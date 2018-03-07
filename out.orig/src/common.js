"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const cp = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");
let extensionPath;
function setExtensionPath(path) {
    extensionPath = path;
}
exports.setExtensionPath = setExtensionPath;
function getExtensionPath() {
    if (!extensionPath) {
        throw new Error('Failed to set extension path');
    }
    return extensionPath;
}
exports.getExtensionPath = getExtensionPath;
function isBoolean(obj) {
    return obj === true || obj === false;
}
exports.isBoolean = isBoolean;
function sum(arr, selector) {
    return arr.reduce((prev, curr) => prev + selector(curr), 0);
}
exports.sum = sum;
/** Retrieve the length of an array. Returns 0 if the array is `undefined`. */
function safeLength(arr) {
    return arr ? arr.length : 0;
}
exports.safeLength = safeLength;
function buildPromiseChain(array, builder) {
    return array.reduce((promise, n) => promise.then(() => builder(n)), Promise.resolve(null));
}
exports.buildPromiseChain = buildPromiseChain;
function execChildProcess(command, workingDirectory = getExtensionPath()) {
    return new Promise((resolve, reject) => {
        cp.exec(command, { cwd: workingDirectory, maxBuffer: 500 * 1024 }, (error, stdout, stderr) => {
            if (error) {
                reject(error);
            }
            else if (stderr && stderr.length > 0) {
                reject(new Error(stderr));
            }
            else {
                resolve(stdout);
            }
        });
    });
}
exports.execChildProcess = execChildProcess;
function getUnixChildProcessIds(pid) {
    return new Promise((resolve, reject) => {
        let ps = cp.exec('ps -A -o ppid,pid', (error, stdout, stderr) => {
            if (error) {
                return reject(error);
            }
            if (stderr) {
                return reject(stderr);
            }
            if (!stdout) {
                return resolve([]);
            }
            let lines = stdout.split(os.EOL);
            let pairs = lines.map(line => line.trim().split(/\s+/));
            let children = [];
            for (let pair of pairs) {
                let ppid = parseInt(pair[0]);
                if (ppid === pid) {
                    children.push(parseInt(pair[1]));
                }
            }
            resolve(children);
        });
        ps.on('error', reject);
    });
}
exports.getUnixChildProcessIds = getUnixChildProcessIds;
function fileExists(filePath) {
    return new Promise((resolve, reject) => {
        fs.stat(filePath, (err, stats) => {
            if (stats && stats.isFile()) {
                resolve(true);
            }
            else {
                resolve(false);
            }
        });
    });
}
exports.fileExists = fileExists;
function deleteIfExists(filePath) {
    return fileExists(filePath)
        .then((exists) => {
        return new Promise((resolve, reject) => {
            if (!exists) {
                return resolve();
            }
            fs.unlink(filePath, err => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
    });
}
exports.deleteIfExists = deleteIfExists;
var InstallFileType;
(function (InstallFileType) {
    InstallFileType[InstallFileType["Begin"] = 0] = "Begin";
    InstallFileType[InstallFileType["Lock"] = 1] = "Lock";
})(InstallFileType = exports.InstallFileType || (exports.InstallFileType = {}));
function getInstallFilePath(type) {
    let installFile = 'install.' + InstallFileType[type];
    return path.resolve(getExtensionPath(), installFile);
}
function installFileExists(type) {
    return fileExists(getInstallFilePath(type));
}
exports.installFileExists = installFileExists;
function touchInstallFile(type) {
    return new Promise((resolve, reject) => {
        fs.writeFile(getInstallFilePath(type), '', err => {
            if (err) {
                reject(err);
                return;
            }
            resolve();
        });
    });
}
exports.touchInstallFile = touchInstallFile;
function deleteInstallFile(type) {
    return new Promise((resolve, reject) => {
        fs.unlink(getInstallFilePath(type), err => {
            if (err) {
                reject(err);
                return;
            }
            resolve();
        });
    });
}
exports.deleteInstallFile = deleteInstallFile;
function convertNativePathToPosix(pathString) {
    let parts = pathString.split(path.sep);
    return parts.join(path.posix.sep);
}
exports.convertNativePathToPosix = convertNativePathToPosix;
/**
 * This function checks to see if a subfolder is part of folder.
 *
 * Assumes subfolder and folder are absolute paths and have consistent casing.
 *
 * @param subfolder subfolder to check if it is part of the folder parameter
 * @param folder folder to check aganist
 */
function isSubfolderOf(subfolder, folder) {
    const subfolderArray = subfolder.split(path.sep);
    const folderArray = folder.split(path.sep);
    // Check to see that every sub directory in subfolder exists in folder.
    return subfolderArray.length <= folderArray.length && subfolderArray.every((subpath, index) => folderArray[index] === subpath);
}
exports.isSubfolderOf = isSubfolderOf;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvbW1vbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7OztnR0FHZ0c7O0FBRWhHLG9DQUFvQztBQUNwQyx5QkFBeUI7QUFDekIseUJBQXlCO0FBQ3pCLDZCQUE2QjtBQUU3QixJQUFJLGFBQXFCLENBQUM7QUFFMUIsMEJBQWlDLElBQVk7SUFDekMsYUFBYSxHQUFHLElBQUksQ0FBQztBQUN6QixDQUFDO0FBRkQsNENBRUM7QUFFRDtJQUNJLEVBQUUsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztRQUNqQixNQUFNLElBQUksS0FBSyxDQUFDLDhCQUE4QixDQUFDLENBQUM7SUFDcEQsQ0FBQztJQUVELE1BQU0sQ0FBQyxhQUFhLENBQUM7QUFDekIsQ0FBQztBQU5ELDRDQU1DO0FBRUQsbUJBQTBCLEdBQVE7SUFDOUIsTUFBTSxDQUFDLEdBQUcsS0FBSyxJQUFJLElBQUksR0FBRyxLQUFLLEtBQUssQ0FBQztBQUN6QyxDQUFDO0FBRkQsOEJBRUM7QUFFRCxhQUF1QixHQUFRLEVBQUUsUUFBNkI7SUFDMUQsTUFBTSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQyxJQUFJLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ2hFLENBQUM7QUFGRCxrQkFFQztBQUVELDhFQUE4RTtBQUM5RSxvQkFBOEIsR0FBb0I7SUFDOUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2hDLENBQUM7QUFGRCxnQ0FFQztBQUVELDJCQUE4QyxLQUFVLEVBQUUsT0FBc0M7SUFDNUYsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQ2YsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxFQUFFLEVBQUUs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