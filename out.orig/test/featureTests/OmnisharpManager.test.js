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
const path = require("path");
const vscode = require("vscode");
const util = require("../../src/common");
const chai_1 = require("chai");
const platform_1 = require("../../src/platform");
const logger_1 = require("../../src/logger");
const async_file_1 = require("async-file");
const OmnisharpDownloader_test_1 = require("./OmnisharpDownloader.test");
const OmnisharpManager_1 = require("../../src/omnisharp/OmnisharpManager");
const chai = require("chai");
chai.use(require("chai-as-promised"));
let expect = chai.expect;
const tmp = require('tmp');
suite('GetExperimentalOmnisharpPath : Returns Omnisharp experiment path depending on the path and useMono option', () => {
    const platformInfo = new platform_1.PlatformInformation("win32", "x86");
    const serverUrl = "https://roslynomnisharp.blob.core.windows.net";
    const installPath = ".omnisharp/experimental";
    const versionFilepathInServer = "releases/testVersionInfo.txt";
    const useMono = false;
    const manager = GetTestOmnisharpManager();
    let extensionPath;
    let tmpDir;
    let tmpFile;
    suiteSetup(() => chai_1.should());
    setup(() => {
        tmpDir = tmp.dirSync();
        extensionPath = tmpDir.name;
        util.setExtensionPath(tmpDir.name);
    });
    test('Throws error if the path is neither an absolute path nor a valid semver, nor the string "latest"', () => __awaiter(this, void 0, void 0, function* () {
        expect(manager.GetOmnisharpPath("Some incorrect path", useMono, serverUrl, versionFilepathInServer, installPath, extensionPath, platformInfo)).to.be.rejectedWith(Error);
    }));
    test('Throws error when the specified path is null', () => __awaiter(this, void 0, void 0, function* () {
        expect(manager.GetOmnisharpPath(null, useMono, serverUrl, versionFilepathInServer, installPath, extensionPath, platformInfo)).to.be.rejectedWith(Error);
    }));
    test('Throws error when the specified path is empty', () => __awaiter(this, void 0, void 0, function* () {
        expect(manager.GetOmnisharpPath("", useMono, serverUrl, versionFilepathInServer, installPath, extensionPath, platformInfo)).to.be.rejectedWith(Error);
    }));
    test('Throws error when the specified path is an invalid semver', () => __awaiter(this, void 0, void 0, function* () {
        expect(manager.GetOmnisharpPath("a.b.c", useMono, serverUrl, versionFilepathInServer, installPath, extensionPath, platformInfo)).to.be.rejectedWith(Error);
    }));
    test('Returns the same path if absolute path to an existing file is passed', () => __awaiter(this, void 0, void 0, function* () {
        tmpFile = tmp.fileSync();
        let omnisharpPath = yield manager.GetOmnisharpPath(tmpFile.name, useMono, serverUrl, versionFilepathInServer, installPath, extensionPath, platformInfo);
        omnisharpPath.should.equal(tmpFile.name);
    }));
    test('Installs the latest version and returns the launch path based on the version and platform', () => __awaiter(this, void 0, void 0, function* () {
        let omnisharpPath = yield manager.GetOmnisharpPath("latest", useMono, serverUrl, versionFilepathInServer, installPath, extensionPath, platformInfo);
        omnisharpPath.should.equal(path.resolve(extensionPath, `.omnisharp/experimental/1.2.3/OmniSharp.exe`));
    }));
    test('Installs the test version and returns the launch path based on the version and platform', () => __awaiter(this, void 0, void 0, function* () {
        let omnisharpPath = yield manager.GetOmnisharpPath("1.2.3", useMono, serverUrl, versionFilepathInServer, installPath, extensionPath, platformInfo);
        omnisharpPath.should.equal(path.resolve(extensionPath, `.omnisharp/experimental/1.2.3/OmniSharp.exe`));
    }));
    test('Downloads package from given url and installs them at the specified path', () => __awaiter(this, void 0, void 0, function* () {
        let launchPath = yield manager.GetOmnisharpPath("1.2.3", useMono, serverUrl, versionFilepathInServer, installPath, extensionPath, platformInfo);
        let exists = yield util.fileExists(path.resolve(extensionPath, `.omnisharp/experimental/1.2.3/install_check_1.2.3.txt`));
        exists.should.equal(true);
    }));
    test('Downloads package and returns launch path based on platform - Not using mono on Linux ', () => __awaiter(this, void 0, void 0, function* () {
        let launchPath = yield manager.GetOmnisharpPath("1.2.3", useMono, serverUrl, versionFilepathInServer, installPath, extensionPath, new platform_1.PlatformInformation("linux", "x64"));
        launchPath.should.equal(path.resolve(extensionPath, '.omnisharp/experimental/1.2.3/run'));
    }));
    test('Downloads package and returns launch path based on platform - Using mono on Linux ', () => __awaiter(this, void 0, void 0, function* () {
        let launchPath = yield manager.GetOmnisharpPath("1.2.3", true, serverUrl, versionFilepathInServer, installPath, extensionPath, new platform_1.PlatformInformation("linux", "x64"));
        launchPath.should.equal(path.resolve(extensionPath, '.omnisharp/experimental/1.2.3/omnisharp/OmniSharp.exe'));
    }));
    test('Downloads package and returns launch path based on install path ', () => __awaiter(this, void 0, void 0, function* () {
        let launchPath = yield manager.GetOmnisharpPath("1.2.3", true, serverUrl, versionFilepathInServer, "installHere", extensionPath, platformInfo);
        launchPath.should.equal(path.resolve(extensionPath, 'installHere/1.2.3/OmniSharp.exe'));
    }));
    teardown(() => __awaiter(this, void 0, void 0, function* () {
        if (tmpDir) {
            yield async_file_1.rimraf(tmpDir.name);
        }
        if (tmpFile) {
            tmpFile.removeCallback();
        }
        tmpFile = null;
        tmpDir = null;
    }));
});
function GetTestOmnisharpManager() {
    let channel = vscode.window.createOutputChannel('Experiment Channel');
    let logger = new logger_1.Logger(text => channel.append(text));
    return new OmnisharpManager_1.OmnisharpManager(channel, logger, OmnisharpDownloader_test_1.GetTestPackageJSON(), null);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT21uaXNoYXJwTWFuYWdlci50ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vdGVzdC9mZWF0dXJlVGVzdHMvT21uaXNoYXJwTWFuYWdlci50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O2dHQUdnRzs7Ozs7Ozs7OztBQUVoRyw2QkFBNkI7QUFDN0IsaUNBQWlDO0FBQ2pDLHlDQUF5QztBQUN6QywrQkFBOEI7QUFDOUIsaURBQXlEO0FBQ3pELDZDQUEwQztBQUMxQywyQ0FBb0M7QUFDcEMseUVBQWdFO0FBQ2hFLDJFQUF3RTtBQUV4RSxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDN0IsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDO0FBQ3RDLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7QUFFekIsTUFBTSxHQUFHLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBRTNCLEtBQUssQ0FBQywyR0FBMkcsRUFBRSxHQUFHLEVBQUU7SUFDcEgsTUFBTSxZQUFZLEdBQUcsSUFBSSw4QkFBbUIsQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDN0QsTUFBTSxTQUFTLEdBQUcsK0NBQStDLENBQUM7SUFDbEUsTUFBTSxXQUFXLEdBQUcseUJBQXlCLENBQUM7SUFDOUMsTUFBTSx1QkFBdUIsR0FBRyw4QkFBOEIsQ0FBQztJQUMvRCxNQUFNLE9BQU8sR0FBRyxLQUFLLENBQUM7SUFDdEIsTUFBTSxPQUFPLEdBQUcsdUJBQXVCLEVBQUUsQ0FBQztJQUMxQyxJQUFJLGFBQXFCLENBQUM7SUFDMUIsSUFBSSxNQUFXLENBQUM7SUFDaEIsSUFBSSxPQUFZLENBQUM7SUFFakIsVUFBVSxDQUFDLEdBQUcsRUFBRSxDQUFDLGFBQU0sRUFBRSxDQUFDLENBQUM7SUFFM0IsS0FBSyxDQUFDLEdBQUcsRUFBRTtRQUNQ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