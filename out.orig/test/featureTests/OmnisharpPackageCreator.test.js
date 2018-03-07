"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const OmnisharpDownloader_test_1 = require("./OmnisharpDownloader.test");
const OmnisharpPackageCreator_1 = require("../../src/omnisharp/OmnisharpPackageCreator");
suite("GetOmnisharpPackage : Output package depends on the input package and other input parameters like serverUrl", () => {
    let serverUrl;
    let version;
    let installPath;
    let inputPackages;
    suiteSetup(() => {
        serverUrl = "http://serverUrl";
        version = "0.0.0";
        installPath = "testPath";
        let packageJSON = OmnisharpDownloader_test_1.GetTestPackageJSON();
        inputPackages = (packageJSON.runtimeDependencies);
        chai_1.should();
    });
    test('Throws exception if version is empty', () => {
        let testPackage = inputPackages.find(element => (element.platformId && element.platformId == "os-architecture"));
        let fn = function () { OmnisharpPackageCreator_1.SetBinaryAndGetPackage(testPackage, serverUrl, "", installPath); };
        chai_1.expect(fn).to.throw('Invalid version');
    });
    test('Throws exception if version is null', () => {
        let testPackage = inputPackages.find(element => (element.platformId && element.platformId == "os-architecture"));
        let fn = function () { OmnisharpPackageCreator_1.SetBinaryAndGetPackage(testPackage, serverUrl, null, installPath); };
        chai_1.expect(fn).to.throw('Invalid version');
    });
    test('Architectures, binaries and platforms do not change', () => {
        let testPackage = inputPackages.find(element => (element.platformId && element.platformId == "os-architecture"));
        let resultPackage = OmnisharpPackageCreator_1.SetBinaryAndGetPackage(testPackage, serverUrl, version, installPath);
        resultPackage.architectures.should.equal(testPackage.architectures);
        chai_1.assert.equal(resultPackage.binaries, testPackage.binaries);
        resultPackage.platforms.should.equal(testPackage.platforms);
    });
    test('Version information is appended to the description', () => {
        let testPackage = inputPackages.find(element => (element.platformId && element.platformId == "os-architecture"));
        let resultPackage = OmnisharpPackageCreator_1.SetBinaryAndGetPackage(testPackage, serverUrl, "1.2.3", installPath);
        resultPackage.description.should.equal(`${testPackage.description}, Version = 1.2.3`);
    });
    test('Download url is calculated using server url and version', () => {
        let testPackage = inputPackages.find(element => (element.platformId && element.platformId == "os-architecture"));
        let resultPackage = OmnisharpPackageCreator_1.SetBinaryAndGetPackage(testPackage, "http://someurl", "1.1.1", installPath);
        resultPackage.url.should.equal("http://someurl/releases/1.1.1/omnisharp-os-architecture.zip");
    });
    test('Install path is calculated using the specified path and version', () => {
        let testPackage = inputPackages.find(element => (element.platformId && element.platformId == "os-architecture"));
        let resultPackage = OmnisharpPackageCreator_1.SetBinaryAndGetPackage(testPackage, serverUrl, "1.2.3", "experimentPath");
        resultPackage.installPath.should.equal("experimentPath/1.2.3");
    });
    test('Install test path is calculated using specified path, version and ends with Omnisharp.exe - Windows(x86)', () => {
        let testPackage = inputPackages.find(element => (element.platformId && element.platformId == "win-x86"));
        let resultPackage = OmnisharpPackageCreator_1.SetBinaryAndGetPackage(testPackage, serverUrl, "1.2.3", "experimentPath");
        resultPackage.installTestPath.should.equal("./experimentPath/1.2.3/OmniSharp.exe");
    });
    test('Install test path is calculated using specified path, version and ends with Omnisharp.exe - Windows(x64)', () => {
        let testPackage = inputPackages.find(element => (element.platformId && element.platformId == "win-x64"));
        let resultPackage = OmnisharpPackageCreator_1.SetBinaryAndGetPackage(testPackage, serverUrl, "1.2.3", "experimentPath");
        resultPackage.installTestPath.should.equal("./experimentPath/1.2.3/OmniSharp.exe");
    });
    test('Install test path is calculated using specified path, version and ends with mono.osx - OSX', () => {
        let testPackage = inputPackages.find(element => (element.platformId && element.platformId == "osx"));
        let resultPackage = OmnisharpPackageCreator_1.SetBinaryAndGetPackage(testPackage, serverUrl, "1.2.3", "experimentPath");
        resultPackage.installTestPath.should.equal("./experimentPath/1.2.3/mono.osx");
    });
    test('Install test path is calculated using specified path, version and ends with mono.linux-x86 - Linux(x86)', () => {
        let testPackage = inputPackages.find(element => (element.platformId && element.platformId == "linux-x86"));
        let resultPackage = OmnisharpPackageCreator_1.SetBinaryAndGetPackage(testPackage, serverUrl, "1.2.3", "experimentPath");
        resultPackage.installTestPath.should.equal("./experimentPath/1.2.3/mono.linux-x86");
    });
    test('Install test path is calculated using specified path, version and ends with mono.linux-x86_64 - Linux(x64)', () => {
        let testPackage = inputPackages.find(element => (element.platformId && element.platformId == "linux-x64"));
        let resultPackage = OmnisharpPackageCreator_1.SetBinaryAndGetPackage(testPackage, serverUrl, "1.2.3", "experimentPath");
        resultPackage.installTestPath.should.equal("./experimentPath/1.2.3/mono.linux-x86_64");
    });
});
suite('GetPackagesFromVersion : Gets the experimental omnisharp packages from a set of input packages', () => {
    const serverUrl = "http://serverUrl";
    const installPath = "testPath";
    let inputPackages;
    suiteSetup(() => {
        inputPackages = (OmnisharpDownloader_test_1.GetTestPackageJSON().runtimeDependencies);
        chai_1.should();
    });
    test('Throws exception if the version is null', () => {
        let version = null;
        let fn = function () { OmnisharpPackageCreator_1.GetPackagesFromVersion(version, inputPackages, serverUrl, installPath); };
        chai_1.expect(fn).to.throw('Invalid version');
    });
    test('Throws exception if the version is empty', () => {
        let version = "";
        let fn = function () { OmnisharpPackageCreator_1.GetPackagesFromVersion(version, inputPackages, serverUrl, installPath); };
        chai_1.expect(fn).to.throw('Invalid version');
    });
    test('Returns experiment packages with install test path depending on install path and version', () => {
        let inputPackages = [
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
        ];
        let outPackages = OmnisharpPackageCreator_1.GetPackagesFromVersion("1.1.1", inputPackages, serverUrl, "experimentPath");
        outPackages.length.should.equal(2);
        outPackages[0].installTestPath.should.equal("./experimentPath/1.1.1/OmniSharp.exe");
        outPackages[1].installTestPath.should.equal("./experimentPath/1.1.1/mono.osx");
    });
    test('Returns only omnisharp packages with experimentalIds', () => {
        let version = "0.0.0";
        let inputPackages = [
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
                "description": "Some other package - no experimental id",
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
            },
        ];
        let outPackages = OmnisharpPackageCreator_1.GetPackagesFromVersion(version, inputPackages, serverUrl, installPath);
        outPackages.length.should.equal(1);
        outPackages[0].platformId.should.equal("win-x64");
    });
});
suite('GetVersionFilePackage : Gives the package for the latest file download', () => {
    test('Contains the expected description', () => {
        let testPackage = OmnisharpPackageCreator_1.GetVersionFilePackage("someUrl", "somePath");
        chai_1.expect(testPackage.description).to.equal('Latest version information file');
    });
    test('Contains the url based on serverUrl and the pathInServer', () => {
        let testPackage = OmnisharpPackageCreator_1.GetVersionFilePackage("someUrl", "somePath");
        chai_1.expect(testPackage.url).to.equal('someUrl/somePath');
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT21uaXNoYXJwUGFja2FnZUNyZWF0b3IudGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3Rlc3QvZmVhdHVyZVRlc3RzL09tbmlzaGFycFBhY2thZ2VDcmVhdG9yLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Z0dBR2dHOztBQUVoRywrQkFBOEM7QUFFOUMseUVBQWdFO0FBQ2hFLHlGQUFvSTtBQUVwSSxLQUFLLENBQUMsNkdBQTZHLEVBQUUsR0FBRyxFQUFFO0lBRXRILElBQUksU0FBaUIsQ0FBQztJQUN0QixJQUFJLE9BQWUsQ0FBQztJQUNwQixJQUFJLFdBQW1CLENBQUM7SUFDeEIsSUFBSSxhQUFrQixDQUFDO0lBRXZCLFVBQVUsQ0FBQyxHQUFHLEVBQUU7UUFDWixTQUFTLEdBQUcsa0JBQWtCLENBQUM7UUFDL0IsT0FBTyxHQUFHLE9BQU8sQ0FBQztRQUNsQixXQUFXLEdBQUcsVUFBVSxDQUFDO1FBQ3pCLElBQUksV0FBVyxHQUFHLDZDQUFrQixFQUFFLENBQUM7UUFDdkMsYUFBYSxHQUFlLENBQUMsV0FBVyxDQUFDLG1CQUFtQixDQUFDLENBQUM7UUFDOUQsYUFBTSxFQUFFLENBQUM7SUFDYixDQUFDLENBQUMsQ0FBQztJQUVILElBQUksQ0FBQyxzQ0FBc0MsRUFBRSxHQUFHLEVBQUU7UUFDOUMsSUFBSSxXQUFXLEdBQUcsYUFBYSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQVUsSUFBSSxPQUFPLENBQUMsVUFBVSxJQUFJLGlCQUFpQixDQUFDLENBQUMsQ0FBQztRQUNqSCxJQUFJLEVBQUUsR0FBRyxjQUFjLGdEQUFzQixDQUFDLFdBQVcsRUFBRSxTQUFTLEVBQUUsRUFBRSxFQUFFLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzFGLGFBQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLGlCQUFpQixD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