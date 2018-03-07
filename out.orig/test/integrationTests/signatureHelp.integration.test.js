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
suite(`SignatureHelp: ${testAssetWorkspace_1.default.description}`, function () {
    let fileUri;
    suiteSetup(function () {
        return __awaiter(this, void 0, void 0, function* () {
            chai_1.should();
            let csharpExtension = vscode.extensions.getExtension("ms-vscode.csharp");
            if (!csharpExtension.isActive) {
                yield csharpExtension.activate();
            }
            yield csharpExtension.exports.initializationFinished;
            let fileName = 'sigHelp.cs';
            let dir = path.dirname(testAssetWorkspace_1.default.projects[0].projectDirectoryPath);
            let loc = path.join(dir, fileName);
            fileUri = vscode.Uri.file(loc);
            yield extension_1.omnisharp.waitForEmptyEventQueue();
            yield vscode.commands.executeCommand("vscode.open", fileUri);
        });
    });
    test("Returns response with documentation as undefined when method does not have documentation", function () {
        return __awaiter(this, void 0, void 0, function* () {
            let c = yield vscode.commands.executeCommand("vscode.executeSignatureHelpProvider", fileUri, new vscode.Position(19, 23));
            chai_1.expect(c.signatures[0].documentation).to.be.undefined;
        });
    });
    test("Returns label when method does not have documentation", function () {
        return __awaiter(this, void 0, void 0, function* () {
            let c = yield vscode.commands.executeCommand("vscode.executeSignatureHelpProvider", fileUri, new vscode.Position(19, 23));
            let answer = `void sigHelp.noDocMethod()`;
            chai_1.expect(c.signatures[0].label).to.equal(answer);
        });
    });
    test("Returns summary as documentation for the method", function () {
        return __awaiter(this, void 0, void 0, function* () {
            let c = yield vscode.commands.executeCommand("vscode.executeSignatureHelpProvider", fileUri, new vscode.Position(18, 18));
            let answer = `DoWork is some method.`;
            chai_1.expect(c.signatures[0].documentation).to.equal(answer);
        });
    });
    test("Returns label for the method", function () {
        return __awaiter(this, void 0, void 0, function* () {
            let c = yield vscode.commands.executeCommand("vscode.executeSignatureHelpProvider", fileUri, new vscode.Position(18, 18));
            let answer = `void sigHelp.DoWork(int Int1, float Float1)`;
            chai_1.expect(c.signatures[0].label).to.equal(answer);
        });
    });
    test("Returns label for the parameters", function () {
        return __awaiter(this, void 0, void 0, function* () {
            let c = yield vscode.commands.executeCommand("vscode.executeSignatureHelpProvider", fileUri, new vscode.Position(18, 18));
            let param1 = `int Int1`;
            let param2 = `float Float1`;
            chai_1.expect(c.signatures[0].parameters[0].label).to.equal(param1);
            chai_1.expect(c.signatures[0].parameters[1].label).to.equal(param2);
        });
    });
    test("Returns documentation for the parameters", function () {
        return __awaiter(this, void 0, void 0, function* () {
            let c = yield vscode.commands.executeCommand("vscode.executeSignatureHelpProvider", fileUri, new vscode.Position(18, 18));
            let param1 = `**Int1**: Used to indicate status.`;
            let param2 = `**Float1**: Used to specify context.`;
            chai_1.expect(c.signatures[0].parameters[0].documentation.value).to.equal(param1);
            chai_1.expect(c.signatures[0].parameters[1].documentation.value).to.equal(param2);
        });
    });
    test("Signature Help identifies active parameter if there is no comma", function () {
        return __awaiter(this, void 0, void 0, function* () {
            let c = yield vscode.commands.executeCommand("vscode.executeSignatureHelpProvider", fileUri, new vscode.Position(18, 18));
            let answer = `int Int1`;
            chai_1.expect(c.signatures[0].parameters[c.activeParameter].label).to.equal(answer);
        });
    });
    test("Signature Help identifies active parameter based on comma", function () {
        return __awaiter(this, void 0, void 0, function* () {
            let c = yield vscode.commands.executeCommand("vscode.executeSignatureHelpProvider", fileUri, new vscode.Position(18, 20));
            let answer = `float Float1`;
            chai_1.expect(c.signatures[0].parameters[c.activeParameter].label).to.equal(answer);
        });
    });
    suiteTeardown(() => __awaiter(this, void 0, void 0, function* () {
        yield testAssetWorkspace_1.default.cleanupWorkspace();
    }));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2lnbmF0dXJlSGVscC5pbnRlZ3JhdGlvbi50ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vdGVzdC9pbnRlZ3JhdGlvblRlc3RzL3NpZ25hdHVyZUhlbHAuaW50ZWdyYXRpb24udGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7OzsrRkFHK0Y7Ozs7Ozs7Ozs7QUFFL0YsaUNBQWlDO0FBQ2pDLDZCQUE2QjtBQUc3QiwrQkFBc0M7QUFDdEMsd0VBQWlFO0FBQ2pFLDZEQUEwRDtBQUUxRCxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDN0IsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztBQUNqQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO0FBRTdCLEtBQUssQ0FBQyxrQkFBa0IsNEJBQWtCLENBQUMsV0FBVyxFQUFFLEVBQUU7SUFDdEQsSUFBSSxPQUFtQixDQUFDO0lBQ3hCLFVBQVUsQ0FBQzs7WUFDUCxhQUFNLEVBQUUsQ0FBQztZQUVULElBQUksZUFBZSxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLGtCQUFrQixDQUFDLENBQUM7WUFDekUsRUFBRSxDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztnQkFDNUIsTUFBTSxlQUFlLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDckMsQ0FBQztZQUVELE1BQU0sZUFBZSxDQUFDLE9BQU8sQ0FBQyxzQkFBc0IsQ0FBQztZQUVyRCxJQUFJLFFBQVEsR0FBRyxZQUFZLENBQUM7WUFDNUIsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyw0QkFBa0IsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsb0JBQW9CLENBQUMsQ0FBQztZQUM1RSxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMs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