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
const fs = require("fs");
const https = require("https");
const mkdirp = require("mkdirp");
const path = require("path");
const tmp = require("tmp");
const url_1 = require("url");
const yauzl = require("yauzl");
const util = require("./common");
const proxy_1 = require("./proxy");
class PackageError extends Error {
    // Do not put PII (personally identifiable information) in the 'message' field as it will be logged to telemetry
    constructor(message, pkg = null, innerError = null) {
        super(message);
        this.message = message;
        this.pkg = pkg;
        this.innerError = innerError;
    }
}
exports.PackageError = PackageError;
class PackageManager {
    constructor(platformInfo, packageJSON) {
        this.platformInfo = platformInfo;
        this.packageJSON = packageJSON;
        // Ensure our temp files get cleaned up in case of error.
        tmp.setGracefulCleanup();
    }
    DownloadPackages(logger, status, proxy, strictSSL) {
        return this.GetPackages()
            .then(packages => {
            return util.buildPromiseChain(packages, pkg => maybeDownloadPackage(pkg, logger, status, proxy, strictSSL));
        });
    }
    InstallPackages(logger, status) {
        return this.GetPackages()
            .then(packages => {
            return util.buildPromiseChain(packages, pkg => installPackage(pkg, logger, status));
        });
    }
    GetAllPackages() {
        return new Promise((resolve, reject) => {
            if (this.allPackages) {
                resolve(this.allPackages);
            }
            else if (this.packageJSON.runtimeDependencies) {
                this.allPackages = JSON.parse(JSON.stringify(this.packageJSON.runtimeDependencies));
                //Copying the packages by value and not by reference so that there are no side effects
                // Convert relative binary paths to absolute
                resolvePackageBinaries(this.allPackages);
                resolve(this.allPackages);
            }
            else {
                reject(new PackageError("Package manifest does not exist."));
            }
        });
    }
    GetPackages() {
        return this.GetAllPackages()
            .then(list => {
            return list.filter(pkg => {
                if (pkg.architectures && pkg.architectures.indexOf(this.platformInfo.architecture) === -1) {
                    return false;
                }
                if (pkg.platforms && pkg.platforms.indexOf(this.platformInfo.platform) === -1) {
                    return false;
                }
                return true;
            });
        });
    }
    SetVersionPackagesForDownload(packages) {
        this.allPackages = packages;
        resolvePackageBinaries(this.allPackages);
    }
    GetLatestVersionFromFile(logger, status, proxy, strictSSL, filePackage) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let latestVersion;
                yield maybeDownloadPackage(filePackage, logger, status, proxy, strictSSL);
                if (filePackage.tmpFile) {
                    latestVersion = fs.readFileSync(filePackage.tmpFile.name, 'utf8');
                    //Delete the temporary file created
                    filePackage.tmpFile.removeCallback();
                }
                return latestVersion;
            }
            catch (error) {
                throw new Error(`Could not download the latest version file due to ${error.toString()}`);
            }
        });
    }
}
exports.PackageManager = PackageManager;
function resolvePackageBinaries(packages) {
    // Convert relative binary paths to absolute
    for (let pkg of packages) {
        if (pkg.binaries) {
            pkg.binaries = pkg.binaries.map(value => path.resolve(getBaseInstallPath(pkg), value));
        }
    }
}
function getBaseInstallPath(pkg) {
    let basePath = util.getExtensionPath();
    if (pkg.installPath) {
        basePath = path.join(basePath, pkg.installPath);
    }
    return basePath;
}
function getNoopStatus() {
    return {
        setMessage: text => { },
        setDetail: text => { }
    };
}
function maybeDownloadPackage(pkg, logger, status, proxy, strictSSL) {
    return doesPackageTestPathExist(pkg).then((exists) => {
        if (!exists) {
            return downloadPackage(pkg, logger, status, proxy, strictSSL);
        }
        else {
            logger.appendLine(`Skipping package '${pkg.description}' (already downloaded).`);
        }
    });
}
function downloadPackage(pkg, logger, status, proxy, strictSSL) {
    status = status || getNoopStatus();
    logger.append(`Downloading package '${pkg.description}' `);
    status.setMessage("$(cloud-download) Downloading packages");
    status.setDetail(`Downloading package '${pkg.description}'...`);
    return new Promise((resolve, reject) => {
        tmp.file({ prefix: 'package-' }, (err, path, fd, cleanupCallback) => {
            if (err) {
                return reject(new PackageError('Error from tmp.file', pkg, err));
            }
            resolve({ name: path, fd: fd, removeCallback: cleanupCallback });
        });
    }).then(tmpResult => {
        pkg.tmpFile = tmpResult;
        let result = downloadFile(pkg.url, pkg, logger, status, proxy, strictSSL)
            .then(() => logger.appendLine(' Done!'));
        // If the package has a fallback Url, and downloading from the primary Url failed, try again from 
        // the fallback. This is used for debugger packages as some users have had issues downloading from
        // the CDN link.
        if (pkg.fallbackUrl) {
            result = result.catch((primaryUrlError) => {
                logger.append(`\tRetrying from '${pkg.fallbackUrl}' `);
                return downloadFile(pkg.fallbackUrl, pkg, logger, status, proxy, strictSSL)
                    .then(() => logger.appendLine(' Done!'))
                    .catch(() => primaryUrlError);
            });
        }
        return result;
    });
}
function downloadFile(urlString, pkg, logger, status, proxy, strictSSL) {
    const url = url_1.parse(urlString);
    const options = {
        host: url.host,
        path: url.path,
        agent: proxy_1.getProxyAgent(url, proxy, strictSSL),
        rejectUnauthorized: util.isBoolean(strictSSL) ? strictSSL : true
    };
    return new Promise((resolve, reject) => {
        if (!pkg.tmpFile || pkg.tmpFile.fd == 0) {
            return reject(new PackageError("Temporary package file unavailable", pkg));
        }
        let request = https.request(options, response => {
            if (response.statusCode === 301 || response.statusCode === 302) {
                // Redirect - download from new location
                return resolve(downloadFile(response.headers.location, pkg, logger, status, proxy, strictSSL));
            }
            if (response.statusCode != 200) {
                // Download failed - print error message
                logger.appendLine(`failed (error code '${response.statusCode}')`);
                return reject(new PackageError(response.statusCode.toString(), pkg));
            }
            // Downloading - hook up events
            let packageSize = parseInt(response.headers['content-length'], 10);
            let downloadedBytes = 0;
            let downloadPercentage = 0;
            let dots = 0;
            let tmpFile = fs.createWriteStream(null, { fd: pkg.tmpFile.fd });
            logger.append(`(${Math.ceil(packageSize / 1024)} KB) `);
            response.on('data', data => {
                downloadedBytes += data.length;
                // Update status bar item with percentage
                let newPercentage = Math.ceil(100 * (downloadedBytes / packageSize));
                if (newPercentage !== downloadPercentage) {
                    status.setDetail(`Downloading package '${pkg.description}'... ${downloadPercentage}%`);
                    downloadPercentage = newPercentage;
                }
                // Update dots after package name in output console
                let newDots = Math.ceil(downloadPercentage / 5);
                if (newDots > dots) {
                    logger.append('.'.repeat(newDots - dots));
                    dots = newDots;
                }
            });
            response.on('end', () => {
                resolve();
            });
            response.on('error', err => {
                reject(new PackageError(`Reponse error: ${err.message || 'NONE'}`, pkg, err));
            });
            // Begin piping data from the response to the package file
            response.pipe(tmpFile, { end: false });
        });
        request.on('error', err => {
            reject(new PackageError(`Request error: ${err.message || 'NONE'}`, pkg, err));
        });
        // Execute the request
        request.end();
    });
}
function installPackage(pkg, logger, status) {
    if (!pkg.tmpFile) {
        // Download of this package was skipped, so there is nothing to install
        return Promise.resolve();
    }
    status = status || getNoopStatus();
    logger.appendLine(`Installing package '${pkg.description}'`);
    status.setMessage("$(desktop-download) Installing packages...");
    status.setDetail(`Installing package '${pkg.description}'`);
    return new Promise((resolve, baseReject) => {
        const reject = (err) => {
            // If anything goes wrong with unzip, make sure we delete the test path (if there is one)
            // so we will retry again later
            const testPath = getPackageTestPath(pkg);
            if (testPath) {
                fs.unlink(testPath, unlinkErr => {
                    baseReject(err);
                });
            }
            else {
                baseReject(err);
            }
        };
        if (pkg.tmpFile.fd == 0) {
            return reject(new PackageError('Downloaded file unavailable', pkg));
        }
        yauzl.fromFd(pkg.tmpFile.fd, { lazyEntries: true }, (err, zipFile) => {
            if (err) {
                return reject(new PackageError('Immediate zip file error', pkg, err));
            }
            zipFile.readEntry();
            zipFile.on('entry', (entry) => {
                let absoluteEntryPath = path.resolve(getBaseInstallPath(pkg), entry.fileName);
                if (entry.fileName.endsWith('/')) {
                    // Directory - create it
                    mkdirp(absoluteEntryPath, { mode: 0o775 }, err => {
                        if (err) {
                            return reject(new PackageError('Error creating directory for zip directory entry:' + err.code || '', pkg, err));
                        }
                        zipFile.readEntry();
                    });
                }
                else {
                    // File - extract it
                    zipFile.openReadStream(entry, (err, readStream) => {
                        if (err) {
                            return reject(new PackageError('Error reading zip stream', pkg, err));
                        }
                        mkdirp(path.dirname(absoluteEntryPath), { mode: 0o775 }, err => {
                            if (err) {
                                return reject(new PackageError('Error creating directory for zip file entry', pkg, err));
                            }
                            // Make sure executable files have correct permissions when extracted
                            let fileMode = pkg.binaries && pkg.binaries.indexOf(absoluteEntryPath) !== -1
                                ? 0o755
                                : 0o664;
                            readStream.pipe(fs.createWriteStream(absoluteEntryPath, { mode: fileMode }));
                            readStream.on('end', () => zipFile.readEntry());
                        });
                    });
                }
            });
            zipFile.on('end', () => {
                resolve();
            });
            zipFile.on('error', err => {
                reject(new PackageError('Zip File Error:' + err.code || '', pkg, err));
            });
        });
    }).then(() => {
        // Clean up temp file
        pkg.tmpFile.removeCallback();
    });
}
function doesPackageTestPathExist(pkg) {
    const testPath = getPackageTestPath(pkg);
    if (testPath) {
        return util.fileExists(testPath);
    }
    else {
        return Promise.resolve(false);
    }
}
function getPackageTestPath(pkg) {
    if (pkg.installTestPath) {
        return path.join(util.getExtensionPath(), pkg.installTestPath);
    }
    else {
        return null;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFja2FnZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvcGFja2FnZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7O0FBRWhHLHlCQUF5QjtBQUN6QiwrQkFBK0I7QUFDL0IsaUNBQWlDO0FBQ2pDLDZCQUE2QjtBQUM3QiwyQkFBMkI7QUFDM0IsNkJBQXdDO0FBQ3hDLCtCQUErQjtBQUMvQixpQ0FBaUM7QUFHakMsbUNBQXdDO0FBdUJ4QyxrQkFBMEIsU0FBUSxLQUFLO0lBQ25DLGdIQUFnSDtJQUNoSCxZQUFtQixPQUFlLEVBQ3ZCLE1BQWUsSUFBSSxFQUNuQixhQUFrQixJQUFJO1FBQzdCLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUhBLFlBQU8sR0FBUCxPQUFPLENBQVE7UUFDdkIsUUFBRyxHQUFILEdBQUcsQ0FBZ0I7UUFDbkIsZUFBVSxHQUFWLFVBQVUsQ0FBWTtJQUVqQyxDQUFDO0NBQ0o7QUFQRCxvQ0FPQztBQUVEO0lBR0ksWUFDWSxZQUFpQyxFQUNqQyxXQUFnQjtRQURoQixpQkFBWSxHQUFaLFlBQVksQ0FBcUI7UUFDakMsZ0JBQVcsR0FBWCxXQUFXLENBQUs7UUFFeEIseURBQXlEO1FBQ3pELEdBQUcsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO0lBQzdCLENBQUM7SUFFTSxnQkFBZ0IsQ0FBQyxNQUFjLEVBQUUsTUFBYyxFQUFFLEtBQWEsRUFBRSxTQUFrQjtRQUNyRixNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRTthQUNwQixJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUU7WUFDYixNQUFNLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLG9CQUFvQixDQUFDLEdBQUcsRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDO1FBQ2hILENBQUMsQ0FBQyxDQUFDO0lB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