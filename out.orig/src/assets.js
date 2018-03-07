"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs-extra");
const path = require("path");
const protocol = require("./omnisharp/protocol");
const serverUtils = require("./omnisharp/utils");
const util = require("./common");
const vscode = require("vscode");
const json_1 = require("./json");
class AssetGenerator {
    constructor(workspaceInfo, workspaceFolder = undefined) {
        if (workspaceFolder) {
            this.workspaceFolder = workspaceFolder;
        }
        else {
            let resourcePath = undefined;
            if (!resourcePath && workspaceInfo.Cake) {
                resourcePath = workspaceInfo.Cake.Path;
            }
            if (!resourcePath && workspaceInfo.ScriptCs) {
                resourcePath = workspaceInfo.ScriptCs.Path;
            }
            if (!resourcePath && workspaceInfo.DotNet && workspaceInfo.DotNet.Projects.length > 0) {
                resourcePath = workspaceInfo.DotNet.Projects[0].Path;
            }
            if (!resourcePath && workspaceInfo.MsBuild) {
                resourcePath = workspaceInfo.MsBuild.SolutionPath;
            }
            this.workspaceFolder = vscode.workspace.getWorkspaceFolder(vscode.Uri.file(resourcePath));
        }
        this.vscodeFolder = path.join(this.workspaceFolder.uri.fsPath, '.vscode');
        this.tasksJsonPath = path.join(this.vscodeFolder, 'tasks.json');
        this.launchJsonPath = path.join(this.vscodeFolder, 'launch.json');
        this.initializeProjectData(workspaceInfo);
    }
    initializeProjectData(workspaceInfo) {
        // TODO: For now, assume the Debug configuration. Eventually, we'll need to revisit
        // this when we allow selecting configurations.
        const configurationName = 'Debug';
        // First, we'll check for .NET Core .csproj projects.
        if (workspaceInfo.MsBuild && workspaceInfo.MsBuild.Projects) {
            const executableMSBuildProjects = protocol.findExecutableMSBuildProjects(workspaceInfo.MsBuild.Projects);
            const targetMSBuildProject = executableMSBuildProjects.length > 0
                ? executableMSBuildProjects[0]
                : undefined;
            if (targetMSBuildProject) {
                this.hasProject = true;
                this.projectPath = path.dirname(targetMSBuildProject.Path);
                this.projectFilePath = targetMSBuildProject.Path;
                this.targetFramework = protocol.findNetCoreAppTargetFramework(targetMSBuildProject).ShortName;
                this.executableName = targetMSBuildProject.AssemblyName + ".dll";
                this.configurationName = configurationName;
                return;
            }
        }
        // Next, we'll try looking for project.json projects.
        const executableProjects = protocol.findExecutableProjectJsonProjects(workspaceInfo.DotNet.Projects, configurationName);
        // TODO: We arbitrarily pick the first executable project that we find. This will need
        // revisiting when we project a "start up project" selector.
        const targetProject = executableProjects.length > 0
            ? executableProjects[0]
            : undefined;
        if (targetProject && targetProject.Frameworks.length > 0) {
            const config = targetProject.Configurations.find(c => c.Name === configurationName);
            if (config) {
                this.hasProject = true;
                this.projectPath = targetProject.Path;
                this.projectFilePath = path.join(targetProject.Path, 'project.json');
                this.targetFramework = targetProject.Frameworks[0].ShortName;
                this.executableName = path.basename(config.CompilationOutputAssemblyFile);
                this.configurationName = configurationName;
            }
        }
        return undefined;
    }
    hasWebServerDependency() {
        // TODO: Update to handle .NET Core projects.
        if (!this.projectFilePath) {
            return false;
        }
        let projectFileText = fs.readFileSync(this.projectFilePath, 'utf8');
        if (path.basename(this.projectFilePath).toLowerCase() === 'project.json') {
            let projectJsonObject;
            try {
                projectJsonObject = json_1.tolerantParse(projectFileText);
            }
            catch (error) {
                vscode.window.showErrorMessage('Failed to parse project.json file');
                projectJsonObject = null;
            }
            if (projectJsonObject == null) {
                return false;
            }
            for (let key in projectJsonObject.dependencies) {
                if (key.toLowerCase().startsWith("microsoft.aspnetcore.server")) {
                    return true;
                }
            }
        }
        // Assume that this is an MSBuild project. In that case, look for the 'Sdk="Microsoft.NET.Sdk.Web"' attribute.
        // TODO: Have OmniSharp provide the list of SDKs used by a project and check that list instead.
        return projectFileText.toLowerCase().indexOf('sdk="microsoft.net.sdk.web"') >= 0;
    }
    computeProgramPath() {
        if (!this.hasProject) {
            // If there's no target project data, use a placeholder for the path.
            return '${workspaceFolder}/bin/Debug/<insert-target-framework-here>/<insert-project-name-here>.dll';
        }
        let result = '${workspaceFolder}';
        if (this.projectPath) {
            result = path.join(result, path.relative(this.workspaceFolder.uri.fsPath, this.projectPath));
        }
        result = path.join(result, `bin/${this.configurationName}/${this.targetFramework}/${this.executableName}`);
        return result;
    }
    computeWorkingDirectory() {
        if (!this.hasProject) {
            // If there's no target project data, use a placeholder for the path.
            return '${workspaceFolder}';
        }
        let result = '${workspaceFolder}';
        if (this.projectPath) {
            result = path.join(result, path.relative(this.workspaceFolder.uri.fsPath, this.projectPath));
        }
        return result;
    }
    createLaunchJson(isWebProject) {
        if (!isWebProject) {
            const launchConfigurationsMassaged = indentJsonString(createLaunchConfiguration(this.computeProgramPath(), this.computeWorkingDirectory()));
            const attachConfigurationsMassaged = indentJsonString(createAttachConfiguration());
            return `
[
    ${launchConfigurationsMassaged},
    ${attachConfigurationsMassaged}
]`;
        }
        else {
            const webLaunchConfigurationsMassaged = indentJsonString(createWebLaunchConfiguration(this.computeProgramPath(), this.computeWorkingDirectory()));
            const attachConfigurationsMassaged = indentJsonString(createAttachConfiguration());
            return `
[
    ${webLaunchConfigurationsMassaged},
    ${attachConfigurationsMassaged}
]`;
        }
    }
    createBuildTaskDescription() {
        let buildPath = '';
        if (this.hasProject) {
            buildPath = path.join('${workspaceFolder}', path.relative(this.workspaceFolder.uri.fsPath, this.projectFilePath));
        }
        return {
            label: 'build',
            command: 'dotnet',
            type: 'process',
            args: ['build', util.convertNativePathToPosix(buildPath)],
            problemMatcher: '$msCompile'
        };
    }
    createTasksConfiguration() {
        return {
            version: "2.0.0",
            tasks: [this.createBuildTaskDescription()]
        };
    }
}
exports.AssetGenerator = AssetGenerator;
function createWebLaunchConfiguration(programPath, workingDirectory) {
    return `
{
    "name": ".NET Core Launch (web)",
    "type": "coreclr",
    "request": "launch",
    "preLaunchTask": "build",
    // If you have changed target frameworks, make sure to update the program path.
    "program": "${util.convertNativePathToPosix(programPath)}",
    "args": [],
    "cwd": "${util.convertNativePathToPosix(workingDirectory)}",
    "stopAtEntry": false,
    "internalConsoleOptions": "openOnSessionStart",
    "launchBrowser": {
        "enabled": true,
        "args": "\${auto-detect-url}",
        "windows": {
            "command": "cmd.exe",
            "args": "/C start \${auto-detect-url}"
        },
        "osx": {
            "command": "open"
        },
        "linux": {
            "command": "xdg-open"
        }
    },
    "env": {
        "ASPNETCORE_ENVIRONMENT": "Development"
    },
    "sourceFileMap": {
        "/Views": "\${workspaceFolder}/Views"
    }
}`;
}
exports.createWebLaunchConfiguration = createWebLaunchConfiguration;
function createLaunchConfiguration(programPath, workingDirectory) {
    return `
{
    "name": ".NET Core Launch (console)",
    "type": "coreclr",
    "request": "launch",
    "preLaunchTask": "build",
    // If you have changed target frameworks, make sure to update the program path.
    "program": "${util.convertNativePathToPosix(programPath)}",
    "args": [],
    "cwd": "${util.convertNativePathToPosix(workingDirectory)}",
    // For more information about the 'console' field, see https://github.com/OmniSharp/omnisharp-vscode/blob/master/debugger-launchjson.md#console-terminal-window
    "console": "internalConsole",
    "stopAtEntry": false,
    "internalConsoleOptions": "openOnSessionStart"
}`;
}
exports.createLaunchConfiguration = createLaunchConfiguration;
// AttachConfiguration
function createAttachConfiguration() {
    return `
{
    "name": ".NET Core Attach",
    "type": "coreclr",
    "request": "attach",
    "processId": "\${command:pickProcess}"
}`;
}
exports.createAttachConfiguration = createAttachConfiguration;
function hasAddOperations(operations) {
    return operations.addLaunchJson || operations.addLaunchJson;
}
function getOperations(generator) {
    return getBuildOperations(generator.tasksJsonPath).then(operations => getLaunchOperations(generator.launchJsonPath, operations));
}
/**
 * Will return old (version=0.1.0) or new (version=2.0.0) tasks. If there are any of them, do not
 * write over the tasks.json.
 */
