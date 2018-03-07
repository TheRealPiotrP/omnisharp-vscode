"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs-extra");
const path = require("path");
const serverUtils = require("./omnisharp/utils");
const assets_1 = require("./assets");
const protocol_1 = require("./omnisharp/protocol");
const common_1 = require("./common");
const jsonc_parser_1 = require("jsonc-parser");
class CSharpConfigurationProvider {
    constructor(server) {
        this.server = server;
    }
    /**
     * TODO: Remove function when https://github.com/OmniSharp/omnisharp-roslyn/issues/909 is resolved.
     *
     * Note: serverUtils.requestWorkspaceInformation only retrieves one folder for multi-root workspaces. Therefore, generator will be incorrect for all folders
     * except the first in a workspace. Currently, this only works if the requested folder is the same as the server's solution path or folder.
     */
    checkWorkspaceInformationMatchesWorkspaceFolder(folder) {
        const solutionPathOrFolder = this.server.getSolutionPathOrFolder();
        // Make sure folder, folder.uri, and solutionPathOrFolder are defined.
        if (!folder || !folder.uri || !solutionPathOrFolder) {
            return Promise.resolve(false);
        }
        let serverFolder = solutionPathOrFolder;
        // If its a .sln file, get the folder of the solution.
        return fs.lstat(solutionPathOrFolder).then(stat => {
            return stat.isFile();
        }).then(isFile => {
            if (isFile) {
                serverFolder = path.dirname(solutionPathOrFolder);
            }
            // Get absolute paths of current folder and server folder.
            const currentFolder = path.resolve(folder.uri.fsPath);
            serverFolder = path.resolve(serverFolder);
            return currentFolder && folder.uri && common_1.isSubfolderOf(serverFolder, currentFolder);
        });
    }
    /**
     * Returns a list of initial debug configurations based on contextual information, e.g. package.json or folder.
     */
    provideDebugConfigurations(folder, token) {
        return serverUtils.requestWorkspaceInformation(this.server).then(info => {
            return this.checkWorkspaceInformationMatchesWorkspaceFolder(folder).then(workspaceMatches => {
                const generator = new assets_1.AssetGenerator(info);
                if (workspaceMatches && protocol_1.containsDotNetCoreProjects(info)) {
                    const dotVscodeFolder = path.join(folder.uri.fsPath, '.vscode');
                    const tasksJsonPath = path.join(dotVscodeFolder, 'tasks.json');
                    // Make sure .vscode folder exists, addTasksJsonIfNecessary will fail to create tasks.json if the folder does not exist. 
                    return fs.ensureDir(dotVscodeFolder).then(() => {
                        // Check to see if tasks.json exists.
                        return fs.pathExists(tasksJsonPath);
                    }).then(tasksJsonExists => {
                        // Enable addTasksJson if it does not exist.
                        return assets_1.addTasksJsonIfNecessary(generator, { addTasksJson: !tasksJsonExists });
                    }).then(() => {
                        const isWebProject = generator.hasWebServerDependency();
                        const launchJson = generator.createLaunchJson(isWebProject);
                        // jsonc-parser's parse function parses a JSON string with comments into a JSON object. However, this removes the comments. 
                        return jsonc_parser_1.parse(launchJson);
                    });
                }
                // Error to be caught in the .catch() below to write default C# configurations
                throw new Error("Does not contain .NET Core projects.");
            });
        }).catch((err) => {
            // Provider will always create an launch.json file. Providing default C# configurations.
            // jsonc-parser's parse to convert to JSON object without comments. 
            return [
                jsonc_parser_1.parse(assets_1.createLaunchConfiguration("${workspaceFolder}/bin/Debug/<insert-target-framework-here>/<insert-project-name-here>.dll", '${workspaceFolder}')),
                jsonc_parser_1.parse(assets_1.createWebLaunchConfiguration("${workspaceFolder}/bin/Debug/<insert-target-framework-here>/<insert-project-name-here>.dll", '${workspaceFolder}')),
                jsonc_parser_1.parse(assets_1.createAttachConfiguration())
            ];
        });
    }
    /**
     * Try to add all missing attributes to the debug configuration being launched.
     */
    resolveDebugConfiguration(folder, config, token) {
        // vsdbg does the error checking
        return config;
    }
}
exports.CSharpConfigurationProvider = CSharpConfigurationProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlndXJhdGlvblByb3ZpZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvbmZpZ3VyYXRpb25Qcm92aWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7OztnR0FHZ0c7O0FBRWhHLCtCQUErQjtBQUMvQiw2QkFBNkI7QUFDN0IsaURBQWlEO0FBR2pELHFDQUF1SjtBQUd2SixtREFBa0U7QUFDbEUscUNBQXlDO0FBQ3pDLCtDQUFxQztBQUVyQztJQUdJLFlBQW1CLE1BQXVCO1FBQ3RDLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0lBQ3pCLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNLLCtDQUErQyxDQUFDLE1BQTBDO1FBQzlGLE1BQU0sb0JBQW9CLEdBQVcsSUFBSSxDQUFDLE1BQU0sQ0FBQyx1QkFBdUIsRUFBRSxDQUFDO1FBRTNFLHNFQUFzRTtRQUN0RSxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxDQUNwRCxDQUFDO1lBQ0csTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDbEMsQ0FBQztRQUVELElBQUksWUFBWSxHQUFHLG9CQUFvQixDQUFDO1FBQ3hDLHNEQUFzRDtRQUN0RCxNQUFNLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUM5QyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ3pCLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRTtZQUNiLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUNYLENBQUM7Z0JBQ0csWUFBWSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsb0JBQW9CLENBQUMsQ0FBQztZQUN0RCxDQUFDO1lBRUQsMERBQTBEO1lB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