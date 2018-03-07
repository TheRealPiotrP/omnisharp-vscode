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
const chai_1 = require("chai");
const testAssetWorkspace_1 = require("./testAssets/testAssetWorkspace");
const chai = require('chai');
chai.use(require('chai-arrays'));
chai.use(require('chai-fs'));
suite(`Code Action Rename ${testAssetWorkspace_1.default.description}`, function () {
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
    test("Code actions can rename and open files", () => __awaiter(this, void 0, void 0, function* () {
        let fileUri = yield testAssetWorkspace_1.default.projects[0].addFileWithContents("test.cs", "class C {}");
        yield vscode.commands.executeCommand("vscode.open", fileUri);
        let c = yield vscode.commands.executeCommand("vscode.executeCodeActionProvider", fileUri, new vscode.Range(0, 7, 0, 7));
        let command = c.find((s) => { return s.title == "Rename file to C.cs"; });
        chai_1.expect(command, "Didn't find rename class command");
        yield vscode.commands.executeCommand(command.command, ...command.arguments);
        chai_1.expect(vscode.window.activeTextEditor.document.fileName).contains("C.cs");
    }));
    teardown(() => __awaiter(this, void 0, void 0, function* () {
        yield testAssetWorkspace_1.default.cleanupWorkspace();
    }));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29kZUFjdGlvblJlbmFtZS5pbnRlZ3JhdGlvbi50ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vdGVzdC9pbnRlZ3JhdGlvblRlc3RzL2NvZGVBY3Rpb25SZW5hbWUuaW50ZWdyYXRpb24udGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7QUFHaEcsaUNBQWlDO0FBR2pDLCtCQUFzQztBQUN0Qyx3RUFBaUU7QUFFakUsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzdCLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7QUFDakMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztBQUU3QixLQUFLLENBQUMsc0JBQXNCLDRCQUFrQixDQUFDLFdBQVcsRUFBRSxFQUFFO0lBQzFELFVBQVUsQ0FBQzs7WUFDUCxhQUFNLEVBQUUsQ0FBQztZQUVULElBQUksZUFBZSxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLGtCQUFrQixDQUFDLENBQUM7WUFDekUsRUFBRSxDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztnQkFDNUIsTUFBTSxlQUFlLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDckMsQ0FBQztZQUVELE1BQU0sZUFBZSxDQUFDLE9BQU8sQ0FBQyxzQkFBc0IsQ0FBQztRQUV6RCxDQUFDO0tBQUEsQ0FBQyxDQUFDO0lBRUgsSUFBSSxDQUFDLHdDQUF3QyxFQUFFLEdBQVMsRUFBRTtRQUN0RCxJQUFJLE9BQU8sR0FBRyxNQUFNLDRCQUFrQixDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxtQkFBbUIsQ0FBQyxTQUFTLEVBQUUsWUFBWSxDQUFDLENBQUM7UUFDaEcsTUFBTSxNQUFNLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxhQUFhLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDN0QsSUFBSSxDQUFDLEdBQUcsTUFBTSxNQUFNLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxrQ0FBa0MsRUFBRSxPQUFPLEVBQUUsSUFBSSxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUE0RCxDQUFDO1FBQ25MLElBQUksT0FBTyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQ2hCLENBQUMsQ0FBQyxFQUFFLEVBQUUsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxxQkFBcUIsQ0FBQyxDQUFDLENBQUMsQ0FDdEQsQ0FBQztRQUNGLGFBQU0sQ0FBQyxPQUFPLEVBQUUsa0NBQWtDLENBQUMsQ0FBQztRQUNwRCxNQUFNLE1BQU0sQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUE7UUFDM0UsYUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUM5RSxDQUFDLENBQUEsQ0FBQyxDQUFDO0lBRUgsUUFBUSxDQUFDLEdBQVMsRUFBRTtRQUNoQixNQUFNLDRCQUFrQixDQUFDLGdCQUFnQixFQUFFLENBQUM7SUFDaEQsQ0FBQyxDQUFBLENBQUMsQ0FBQztBQUNQLENBQUMsQ0FBQyxDQUFDIn0=