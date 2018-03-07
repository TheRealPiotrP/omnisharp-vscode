"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const vscode = require("vscode");
const testAssets_1 = require("./testAssets");
const singleCsproj_1 = require("./singleCsproj");
const slnWithCsproj_1 = require("./slnWithCsproj");
const testAssetWorkspaces = {
    singleCsproj: singleCsproj_1.default,
    slnWithCsproj: slnWithCsproj_1.default
};
const workspaceName = vscode.workspace.rootPath
    .split(path.sep)
    .pop();
const activeTestAssetWorkspace = new testAssets_1.TestAssetWorkspace(testAssetWorkspaces[workspaceName]);
exports.default = activeTestAssetWorkspace;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdEFzc2V0V29ya3NwYWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vdGVzdC9pbnRlZ3JhdGlvblRlc3RzL3Rlc3RBc3NldHMvdGVzdEFzc2V0V29ya3NwYWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O2dHQUdnRzs7QUFFaEcsNkJBQTZCO0FBQzdCLGlDQUFpQztBQUVqQyw2Q0FBcUU7QUFFckUsaURBQTBDO0FBQzFDLG1EQUE0QztBQUU1QyxNQUFNLG1CQUFtQixHQUF5QztJQUM5RCxZQUFZLEVBQVosc0JBQVk7SUFDWixhQUFhLEVBQWIsdUJBQWE7Q0FDaEIsQ0FBQztBQUVGLE1BQU0sYUFBYSxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUMsUUFBUTtLQUMxQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQztLQUNmLEdBQUcsRUFBRSxDQUFDO0FBRVgsTUFBTSx3QkFBd0IsR0FBRyxJQUFJLCtCQUFrQixDQUFDLG1CQUFtQixDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7QUFFNUYsa0JBQWUsd0JBQXdCLENBQUMifQ==