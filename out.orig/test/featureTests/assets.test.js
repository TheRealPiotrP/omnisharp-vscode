"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const vscode = require("vscode");
const assets_1 = require("../../src/assets");
const jsonc_parser_1 = require("jsonc-parser");
const chai_1 = require("chai");
suite("Asset generation: project.json", () => {
    suiteSetup(() => chai_1.should());
    test("Create tasks.json for project opened in workspace", () => {
        let rootPath = path.resolve('testRoot');
        let info = createDotNetWorkspaceInformation(rootPath, 'testApp.dll', 'netcoreapp1.0');
        let generator = new assets_1.AssetGenerator(info, createMockWorkspaceFolder(rootPath));
        let tasksJson = generator.createTasksConfiguration();
        let buildPath = tasksJson.tasks[0].args[1];
        // ${workspaceFolder}/project.json
        let segments = buildPath.split(path.posix.sep);
        segments.should.deep.equal(['${workspaceFolder}', 'project.json']);
    });
    test("Create tasks.json for nested project opened in workspace", () => {
        let rootPath = path.resolve('testRoot');
        let info = createDotNetWorkspaceInformation(path.join(rootPath, 'nested'), 'testApp.dll', 'netcoreapp1.0');
        let generator = new assets_1.AssetGenerator(info, createMockWorkspaceFolder(rootPath));
        let tasksJson = generator.createTasksConfiguration();
        let buildPath = tasksJson.tasks[0].args[1];
        // ${workspaceFolder}/nested/project.json
        let segments = buildPath.split(path.posix.sep);
        segments.should.deep.equal(['${workspaceFolder}', 'nested', 'project.json']);
    });
    test("Create launch.json for project opened in workspace", () => {
        let rootPath = path.resolve('testRoot');
        let info = createDotNetWorkspaceInformation(rootPath, 'testApp.dll', 'netcoreapp1.0');
        let generator = new assets_1.AssetGenerator(info, createMockWorkspaceFolder(rootPath));
        let launchJson = jsonc_parser_1.parse(generator.createLaunchJson(/*isWebProject*/ false), undefined, { disallowComments: true });
        let programPath = launchJson[0].program;
        // ${workspaceFolder}/bin/Debug/netcoreapp1.0/testApp.dll
        let segments = programPath.split(path.posix.sep);
        segments.should.deep.equal(['${workspaceFolder}', 'bin', 'Debug', 'netcoreapp1.0', 'testApp.dll']);
    });
    test("Create launch.json for nested project opened in workspace", () => {
        let rootPath = path.resolve('testRoot');
        let info = createDotNetWorkspaceInformation(path.join(rootPath, 'nested'), 'testApp.dll', 'netcoreapp1.0');
        let generator = new assets_1.AssetGenerator(info, createMockWorkspaceFolder(rootPath));
        let launchJson = jsonc_parser_1.parse(generator.createLaunchJson(/*isWebProject*/ false), undefined, { disallowComments: true });
        let programPath = launchJson[0].program;
        // ${workspaceFolder}/nested/bin/Debug/netcoreapp1.0/testApp.dll
        let segments = programPath.split(path.posix.sep);
        segments.should.deep.equal(['${workspaceFolder}', 'nested', 'bin', 'Debug', 'netcoreapp1.0', 'testApp.dll']);
    });
    test("Create launch.json for web project opened in workspace", () => {
        let rootPath = path.resolve('testRoot');
        let info = createDotNetWorkspaceInformation(rootPath, 'testApp.dll', 'netcoreapp1.0');
        let generator = new assets_1.AssetGenerator(info, createMockWorkspaceFolder(rootPath));
        let launchJson = jsonc_parser_1.parse(generator.createLaunchJson(/*isWebProject*/ true), undefined, { disallowComments: true });
        let programPath = launchJson[0].program;
        // ${workspaceFolder}/bin/Debug/netcoreapp1.0/testApp.dll
        let segments = programPath.split(path.posix.sep);
        segments.should.deep.equal(['${workspaceFolder}', 'bin', 'Debug', 'netcoreapp1.0', 'testApp.dll']);
    });
    test("Create launch.json for nested web project opened in workspace", () => {
        let rootPath = path.resolve('testRoot');
        let info = createDotNetWorkspaceInformation(path.join(rootPath, 'nested'), 'testApp.dll', 'netcoreapp1.0');
        let generator = new assets_1.AssetGenerator(info, createMockWorkspaceFolder(rootPath));
        let launchJson = jsonc_parser_1.parse(generator.createLaunchJson(/*isWebProject*/ true), undefined, { disallowComments: true });
        let programPath = launchJson[0].program;
        // ${workspaceFolder}/nested/bin/Debug/netcoreapp1.0/testApp.dll
        let segments = programPath.split(path.posix.sep);
        segments.should.deep.equal(['${workspaceFolder}', 'nested', 'bin', 'Debug', 'netcoreapp1.0', 'testApp.dll']);
    });
});
suite("Asset generation: csproj", () => {
    suiteSetup(() => chai_1.should());
    test("Create tasks.json for project opened in workspace", () => {
        let rootPath = path.resolve('testRoot');
        let info = createMSBuildWorkspaceInformation(path.join(rootPath, 'testApp.csproj'), 'testApp', 'netcoreapp1.0');
        let generator = new assets_1.AssetGenerator(info, createMockWorkspaceFolder(rootPath));
        let tasksJson = generator.createTasksConfiguration();
        let buildPath = tasksJson.tasks[0].args[1];
        // ${workspaceFolder}/project.json
        let segments = buildPath.split(path.posix.sep);
        segments.should.deep.equal(['${workspaceFolder}', 'testApp.csproj']);
    });
    test("Create tasks.json for nested project opened in workspace", () => {
        let rootPath = path.resolve('testRoot');
        let info = createMSBuildWorkspaceInformation(path.join(rootPath, 'nested', 'testApp.csproj'), 'testApp', 'netcoreapp1.0');
        let generator = new assets_1.AssetGenerator(info, createMockWorkspaceFolder(rootPath));
        let tasksJson = generator.createTasksConfiguration();
        let buildPath = tasksJson.tasks[0].args[1];
        // ${workspaceFolder}/nested/project.json
        let segments = buildPath.split(path.posix.sep);
        segments.should.deep.equal(['${workspaceFolder}', 'nested', 'testApp.csproj']);
    });
    test("Create launch.json for project opened in workspace", () => {
        let rootPath = path.resolve('testRoot');
        let info = createMSBuildWorkspaceInformation(path.join(rootPath, 'testApp.csproj'), 'testApp', 'netcoreapp1.0');
        let generator = new assets_1.AssetGenerator(info, createMockWorkspaceFolder(rootPath));
        let launchJson = jsonc_parser_1.parse(generator.createLaunchJson(/*isWebProject*/ false), undefined, { disallowComments: true });
        let programPath = launchJson[0].program;
        // ${workspaceFolder}/bin/Debug/netcoreapp1.0/testApp.dll
        let segments = programPath.split(path.posix.sep);
        segments.should.deep.equal(['${workspaceFolder}', 'bin', 'Debug', 'netcoreapp1.0', 'testApp.dll']);
    });
    test("Create launch.json for nested project opened in workspace", () => {
        let rootPath = path.resolve('testRoot');
        let info = createMSBuildWorkspaceInformation(path.join(rootPath, 'nested', 'testApp.csproj'), 'testApp', 'netcoreapp1.0');
        let generator = new assets_1.AssetGenerator(info, createMockWorkspaceFolder(rootPath));
        let launchJson = jsonc_parser_1.parse(generator.createLaunchJson(/*isWebProject*/ false), undefined, { disallowComments: true });
        let programPath = launchJson[0].program;
        // ${workspaceFolder}/nested/bin/Debug/netcoreapp1.0/testApp.dll
        let segments = programPath.split(path.posix.sep);
        segments.should.deep.equal(['${workspaceFolder}', 'nested', 'bin', 'Debug', 'netcoreapp1.0', 'testApp.dll']);
    });
    test("Create launch.json for web project opened in workspace", () => {
        let rootPath = path.resolve('testRoot');
        let info = createMSBuildWorkspaceInformation(path.join(rootPath, 'testApp.csproj'), 'testApp', 'netcoreapp1.0');
        let generator = new assets_1.AssetGenerator(info, createMockWorkspaceFolder(rootPath));
        let launchJson = jsonc_parser_1.parse(generator.createLaunchJson(/*isWebProject*/ true), undefined, { disallowComments: true });
        let programPath = launchJson[0].program;
        // ${workspaceFolder}/bin/Debug/netcoreapp1.0/testApp.dll
        let segments = programPath.split(path.posix.sep);
        segments.should.deep.equal(['${workspaceFolder}', 'bin', 'Debug', 'netcoreapp1.0', 'testApp.dll']);
    });
    test("Create launch.json for nested web project opened in workspace", () => {
        let rootPath = path.resolve('testRoot');
        let info = createMSBuildWorkspaceInformation(path.join(rootPath, 'nested', 'testApp.csproj'), 'testApp', 'netcoreapp1.0');
        let generator = new assets_1.AssetGenerator(info, createMockWorkspaceFolder(rootPath));
        let launchJson = jsonc_parser_1.parse(generator.createLaunchJson(/*isWebProject*/ true), undefined, { disallowComments: true });
        let programPath = launchJson[0].program;
        // ${workspaceFolder}/nested/bin/Debug/netcoreapp1.0/testApp.dll
        let segments = programPath.split(path.posix.sep);
        segments.should.deep.equal(['${workspaceFolder}', 'nested', 'bin', 'Debug', 'netcoreapp1.0', 'testApp.dll']);
    });
});
function createMockWorkspaceFolder(rootPath) {
    return {
        uri: vscode.Uri.file(rootPath),
        name: undefined,
        index: undefined
    };
}
function createDotNetWorkspaceInformation(projectPath, compilationOutputAssemblyFile, targetFrameworkShortName, emitEntryPoint = true) {
    return {
        DotNet: {
            Projects: [
                {
                    Path: projectPath,
                    Name: '',
                    ProjectSearchPaths: [],
                    Configurations: [
                        {
                            Name: 'Debug',
                            CompilationOutputPath: '',
                            CompilationOutputAssemblyFile: compilationOutputAssemblyFile,
                            CompilationOutputPdbFile: '',
                            EmitEntryPoint: emitEntryPoint
                        }
                    ],
                    Frameworks: [
                        {
                            Name: '',
                            FriendlyName: '',
                            ShortName: targetFrameworkShortName
                        }
                    ],
                    SourceFiles: []
                }
            ],
            RuntimePath: ''
        }
    };
}
function createMSBuildWorkspaceInformation(projectPath, assemblyName, targetFrameworkShortName, isExe = true) {
    return {
        MsBuild: {
            SolutionPath: '',
            Projects: [
                {
                    ProjectGuid: '',
                    Path: projectPath,
                    AssemblyName: assemblyName,
                    TargetPath: '',
                    TargetFramework: '',
                    SourceFiles: [],
                    TargetFrameworks: [
                        {
                            Name: '',
                            FriendlyName: '',
                            ShortName: targetFrameworkShortName
                        }
                    ],
                    OutputPath: '',
                    IsExe: isExe,
                    IsUnityProject: false
                }
            ],
        }
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXNzZXRzLnRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi90ZXN0L2ZlYXR1cmVUZXN0cy9hc3NldHMudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7OztnR0FHZ0c7O0FBRWhHLDZCQUE2QjtBQUU3QixpQ0FBaUM7QUFFakMsNkNBQWtEO0FBQ2xELCtDQUFxQztBQUNyQywrQkFBOEI7QUFFOUIsS0FBSyxDQUFDLGdDQUFnQyxFQUFFLEdBQUcsRUFBRTtJQUN6QyxVQUFVLENBQUMsR0FBRyxFQUFFLENBQUMsYUFBTSxFQUFFLENBQUMsQ0FBQztJQUUzQixJQUFJLENBQUMsbURBQW1ELEVBQUUsR0FBRyxFQUFFO1FBQzNELElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDeEMsSUFBSSxJQUFJLEdBQUcsZ0NBQWdDLENBQUMsUUFBUSxFQUFFLGFBQWEsRUFBRSxlQUFlLENBQUMsQ0FBQztRQUN0RixJQUFJLFNBQVMsR0FBRyxJQUFJLHVCQUFjLENBQUMsSUFBSSxFQUFFLHlCQUF5QixDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFDOUUsSUFBSSxTQUFTLEdBQUcsU0FBUyxDQUFDLHdCQUF3QixFQUFFLENBQUM7UUFDckQsSUFBSSxTQUFTLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFM0Msa0NBQWtDO1FBQ2xDLElBQUksUUFBUSxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUMvQyxRQUFRLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxvQkFBb0IsRUFBRSxjQUFjLENBQUMsQ0FBQyxDQUFDO0lBQ3ZFLENBQUMsQ0FBQyxDQUFDO0lBRUgsSUFBSSxDQUFDLDBEQUEwRCxFQUFFLEdBQUcsRUFB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