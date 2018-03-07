/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const commands_1 = require("./commands");
const path_1 = require("path");
const serverUtils = require("../omnisharp/utils");
const debounce = require('lodash.debounce');
function reportStatus(server) {
    return vscode.Disposable.from(reportServerStatus(server), forwardOutput(server), reportDocumentStatus(server));
}
exports.default = reportStatus;
// --- document status
let defaultSelector = [
    'csharp',
    { pattern: '**/project.json' },
    { pattern: '**/*.sln' },
    { pattern: '**/*.csproj' },
    { pattern: '**/*.csx' },
    { pattern: '**/*.cake' } // Cake script
];
class Status {
    constructor(selector) {
        this.selector = selector;
    }
}
function reportDocumentStatus(server) {
    let disposables = [];
    let localDisposables;
    let entry = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, Number.MIN_VALUE);
    let defaultStatus = new Status(defaultSelector);
    let projectStatus;
    function render() {
        if (!vscode.window.activeTextEditor) {
            entry.hide();
            return;
        }
        let document = vscode.window.activeTextEditor.document;
        let status;
        if (projectStatus && vscode.languages.match(projectStatus.selector, document)) {
            status = projectStatus;
        }
        else if (defaultStatus.text && vscode.languages.match(defaultStatus.selector, document)) {
            status = defaultStatus;
        }
        if (status) {
            entry.text = status.text;
            entry.command = status.command;
            entry.color = status.color;
            entry.show();
            return;
        }
        entry.hide();
    }
    disposables.push(vscode.window.onDidChangeActiveTextEditor(render));
    disposables.push(server.onServerError(err => {
        defaultStatus.text = '$(flame) Error starting OmniSharp';
        defaultStatus.command = 'o.showOutput';
        defaultStatus.color = '';
        render();
    }));
    disposables.push(server.onMultipleLaunchTargets(targets => {
        defaultStatus.text = '$(flame) Select project';
        defaultStatus.command = 'o.pickProjectAndStart';
        defaultStatus.color = 'rgb(90, 218, 90)';
        render();
    }));
    disposables.push(server.onBeforeServerInstall(() => {
        defaultStatus.text = '$(flame) Installing OmniSharp...';
        defaultStatus.command = 'o.showOutput';
        defaultStatus.color = '';
        render();
    }));
    disposables.push(server.onBeforeServerStart(path => {
        defaultStatus.text = '$(flame) Starting...';
        defaultStatus.command = 'o.showOutput';
        defaultStatus.color = '';
        render();
    }));
    disposables.push(server.onServerStop(() => {
        projectStatus = undefined;
        defaultStatus.text = undefined;
        if (localDisposables) {
            vscode.Disposable.from(...localDisposables).dispose();
        }
        localDisposables = undefined;
    }));
    disposables.push(server.onServerStart(path => {
        localDisposables = [];
        defaultStatus.text = '$(flame) Running';
        defaultStatus.command = 'o.pickProjectAndStart';
        defaultStatus.color = '';
        render();
        function updateProjectInfo() {
            serverUtils.requestWorkspaceInformation(server).then(info => {
                let fileNames = [];
                let label;
                function addProjectFileNames(project) {
                    fileNames.push({ pattern: project.Path });
                    if (project.SourceFiles) {
                        for (let sourceFile of project.SourceFiles) {
                            fileNames.push({ pattern: sourceFile });
                        }
                    }
                }
                function addDnxOrDotNetProjects(projects) {
                    let count = 0;
                    for (let project of projects) {
                        count += 1;
                        addProjectFileNames(project);
                    }
                    if (!label) {
                        if (count === 1) {
                            label = path_1.basename(projects[0].Path); //workspace.getRelativePath(info.Dnx.Projects[0].Path);
                        }
                        else {
                            label = `${count} projects`;
                        }
                    }
                }
                // show sln-file if applicable
                if (info.MsBuild && info.MsBuild.SolutionPath) {
                    label = path_1.basename(info.MsBuild.SolutionPath); //workspace.getRelativePath(info.MsBuild.SolutionPath);
                    fileNames.push({ pattern: info.MsBuild.SolutionPath });
                    for (let project of info.MsBuild.Projects) {
                        addProjectFileNames(project);
                    }
                }
                // show .NET Core projects if applicable
                if (info.DotNet) {
                    addDnxOrDotNetProjects(info.DotNet.Projects);
                }
                // set project info
                projectStatus = new Status(fileNames);
                projectStatus.text = '$(flame) ' + label;
                projectStatus.command = 'o.pickProjectAndStart';
                // default is to change project
                defaultStatus.text = '$(flame) Switch projects';
                defaultStatus.command = 'o.pickProjectAndStart';
                render();
            });
        }
        // Don't allow the same request to slam the server within a "short" window
        let debouncedUpdateProjectInfo = debounce(updateProjectInfo, 1500, { leading: true });
        localDisposables.push(server.onProjectAdded(debouncedUpdateProjectInfo));
        localDisposables.push(server.onProjectChange(debouncedUpdateProjectInfo));
        localDisposables.push(server.onProjectRemoved(debouncedUpdateProjectInfo));
    }));
    return vscode.Disposable.from(...disposables);
}
exports.reportDocumentStatus = reportDocumentStatus;
// ---- server status
function reportServerStatus(server) {
    function appendLine(value = '') {
        server.getChannel().appendLine(value);
    }
    let d0 = server.onServerError(err => {
        appendLine('[ERROR] ' + err);
    });
    let d1 = server.onError(message => {
        if (message.FileName) {
            appendLine(`${message.FileName}(${message.Line},${message.Column})`);
        }
        appendLine(message.Text);
        appendLine();
        showMessageSoon();
    });
    let d2 = server.onMsBuildProjectDiagnostics(message => {
        function asErrorMessage(message) {
            let value = `${message.FileName}(${message.StartLine},${message.StartColumn}): Error: ${message.Text}`;
            appendLine(value);
        }
        function asWarningMessage(message) {
            let value = `${message.FileName}(${message.StartLine},${message.StartColumn}): Warning: ${message.Text}`;
            appendLine(value);
        }
        if (message.Errors.length > 0 || message.Warnings.length > 0) {
            appendLine(message.FileName);
            message.Errors.forEach(error => asErrorMessage);
            message.Warnings.forEach(warning => asWarningMessage);
            appendLine();
            if (message.Errors.length > 0) {
                showMessageSoon();
            }
        }
    });
    let d3 = server.onUnresolvedDependencies(message => {
        let csharpConfig = vscode.workspace.getConfiguration('csharp');
        if (!csharpConfig.get('suppressDotnetRestoreNotification')) {
            let info = `There are unresolved dependencies from '${vscode.workspace.asRelativePath(message.FileName)}'. Please execute the restore command to continue.`;
            return vscode.window.showInformationMessage(info, 'Restore').then(value => {
                if (value) {
                    commands_1.dotnetRestoreForProject(server, message.FileName);
                }
            });
        }
    });
    return vscode.Disposable.from(d0, d1, d2, d3);
}
exports.reportServerStatus = reportServerStatus;
// show user message
let _messageHandle;
function showMessageSoon() {
    clearTimeout(_messageHandle);
    _messageHandle = setTimeout(function () {
        let message = "Some projects have trouble loading. Please review the output for more details.";
        vscode.window.showWarningMessage(message, { title: "Show Output", command: 'o.showOutput' }).then(value => {
            if (value) {
                vscode.commands.executeCommand(value.command);
            }
        });
    }, 1500);
}
// --- mirror output in channel
function forwardOutput(server) {
    const logChannel = server.getChannel();
    function forward(message) {
        logChannel.append(message);
    }
    return vscode.Disposable.from(server.onStderr(forward));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhdHVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2ZlYXR1cmVzL3N0YXR1cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRztBQUNoRyxZQUFZLENBQUM7O0FBRWIsaUNBQWlDO0FBRWpDLHlDQUFtRDtBQUNuRCwrQkFBOEI7QUFFOUIsa0RBQWtEO0FBRWxELE1BQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0FBRTVDLHNCQUFxQyxNQUF1QjtJQUN4RCxNQUFNLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQ3pCLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxFQUMxQixhQUFhLENBQUMsTUFBTSxDQUFDLEVBQ3JCLG9CQUFvQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7QUFDdEMsQ0FBQztBQUxELCtCQUtDO0FBRUQsc0JBQXNCO0FBRXRCLElBQUksZUFBZSxHQUE0QjtJQUMzQyxRQUFRO0lBQ1IsRUFBRSxPQUFPLEVBQUUsaUJBQWlCLEVBQUU7SUFDOUIsRUFBRSxPQUFPLEVBQUUsVUFBVSxFQUFFO0lBQ3ZCLEVBQUUsT0FBTyxFQUFFLGFBQWEsRUFBRTtJQUMxQixFQUFFLE9BQU8sRUFBRSxVQUFVLEVBQUU7SUFDdkIsRUFBRSxPQUFPLEVBQUUsV0FBVyxFQUFFLENBQUMsY0FBYztDQUMxQyxDQUFDO0FBRUY7SUFPSSxZQUFZLFFBQWlDO1FBQ3pDLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO0lBQzdCLENBQUM7Q0FDSjtBQUVELDhCQUFxQyxNQUF1QjtJQUV4RCxJQUFJLFdBQVcsR0FBd0IsRUFBRSxDQUFDO0lBQzFDLElBQUksZ0JBQXFDLENBQUM7SUFFMUMsSUFBSSxLQUFLLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxNQUFNLENBQUMsa0JBQWtCLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztJ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