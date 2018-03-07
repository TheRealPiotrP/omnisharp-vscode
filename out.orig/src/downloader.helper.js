"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*---------------------------------------------------------------------------------------------
* Copyright (c) Microsoft Corporation. All rights reserved.
* Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/
const vscode = require("vscode");
const packages_1 = require("./packages");
function GetNetworkConfiguration() {
    const config = vscode.workspace.getConfiguration();
    const proxy = config.get('http.proxy');
    const strictSSL = config.get('http.proxyStrictSSL', true);
    return { Proxy: proxy, StrictSSL: strictSSL };
}
exports.GetNetworkConfiguration = GetNetworkConfiguration;
function GetStatus() {
    let statusItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right);
    let status = {
        setMessage: text => {
            statusItem.text = text;
            statusItem.show();
        },
        setDetail: text => {
            statusItem.tooltip = text;
            statusItem.show();
        },
        dispose: () => {
            statusItem.dispose();
        }
    };
    return status;
}
exports.GetStatus = GetStatus;
function ReportInstallationError(logger, error, telemetryProps, installationStage) {
    let errorMessage;
    if (error instanceof packages_1.PackageError) {
        // we can log the message in a PackageError to telemetry as we do not put PII in PackageError messages
        telemetryProps['error.message'] = error.message;
        if (error.innerError) {
            errorMessage = error.innerError.toString();
        }
        else {
            errorMessage = error.message;
        }
        if (error.pkg) {
            telemetryProps['error.packageUrl'] = error.pkg.url;
        }
    }
    else {
        // do not log raw errorMessage in telemetry as it is likely to contain PII.
        errorMessage = error.toString();
    }
    logger.appendLine();
    logger.appendLine(`Failed at stage: ${installationStage}`);
    logger.appendLine(errorMessage);
}
exports.ReportInstallationError = ReportInstallationError;
function SendInstallationTelemetry(logger, reporter, telemetryProps, installationStage, platformInfo) {
    telemetryProps['installStage'] = installationStage;
    telemetryProps['platform.architecture'] = platformInfo.architecture;
    telemetryProps['platform.platform'] = platformInfo.platform;
    if (platformInfo.distribution) {
        telemetryProps['platform.distribution'] = platformInfo.distribution.toTelemetryString();
    }
    if (reporter) {
        reporter.sendTelemetryEvent('Acquisition', telemetryProps);
    }
    logger.appendLine();
    installationStage = '';
    logger.appendLine('Finished');
    logger.appendLine();
}
exports.SendInstallationTelemetry = SendInstallationTelemetry;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG93bmxvYWRlci5oZWxwZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZG93bmxvYWRlci5oZWxwZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7OytGQUcrRjtBQUMvRixpQ0FBaUM7QUFDakMseUNBQWtEO0FBS2xEO0lBQ0ksTUFBTSxNQUFNLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO0lBQ25ELE1BQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQVMsWUFBWSxDQUFDLENBQUM7SUFDL0MsTUFBTSxTQUFTLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUMxRCxNQUFNLENBQUMsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsQ0FBQztBQUNsRCxDQUFDO0FBTEQsMERBS0M7QUFFRDtJQUNJLElBQUksVUFBVSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsbUJBQW1CLENBQUMsTUFBTSxDQUFDLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3BGLElBQUksTUFBTSxHQUFXO1FBQ2pCLFVBQVUsRUFBRSxJQUFJLENBQUMsRUFBRTtZQUNmLFVBQVUsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1lBQ3ZCLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUN0QixDQUFDO1FBQ0QsU0FBUyxFQUFFLElBQUksQ0FBQyxFQUFFO1lBQ2QsVUFBVSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7WUFDMUIsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ3RCLENBQUM7UUFDRCxPQUFPLEVBQUUsR0FBRyxFQUFFO1lBQ1YsVUFBVSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ3pCLENBQUM7S0FDSixDQUFDO0lBRUYsTUFBTSxDQUFDLE1BQU0sQ0FBQztBQUNsQixDQUFDO0FBakJELDhCQWlCQztBQUVELGlDQUF3QyxNQUFjLEVBQUUsS0FBSyxFQUFFLGNBQW1CLEVBQUUsaUJBQXlCO0lBQ3pHLElBQUksWUFBb0IsQ0FBQztJQUN6QixFQUFFLENBQUMsQ0FBQyxLQUFLLFlBQVksdUJBQVksQ0FBQyxDQUFDLENBQUM7UUFDaEMsc0dBQXNHO1FBQ3RHLGNBQWMsQ0FBQyxlQUFlLENBQUMsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDO1FBQ2hELEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1lBQ25CLFlBQVksR0FBRyxLQUFLLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQy9DLENBQUM7UUFDRCxJQUFJLENBQUMsQ0FBQztZQUNGLFlBQVksR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDO1FBQ2pDLENBQUM7UUFDRCxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNaLGNBQWMsQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDO1FBQ3ZELENBQUM7SUFDTCxDQUFDO0lBQ0QsSUFBSSxDQUFDLENBQUM7UUFDRiwyRUFBMkU7UUFDM0UsWUFBWSxHQUFHLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUNwQyxDQUFDO0lBRUQsTUFBTSxDQUFDLFVBQVUsRUFBRSxDQUFDO0lBQ3BCLE1BQU0sQ0FBQyxVQUFVLENBQUMsb0JBQW9CLGlCQUFpQixFQUFFLENBQUMsQ0FBQztJQUMzRCxNQUFNLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQ3BDLENBQUM7QUF2QkQsMERBdUJDO0FBRUQsbUNBQTBDLE1BQWMsRUFBRSxRQUEyQixFQUFFLGNBQW1CLEVBQUUsaUJBQXlCLEVBQUUsWUFBaUM7SUFDcEssY0FBYyxDQUFDLGNBQWMsQ0FBQyxHQUFHLGlCQUFpQixDQUFDO0lBQ25ELGNBQWMsQ0FBQyx1QkFBdUIsQ0FBQyxHQUFHLFlBQVksQ0FBQyxZQUFZLENBQUM7SUFDcEUsY0FBYyxDQUFDLG1CQUFtQixDQUFDLEdBQUcsWUFBWSxDQUFDLFFBQVEsQ0FBQztJQUM1RCxFQUFFLENBQUMsQ0FBQyxZQUFZLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztRQUM1QixjQUFjLENBQUMsdUJBQXVCLENBQUMsR0FBRyxZQUFZLENBQUMsWUFBWSxDQUFDLGlCQUFpQixFQUFFLENBQUM7SUFDNUYsQ0FBQztJQUNELEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFDWCxRQUFRLENBQUMsa0JBQWtCLENBQUMsYUFBYSxFQUFFLGNBQWMsQ0FBQyxDQUFDO0lBQy9ELENBQUM7SUFFRCxNQUFNLENBQUMsVUFBVSxFQUFFLENBQUM7SUFDcEIsaUJBQWlCLEdBQUcsRUFBRSxDQUFDO0lBQ3ZCLE1BQU0sQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDOUIsTUFBTSxDQUFDLFVBQVUsRUFBRSxDQUFDO0FBQ3hCLENBQUM7QUFmRCw4REFlQyJ9