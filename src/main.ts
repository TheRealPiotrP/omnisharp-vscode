/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as OmniSharp from './omnisharp/extension';
import * as coreclrdebug from './coreclr-debug/activate';
import * as util from './common';
import * as vscode from 'vscode';

import { ActivationFailure, ActiveTextEditorChanged } from './omnisharp/loggingEvents';
import { WarningMessageObserver } from './observers/WarningMessageObserver';
import { CSharpExtDownloader } from './CSharpExtDownloader';
import { CsharpChannelObserver } from './observers/CsharpChannelObserver';
import { CsharpLoggerObserver } from './observers/CsharpLoggerObserver';
import { DotNetChannelObserver } from './observers/DotnetChannelObserver';
import { DotnetLoggerObserver } from './observers/DotnetLoggerObserver';
import { EventStream } from './EventStream';
import { InformationMessageObserver } from './observers/InformationMessageObserver';
import { OmnisharpChannelObserver } from './observers/OmnisharpChannelObserver';
import { OmnisharpDebugModeLoggerObserver } from './observers/OmnisharpDebugModeLoggerObserver';
import { OmnisharpLoggerObserver } from './observers/OmnisharpLoggerObserver';
import { OmnisharpStatusBarObserver } from './observers/OmnisharpStatusBarObserver';
import { PlatformInformation } from './platform';
import { StatusBarItemAdapter } from './statusBarItemAdapter';
import { TelemetryObserver } from './observers/TelemetryObserver';
import TelemetryReporter from 'vscode-extension-telemetry';
import { addJSONProviders } from './features/json/jsonContributions';
import { ProjectStatusBarObserver } from './observers/ProjectStatusBarObserver';
import CSharpExtensionExports from './CSharpExtensionExports';

export async function activate(context: vscode.ExtensionContext): Promise<CSharpExtensionExports> {

    const extensionId = 'ms-vscode.csharp';
    const extension = vscode.extensions.getExtension<CSharpExtensionExports>(extensionId);
    const extensionVersion = extension.packageJSON.version;
    const aiKey = extension.packageJSON.contributes.debuggers[0].aiKey;
    const reporter = new TelemetryReporter(extensionId, extensionVersion, aiKey);

    util.setExtensionPath(extension.extensionPath);

    const eventStream = new EventStream();

    let dotnetChannel = vscode.window.createOutputChannel('.NET');
    let dotnetChannelObserver = new DotNetChannelObserver(dotnetChannel);
    let dotnetLoggerObserver = new DotnetLoggerObserver(dotnetChannel);
    eventStream.subscribe(dotnetChannelObserver.post);
    eventStream.subscribe(dotnetLoggerObserver.post);

    let csharpChannel = vscode.window.createOutputChannel('C#');
    let csharpchannelObserver = new CsharpChannelObserver(csharpChannel);
    let csharpLogObserver = new CsharpLoggerObserver(csharpChannel);
    eventStream.subscribe(csharpchannelObserver.post);
    eventStream.subscribe(csharpLogObserver.post);

    let omnisharpChannel = vscode.window.createOutputChannel('OmniSharp Log');
    let omnisharpLogObserver = new OmnisharpLoggerObserver(omnisharpChannel);
    let omnisharpChannelObserver = new OmnisharpChannelObserver(omnisharpChannel);
    eventStream.subscribe(omnisharpLogObserver.post);
    eventStream.subscribe(omnisharpChannelObserver.post);

    let warningMessageObserver = new WarningMessageObserver(vscode);
    eventStream.subscribe(warningMessageObserver.post);

    let informationMessageObserver = new InformationMessageObserver(vscode);
    eventStream.subscribe(informationMessageObserver.post);

    let omnisharpStatusBar = new StatusBarItemAdapter(vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, Number.MIN_VALUE));
    let omnisharpStatusBarObserver = new OmnisharpStatusBarObserver(omnisharpStatusBar);
    eventStream.subscribe(omnisharpStatusBarObserver.post);

    let projectStatusBar = new StatusBarItemAdapter(vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left));
    let projectStatusBarObserver = new ProjectStatusBarObserver(projectStatusBar);
    eventStream.subscribe(projectStatusBarObserver.post);

    const debugMode = false;
    if (debugMode) {
        let omnisharpDebugModeLoggerObserver = new OmnisharpDebugModeLoggerObserver(omnisharpChannel);
        eventStream.subscribe(omnisharpDebugModeLoggerObserver.post);
    }

    let platformInfo: PlatformInformation;
    try {
        platformInfo = await PlatformInformation.GetCurrent();
    }
    catch (error) {
        eventStream.post(new ActivationFailure());
    }

    let telemetryObserver = new TelemetryObserver(platformInfo, () => reporter);
    eventStream.subscribe(telemetryObserver.post);

    let runtimeDependenciesExist = await ensureRuntimeDependencies(extension, eventStream, platformInfo);

    // activate language services
    let omniSharpPromise = OmniSharp.activate(context, eventStream, extension.packageJSON, platformInfo);

    // register JSON completion & hover providers for project.json
    context.subscriptions.push(addJSONProviders());
    context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(() => {
        eventStream.post(new ActiveTextEditorChanged());
    }));

    let coreClrDebugPromise = Promise.resolve();
    if (runtimeDependenciesExist) {
        // activate coreclr-debug
        coreClrDebugPromise = coreclrdebug.activate(extension, context, platformInfo, eventStream);
    }

    return {
        initializationFinished: Promise.all([omniSharpPromise.then(async o => o.waitForEmptyEventQueue()), coreClrDebugPromise])
            .then(promiseResult => {
                // This promise resolver simply swallows the result of Promise.all. When we decide we want to expose this level of detail
                // to other extensions then we will design that return type and implement it here.
            })
    };
}

async function ensureRuntimeDependencies(extension: vscode.Extension<CSharpExtensionExports>, eventStream: EventStream, platformInfo: PlatformInformation): Promise<boolean> {
    return util.installFileExists(util.InstallFileType.Lock)
        .then(exists => {
            if (!exists) {
                const downloader = new CSharpExtDownloader(eventStream, extension.packageJSON, platformInfo);
                return downloader.installRuntimeDependencies();
            } else {
                return true;
            }
        });
}

