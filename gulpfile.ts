/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import * as child_process from 'child_process';
import * as debugUtil from './src/coreclr-debug/util';
import * as del from 'del';
import * as fs from 'fs';
import * as gulp from 'gulp';
import * as logger from './src/logger';
import * as mocha from 'gulp-mocha';
import * as optionsSchemaGenerator from './src/tools/GenerateOptionsSchema';
import * as packageDependencyUpdater from './src/tools/UpdatePackageDependencies';
import * as packages from './src/packages';
import * as path from 'path';
import * as platform from './src/platform';
import * as util from './src/common';
import * as vsce from 'vsce';

import { CsharpLoggerObserver } from './src/observers/CsharpLoggerObserver';
import { EventStream } from './src/EventStream';
import tslint from 'gulp-tslint';

const Logger = logger.Logger;
const PackageManager = packages.PackageManager;
const LinuxDistribution = platform.LinuxDistribution;
const PlatformInformation = platform.PlatformInformation;

function cleanSync(deleteVsix) {
    del.sync('install.*');
    del.sync('.omnisharp*');
    del.sync('.debugger');

    if (deleteVsix) {
        del.sync('*.vsix');
    }
}

gulp.task('clean', () => {
    cleanSync(true);
});

gulp.task('generateOptionsSchema', () => {
    optionsSchemaGenerator.GenerateOptionsSchema();
});

gulp.task('updatePackageDependencies', () => {
    packageDependencyUpdater.updatePackageDependencies();
});

// Install Tasks
function install(platformInfo, packageJSON) {
    const packageManager = new PackageManager(platformInfo, packageJSON);
    const eventStream = new EventStream();
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

gulp.task('install', ['clean'], () => {
    util.setExtensionPath(__dirname);

    return PlatformInformation.GetCurrent()
        .then(platformInfo => {
            return install(platformInfo, getPackageJSON());
        });
});

gulp.task('unpackage:vsix', () => { 
    util.setExtensionPath(__dirname); 
    const packageJSON = getPackageJSON(); 
    const name = packageJSON.name;
    const version = packageJSON.version; 
    const packageName = `${name}-${version}.vsix`; 
}); 

/// Packaging (VSIX) Tasks
function doPackageSync(packageName?) {

    let vsceArgs = [];
    vsceArgs.push(path.join(__dirname, 'node_modules', 'vsce', 'out', 'vsce'));
    vsceArgs.push('package'); // package command

    if (packageName !== undefined) {
        vsceArgs.push('-o');
        vsceArgs.push(packageName);
    }

    let proc = child_process.spawnSync('node', vsceArgs);
    if (proc.error) {
        console.error(proc.error.toString());
    }
}

function doOfflinePackage(platformInfo, packageName, packageJSON) {
    if (process.platform === 'win32') {
        throw new Error('Do not build offline packages on windows. Runtime executables will not be marked executable in *nix packages.');
    }

    cleanSync(false);
    return install(platformInfo, packageJSON)
        .then(() => {
            doPackageSync(packageName + '-' + platformInfo.platform + '-' + platformInfo.architecture + '.vsix');
        });
}

function getPackageJSON() {
    return JSON.parse(fs.readFileSync('package.json').toString());
}

gulp.task('package:clean', () => {
    del.sync('*.vsix');
});

gulp.task('package:online', ['clean'], () => {
    doPackageSync();
});

gulp.task('package:offline', ['clean'], () => {
    util.setExtensionPath(__dirname);

    const packageJSON = getPackageJSON();
    const name = packageJSON.name;
    const version = packageJSON.version;
    const packageName = name + '.' + version;

    const packages = [];
    packages.push(new PlatformInformation('win32', 'x86_64'));
    packages.push(new PlatformInformation('darwin', 'x86_64'));
    packages.push(new PlatformInformation('linux', 'x86_64'));

    let promise = Promise.resolve();

    packages.forEach(platformInfo => {
        promise = promise
            .then(() => {
                return doOfflinePackage(platformInfo, packageName, packageJSON);
            });
    });

    return promise;
});

/// Misc Tasks
const allTypeScript = [
    'src/**/*.ts',
    '!**/*.d.ts',
    '!**/typings**'
];

const lintReporter = (output, file, options) => {
    //emits: src/helloWorld.c:5:3: warning: implicit declaration of function ‘prinft’
    const relativeBase = file.base.substring(file.cwd.length + 1).replace('\\', '/');
    output.forEach(e => {
        const message = relativeBase + e.name + ':' + (e.startPosition.line + 1) + ':' + (e.startPosition.character + 1) + ': ' + e.failure;
        console.log('[tslint] ' + message);
    });
};

gulp.task('tslint', () => {
    gulp.src(allTypeScript)
        .pipe(tslint({
            program: require('tslint').Linter.createProgram("./tsconfig.json"),
            configuration: "./tslint.json"
        }))
        .pipe(tslint.report({
            summarizeFailureOutput: false,
            emitError: false
        }));
});