function getBuildTasks(tasksConfiguration) {
    let result = [];
    const tasksV1 = "0.1.0";
    const tasksV2 = "2.0.0";
    function findBuildTask(version, tasksDescriptions) {
        let buildTask = undefined;
        // Find the old tasks
        if (version === tasksV1 && tasksDescriptions) {
            buildTask = tasksDescriptions.find(td => td.isBuildCommand);
        }
        else if (version === tasksV2 && tasksDescriptions) {
            buildTask = tasksDescriptions.find(td => td.group === 'build');
        }
        if (buildTask !== undefined) {
            result.push(buildTask);
        }
    }
    findBuildTask(tasksConfiguration.version, tasksConfiguration.tasks);
    if (tasksConfiguration.windows) {
        findBuildTask(tasksConfiguration.version, tasksConfiguration.windows.tasks);
    }
    if (tasksConfiguration.osx) {
        findBuildTask(tasksConfiguration.version, tasksConfiguration.osx.tasks);
    }
    if (tasksConfiguration.linux) {
        findBuildTask(tasksConfiguration.version, tasksConfiguration.linux.tasks);
    }
    return result;
}
function getBuildOperations(tasksJsonPath) {
    return new Promise((resolve, reject) => {
        fs.exists(tasksJsonPath, exists => {
            if (exists) {
                fs.readFile(tasksJsonPath, (err, buffer) => {
                    if (err) {
                        return reject(err);
                    }
                    const text = buffer.toString();
                    let tasksConfiguration;
                    try {
                        tasksConfiguration = json_1.tolerantParse(text);
                    }
                    catch (error) {
                        vscode.window.showErrorMessage(`Failed to parse tasks.json file`);
                        return resolve({ updateTasksJson: false });
                    }
                    let buildTasks = getBuildTasks(tasksConfiguration);
                    resolve({ updateTasksJson: buildTasks.length === 0 });
                });
            }
            else {
                resolve({ addTasksJson: true });
            }
        });
    });
}
function getLaunchOperations(launchJsonPath, operations) {
    return new Promise((resolve, reject) => {
        return fs.exists(launchJsonPath, exists => {
            if (exists) {
                resolve(operations);
            }
            else {
                operations.addLaunchJson = true;
                resolve(operations);
            }
        });
    });
}
var PromptResult;
(function (PromptResult) {
    PromptResult[PromptResult["Yes"] = 0] = "Yes";
    PromptResult[PromptResult["No"] = 1] = "No";
    PromptResult[PromptResult["Disable"] = 2] = "Disable";
})(PromptResult || (PromptResult = {}));
function promptToAddAssets(workspaceFolder) {
    return new Promise((resolve, reject) => {
        const yesItem = { title: 'Yes', result: PromptResult.Yes };
        const noItem = { title: 'Not Now', result: PromptResult.No, isCloseAffordance: true };
        const disableItem = { title: "Don't Ask Again", result: PromptResult.Disable };
        const projectName = path.basename(workspaceFolder.uri.fsPath);
        vscode.window.showWarningMessage(`Required assets to build and debug are missing from '${projectName}'. Add them?`, disableItem, noItem, yesItem)
            .then(selection => resolve(selection.result));
    });
}
function addTasksJsonIfNecessary(generator, operations) {
    return new Promise((resolve, reject) => {
        if (!operations.addTasksJson) {
            return resolve();
        }
        // Read existing Tasks configuration
        const tasksConfigs = vscode.workspace.getConfiguration('tasks');
        let existingTaskConfigs = tasksConfigs.get('tasks');
        const tasksJson = generator.createTasksConfiguration();
        if (existingTaskConfigs) {
            tasksJson['tasks'] = tasksJson['tasks'].concat(existingTaskConfigs);
        }
        const tasksJsonText = JSON.stringify(tasksJson, null, '    ');
        fs.writeFile(generator.tasksJsonPath, tasksJsonText, err => {
            if (err) {
                return reject(err);
            }
            resolve();
        });
    });
}
exports.addTasksJsonIfNecessary = addTasksJsonIfNecessary;
function indentJsonString(json, numSpaces = 4) {
    return json.split('\n').map(line => ' '.repeat(numSpaces) + line).join('\n').trim();
}
function addLaunchJsonIfNecessary(generator, operations) {
    return new Promise((resolve, reject) => {
        if (!operations.addLaunchJson) {
            return resolve();
        }
        // Read existing launch configuration
        const launchConfigs = vscode.workspace.getConfiguration('launch');
        let existingLaunchConfigs = launchConfigs.get('configurations');
        const isWebProject = generator.hasWebServerDependency();
        let launchJson = generator.createLaunchJson(isWebProject);
        if (existingLaunchConfigs) {
            let existingLaunchConfigsString = JSON.stringify(existingLaunchConfigs, null, '    ');
            const lastBracket = launchJson.lastIndexOf(']');
            const lastBracketInExistingConfig = existingLaunchConfigsString.lastIndexOf(']');
            const firstBracketInExistingConfig = existingLaunchConfigsString.indexOf('[');
            if (lastBracket !== -1 && lastBracketInExistingConfig !== -1 && firstBracketInExistingConfig !== -1) {
                launchJson = launchJson.substring(0, lastBracket);
                existingLaunchConfigsString = existingLaunchConfigsString.substring(firstBracketInExistingConfig + 1, lastBracketInExistingConfig);
                launchJson = `${launchJson},${existingLaunchConfigsString}]`;
            }
        }
        const configurationsMassaged = indentJsonString(launchJson);
        const launchJsonText = `
{
   // Use IntelliSense to find out which attributes exist for C# debugging
   // Use hover for the description of the existing attributes
   // For further information visit https://github.com/OmniSharp/omnisharp-vscode/blob/master/debugger-launchjson.md
   "version": "0.2.0",
   "configurations": ${configurationsMassaged}
}`;
        fs.writeFile(generator.launchJsonPath, launchJsonText.trim(), err => {
            if (err) {
                return reject(err);
            }
            resolve();
        });
    });
}
function addAssets(generator, operations) {
    const promises = [
        addTasksJsonIfNecessary(generator, operations),
        addLaunchJsonIfNecessary(generator, operations)
    ];
    return Promise.all(promises);
}
var AddAssetResult;
(function (AddAssetResult) {
    AddAssetResult[AddAssetResult["NotApplicable"] = 0] = "NotApplicable";
    AddAssetResult[AddAssetResult["Done"] = 1] = "Done";
    AddAssetResult[AddAssetResult["Disable"] = 2] = "Disable";
    AddAssetResult[AddAssetResult["Cancelled"] = 3] = "Cancelled";
})(AddAssetResult = exports.AddAssetResult || (exports.AddAssetResult = {}));
function addAssetsIfNecessary(server) {
    return new Promise((resolve, reject) => {
        if (!vscode.workspace.workspaceFolders) {
            return resolve(AddAssetResult.NotApplicable);
        }
        serverUtils.requestWorkspaceInformation(server).then(info => {
            // If there are no .NET Core projects, we won't bother offering to add assets.
            if (protocol.containsDotNetCoreProjects(info)) {
                const generator = new AssetGenerator(info);
                return getOperations(generator).then(operations => {
                    if (!hasAddOperations(operations)) {
                        return resolve(AddAssetResult.NotApplicable);
                    }
                    promptToAddAssets(generator.workspaceFolder).then(result => {
                        if (result === PromptResult.Disable) {
                            return resolve(AddAssetResult.Disable);
                        }
                        if (result !== PromptResult.Yes) {
                            return resolve(AddAssetResult.Cancelled);
                        }
                        fs.ensureDir(generator.vscodeFolder, err => {
                            addAssets(generator, operations).then(() => resolve(AddAssetResult.Done));
                        });
                    });
                });
            }
        }).catch(err => reject(err));
    });
}
exports.addAssetsIfNecessary = addAssetsIfNecessary;
function doesAnyAssetExist(generator) {
    return new Promise((resolve, reject) => {
        fs.exists(generator.launchJsonPath, exists => {
            if (exists) {
                resolve(true);
            }
            else {
                fs.exists(generator.tasksJsonPath, exists => {
                    resolve(exists);
                });
            }
        });
    });
}
function deleteAssets(generator) {
    return Promise.all([
        util.deleteIfExists(generator.launchJsonPath),
        util.deleteIfExists(generator.tasksJsonPath)
    ]);
}
function shouldGenerateAssets(generator) {
    return new Promise((resolve, reject) => {
        doesAnyAssetExist(generator).then(res => {
            if (res) {
                const yesItem = { title: 'Yes' };
                const cancelItem = { title: 'Cancel', isCloseAffordance: true };
                vscode.window.showWarningMessage('Replace existing build and debug assets?', cancelItem, yesItem)
                    .then(selection => {
                    if (selection === yesItem) {
                        deleteAssets(generator).then(_ => resolve(true));
                    }
                    else {
                        // The user clicked cancel
                        resolve(false);
                    }
                });
            }
            else {
                // The assets don't exist, so we're good to go.
                resolve(true);
            }
        });
    });
}
function generateAssets(server) {
    return __awaiter(this, void 0, void 0, function* () {
        let workspaceInformation = yield serverUtils.requestWorkspaceInformation(server);
        if (protocol.containsDotNetCoreProjects(workspaceInformation)) {
            const generator = new AssetGenerator(workspaceInformation);
            let operations = yield getOperations(generator);
            if (hasAddOperations(operations)) {
                let doGenerateAssets = yield shouldGenerateAssets(generator);
                if (doGenerateAssets) {
                    yield fs.ensureDir(generator.vscodeFolder);
                    yield addAssets(generator, operations);
                }
            }
        }
        else {
            yield vscode.window.showErrorMessage("Could not locate .NET Core project. Assets were not generated.");
        }
    });
}
exports.generateAssets = generateAssets;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXNzZXRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2Fzc2V0cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7QUFFaEcsK0JBQStCO0FBQy9CLDZCQUE2QjtBQUM3QixpREFBaUQ7QUFDakQsaURBQWlEO0FBRWpELGlDQUFpQztBQUNqQyxpQ0FBaUM7QUFHakMsaUNBQXVDO0FBRXZDO0lBYUksWUFBbUIsYUFBb0QsRUFBRSxrQkFBMEMsU0FBUztRQUN4SCxFQUFFLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDO1lBQ2xCLElBQUksQ0FBQyxlQUFlLEdBQUcsZUFBZSxDQUFDO1FBQzNDLENBQUM7UUFDRCxJQUFJLENBQUMsQ0FBQztZQUNGLElBQUksWUFBWSxHQUFXLFNBQVMsQ0FBQztZQUVyQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFlBQVksSUFBSSxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDdEMsWUFBWSxHQUFHLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO1lBQzNDLENBQUM7WUFFRCxFQUFFLENBQUMsQ0FBQyxDQUFDLFlBQVksSUFBSSxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztnQkFDMUMsWUFBWSxHQUFHLGFBQWEsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDO1lBQy9DLENBQUM7WUFFRCxFQUFFLENBQUMsQ0FBQyxDQUFDLFlBQVksSUFBSSxhQUFhLENBQUMsTUFBTSxJQUFJLGFBQWEsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNwRixZQUFZLEdBQUcsYUFBYSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1lBQ3pELENBQUM7WUFFRCxFQUFFLENBQUMsQ0FBQyxDQUFDLFlBQVksSUFBSSxhQUFhLENBQUMsT0FBTyxDQUFDLENB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