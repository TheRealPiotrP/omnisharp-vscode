/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { spawn, ChildProcess } from 'child_process';
import { satisfies } from 'semver';
import { PlatformInformation } from '../platform';
import * as path from 'path';
import * as vscode from 'vscode';
import * as util from '../common';
import { Options } from './options';

export enum LaunchTargetKind {
    Solution,
    ProjectJson,
    Folder,
    Csx,
    Cake
}

/**
 * Represents the project or solution that OmniSharp is to be launched with.
 * */
export interface LaunchTarget {
    label: string;
    description: string;
    directory: string;
    target: string;
    kind: LaunchTargetKind;
}

/**
 * Returns a list of potential targets on which OmniSharp can be launched.
 * This includes `project.json` files, `*.sln` files (if any `*.csproj` files are found), and the root folder
 * (if it doesn't contain a `project.json` file, but `project.json` files exist). In addition, the root folder
 * is included if there are any `*.csproj` files present, but a `*.sln* file is not found.
 */
export function findLaunchTargets(): Thenable<LaunchTarget[]> {
    if (!vscode.workspace.workspaceFolders) {
        return Promise.resolve([]);
    }

    const options = Options.Read();

    return vscode.workspace.findFiles(
            /*include*/ '{**/*.sln,**/*.csproj,**/project.json,**/*.csx,**/*.cake}',
            /*exclude*/ '{**/node_modules/**,**/.git/**,**/bower_components/**}',
            /*maxResults*/ options.maxProjectResults)
        .then(resourcesToLaunchTargets);
}

function resourcesToLaunchTargets(resources: vscode.Uri[]): LaunchTarget[] {
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

    let workspaceFolderToUriMap = new Map<number, vscode.Uri[]>();

    for (let resource of resources) {
        let folder = vscode.workspace.getWorkspaceFolder(resource);
        if (folder) {
            let buckets: vscode.Uri[];

            if (workspaceFolderToUriMap.has(folder.index)) {
                buckets = workspaceFolderToUriMap.get(folder.index);
            } else {
                buckets = [];
                workspaceFolderToUriMap.set(folder.index, buckets);
            }

            buckets.push(resource);
        }
    }

    let targets: LaunchTarget[] = [];

    workspaceFolderToUriMap.forEach((resources, folderIndex) => {
        let hasCsProjFiles = false,
            hasSlnFile = false,
            hasProjectJson = false,
            hasProjectJsonAtRoot = false,
            hasCSX = false,
            hasCake = false;

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

function isCSharpProject(resource: vscode.Uri): boolean {
    return /\.csproj$/i.test(resource.fsPath);
}

function isSolution(resource: vscode.Uri): boolean {
    return /\.sln$/i.test(resource.fsPath);
}

function isProjectJson(resource: vscode.Uri): boolean {
    return /\project.json$/i.test(resource.fsPath);
}

function isCsx(resource: vscode.Uri): boolean {
    return /\.csx$/i.test(resource.fsPath);
}

function isCake(resource: vscode.Uri): boolean {
    return /\.cake$/i.test(resource.fsPath);
}

export interface LaunchResult {
    process: ChildProcess;
    command: string;
    usingMono: boolean;
}

export function launchOmniSharp(cwd: string, args: string[], launchPath: string): Promise<LaunchResult> {
    return new Promise<LaunchResult>((resolve, reject) => {
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

function launch(cwd: string, args: string[], launchPath: string): Promise<LaunchResult> {
    return PlatformInformation.GetCurrent().then(platformInfo => {
        const options = Options.Read();

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

function getConfigurationValue(globalConfig: vscode.WorkspaceConfiguration, csharpConfig: vscode.WorkspaceConfiguration,
    configurationPath: string, defaultValue: any): any {

    if (csharpConfig[configurationPath] != undefined) {
        return csharpConfig[configurationPath];
    }

    return globalConfig.get(configurationPath, defaultValue);
}

function launchWindows(launchPath: string, cwd: string, args: string[]): LaunchResult {
    function escapeIfNeeded(arg: string) {
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

    let process = spawn('cmd', argsCopy, <any>{
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

function launchNix(launchPath: string, cwd: string, args: string[]): LaunchResult {
    let process = spawn(launchPath, args, {
        detached: false,
        cwd: cwd
    });

    return {
        process,
        command: launchPath,
        usingMono: true
    };
}

function launchNixMono(launchPath: string, cwd: string, args: string[]): Promise<LaunchResult> {
    return canLaunchMono()
        .then(() => {
            let argsCopy = args.slice(0); // create copy of details args
            argsCopy.unshift(launchPath);
            argsCopy.unshift("--assembly-loader=strict");

            let process = spawn('mono', argsCopy, {
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

function canLaunchMono(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
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

export function hasMono(range?: string): Promise<boolean> {
    const versionRegexp = /(\d+\.\d+\.\d+)/;

    return new Promise<boolean>((resolve, reject) => {
        let childprocess: ChildProcess;
        try {
            childprocess = spawn('mono', ['--version']);
        }
        catch (e) {
            return resolve(false);
        }

        childprocess.on('error', function (err: any) {
            resolve(false);
        });

        let stdout = '';
        childprocess.stdout.on('data', (data: NodeBuffer) => {
            stdout += data.toString();
        });

        childprocess.stdout.on('close', () => {
            let match = versionRegexp.exec(stdout),
                ret: boolean;

            if (!match) {
                ret = false;
            }
            else if (!range) {
                ret = true;
            }
            else {
                ret = satisfies(match[1], range);
            }

            resolve(ret);
        });
    });
}