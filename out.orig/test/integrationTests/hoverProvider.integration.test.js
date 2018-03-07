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
const vscode = require("vscode");
const path = require("path");
const chai_1 = require("chai");
const testAssetWorkspace_1 = require("./testAssets/testAssetWorkspace");
const extension_1 = require("../../src/omnisharp/extension");
const chai = require('chai');
chai.use(require('chai-arrays'));
chai.use(require('chai-fs'));
suite(`Hover Provider: ${testAssetWorkspace_1.default.description}`, function () {
    suiteSetup(function () {
        return __awaiter(this, void 0, void 0, function* () {
            chai_1.should();
            let csharpExtension = vscode.extensions.getExtension("ms-vscode.csharp");
            if (!csharpExtension.isActive) {
                yield csharpExtension.activate();
            }
            yield csharpExtension.exports.initializationFinished;
        });
    });
    test("Hover returns structured documentation with proper newlines", function () {
        return __awaiter(this, void 0, void 0, function* () {
            let fileName = 'hover.cs';
            let dir = path.dirname(testAssetWorkspace_1.default.projects[0].projectDirectoryPath);
            let loc = path.join(dir, fileName);
            let fileUri = vscode.Uri.file(loc);
            yield extension_1.omnisharp.waitForEmptyEventQueue();
            yield vscode.commands.executeCommand("vscode.open", fileUri);
            let c = yield vscode.commands.executeCommand("vscode.executeHoverProvider", fileUri, new vscode.Position(10, 29));
            let answer = `Checks if object is tagged with the tag.

Parameters:

\t\tgameObject: The game object.
\t\ttagName: Name of the tag.

Returns true if object is tagged with tag.`;
            chai_1.expect(c[0].contents[0].value).to.equal(answer);
        });
    });
    teardown(() => __awaiter(this, void 0, void 0, function* () {
        yield testAssetWorkspace_1.default.cleanupWorkspace();
    }));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaG92ZXJQcm92aWRlci5pbnRlZ3JhdGlvbi50ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vdGVzdC9pbnRlZ3JhdGlvblRlc3RzL2hvdmVyUHJvdmlkZXIuaW50ZWdyYXRpb24udGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7OzsrRkFHK0Y7Ozs7Ozs7Ozs7QUFHL0YsaUNBQWlDO0FBQ2pDLDZCQUE2QjtBQUc3QiwrQkFBc0M7QUFDdEMsd0VBQWlFO0FBR2pFLDZEQUEwRDtBQUUxRCxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDN0IsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztBQUNqQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO0FBRTdCLEtBQUssQ0FBQyxtQkFBbUIsNEJBQWtCLENBQUMsV0FBVyxFQUFFLEVBQUU7SUFDdkQsVUFBVSxDQUFDOztZQUNQLGFBQU0sRUFBRSxDQUFDO1lBRVQsSUFBSSxlQUFlLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsa0JBQWtCLENBQUMsQ0FBQztZQUN6RSxFQUFFLENBQUMsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO2dCQUM1QixNQUFNLGVBQWUsQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUNyQyxDQUFDO1lBRUQsTUFBTSxlQUFlLENBQUMsT0FBTyxDQUFDLHNCQUFzQixDQUFDO1FBQ3pELENBQUM7S0FBQSxDQUFDLENBQUM7SUFFSCxJQUFJLENBQUMsNkRBQTZELEVBQUU7O1lBQ2hFLElBQUksUUFBUSxHQUFHLFVBQVUsQ0FBQztZQUMxQixJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLDRCQUFrQixDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1lBQzVFLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQ25DLElBQUksT0FBTyxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ25DLE1BQU0scUJBQVMsQ0FBQyxzQkFBc0IsRUFBRSxDQUFDO1lBRXpDLE1BQU0sTUFBTSxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsYUFBYSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQzdELElBQUksQ0FBQyxHQUFHLE1BQU0sTUFBTSxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsNkJBQTZCLEVBQUUsT0FBTyxFQUFFLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNsSCxJQUFJLE1BQU0sR0FDTjs7Ozs7OzsyQ0FPK0IsQ0FBQztZQUNwQyxhQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3BELENBQUM7S0FBQSxDQUFDLENBQUM7SUFFSCxRQUFRLENBQUMsR0FBUyxFQUFFO1FBQ2hCLE1BQU0sNEJBQWtCLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztJQUNoRCxDQUFDLENBQUEsQ0FBQyxDQUFDO0FBQ1AsQ0FBQyxDQUFDLENBQUMifQ==