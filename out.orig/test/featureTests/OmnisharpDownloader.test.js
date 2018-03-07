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
const util = require("../../src/common");
const logger_1 = require("../../src/logger");
const OmnisharpDownloader_1 = require("../../src/omnisharp/OmnisharpDownloader");
const async_file_1 = require("async-file");
const platform_1 = require("../../src/platform");
const tmp = require('tmp');
const chai = require("chai");
chai.use(require("chai-as-promised"));
let expect = chai.expect;
suite("DownloadAndInstallExperimentalVersion : Gets the version packages, downloads and installs them", () => {
    let tmpDir = null;
    const version = "1.2.3";
    const downloader = GetTestOmnisharpDownloader();
    const serverUrl = "https://roslynomnisharp.blob.core.windows.net";
    const installPath = ".omnisharp/experimental/";
    setup(() => {
        tmpDir = tmp.dirSync();
        util.setExtensionPath(tmpDir.name);
    });
    test('Throws error if request is made for a version that doesnot exist on the server', () => {
        expect(downloader.DownloadAndInstallOmnisharp("1.00000001.0000", serverUrl, installPath)).to.be.rejectedWith(Error);
    });
    test('Packages are downloaded from the specified server url and installed at the specified path', () => __awaiter(this, void 0, void 0, function* () {
        /* Download a test package that conatins a install_check_1.2.3.txt file and check whether the
           file appears at the expected path */
        yield downloader.DownloadAndInstallOmnisharp(version, serverUrl, installPath);
        let exists = yield util.fileExists(path.resolve(tmpDir.name, installPath, version, `install_check_1.2.3.txt`));
        exists.should.equal(true);
    }));
    teardown(() => __awaiter(this, void 0, void 0, function* () {
        if (tmpDir) {
            yield async_file_1.rimraf(tmpDir.name);
        }
        tmpDir = null;
    }));
});
function GetTestOmnisharpDownloader() {
    let channel = vscode.window.createOutputChannel('Experiment Channel');
    let logger = new logger_1.Logger(text => channel.append(text));
    return new OmnisharpDownloader_1.OmnisharpDownloader(channel, logger, GetTestPackageJSON(), new platform_1.PlatformInformation("win32", "x86"), null);
}
//Since we need only the runtime dependencies of packageJSON for the downloader create a testPackageJSON
//with just that
function GetTestPackageJSON() {
    let testpackageJSON = {
        "runtimeDependencies": [
            {
                "description": "OmniSharp for Windows (.NET 4.6 / x86)",
                "url": "https://download.visualstudio.microsoft.com/download/pr/100505823/5804b7d3b5eeb7e4ae812a7cff03bd52/omnisharp-win-x86-1.28.0.zip",
                "fallbackUrl": "https://omnisharpdownload.blob.core.windows.net/ext/omnisharp-win-x86-1.28.0.zip",
                "installPath": ".omnisharp",
                "platforms": [
                    "win32"
                ],
                "architectures": [
                    "x86"
                ],
                "installTestPath": "./.omnisharp/OmniSharp.exe",
                "platformId": "win-x86"
            },
            {
                "description": "OmniSharp for Windows (.NET 4.6 / x64)",
                "url": "https://download.visualstudio.microsoft.com/download/pr/100505821/c570a9e20dbf7172f79850babd058872/omnisharp-win-x64-1.28.0.zip",
                "fallbackUrl": "https://omnisharpdownload.blob.core.windows.net/ext/omnisharp-win-x64-1.28.0.zip",
                "installPath": ".omnisharp",
                "platforms": [
                    "win32"
                ],
                "architectures": [
                    "x86_64"
                ],
                "installTestPath": "./.omnisharp/OmniSharp.exe",
                "platformId": "win-x64"
            },
            {
                "description": "OmniSharp for OSX",
                "url": "https://download.visualstudio.microsoft.com/download/pr/100505818/6b99c6a86da3221919158ca0f36a3e45/omnisharp-osx-1.28.0.zip",
                "fallbackUrl": "https://omnisharpdownload.blob.core.windows.net/ext/omnisharp-osx-1.28.0.zip",
                "installPath": ".omnisharp",
                "platforms": [
                    "darwin"
                ],
                "binaries": [
                    "./mono.osx",
                    "./run"
                ],
                "installTestPath": "./.omnisharp/mono.osx",
                "platformId": "osx"
            },
            {
                "description": "OmniSharp for Linux (x86)",
                "url": "https://download.visualstudio.microsoft.com/download/pr/100505817/b710ec9c2bedc0cfdb57da82da166c47/omnisharp-linux-x86-1.28.0.zip",
                "fallbackUrl": "https://omnisharpdownload.blob.core.windows.net/ext/omnisharp-linux-x86-1.28.0.zip",
                "installPath": ".omnisharp",
                "platforms": [
                    "linux"
                ],
                "architectures": [
                    "x86",
                    "i686"
                ],
                "binaries": [
                    "./mono.linux-x86",
                    "./run"
                ],
                "installTestPath": "./.omnisharp/mono.linux-x86",
                "platformId": "linux-x86"
            },
            {
                "description": "OmniSharp for Linux (x64)",
                "url": "https://download.visualstudio.microsoft.com/download/pr/100505485/3f8a10409240decebb8a3189429f3fdf/omnisharp-linux-x64-1.28.0.zip",
                "fallbackUrl": "https://omnisharpdownload.blob.core.windows.net/ext/omnisharp-linux-x64-1.28.0.zip",
                "installPath": ".omnisharp",
                "platforms": [
                    "linux"
                ],
                "architectures": [
                    "x86_64"
                ],
                "binaries": [
                    "./mono.linux-x86_64",
                    "./run"
                ],
                "installTestPath": "./.omnisharp/mono.linux-x86_64",
                "platformId": "linux-x64"
            },
            {
                "description": "OmniSharp for Test OS(architecture)",
                "url": "https://download.visualstudio.microsoft.com/download/pr/100505485/3f8a10409240decebb8a3189429f3fdf/omnisharp-os-architecture-version.zip",
                "fallbackUrl": "https://omnisharpdownload.blob.core.windows.net/ext/omnisharp-os-architecture-version.zip",
                "installPath": ".omnisharp",
                "platforms": [
                    "platform1"
                ],
                "architectures": [
                    "architecture"
                ],
                "binaries": [
                    "./binary1",
                    "./binary2"
                ],
                "installTestPath": "./.omnisharp/binary",
                "platformId": "os-architecture"
            },
            {
                "description": "Non omnisharp package without platformId",
                "url": "https://download.visualstudio.microsoft.com/download/pr/100317420/a30d7e11bc435433d297adc824ee837f/coreclr-debug-win7-x64.zip",
                "fallbackUrl": "https://vsdebugger.blob.core.windows.net/coreclr-debug-1-14-4/coreclr-debug-win7-x64.zip",
                "installPath": ".debugger",
                "platforms": [
                    "win32"
                ],
                "architectures": [
                    "x86_64"
                ],
                "installTestPath": "./.debugger/vsdbg-ui.exe"
            }
        ]
    };
    return testpackageJSON;
}
exports.GetTestPackageJSON = GetTestPackageJSON;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT21uaXNoYXJwRG93bmxvYWRlci50ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vdGVzdC9mZWF0dXJlVGVzdHMvT21uaXNoYXJwRG93bmxvYWRlci50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O2dHQUdnRzs7Ozs7Ozs7OztBQUVoRyxpQ0FBaUM7QUFDakMsNkJBQTZCO0FBQzdCLHlDQUF5QztBQUV6Qyw2Q0FBMEM7QUFDMUMsaUZBQThFO0FBQzlFLDJDQUFvQztBQUNwQyxpREFBeUQ7QUFFekQsTUFBTSxHQUFHLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQzNCLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUM3QixJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUM7QUFDdEMsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztBQUV6QixLQUFLLENBQUMsZ0dBQWdHLEVBQUUsR0FBRyxFQUFFO0lBQ3pHLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQztJQUNsQixNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUM7SUFDeEIsTUFBTSxVQUFVLEdBQUcsMEJBQTBCLEVBQUUsQ0FBQztJQUNoRCxNQUFNLFNBQVMsR0FBRywrQ0FBK0MsQ0FBQztJQUNsRSxNQUFNLFdBQVcsR0FBRywwQkFBMEIsQ0FBQztJQUUvQyxLQUFLLENBQUMsR0FBRyxFQUFFO1FBQ1AsTUFBTSxHQUFHLEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUN2QixJQUFJLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3ZDLENBQUMsQ0FBQyxDQUFDO0lBRUgsSUFBSSxDQUFDLGdGQUFnRixFQUFFLEdBQUcsRUFBRTtRQUN4RixNQUFNLENBQUMsVUFBVSxDQUFDLDJCQUEyQixDQUFDLGlCQUFpQixFQUFFLFNBQVMs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