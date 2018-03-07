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
const util = require("./common");
const packages_1 = require("./packages");
const platform_1 = require("./platform");
const downloader_helper_1 = require("./downloader.helper");
/*
 * Class used to download the runtime dependencies of the C# Extension
 */
class CSharpExtDownloader {
    constructor(channel, logger, reporter /* optional */, packageJSON) {
        this.channel = channel;
        this.logger = logger;
        this.reporter = reporter; /* optional */
        this.packageJSON = packageJSON;
    }
    installRuntimeDependencies() {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.append('Installing C# dependencies...');
            this.channel.show();
            let status = downloader_helper_1.GetStatus();
            // Sends "AcquisitionStart" telemetry to indicate an acquisition  started.
            if (this.reporter) {
                this.reporter.sendTelemetryEvent("AcquisitionStart");
            }
            let platformInfo;
            let packageManager;
            let installationStage = 'touchBeginFile';
            let success = false;
            let telemetryProps = {};
            try {
                yield util.touchInstallFile(util.InstallFileType.Begin);
                installationStage = 'getPlatformInfo';
                platformInfo = yield platform_1.PlatformInformation.GetCurrent();
                packageManager = new packages_1.PackageManager(platformInfo, this.packageJSON);
                this.logger.appendLine();
                // Display platform information and RID followed by a blank line
                this.logger.appendLine(`Platform: ${platformInfo.toString()}`);
                this.logger.appendLine();
                installationStage = 'downloadPackages';
                let networkConfiguration = downloader_helper_1.GetNetworkConfiguration();
                const proxy = networkConfiguration.Proxy;
                const strictSSL = networkConfiguration.StrictSSL;
                yield packageManager.DownloadPackages(this.logger, status, proxy, strictSSL);
                this.logger.appendLine();
                installationStage = 'installPackages';
                yield packageManager.InstallPackages(this.logger, status);
                installationStage = 'touchLockFile';
                yield util.touchInstallFile(util.InstallFileType.Lock);
                installationStage = 'completeSuccess';
                success = true;
            }
            catch (error) {
                downloader_helper_1.ReportInstallationError(this.logger, error, telemetryProps, installationStage);
            }
            finally {
                downloader_helper_1.SendInstallationTelemetry(this.logger, this.reporter, telemetryProps, installationStage, platformInfo);
                status.dispose();
                // We do this step at the end so that we clean up the begin file in the case that we hit above catch block
                // Attach a an empty catch to this so that errors here do not propogate
                try {
                    util.deleteInstallFile(util.InstallFileType.Begin);
                }
                catch (error) { }
                return success;
            }
        });
    }
}
exports.CSharpExtDownloader = CSharpExtDownloader;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ1NoYXJwRXh0RG93bmxvYWRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9DU2hhcnBFeHREb3dubG9hZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O2dHQUdnRzs7Ozs7Ozs7OztBQUloRyxpQ0FBaUM7QUFFakMseUNBQTRDO0FBQzVDLHlDQUFpRDtBQUNqRCwyREFBNkg7QUFFN0g7O0dBRUc7QUFDSDtJQUNJLFlBQ1ksT0FBNkIsRUFDN0IsTUFBYyxFQUNkLFFBQTJCLENBQUMsY0FBYyxFQUMxQyxXQUFnQjtRQUhoQixZQUFPLEdBQVAsT0FBTyxDQUFzQjtRQUM3QixXQUFNLEdBQU4sTUFBTSxDQUFRO1FBQ2QsYUFBUSxHQUFSLFFBQVEsQ0FBbUIsQ0FBQyxjQUFjO1FBQzFDLGdCQUFXLEdBQVgsV0FBVyxDQUFLO0lBQzVCLENBQUM7SUFFWSwwQkFBMEI7O1lBQ25DLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLCtCQUErQixDQUFDLENBQUM7WUFDcEQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUVwQixJQUFJLE1BQU0sR0FBRyw2QkFBUyxFQUFFLENBQUM7WUFFekIsMEVBQTBFO1lBQzFFLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO2dCQUNoQixJQUFJLENBQUMsUUFBUSxDQUFDLGtCQUFrQixDQUFDLGtCQUFrQixDQUFDLENBQUM7WUFDekQsQ0FBQztZQUVELElBQUksWUFBaUMsQ0FBQztZQUN0QyxJQUFJLGNBQThCLENBQUM7WUFDbkMsSUFBSSxpQkFBaUIsR0FBRyxnQkFBZ0IsQ0FBQztZQUN6QyxJQUFJLE9BQU8sR0FBRyxLQUFLLENBQUM7WUFFcEIsSUFBSSxjQUFjLEdBQVEsRUFBRSxDQUFDO1lBRTdCLElBQUksQ0FBQztnQkFDRCxNQUFNLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUN4RCxpQkFBaUIsR0FBRyxpQkFBaUIsQ0FBQztnQkFDdEMsWUFBWSxHQUFHLE1BQU0sOEJBQW1CLENBQUMsVUFBVSxFQUFFLENBQUM7Z0JBRXRELGNBQWMsR0FBRyxJQUFJLHlCQUFjLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztnQkFDcEUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsQ0FBQztnQkFDekIsZ0VBQWdFO2dCQUNoRSxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxhQUFhLFlBQVksQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLENBQUM7Z0JBQy9ELElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLENBQUM7Z0JBRXpCLGlCQUFpQixHQUFHLGtCQUFrQixDQUFDO2dCQUV2QyxJQUFJLG9CQUFvQixHQUFHLDJDQUF1QixFQUFFLENBQUM7Z0JBQ3JELE1BQU0sS0FBSyxHQUFHLG9CQUFvQixDQUFDLEtBQUssQ0FBQztnQkFDekMsTUFBTSxTQUFTLEdBQUcsb0JBQW9CLENBQUMsU0FBUyxDQUFDO2dCQUVqRCxNQUFNLGNBQWMsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsU0FBUyxDQUFDLENBQUM7Z0JBQzdFLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLENBQUM7Z0JBRXpCLGlCQUFpQixHQUFHLGlCQUFpQixDQUFDO2dCQUN0QyxNQUFNLGNBQWMsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztnQkFFMUQsaUJBQWlCLEdBQUcsZUFBZSxDQUFDO2dCQUNwQyxNQUFNLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUV2RCxpQkFBaUIsR0FBRyxpQkFBaUIsQ0FBQztnQkFDdEMsT0FBTyxHQUFHLElBQUksQ0FBQztZQUNuQixDQUFDO1lBQ0QsS0FBSyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztnQkFDWCwyQ0FBdUIsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxjQUFjLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztZQUNuRixDQUFDO29CQUNPLENBQUM7Z0JBQ0wsNkNBQXlCLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLGNBQWMsRUFBRSxpQkFBaUIsRUFBRSxZQUFZLENBQUMsQ0FBQztnQkFDdkcsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUNqQiwwR0FBMEc7Z0JBQzFHLHVFQUF1RTtnQkFDdkUsSUFBSSxDQUFDO29CQUNELElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUN2RCxDQUFDO2dCQUNELEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNqQixNQUFNLENBQUMsT0FBTyxDQUFDO1lBQ25CLENBQUM7UUFDTCxDQUFDO0tBQUE7Q0FDSjtBQXRFRCxrREFzRUMifQ==