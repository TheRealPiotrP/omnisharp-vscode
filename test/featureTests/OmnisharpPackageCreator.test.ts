/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { assert, should, expect } from "chai";
import { Package } from "../../src/packages";
import { GetTestPackageJSON } from "./OmnisharpDownloader.test";
import { SetBinaryAndGetPackage, GetPackagesFromVersion, GetVersionFilePackage } from "../../src/omnisharp/OmnisharpPackageCreator";

suite("GetOmnisharpPackage : Output package depends on the input package and other input parameters like serverUrl", () => {

    let serverUrl: string;
    let version: string;
    let installPath: string;
    let inputPackages: Package[];

    suiteSetup(() => {
        serverUrl = "http://serverUrl";
        version = "0.0.0";
        installPath = "testPath";
        let packageJSON = GetTestPackageJSON();
        inputPackages = <Package[]> (packageJSON.runtimeDependencies);
        should();
    });

    test('Throws exception if version is empty', () => {
        let testPackage = inputPackages.find(element => (element.platformId && element.platformId == "os-architecture"));
        let fn = function () { SetBinaryAndGetPackage(testPackage, serverUrl, "", installPath); };
        expect(fn).to.throw('Invalid version');
    });

    test('Throws exception if version is null', () => {
        let testPackage = inputPackages.find(element => (element.platformId && element.platformId == "os-architecture"));
        let fn = function () { SetBinaryAndGetPackage(testPackage, serverUrl, null, installPath);};
        expect(fn).to.throw('Invalid version');
    });

    test('Architectures, binaries and platforms do not change', () => {
        let testPackage = inputPackages.find(element => (element.platformId && element.platformId == "os-architecture"));
        let resultPackage = SetBinaryAndGetPackage(testPackage, serverUrl, version, installPath);

        resultPackage.architectures.should.equal(testPackage.architectures);
        assert.equal(resultPackage.binaries, testPackage.binaries);
        resultPackage.platforms.should.equal(testPackage.platforms);
    });

    test('Version information is appended to the description', () => {
        let testPackage = inputPackages.find(element => (element.platformId && element.platformId == "os-architecture"));
        let resultPackage = SetBinaryAndGetPackage(testPackage, serverUrl, "1.2.3", installPath);

        resultPackage.description.should.equal(`${testPackage.description}, Version = 1.2.3`);
    });

    test('Download url is calculated using server url and version', () => {
        let testPackage = inputPackages.find(element => (element.platformId && element.platformId == "os-architecture"));
        let resultPackage = SetBinaryAndGetPackage(testPackage, "http://someurl", "1.1.1", installPath);
        resultPackage.url.should.equal("http://someurl/releases/1.1.1/omnisharp-os-architecture.zip");
    });

    test('Install path is calculated using the specified path and version', () => {
        let testPackage = inputPackages.find(element => (element.platformId && element.platformId == "os-architecture"));
        let resultPackage = SetBinaryAndGetPackage(testPackage, serverUrl, "1.2.3", "experimentPath");
        resultPackage.installPath.should.equal("experimentPath/1.2.3");
    });

    test('Install test path is calculated using specified path, version and ends with Omnisharp.exe - Windows(x86)', () => {
        let testPackage = inputPackages.find(element => (element.platformId && element.platformId == "win-x86"));
        let resultPackage = SetBinaryAndGetPackage(testPackage, serverUrl, "1.2.3", "experimentPath");
        resultPackage.installTestPath.should.equal("./experimentPath/1.2.3/OmniSharp.exe");
    });

    test('Install test path is calculated using specified path, version and ends with Omnisharp.exe - Windows(x64)', () => {
        let testPackage = inputPackages.find(element => (element.platformId && element.platformId == "win-x64"));
        let resultPackage = SetBinaryAndGetPackage(testPackage, serverUrl, "1.2.3", "experimentPath");
        resultPackage.installTestPath.should.equal("./experimentPath/1.2.3/OmniSharp.exe");
    });

    test('Install test path is calculated using specified path, version and ends with mono.osx - OSX', () => {
        let testPackage = inputPackages.find(element => (element.platformId && element.platformId == "osx"));
        let resultPackage = SetBinaryAndGetPackage(testPackage, serverUrl, "1.2.3", "experimentPath");
        resultPackage.installTestPath.should.equal("./experimentPath/1.2.3/mono.osx");
    });

    test('Install test path is calculated using specified path, version and ends with mono.linux-x86 - Linux(x86)', () => {
        let testPackage = inputPackages.find(element => (element.platformId && element.platformId == "linux-x86"));
        let resultPackage = SetBinaryAndGetPackage(testPackage, serverUrl, "1.2.3", "experimentPath");
        resultPackage.installTestPath.should.equal("./experimentPath/1.2.3/mono.linux-x86");
    });

    test('Install test path is calculated using specified path, version and ends with mono.linux-x86_64 - Linux(x64)', () => {
        let testPackage = inputPackages.find(element => (element.platformId && element.platformId == "linux-x64"));
        let resultPackage = SetBinaryAndGetPackage(testPackage, serverUrl, "1.2.3", "experimentPath");
        resultPackage.installTestPath.should.equal("./experimentPath/1.2.3/mono.linux-x86_64");
    });
});

suite('GetPackagesFromVersion : Gets the experimental omnisharp packages from a set of input packages', () => {

    const serverUrl = "http://serverUrl";
    const installPath = "testPath";
    let inputPackages : any;

    suiteSetup(() => {
        inputPackages = <Package[]>(GetTestPackageJSON().runtimeDependencies);
        should();
    });

    test('Throws exception if the version is null', () => {
        let version: string = null;
        let fn = function () { GetPackagesFromVersion(version, inputPackages, serverUrl, installPath); };
        expect(fn).to.throw('Invalid version');
    });

    test('Throws exception if the version is empty', () => {
        let version = "";
        let fn = function () { GetPackagesFromVersion(version, inputPackages, serverUrl, installPath); };
        expect(fn).to.throw('Invalid version');
    });

    test('Returns experiment packages with install test path depending on install path and version', () => {
        let inputPackages = <Package[]>[
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

        let outPackages = GetPackagesFromVersion("1.1.1", inputPackages, serverUrl, "experimentPath");
        outPackages.length.should.equal(2);
        outPackages[0].installTestPath.should.equal("./experimentPath/1.1.1/OmniSharp.exe");
        outPackages[1].installTestPath.should.equal("./experimentPath/1.1.1/mono.osx");
    });

    test('Returns only omnisharp packages with experimentalIds', () => {
        let version = "0.0.0";
        let inputPackages = <Package[]>[
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

        let outPackages = GetPackagesFromVersion(version, inputPackages, serverUrl, installPath);
        outPackages.length.should.equal(1);
        outPackages[0].platformId.should.equal("win-x64");
    });
});

suite('GetVersionFilePackage : Gives the package for the latest file download', () => {
    test('Contains the expected description', () => {
        let testPackage = GetVersionFilePackage("someUrl", "somePath");
        expect(testPackage.description).to.equal('Latest version information file');
    }); 

    test('Contains the url based on serverUrl and the pathInServer', () => {
        let testPackage = GetVersionFilePackage("someUrl", "somePath");
        expect(testPackage.url).to.equal('someUrl/somePath');
    }); 
});