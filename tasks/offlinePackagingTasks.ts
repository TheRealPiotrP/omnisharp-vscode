
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import * as debugUtil from '../src/coreclr-debug/util';
import * as del from 'del';
import * as fs from 'fs';
import * as gulp from 'gulp';
import * as path from 'path';
import * as unzip from 'unzip2';
import * as util from '../src/common';
import spawnNode from '../tasks/spawnNode';
import { codeExtensionPath, offlineVscodeignorePath, vscodeignorePath, vscePath, packedVsixOutputRoot } from '../tasks/projectPaths';
import { commandLineOptions } from '../tasks/commandLineArguments';
import { CsharpLoggerObserver } from '../src/observers/CsharpLoggerObserver';
import { EventStream } from '../src/EventStream';
import { getPackageJSON } from '../tasks/packageJson';
import { Logger } from '../src/logger';
import { PackageManager } from '../src/packages';
import { PlatformInformation } from '../src/platform';

gulp.task('vsix:offline:package', () => {
    del.sync(vscodeignorePath);

    fs.copyFileSync(offlineVscodeignorePath, vscodeignorePath);

    return doPackageOffline()
        .then(v => del(vscodeignorePath),
            e => {
                del(vscodeignorePath);
                throw e;
            });
});

function doPackageOffline() {
    util.setExtensionPath(codeExtensionPath);

    if (commandLineOptions.retainVsix) {
        //if user doesnot want to clean up the existing vsix packages
        cleanSync(false);
    }
    else {
        cleanSync(true);
    }

    const packageJSON = getPackageJSON();
    const name = packageJSON.name;
    const version = packageJSON.version;
    const packageName = name + '.' + version;

    const packages = [
        new PlatformInformation('win32', 'x86_64'),
        new PlatformInformation('darwin', 'x86_64'),
        new PlatformInformation('linux', 'x86_64')
    ];

    let promise = Promise.resolve();

    packages.forEach(platformInfo => {
        promise = promise
            .then(() => doOfflinePackage(platformInfo, packageName, packageJSON, packedVsixOutputRoot));
    });

    return promise;
}

function cleanSync(deleteVsix: boolean) {
    del.sync('install.*');
    del.sync('.omnisharp*');
    del.sync('.debugger');

    if (deleteVsix) {
        del.sync('*.vsix');
    }
}

function doOfflinePackage(platformInfo: PlatformInformation, packageName: string, packageJSON: any, outputFolder: string) {
    if (process.platform === 'win32') {
        throw new Error('Do not build offline packages on windows. Runtime executables will not be marked executable in *nix packages.');
    }

    cleanSync(false);

    return install(platformInfo, packageJSON)
        .then(() => doPackageSync(packageName + '-' + platformInfo.platform + '-' + platformInfo.architecture + '.vsix', outputFolder));
}

// Install Tasks
function install(platformInfo: PlatformInformation, packageJSON: any) {
    const packageManager = new PackageManager(platformInfo, packageJSON);
    let eventStream = new EventStream();
    const logger = new Logger(message => process.stdout.write(message));
    let stdoutObserver = new CsharpLoggerObserver(logger);
    eventStream.subscribe(stdoutObserver.post);
    const debuggerUtil = new debugUtil.CoreClrDebugUtil(path.resolve('.'));

    return packageManager.DownloadPackages(eventStream, undefined, undefined, undefined)
        .then(() => {
            return packageManager.InstallPackages(eventStream, undefined);
        })
        .then(() => {

            return util.touchInstallFile(util.InstallFileType.Lock);
        })
        .then(() => {
            return debugUtil.CoreClrDebugUtil.writeEmptyFile(debuggerUtil.installCompleteFilePath());
        });
}

/// Packaging (VSIX) Tasks
function doPackageSync(packageName: string, outputFolder: string) {

    let vsceArgs = [];
    vsceArgs.push(vscePath);
    vsceArgs.push('package'); // package command

    if (packageName !== undefined) {
        vsceArgs.push('-o');
        if (outputFolder) {
            //if we have specified an output folder then put the files in that output folder
            vsceArgs.push(path.join(outputFolder, packageName));
        }
        else {
            vsceArgs.push(packageName);
        }
    }

    return spawnNode(vsceArgs);
}