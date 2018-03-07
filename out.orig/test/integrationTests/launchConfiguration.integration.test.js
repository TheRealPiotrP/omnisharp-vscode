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
const fs = require("async-file");
const vscode = require("vscode");
const poll_1 = require("./poll");
const chai_1 = require("chai");
const testAssetWorkspace_1 = require("./testAssets/testAssetWorkspace");
const chai = require('chai');
chai.use(require('chai-arrays'));
chai.use(require('chai-fs'));
suite(`Tasks generation: ${testAssetWorkspace_1.default.description}`, function () {
    suiteSetup(function () {
        return __awaiter(this, void 0, void 0, function* () {
            chai_1.should();
            let csharpExtension = vscode.extensions.getExtension("ms-vscode.csharp");
            if (!csharpExtension.isActive) {
                yield csharpExtension.activate();
            }
            yield testAssetWorkspace_1.default.cleanupWorkspace();
            yield csharpExtension.exports.initializationFinished;
            yield csharpExtension.exports.initializationFinished;
            yield vscode.commands.executeCommand("dotnet.generateAssets");
            yield poll_1.default(() => __awaiter(this, void 0, void 0, function* () { return yield fs.exists(testAssetWorkspace_1.default.launchJsonPath); }), 10000, 100);
        });
    });
    test("Starting .NET Core Launch (console) from the workspace root should create an Active Debug Session", () => __awaiter(this, void 0, void 0, function* () {
        yield vscode.debug.startDebugging(vscode.workspace.workspaceFolders[0], ".NET Core Launch (console)");
        let debugSessionTerminated = new Promise(resolve => {
            vscode.debug.onDidTerminateDebugSession((e) => resolve());
        });
        vscode.debug.activeDebugSession.type.should.equal("coreclr");
        yield debugSessionTerminated;
    }));
    teardown(() => __awaiter(this, void 0, void 0, function* () {
        yield testAssetWorkspace_1.default.cleanupWorkspace();
    }));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGF1bmNoQ29uZmlndXJhdGlvbi5pbnRlZ3JhdGlvbi50ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vdGVzdC9pbnRlZ3JhdGlvblRlc3RzL2xhdW5jaENvbmZpZ3VyYXRpb24uaW50ZWdyYXRpb24udGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7QUFFaEcsaUNBQWlDO0FBQ2pDLGlDQUFpQztBQUVqQyxpQ0FBMEI7QUFDMUIsK0JBQThCO0FBQzlCLHdFQUFpRTtBQUVqRSxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDN0IsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztBQUNqQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO0FBRTdCLEtBQUssQ0FBQyxxQkFBcUIsNEJBQWtCLENBQUMsV0FBVyxFQUFFLEVBQUU7SUFDekQsVUFBVSxDQUFDOztZQUNQLGFBQU0sRUFBRSxDQUFDO1lBRVQsSUFBSSxlQUFlLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsa0JBQWtCLENBQUMsQ0FBQztZQUN6RSxFQUFFLENBQUMsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO2dCQUM1QixNQUFNLGVBQWUsQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUNyQyxDQUFDO1lBRUQsTUFBTSw0QkFBa0IsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1lBRTVDLE1BQU0sZUFBZSxDQUFDLE9BQU8sQ0FBQyxzQkFBc0IsQ0FBQztZQUVyRCxNQUFNLGVBQWUsQ0FBQyxPQUFPLENBQUMsc0JBQXNCLENBQUM7WUFFckQsTUFBTSxNQUFNLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO1lBRTlELE1BQU0sY0FBSSxDQUFDLEdBQVMsRUFBRSxnREFBQyxNQUFNLENBQU4sTUFBTSxFQUFFLENBQUMsTUFBTSxDQUFDLDRCQUFrQixDQUFDLGNBQWMsQ0FBQyxDQUFBLEdBQUEsRUFBRSxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDM0YsQ0FBQztLQUFBLENBQUMsQ0FBQztJQUVILElBQUksQ0FBQyxtR0FBbUcsRUFBRSxHQUFTLEVBQUU7UUFDakgsTUFBTSxNQUFNLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxFQUFFLDRCQUE0QixDQUFDLENBQUM7UUFFdEcsSUFBSSxzQkFBc0IsR0FBRyxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRTtZQUMvQyxNQUFNLENBQUMsS0FBSyxDQUFDLDBCQUEwQixDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1FBQzlELENBQUMsQ0FBQyxDQUFDO1FBRUgsTUFBTSxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUU3RCxNQUFNLHNCQUFzQixDQUFDO0lBQ2pDLENBQUMsQ0FBQSxDQUFDLENBQUM7SUFFSCxRQUFRLENBQUMsR0FBUyxFQUFFO1FBQ2hCLE1BQU0sNEJBQWtCLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztJQUNoRCxDQUFDLENBQUEsQ0FBQyxDQUFDO0FBQ1AsQ0FBQyxDQUFDLENBQUMifQ==