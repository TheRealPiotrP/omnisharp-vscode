/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
var Requests;
(function (Requests) {
    Requests.AddToProject = '/addtoproject';
    Requests.AutoComplete = '/autocomplete';
    Requests.CodeCheck = '/codecheck';
    Requests.CodeFormat = '/codeformat';
    Requests.ChangeBuffer = '/changebuffer';
    Requests.CurrentFileMembersAsTree = '/currentfilemembersastree';
    Requests.FilesChanged = '/filesChanged';
    Requests.FindSymbols = '/findsymbols';
    Requests.FindUsages = '/findusages';
    Requests.FormatAfterKeystroke = '/formatAfterKeystroke';
    Requests.FormatRange = '/formatRange';
    Requests.GetCodeActions = '/getcodeactions';
    Requests.GoToDefinition = '/gotoDefinition';
    Requests.FindImplementations = '/findimplementations';
    Requests.Project = '/project';
    Requests.Projects = '/projects';
    Requests.RemoveFromProject = '/removefromproject';
    Requests.Rename = '/rename';
    Requests.RunCodeAction = '/runcodeaction';
    Requests.SignatureHelp = '/signatureHelp';
    Requests.TypeLookup = '/typelookup';
    Requests.UpdateBuffer = '/updatebuffer';
    Requests.Metadata = '/metadata';
})(Requests = exports.Requests || (exports.Requests = {}));
var FileModificationType;
(function (FileModificationType) {
    FileModificationType[FileModificationType["Modified"] = 0] = "Modified";
    FileModificationType[FileModificationType["Opened"] = 1] = "Opened";
    FileModificationType[FileModificationType["Renamed"] = 2] = "Renamed";
})(FileModificationType = exports.FileModificationType || (exports.FileModificationType = {}));
var FileChangeType;
(function (FileChangeType) {
    FileChangeType["Change"] = "Change";
    FileChangeType["Create"] = "Create";
    FileChangeType["Delete"] = "Delete";
})(FileChangeType = exports.FileChangeType || (exports.FileChangeType = {}));
var V2;
(function (V2) {
    let Requests;
    (function (Requests) {
        Requests.GetCodeActions = '/v2/getcodeactions';
        Requests.RunCodeAction = '/v2/runcodeaction';
        Requests.GetTestStartInfo = '/v2/getteststartinfo';
        Requests.RunTest = '/v2/runtest';
        Requests.RunAllTestsInClass = "/v2/runtestsinclass";
        Requests.DebugTestGetStartInfo = '/v2/debugtest/getstartinfo';
        Requests.DebugTestsInClassGetStartInfo = '/v2/debugtestsinclass/getstartinfo';
        Requests.DebugTestLaunch = '/v2/debugtest/launch';
        Requests.DebugTestStop = '/v2/debugtest/stop';
    })(Requests = V2.Requests || (V2.Requests = {}));
    let TestOutcomes;
    (function (TestOutcomes) {
        TestOutcomes.None = 'none';
        TestOutcomes.Passed = 'passed';
        TestOutcomes.Failed = 'failed';
        TestOutcomes.Skipped = 'skipped';
        TestOutcomes.NotFound = 'notfound';
    })(TestOutcomes = V2.TestOutcomes || (V2.TestOutcomes = {}));
})(V2 = exports.V2 || (exports.V2 = {}));
function findNetFrameworkTargetFramework(project) {
    let regexp = new RegExp('^net[1-4]');
    return project.TargetFrameworks.find(tf => regexp.test(tf.ShortName));
}
exports.findNetFrameworkTargetFramework = findNetFrameworkTargetFramework;
function findNetCoreAppTargetFramework(project) {
    return project.TargetFrameworks.find(tf => tf.ShortName.startsWith('netcoreapp'));
}
exports.findNetCoreAppTargetFramework = findNetCoreAppTargetFramework;
function findNetStandardTargetFramework(project) {
    return project.TargetFrameworks.find(tf => tf.ShortName.startsWith('netstandard'));
}
exports.findNetStandardTargetFramework = findNetStandardTargetFramework;
function isDotNetCoreProject(project) {
    return findNetCoreAppTargetFramework(project) !== undefined ||
        findNetStandardTargetFramework(project) !== undefined ||
        findNetFrameworkTargetFramework(project) !== undefined;
}
exports.isDotNetCoreProject = isDotNetCoreProject;
function getDotNetCoreProjectDescriptors(info) {
    let result = [];
    if (info.DotNet && info.DotNet.Projects.length > 0) {
        for (let project of info.DotNet.Projects) {
            result.push({
                Name: project.Name,
                Directory: project.Path,
                FilePath: path.join(project.Path, 'project.json')
            });
        }
    }
    if (info.MsBuild && info.MsBuild.Projects.length > 0) {
        for (let project of info.MsBuild.Projects) {
            if (isDotNetCoreProject(project)) {
                result.push({
                    Name: path.basename(project.Path),
                    Directory: path.dirname(project.Path),
                    FilePath: project.Path
                });
            }
        }
    }
    return result;
}
exports.getDotNetCoreProjectDescriptors = getDotNetCoreProjectDescriptors;
function findExecutableMSBuildProjects(projects) {
    let result = [];
    projects.forEach(project => {
        if (project.IsExe && findNetCoreAppTargetFramework(project) !== undefined) {
            result.push(project);
        }
    });
    return result;
}
exports.findExecutableMSBuildProjects = findExecutableMSBuildProjects;
function findExecutableProjectJsonProjects(projects, configurationName) {
    let result = [];
    projects.forEach(project => {
        project.Configurations.forEach(configuration => {
            if (configuration.Name === configurationName && configuration.EmitEntryPoint === true) {
                if (project.Frameworks.length > 0) {
                    result.push(project);
                }
            }
        });
    });
    return result;
}
exports.findExecutableProjectJsonProjects = findExecutableProjectJsonProjects;
function containsDotNetCoreProjects(workspaceInfo) {
    if (workspaceInfo.DotNet && findExecutableProjectJsonProjects(workspaceInfo.DotNet.Projects, 'Debug').length > 0) {
        return true;
    }
    if (workspaceInfo.MsBuild && findExecutableMSBuildProjects(workspaceInfo.MsBuild.Projects).length > 0) {
        return true;
    }
    return false;
}
exports.containsDotNetCoreProjects = containsDotNetCoreProjects;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvdG9jb2wuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvb21uaXNoYXJwL3Byb3RvY29sLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHO0FBRWhHLFlBQVksQ0FBQzs7QUFFYiw2QkFBNkI7QUFFN0IsSUFBYyxRQUFRLENBd0JyQjtBQXhCRCxXQUFjLFFBQVE7SUFDTCxxQkFBWSxHQUFHLGVBQWUsQ0FBQztJQUMvQixxQkFBWSxHQUFHLGVBQWUsQ0FBQztJQUMvQixrQkFBUyxHQUFHLFlBQVksQ0FBQztJQUN6QixtQkFBVSxHQUFHLGFBQWEsQ0FBQztJQUMzQixxQkFBWSxHQUFHLGVBQWUsQ0FBQztJQUMvQixpQ0FBd0IsR0FBRywyQkFBMkIsQ0FBQztJQUN2RCxxQkFBWSxHQUFHLGVBQWUsQ0FBQztJQUMvQixvQkFBVyxHQUFHLGNBQWMsQ0FBQztJQUM3QixtQkFBVSxHQUFHLGFBQWEsQ0FBQztJQUMzQiw2QkFBb0IsR0FBRyx1QkFBdUIsQ0FBQztJQUMvQyxvQkFBVyxHQUFHLGNBQWMsQ0FBQztJQUM3Qix1QkFBYyxHQUFHLGlCQUFpQixDQUFDO0lBQ25DLHVCQUFjLEdBQUcsaUJBQWlCLENBQUM7SUFDbkMsNEJBQW1CLEdBQUcsc0JBQXNCLENBQUM7SUFDN0MsZ0JBQU8sR0FBRyxVQUFVLENBQUM7SUFDckIsaUJBQVEsR0FBRyxXQUFXLENBQUM7SUFDdkIsMEJBQWlCLEdBQUcsb0JBQW9CLENBQUM7SUFDekMsZUFBTSxHQUFHLFNBQVMsQ0FBQztJQUNuQixzQkFBYSxHQUFHLGdCQUFnQixDQUFDO0lBQ2pDLHNCQUFhLEdBQUcsZ0JBQWdCLENBQUM7SUFDakMsbUJBQVUsR0FBRyxhQUFhLENBQUM7SUFDM0IscUJBQVksR0FBRyxlQUFlLENBQUM7SUFDL0IsaUJBQVEsR0FBRyxXQUFXLENBQUM7QUFDeEMsQ0FBQyxFQXhCYSxRQUFRLEdBQVIsZ0JBQVEsS0FBUixnQkFBUSxRQXdCckI7QUF5VkQs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