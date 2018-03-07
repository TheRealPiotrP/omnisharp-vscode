/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const semver_1 = require("semver");
const platform_1 = require("../platform");
const path = require("path");
const vscode = require("vscode");
const util = require("../common");
const options_1 = require("./options");
var LaunchTargetKind;
(function (LaunchTargetKind) {
    LaunchTargetKind[LaunchTargetKind["Solution"] = 0] = "Solution";
    LaunchTargetKind[LaunchTargetKind["ProjectJson"] = 1] = "ProjectJson";
    LaunchTargetKind[LaunchTargetKind["Folder"] = 2] = "Folder";
    LaunchTargetKind[LaunchTargetKind["Csx"] = 3] = "Csx";
    LaunchTargetKind[LaunchTargetKind["Cake"] = 4] = "Cake";
})(LaunchTargetKind = exports.LaunchTargetKind || (exports.LaunchTargetKind = {}));
/**
 * Returns a list of potential targets on which OmniSharp can be launched.
 * This includes `project.json` files, `*.sln` files (if any `*.csproj` files are found), and the root folder
 * (if it doesn't contain a `project.json` file, but `project.json` files exist). In addition, the root folder
 * is included if there are any `*.csproj` files present, but a `*.sln* file is not found.
 */
function findLaunchTargets() {
    if (!vscode.workspace.workspaceFolders) {
        return Promise.resolve([]);
    }
    const options = options_1.Options.Read();
    return vscode.workspace.findFiles(
    /*include*/ '{**/*.sln,**/*.csproj,**/project.json,**/*.csx,**/*.cake}', 
    /*exclude*/ '{**/node_modules/**,**/.git/**,**/bower_components/**}', 
    /*maxResults*/ options.maxProjectResults)
        .then(resourcesToLaunchTargets);
}
exports.findLaunchTargets = findLaunchTargets;
function resourcesToLaunchTargets(resources) {
    // The list of launch targets is calculated like so:
    //   * If there are .csproj files, .sln files are considered as launch targets.
    //   * Any project.json file is considered a launch target.
    //   * If there is no project.json file in a workspace folder, the workspace folder as added as a launch target.
    //   * Additionally, if there are .csproj files, but no .sln file, the root is added as a launch target.
    //
    // TODO:
    //   * It should be possible to choose a .csproj as a launch target
    //   * It should be possible to choose a .sln file even when no .csproj files are found 
    //     within the root.
    if (!Array.isArray(resources)) {
        return [];
    }
    let workspaceFolderToUriMap = new Map();
    for (let resource of resources) {
        let folder = vscode.workspace.getWorkspaceFolder(resource);
        if (folder) {
            let buckets;
            if (workspaceFolderToUriMap.has(folder.index)) {
                buckets = workspaceFolderToUriMap.get(folder.index);
            }
            else {
                buckets = [];
                workspaceFolderToUriMap.set(folder.index, buckets);
            }
            buckets.push(resource);
        }
    }
    let targets = [];
    workspaceFolderToUriMap.forEach((resources, folderIndex) => {
        let hasCsProjFiles = false, hasSlnFile = false, hasProjectJson = false, hasProjectJsonAtRoot = false, hasCSX = false, hasCake = false;
        hasCsProjFiles = resources.some(isCSharpProject);
        let folder = vscode.workspace.workspaceFolders[folderIndex];
        let folderPath = folder.uri.fsPath;
        resources.forEach(resource => {
            // Add .sln files if there are .csproj files
            if (hasCsProjFiles && isSolution(resource)) {
                hasSlnFile = true;
                targets.push({
                    label: path.basename(resource.fsPath),
                    description: vscode.workspace.asRelativePath(path.dirname(resource.fsPath)),
                    target: resource.fsPath,
                    directory: path.dirname(resource.fsPath),
                    kind: LaunchTargetKind.Solution
                });
            }
            // Add project.json files
            if (isProjectJson(resource)) {
                const dirname = path.dirname(resource.fsPath);
                hasProjectJson = true;
                hasProjectJsonAtRoot = hasProjectJsonAtRoot || dirname === folderPath;
                targets.push({
                    label: path.basename(resource.fsPath),
                    description: vscode.workspace.asRelativePath(path.dirname(resource.fsPath)),
                    target: dirname,
                    directory: dirname,
                    kind: LaunchTargetKind.ProjectJson
                });
            }
            // Discover if there is any CSX file
            if (!hasCSX && isCsx(resource)) {
                hasCSX = true;
            }
            // Discover if there is any Cake file
            if (!hasCake && isCake(resource)) {
                hasCake = true;
            }
        });
        // Add the root folder under the following circumstances:
        // * If there are .csproj files, but no .sln file, and none in the root.
        // * If there are project.json files, but none in the root.
        if ((hasCsProjFiles && !hasSlnFile) || (hasProjectJson && !hasProjectJsonAtRoot)) {
            targets.push({
                label: path.basename(folderPath),
                description: '',
                target: folderPath,
                directory: folderPath,
                kind: LaunchTargetKind.Folder
            });
        }
        // if we noticed any CSX file(s), add a single CSX-specific target pointing at the root folder
        if (hasCSX) {
            targets.push({
                label: "CSX",
                description: path.basename(folderPath),
                target: folderPath,
                directory: folderPath,
                kind: LaunchTargetKind.Csx
            });
        }
        // if we noticed any Cake file(s), add a single Cake-specific target pointing at the root folder
        if (hasCake) {
            targets.push({
                label: "Cake",
                description: path.basename(folderPath),
                target: folderPath,
                directory: folderPath,
                kind: LaunchTargetKind.Cake
            });
        }
    });
    return targets.sort((a, b) => a.directory.localeCompare(b.directory));
}
function isCSharpProject(resource) {
    return /\.csproj$/i.test(resource.fsPath);
}
function isSolution(resource) {
    return /\.sln$/i.test(resource.fsPath);
}
function isProjectJson(resource) {
    return /\project.json$/i.test(resource.fsPath);
}
function isCsx(resource) {
    return /\.csx$/i.test(resource.fsPath);
}
function isCake(resource) {
    return /\.cake$/i.test(resource.fsPath);
}
function launchOmniSharp(cwd, args, launchPath) {
    return new Promise((resolve, reject) => {
        launch(cwd, args, launchPath)
            .then(result => {
            // async error - when target not not ENEOT
            result.process.on('error', err => {
                reject(err);
            });
            // success after a short freeing event loop
            setTimeout(function () {
                resolve(result);
            }, 0);
        })
            .catch(reason => reject(reason));
    });
}
exports.launchOmniSharp = launchOmniSharp;
function launch(cwd, args, launchPath) {
    return platform_1.PlatformInformation.GetCurrent().then(platformInfo => {
        const options = options_1.Options.Read();
        if (options.useEditorFormattingSettings) {
            let globalConfig = vscode.workspace.getConfiguration();
            let csharpConfig = vscode.workspace.getConfiguration('[csharp]');
            args.push(`formattingOptions:useTabs=${!getConfigurationValue(globalConfig, csharpConfig, 'editor.insertSpaces', true)}`);
            args.push(`formattingOptions:tabSize=${getConfigurationValue(globalConfig, csharpConfig, 'editor.tabSize', 4)}`);
            args.push(`formattingOptions:indentationSize=${getConfigurationValue(globalConfig, csharpConfig, 'editor.tabSize', 4)}`);
        }
        // If the user has provided an absolute path or the specified version has been installed successfully, we'll use the path.
        if (launchPath) {
            if (platformInfo.isWindows()) {
                return launchWindows(launchPath, cwd, args);
            }
            // If we're launching on macOS/Linux, we have two possibilities:
            //   1. Launch using Mono
            //   2. Launch process directly (e.g. a 'run' script)
            return options.useMono
                ? launchNixMono(launchPath, cwd, args)
                : launchNix(launchPath, cwd, args);
        }
        // If the user has not provided a path, we'll use the locally-installed OmniSharp
        const basePath = path.resolve(util.getExtensionPath(), '.omnisharp');
        if (platformInfo.isWindows()) {
            return launchWindows(path.join(basePath, 'OmniSharp.exe'), cwd, args);
        }
        // If it's possible to launch on a global Mono, we'll do that. Otherwise, run with our
        // locally installed Mono runtime.
        return canLaunchMono()
            .then(() => {
            return launchNixMono(path.join(basePath, 'omnisharp', 'OmniSharp.exe'), cwd, args);
        })
            .catch(_ => {
            return launchNix(path.join(basePath, 'run'), cwd, args);
        });
    });
}
function getConfigurationValue(globalConfig, csharpConfig, configurationPath, defaultValue) {
    if (csharpConfig[configurationPath] != undefined) {
        return csharpConfig[configurationPath];
    }
    return globalConfig.get(configurationPath, defaultValue);
}
function launchWindows(launchPath, cwd, args) {
    function escapeIfNeeded(arg) {
        const hasSpaceWithoutQuotes = /^[^"].* .*[^"]/;
        return hasSpaceWithoutQuotes.test(arg)
            ? `"${arg}"`
            : arg.replace("&", "^&");
    }
    let argsCopy = args.slice(0); // create copy of args
    argsCopy.unshift(launchPath);
    argsCopy = [[
            '/s',
            '/c',
            '"' + argsCopy.map(escapeIfNeeded).join(' ') + '"'
        ].join(' ')];
    let process = child_process_1.spawn('cmd', argsCopy, {
        windowsVerbatimArguments: true,
        detached: false,
        cwd: cwd
    });
    return {
        process,
        command: launchPath,
        usingMono: false
    };
}
function launchNix(launchPath, cwd, args) {
    let process = child_process_1.spawn(launchPath, args, {
        detached: false,
        cwd: cwd
    });
    return {
        process,
        command: launchPath,
        usingMono: true
    };
}
function launchNixMono(launchPath, cwd, args) {
    return canLaunchMono()
        .then(() => {
        let argsCopy = args.slice(0); // create copy of details args
        argsCopy.unshift(launchPath);
        argsCopy.unshift("--assembly-loader=strict");
        let process = child_process_1.spawn('mono', argsCopy, {
            detached: false,
            cwd: cwd
        });
        return {
            process,
            command: launchPath,
            usingMono: true
        };
    });
}
function canLaunchMono() {
    return new Promise((resolve, reject) => {
        hasMono('>=5.2.0').then(success => {
            if (success) {
                resolve();
            }
            else {
                reject(new Error('Cannot start Omnisharp because Mono version >=5.2.0 is required.'));
            }
        });
    });
}
function hasMono(range) {
    const versionRegexp = /(\d+\.\d+\.\d+)/;
    return new Promise((resolve, reject) => {
        let childprocess;
        try {
            childprocess = child_process_1.spawn('mono', ['--version']);
        }
        catch (e) {
            return resolve(false);
        }
        childprocess.on('error', function (err) {
            resolve(false);
        });
        let stdout = '';
        childprocess.stdout.on('data', (data) => {
            stdout += data.toString();
        });
        childprocess.stdout.on('close', () => {
            let match = versionRegexp.exec(stdout), ret;
            if (!match) {
                ret = false;
            }
            else if (!range) {
                ret = true;
            }
            else {
                ret = semver_1.satisfies(match[1], range);
            }
            resolve(ret);
        });
    });
}
exports.hasMono = hasMono;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGF1bmNoZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvb21uaXNoYXJwL2xhdW5jaGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHO0FBRWhHLFlBQVksQ0FBQzs7QUFFYixpREFBb0Q7QUFDcEQsbUNBQW1DO0FBQ25DLDBDQUFrRDtBQUNsRCw2QkFBNkI7QUFDN0IsaUNBQWlDO0FBQ2pDLGtDQUFrQztBQUNsQyx1Q0FBb0M7QUFFcEMsSUFBWSxnQkFNWDtBQU5ELFdBQVksZ0JBQWdCO0lBQ3hCLCtEQUFRLENBQUE7SUFDUixxRUFBVyxDQUFBO0lBQ1gsMkRBQU0sQ0FBQTtJQUNOLHFEQUFHLENBQUE7SUFDSCx1REFBSSxDQUFBO0FBQ1IsQ0FBQyxFQU5XLGdCQUFnQixHQUFoQix3QkFBZ0IsS0FBaEIsd0JBQWdCLFFBTTNCO0FBYUQ7Ozs7O0dBS0c7QUFDSDtJQUNJLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUM7UUFDckMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDL0IsQ0FBQztJQUVELE1BQU0sT0FBTyxHQUFHLGlCQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7SUFFL0IsTUFBTSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsU0FBUztJQUN6QixXQUFXLENBQUMsMkRBQTJEO0lBQ3ZFLFdBQVcsQ0FBQyx3REFBd0Q7SUFDcEUsY0FBYyxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQztTQUM1QyxJQUFJLENBQUMsd0JBQXdCLENBQUMsQ0FBQztBQUN4QyxDQUFDO0FBWkQsOENBWUM7QUFFRCxrQ0FBa0MsU0FBdUI7SUFDckQsb0RBQW9EO0lBQ3BELCtFQUErRTtJQUMvRSwyREFBMkQ7SUFDM0QsZ0hBQWdIO0lBQ2hILHdHQUF3RztJQUN4RyxFQUFFO0lBQ0YsUUFBUTtJQUNSLG1FQUFt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