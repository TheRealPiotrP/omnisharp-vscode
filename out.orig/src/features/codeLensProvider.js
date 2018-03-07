/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const serverUtils = require("../omnisharp/utils");
const vscode = require("vscode");
const typeConvertion_1 = require("../omnisharp/typeConvertion");
const abstractProvider_1 = require("./abstractProvider");
const options_1 = require("../omnisharp/options");
class OmniSharpCodeLens extends vscode.CodeLens {
    constructor(fileName, range) {
        super(range);
        this.fileName = fileName;
    }
}
class OmniSharpCodeLensProvider extends abstractProvider_1.default {
    constructor(server, reporter, testManager) {
        super(server, reporter);
        this._resetCachedOptions();
        let configChangedDisposable = vscode.workspace.onDidChangeConfiguration(this._resetCachedOptions, this);
        this.addDisposables(configChangedDisposable);
    }
    _resetCachedOptions() {
        this._options = options_1.Options.Read();
    }
    provideCodeLenses(document, token) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._options.showReferencesCodeLens && !this._options.showTestsCodeLens) {
                return [];
            }
            let tree = yield serverUtils.currentFileMembersAsTree(this._server, { FileName: document.fileName }, token);
            let ret = [];
            for (let node of tree.TopLevelTypeDefinitions) {
                yield this._convertQuickFix(ret, document.fileName, node);
            }
            return ret;
        });
    }
    _convertQuickFix(bucket, fileName, node) {
        return __awaiter(this, void 0, void 0, function* () {
            if (node.Kind === 'MethodDeclaration' && OmniSharpCodeLensProvider.filteredSymbolNames[node.Location.Text]) {
                return;
            }
            let lens = new OmniSharpCodeLens(fileName, typeConvertion_1.toRange(node.Location));
            if (this._options.showReferencesCodeLens) {
                bucket.push(lens);
            }
            for (let child of node.ChildNodes) {
                this._convertQuickFix(bucket, fileName, child);
            }
            if (this._options.showTestsCodeLens) {
                yield this._updateCodeLensForTest(bucket, fileName, node);
            }
        });
    }
    resolveCodeLens(codeLens, token) {
        if (codeLens instanceof OmniSharpCodeLens) {
            let req = {
                FileName: codeLens.fileName,
                Line: codeLens.range.start.line + 1,
                Column: codeLens.range.start.character + 1,
                OnlyThisFile: false,
                ExcludeDefinition: true
            };
            return serverUtils.findUsages(this._server, req, token).then(res => {
                if (!res || !Array.isArray(res.QuickFixes)) {
                    return;
                }
                let len = res.QuickFixes.length;
                codeLens.command = {
                    title: len === 1 ? '1 reference' : `${len} references`,
                    command: 'editor.action.showReferences',
                    arguments: [vscode.Uri.file(req.FileName), codeLens.range.start, res.QuickFixes.map(typeConvertion_1.toLocation)]
                };
                return codeLens;
            });
        }
    }
    _updateCodeLensForTest(bucket, fileName, node) {
        return __awaiter(this, void 0, void 0, function* () {
            // backward compatible check: Features property doesn't present on older version OmniSharp
            if (node.Features === undefined) {
                return;
            }
            if (node.Kind === "ClassDeclaration" && node.ChildNodes.length > 0) {
                let projectInfo = yield serverUtils.requestProjectInformation(this._server, { FileName: fileName });
                if (!projectInfo.DotNetProject && projectInfo.MsBuildProject) {
                    this._updateCodeLensForTestClass(bucket, fileName, node);
                }
            }
            let [testFeature, testFrameworkName] = this._getTestFeatureAndFramework(node);
            if (testFeature) {
                bucket.push(new vscode.CodeLens(typeConvertion_1.toRange(node.Location), { title: "run test", command: 'dotnet.test.run', arguments: [testFeature.Data, fileName, testFrameworkName] }));
                bucket.push(new vscode.CodeLens(typeConvertion_1.toRange(node.Location), { title: "debug test", command: 'dotnet.test.debug', arguments: [testFeature.Data, fileName, testFrameworkName] }));
            }
        });
    }
    _updateCodeLensForTestClass(bucket, fileName, node) {
        // if the class doesnot contain any method then return
        if (!node.ChildNodes.find(value => (value.Kind === "MethodDeclaration"))) {
            return;
        }
        let testMethods = new Array();
        let testFrameworkName = null;
        for (let child of node.ChildNodes) {
            let [testFeature, frameworkName] = this._getTestFeatureAndFramework(child);
            if (testFeature) {
                // this test method has a test feature
                if (!testFrameworkName) {
                    testFrameworkName = frameworkName;
                }
                testMethods.push(testFeature.Data);
            }
        }
        if (testMethods.length > 0) {
            bucket.push(new vscode.CodeLens(typeConvertion_1.toRange(node.Location), { title: "run all tests", command: 'dotnet.classTests.run', arguments: [testMethods, fileName, testFrameworkName] }));
            bucket.push(new vscode.CodeLens(typeConvertion_1.toRange(node.Location), { title: "debug all tests", command: 'dotnet.classTests.debug', arguments: [testMethods, fileName, testFrameworkName] }));
        }
    }
    _getTestFeatureAndFramework(node) {
        let testFeature = node.Features.find(value => (value.Name == 'XunitTestMethod' || value.Name == 'NUnitTestMethod' || value.Name == 'MSTestMethod'));
        if (testFeature) {
            let testFrameworkName = 'xunit';
            if (testFeature.Name == 'NUnitTestMethod') {
                testFrameworkName = 'nunit';
            }
            else if (testFeature.Name == 'MSTestMethod') {
                testFrameworkName = 'mstest';
            }
            return [testFeature, testFrameworkName];
        }
        return [null, null];
    }
}
OmniSharpCodeLensProvider.filteredSymbolNames = {
    'Equals': true,
    'Finalize': true,
    'GetHashCode': true,
    'ToString': true
};
exports.default = OmniSharpCodeLensProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29kZUxlbnNQcm92aWRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9mZWF0dXJlcy9jb2RlTGVuc1Byb3ZpZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHO0FBRWhHLFlBQVksQ0FBQzs7Ozs7Ozs7OztBQUdiLGtEQUFrRDtBQUNsRCxpQ0FBaUM7QUFFakMsZ0VBQWtFO0FBRWxFLHlEQUFrRDtBQUVsRCxrREFBK0M7QUFJL0MsdUJBQXdCLFNBQVEsTUFBTSxDQUFDLFFBQVE7SUFJM0MsWUFBWSxRQUFnQixFQUFFLEtBQW1CO1FBQzdDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNiLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO0lBQzdCLENBQUM7Q0FDSjtBQUVELCtCQUErQyxTQUFRLDBCQUFnQjtJQUluRSxZQUFZLE1BQXVCLEVBQUUsUUFBMkIsRUFBRSxXQUF3QjtRQUN0RixLQUFLLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBRXhCLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO1FBRTNCLElBQUksdUJBQXVCLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQyx3QkFBd0IsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDeEcsSUFBSSxDQUFDLGNBQWMsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO0lBQ2pELENBQUM7SUFFTyxtQkFBbUI7UUFDdkIsSUFBSSxDQUFDLFFBQVEsR0FBRyxpQkFBTyxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ25DLENBQUM7SUFTSyxpQkFBaUIsQ0FBQyxRQUE2QixFQUFFLEtBQStCOztZQUNsRixFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsc0JBQXNCLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQztnQkFDNUUsTUFBTSxDQUFDLEVB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