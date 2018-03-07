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
const util = require("../common");
const path = require("path");
const semver = require("semver");
const OmnisharpDownloader_1 = require("./OmnisharpDownloader");
class OmnisharpManager {
    constructor(channel, logger, packageJSON, reporter) {
        this.channel = channel;
        this.logger = logger;
        this.packageJSON = packageJSON;
        this.reporter = reporter;
    }
    GetOmnisharpPath(omnisharpPath, useMono, serverUrl, latestVersionFileServerPath, installPath, extensionPath, platformInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            // Looks at the options path, installs the dependencies and returns the path to be loaded by the omnisharp server
            let downloader = new OmnisharpDownloader_1.OmnisharpDownloader(this.channel, this.logger, this.packageJSON, platformInfo, this.reporter);
            if (path.isAbsolute(omnisharpPath)) {
                if (yield util.fileExists(omnisharpPath)) {
                    return omnisharpPath;
                }
                else {
                    throw new Error('The system could not find the specified path');
                }
            }
            else if (omnisharpPath == "latest") {
                return yield this.InstallLatestAndReturnLaunchPath(downloader, useMono, serverUrl, latestVersionFileServerPath, installPath, extensionPath, platformInfo);
            }
            //If the path is neither a valid path on disk not the string "latest", treat it as a version 
            return yield this.InstallVersionAndReturnLaunchPath(downloader, omnisharpPath, useMono, serverUrl, installPath, extensionPath, platformInfo);
        });
    }
    InstallLatestAndReturnLaunchPath(downloader, useMono, serverUrl, latestVersionFileServerPath, installPath, extensionPath, platformInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            let version = yield downloader.GetLatestVersion(serverUrl, latestVersionFileServerPath);
            return yield this.InstallVersionAndReturnLaunchPath(downloader, version, useMono, serverUrl, installPath, extensionPath, platformInfo);
        });
    }
    InstallVersionAndReturnLaunchPath(downloader, version, useMono, serverUrl, installPath, extensionPath, platformInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            if (semver.valid(version)) {
                yield downloader.DownloadAndInstallOmnisharp(version, serverUrl, installPath);
                return GetLaunchPathForVersion(platformInfo, version, installPath, extensionPath, useMono);
            }
            else {
                throw new Error(`Invalid omnisharp version - ${version}`);
            }
        });
    }
}
exports.OmnisharpManager = OmnisharpManager;
function GetLaunchPathForVersion(platformInfo, version, installPath, extensionPath, useMono) {
    if (!version) {
        throw new Error('Invalid Version');
    }
    let basePath = path.resolve(extensionPath, installPath, version);
    if (platformInfo.isWindows()) {
        return path.join(basePath, 'OmniSharp.exe');
    }
    if (useMono) {
        return path.join(basePath, 'omnisharp', 'OmniSharp.exe');
    }
    return path.join(basePath, 'run');
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT21uaXNoYXJwTWFuYWdlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vbW5pc2hhcnAvT21uaXNoYXJwTWFuYWdlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7QUFFaEcsa0NBQWtDO0FBQ2xDLDZCQUE2QjtBQUM3QixpQ0FBaUM7QUFHakMsK0RBQTREO0FBSTVEO0lBQ0ksWUFDWSxPQUE2QixFQUM3QixNQUFjLEVBQ2QsV0FBZ0IsRUFDaEIsUUFBNEI7UUFINUIsWUFBTyxHQUFQLE9BQU8sQ0FBc0I7UUFDN0IsV0FBTSxHQUFOLE1BQU0sQ0FBUTtRQUNkLGdCQUFXLEdBQVgsV0FBVyxDQUFLO1FBQ2hCLGFBQVEsR0FBUixRQUFRLENBQW9CO0lBQ3hDLENBQUM7SUFFWSxnQkFBZ0IsQ0FBQyxhQUFxQixFQUFFLE9BQWdCLEVBQUUsU0FBaUIsRUFBRSwyQkFBbUMsRUFBRSxXQUFtQixFQUFFLGFBQXFCLEVBQUUsWUFBaUM7O1lBQ3hNLGlIQUFpSDtZQUNqSCxJQUFJLFVBQVUsR0FBRyxJQUFJLHlDQUFtQixDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsV0FBVyxFQUFFLFlBQVksRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDbkgsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2pDLEVBQUUsQ0FBQyxDQUFDLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ3ZDLE1BQU0sQ0FBQyxhQUFhLENBQUM7Z0JBQ3pCLENBQUM7Z0JBQ0QsSUFBSSxDQUFDLENBQUM7b0JBQ0YsTUFBTSxJQUFJLEtBQUssQ0FBQyw4Q0FBOEMsQ0FBQyxDQUFDO2dCQUNwRSxDQUFDO1lBQ0wsQ0FBQztZQUNELElBQUksQ0FB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