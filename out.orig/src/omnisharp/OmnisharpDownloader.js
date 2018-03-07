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
const packages_1 = require("../packages");
const OmnisharpPackageCreator_1 = require("./OmnisharpPackageCreator");
const downloader_helper_1 = require("../downloader.helper");
class OmnisharpDownloader {
    constructor(channel, logger, packageJSON, platformInfo, reporter) {
        this.channel = channel;
        this.logger = logger;
        this.packageJSON = packageJSON;
        this.platformInfo = platformInfo;
        this.reporter = reporter;
        this.status = downloader_helper_1.GetStatus();
        let networkConfiguration = downloader_helper_1.GetNetworkConfiguration();
        this.proxy = networkConfiguration.Proxy;
        this.strictSSL = networkConfiguration.StrictSSL;
        this.telemetryProps = {};
        this.packageManager = new packages_1.PackageManager(this.platformInfo, this.packageJSON);
    }
    DownloadAndInstallOmnisharp(version, serverUrl, installPath) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.append('Installing Omnisharp Packages...');
            this.channel.show();
            let installationStage = '';
            if (this.reporter) {
                this.reporter.sendTelemetryEvent("AcquisitionStart");
            }
            try {
                installationStage = 'logPlatformInfo';
                this.logger.appendLine();
                this.logger.appendLine(`Platform: ${this.platformInfo.toString()}`);
                this.logger.appendLine();
                installationStage = 'getPackageInfo';
                let packages = OmnisharpPackageCreator_1.GetPackagesFromVersion(version, this.packageJSON.runtimeDependencies, serverUrl, installPath);
                installationStage = 'downloadPackages';
                // Specify the packages that the package manager needs to download
                this.packageManager.SetVersionPackagesForDownload(packages);
                yield this.packageManager.DownloadPackages(this.logger, this.status, this.proxy, this.strictSSL);
                this.logger.appendLine();
                installationStage = 'installPackages';
                yield this.packageManager.InstallPackages(this.logger, this.status);
                installationStage = 'completeSuccess';
            }
            catch (error) {
                downloader_helper_1.ReportInstallationError(this.logger, error, this.telemetryProps, installationStage);
                throw error; // throw the error up to the server
            }
            finally {
                downloader_helper_1.SendInstallationTelemetry(this.logger, this.reporter, this.telemetryProps, installationStage, this.platformInfo);
                this.status.dispose();
            }
        });
    }
    GetLatestVersion(serverUrl, latestVersionFileServerPath) {
        return __awaiter(this, void 0, void 0, function* () {
            let installationStage = 'getLatestVersionInfoFile';
            try {
                this.logger.appendLine('Getting latest build information...');
                this.logger.appendLine();
                //The package manager needs a package format to download, hence we form a package for the latest version file
                let filePackage = OmnisharpPackageCreator_1.GetVersionFilePackage(serverUrl, latestVersionFileServerPath);
                //Fetch the latest version information from the file
                return yield this.packageManager.GetLatestVersionFromFile(this.logger, this.status, this.proxy, this.strictSSL, filePackage);
            }
            catch (error) {
                downloader_helper_1.ReportInstallationError(this.logger, error, this.telemetryProps, installationStage);
                throw error;
            }
        });
    }
}
exports.OmnisharpDownloader = OmnisharpDownloader;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT21uaXNoYXJwRG93bmxvYWRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vbW5pc2hhcnAvT21uaXNoYXJwRG93bmxvYWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7QUFHaEcsMENBQThEO0FBSTlELHVFQUEwRjtBQUMxRiw0REFBOEg7QUFFOUg7SUFPSSxZQUNZLE9BQTZCLEVBQzdCLE1BQWMsRUFDZCxXQUFnQixFQUNoQixZQUFpQyxFQUNqQyxRQUE0QjtRQUo1QixZQUFPLEdBQVAsT0FBTyxDQUFzQjtRQUM3QixXQUFNLEdBQU4sTUFBTSxDQUFRO1FBQ2QsZ0JBQVcsR0FBWCxXQUFXLENBQUs7UUFDaEIsaUJBQVksR0FBWixZQUFZLENBQXFCO1FBQ2pDLGFBQVEsR0FBUixRQUFRLENBQW9CO1FBRXBDLElBQUksQ0FBQyxNQUFNLEdBQUcsNkJBQVMsRUFBRSxDQUFDO1FBQzFCLElBQUksb0JBQW9CLEdBQUcsMkNBQXVCLEVBQUUsQ0FBQztRQUNyRCxJQUFJLENBQUMsS0FBSyxHQUFHLG9CQUFvQixDQUFDLEtBQUssQ0FBQztRQUN4QyxJQUFJLENBQUMsU0FBUyxHQUFHLG9CQUFvQixDQUFDLFNBQVMsQ0FBQztRQUNoRCxJQUFJLENBQUMsY0FBYyxHQUFHLEVBQUUsQ0FBQztRQUN6QixJQUFJLENBQUMsY0FBYyxHQUFHLElBQUkseUJBQWMsQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUNsRixDQUFDO0lBRVksMkJBQTJCLENBQUMsT0FBZSxFQUFFLFNBQWlCLEVBQUUsV0FBbUI7O1lBQzVGLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLGtDQUFrQyxDQUFDLENBQUM7WUFDdkQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUVwQixJQUFJLGlCQUFpQixHQUFHLEVBQUUsQ0FBQztZQUUzQixF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