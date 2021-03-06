/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { PackageError } from "../packages";
import { PlatformInformation } from "../platform";
import { BaseEvent, PackageInstallation, InstallationFailure, InstallationSuccess, OmnisharpDelayTrackerEventMeasures, OmnisharpStart, TestExecutionCountReport, TelemetryEventWithMeasures } from "../omnisharp/loggingEvents";

export interface ITelemetryReporter {
    sendTelemetryEvent(eventName: string, properties?: { [key: string]: string }, measures?: { [key: string]: number }): void;
}

export class TelemetryObserver {
    private reporter: ITelemetryReporter;
    private platformInfo: PlatformInformation;

    constructor(platformInfo: PlatformInformation, reporterCreator: () => ITelemetryReporter) {
        this.platformInfo = platformInfo;
        this.reporter = reporterCreator();
    }

    public post = (event: BaseEvent) => {
        let telemetryProps = this.getTelemetryProps();
        switch (event.constructor.name) {
            case PackageInstallation.name:
                this.reporter.sendTelemetryEvent("AcquisitionStart");
                break;
            case InstallationFailure.name:
                this.handleInstallationFailure(<InstallationFailure>event, telemetryProps);
                break;
            case InstallationSuccess.name:
                this.handleInstallationSuccess(telemetryProps);
                break;
            case OmnisharpDelayTrackerEventMeasures.name:
            case OmnisharpStart.name:
                this.handleTelemetryEventMeasures(<TelemetryEventWithMeasures>event);
                break;
            case TestExecutionCountReport.name:
                this.handleTestExecutionCountReport(<TestExecutionCountReport>event);
                break;
        }
    }

    private handleTelemetryEventMeasures(event: TelemetryEventWithMeasures) {
        this.reporter.sendTelemetryEvent(event.eventName, null, event.measures);
    }

    private handleInstallationSuccess(telemetryProps: any) {
        telemetryProps['installStage'] = 'completeSuccess';
        this.reporter.sendTelemetryEvent('Acquisition', telemetryProps);
    }

    private handleInstallationFailure(event: InstallationFailure, telemetryProps: any) {
        telemetryProps['installStage'] = event.stage;
        if (event.error instanceof PackageError) {
            // we can log the message in a PackageError to telemetry as we do not put PII in PackageError messages
            telemetryProps['error.message'] = event.error.message;

            if (event.error.pkg) {
                telemetryProps['error.packageUrl'] = event.error.pkg.url;
            }
        }

        this.reporter.sendTelemetryEvent('Acquisition', telemetryProps);
    }

    private handleTestExecutionCountReport(event: TestExecutionCountReport) {
        if (event.debugCounts) {
            this.reporter.sendTelemetryEvent('DebugTest', null, event.debugCounts);
        }
        if (event.runCounts) {
            this.reporter.sendTelemetryEvent('RunTest', null, event.runCounts);
        }
    }

    private getTelemetryProps() {
        let telemetryProps = {
            'platform.architecture': this.platformInfo.architecture,
            'platform.platform': this.platformInfo.platform
        };

        if (this.platformInfo.distribution) {
            telemetryProps['platform.distribution'] = this.platformInfo.distribution.toTelemetryString();
        }

        return telemetryProps;
    }
}
