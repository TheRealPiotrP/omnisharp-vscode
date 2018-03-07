/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const serverUtils = require("../omnisharp/utils");
const launcher_1 = require("../omnisharp/launcher");
const cp = require("child_process");
const fs = require("fs");
const path = require("path");
const protocol = require("../omnisharp/protocol");
const vscode = require("vscode");
const processPicker_1 = require("./processPicker");
const assets_1 = require("../assets");
const activate_1 = require("../coreclr-debug/activate");
let channel = vscode.window.createOutputChannel('.NET');
function registerCommands(server, reporter, channel) {
    let d1 = vscode.commands.registerCommand('o.restart', () => restartOmniSharp(server));
    let d2 = vscode.commands.registerCommand('o.pickProjectAndStart', () => pickProjectAndStart(server));
    let d3 = vscode.commands.registerCommand('o.showOutput', () => server.getChannel().show(vscode.ViewColumn.Three));
    let d4 = vscode.commands.registerCommand('dotnet.restore', () => dotnetRestoreAllProjects(server));
    // register empty handler for csharp.installDebugger
    // running the command activates the extension, which is all we need for installation to kickoff
    let d5 = vscode.commands.registerCommand('csharp.downloadDebugger', () => { });
    // register process picker for attach
    let attachItemsProvider = processPicker_1.DotNetAttachItemsProviderFactory.Get();
    let attacher = new processPicker_1.AttachPicker(attachItemsProvider);
    let d6 = vscode.commands.registerCommand('csharp.listProcess', () => attacher.ShowAttachEntries());
    // Register command for generating tasks.json and launch.json assets.
    let d7 = vscode.commands.registerCommand('dotnet.generateAssets', () => assets_1.generateAssets(server));
    // Register command for remote process picker for attach
    let d8 = vscode.commands.registerCommand('csharp.listRemoteProcess', (args) => processPicker_1.RemoteAttachPicker.ShowAttachEntries(args));
    // Register command for adapter executable command.
    let d9 = vscode.commands.registerCommand('csharp.coreclrAdapterExecutableCommand', (args) => activate_1.getAdapterExecutionCommand(channel));
    let d10 = vscode.commands.registerCommand('csharp.clrAdapterExecutableCommand', (args) => activate_1.getAdapterExecutionCommand(channel));
    return vscode.Disposable.from(d1, d2, d3, d4, d5, d6, d7, d8, d9, d10);
}
exports.default = registerCommands;
function restartOmniSharp(server) {
    if (server.isRunning()) {
        server.restart();
    }
    else {
        server.autoStart('');
    }
}
function pickProjectAndStart(server) {
    return launcher_1.findLaunchTargets().then(targets => {
        let currentPath = server.getSolutionPathOrFolder();
        if (currentPath) {
            for (let target of targets) {
                if (target.target === currentPath) {
                    target.label = `\u2713 ${target.label}`;
                }
            }
        }
        return vscode.window.showQuickPick(targets, {
            matchOnDescription: true,
            placeHolder: `Select 1 of ${targets.length} projects`
        }).then(launchTarget => {
            if (launchTarget) {
                return server.restart(launchTarget);
            }
        });
    });
}
function projectsToCommands(projects) {
    return projects.map(project => {
        let projectDirectory = project.Directory;
        return new Promise((resolve, reject) => {
            fs.lstat(projectDirectory, (err, stats) => {
                if (err) {
                    return reject(err);
                }
                if (stats.isFile()) {
                    projectDirectory = path.dirname(projectDirectory);
                }
                resolve({
                    label: `dotnet restore - (${project.Name || path.basename(project.Directory)})`,
                    description: projectDirectory,
                    execute() {
                        return dotnetRestore(projectDirectory);
                    }
                });
            });
        });
    });
}
function dotnetRestoreAllProjects(server) {
    if (!server.isRunning()) {
        return Promise.reject('OmniSharp server is not running.');
    }
    return serverUtils.requestWorkspaceInformation(server).then(info => {
        let descriptors = protocol.getDotNetCoreProjectDescriptors(info);
        if (descriptors.length === 0) {
            return Promise.reject("No .NET Core projects found");
        }
        let commandPromises = projectsToCommands(descriptors);
        return Promise.all(commandPromises).then(commands => {
            return vscode.window.showQuickPick(commands);
        }).then(command => {
            if (command) {
                return command.execute();
            }
        });
    });
}
exports.dotnetRestoreAllProjects = dotnetRestoreAllProjects;
function dotnetRestoreForProject(server, filePath) {
    if (!server.isRunning()) {
        return Promise.reject('OmniSharp server is not running.');
    }
    return serverUtils.requestWorkspaceInformation(server).then(info => {
        let descriptors = protocol.getDotNetCoreProjectDescriptors(info);
        if (descriptors.length === 0) {
            return Promise.reject("No .NET Core projects found");
        }
        for (let descriptor of descriptors) {
            if (descriptor.FilePath === filePath) {
                return dotnetRestore(descriptor.Directory, filePath);
            }
        }
    });
}
exports.dotnetRestoreForProject = dotnetRestoreForProject;
function dotnetRestore(cwd, filePath) {
    return new Promise((resolve, reject) => {
        channel.clear();
        channel.show();
        let cmd = 'dotnet';
        let args = ['restore'];
        if (filePath) {
            args.push(filePath);
        }
        let dotnet = cp.spawn(cmd, args, { cwd: cwd, env: process.env });
        function handleData(stream) {
            stream.on('data', chunk => {
                channel.append(chunk.toString());
            });
            stream.on('err', err => {
                channel.append(`ERROR: ${err}`);
            });
        }
        handleData(dotnet.stdout);
        handleData(dotnet.stderr);
        dotnet.on('close', (code, signal) => {
            channel.appendLine(`Done: ${code}.`);
            resolve();
        });
        dotnet.on('error', err => {
            channel.appendLine(`ERROR: ${err}`);
            reject(err);
        });
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWFuZHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvZmVhdHVyZXMvY29tbWFuZHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7QUFFaEcsWUFBWSxDQUFDOztBQUdiLGtEQUFrRDtBQUNsRCxvREFBMEQ7QUFDMUQsb0NBQW9DO0FBQ3BDLHlCQUF5QjtBQUN6Qiw2QkFBNkI7QUFDN0Isa0RBQWtEO0FBQ2xELGlDQUFpQztBQUNqQyxtREFBcUc7QUFDckcsc0NBQTJDO0FBRTNDLHdEQUF1RTtBQUV2RSxJQUFJLE9BQU8sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLG1CQUFtQixDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBRXhELDBCQUF5QyxNQUF1QixFQUFFLFFBQTJCLEVBQUUsT0FBNkI7SUFDeEgsSUFBSSxFQUFFLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsV0FBVyxFQUFFLEdBQUcsRUFBRSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7SUFDdEYsSUFBSSxFQUFFLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsdUJBQXVCLEVBQUUsR0FBRyxFQUFFLENBQUMsbUJBQW1CLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUNyRyxJQUFJLEVBQUUsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxjQUFjLEVBQUUsR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDbEgsSUFBSSxFQUFFLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsZ0JBQWdCLEVBQUUsR0FBRyxFQUFFLENBQUMsd0JBQXdCLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUVuRyxvREFBb0Q7SUFDcEQsZ0dBQWdHO0lBQ2hH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