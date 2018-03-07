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
const events_1 = require("events");
const child_process_1 = require("child_process");
const readline_1 = require("readline");
const launcher_1 = require("./launcher");
const options_1 = require("./options");
const logger_1 = require("../logger");
const delayTracker_1 = require("./delayTracker");
const launcher_2 = require("./launcher");
const requestQueue_1 = require("./requestQueue");
const os = require("os");
const path = require("path");
const utils = require("../common");
const vscode = require("vscode");
const timers_1 = require("timers");
const OmnisharpManager_1 = require("./OmnisharpManager");
const platform_1 = require("../platform");
var ServerState;
(function (ServerState) {
    ServerState[ServerState["Starting"] = 0] = "Starting";
    ServerState[ServerState["Started"] = 1] = "Started";
    ServerState[ServerState["Stopped"] = 2] = "Stopped";
})(ServerState || (ServerState = {}));
var Events;
(function (Events) {
    Events.StateChanged = 'stateChanged';
    Events.StdOut = 'stdout';
    Events.StdErr = 'stderr';
    Events.Error = 'Error';
    Events.ServerError = 'ServerError';
    Events.UnresolvedDependencies = 'UnresolvedDependencies';
    Events.PackageRestoreStarted = 'PackageRestoreStarted';
    Events.PackageRestoreFinished = 'PackageRestoreFinished';
    Events.ProjectChanged = 'ProjectChanged';
    Events.ProjectAdded = 'ProjectAdded';
    Events.ProjectRemoved = 'ProjectRemoved';
    Events.MsBuildProjectDiagnostics = 'MsBuildProjectDiagnostics';
    Events.TestMessage = 'TestMessage';
    Events.BeforeServerInstall = 'BeforeServerInstall';
    Events.BeforeServerStart = 'BeforeServerStart';
    Events.ServerStart = 'ServerStart';
    Events.ServerStop = 'ServerStop';
    Events.MultipleLaunchTargets = 'server:MultipleLaunchTargets';
    Events.Started = 'started';
})(Events || (Events = {}));
const TelemetryReportingDelay = 2 * 60 * 1000; // two minutes
const serverUrl = "https://roslynomnisharp.blob.core.windows.net";
const installPath = ".omnisharp/experimental";
const latestVersionFileServerPath = 'releases/versioninfo.txt';
class OmniSharpServer {
    constructor(reporter, csharpLogger, csharpChannel, packageJSON) {
        this._debugMode = false;
        this._disposables = [];
        this._telemetryIntervalId = undefined;
        this._eventBus = new events_1.EventEmitter();
        this._state = ServerState.Stopped;
        this._reporter = reporter;
        this._channel = vscode.window.createOutputChannel('OmniSharp Log');
        this._logger = new logger_1.Logger(message => this._channel.append(message));
        const logger = this._debugMode
            ? this._logger
            : new logger_1.Logger(message => { });
        this._requestQueue = new requestQueue_1.RequestQueueCollection(logger, 8, request => this._makeRequest(request));
        this._csharpLogger = csharpLogger;
        this._csharpChannel = csharpChannel;
        this._packageJSON = packageJSON;
    }
    isRunning() {
        return this._state === ServerState.Started;
    }
    waitForEmptyEventQueue() {
        return __awaiter(this, void 0, void 0, function* () {
            while (!this._requestQueue.isEmpty()) {
                let p = new Promise((resolve) => timers_1.setTimeout(resolve, 100));
                yield p;
            }
        });
    }
    _getState() {
        return this._state;
    }
    _setState(value) {
        if (typeof value !== 'undefined' && value !== this._state) {
            this._state = value;
            this._fireEvent(Events.StateChanged, this._state);
        }
    }
    _recordRequestDelay(requestName, elapsedTime) {
        let tracker = this._delayTrackers[requestName];
        if (!tracker) {
            tracker = new delayTracker_1.DelayTracker(requestName);
            this._delayTrackers[requestName] = tracker;
        }
        tracker.reportDelay(elapsedTime);
    }
    _reportTelemetry() {
        const delayTrackers = this._delayTrackers;
        for (const requestName in delayTrackers) {
            const tracker = delayTrackers[requestName];
            const eventName = 'omnisharp' + requestName;
            if (tracker.hasMeasures()) {
                const measures = tracker.getMeasures();
                tracker.clearMeasures();
                this._reporter.sendTelemetryEvent(eventName, null, measures);
            }
        }
    }
    getSolutionPathOrFolder() {
        return this._launchTarget
            ? this._launchTarget.target
            : undefined;
    }
    getChannel() {
        return this._channel;
    }
    // --- eventing
    onStdout(listener, thisArg) {
        return this._addListener(Events.StdOut, listener, thisArg);
    }
    onStderr(listener, thisArg) {
        return this._addListener(Events.StdErr, listener, thisArg);
    }
    onError(listener, thisArg) {
        return this._addListener(Events.Error, listener, thisArg);
    }
    onServerError(listener, thisArg) {
        return this._addListener(Events.ServerError, listener, thisArg);
    }
    onUnresolvedDependencies(listener, thisArg) {
        return this._addListener(Events.UnresolvedDependencies, listener, thisArg);
    }
    onBeforePackageRestore(listener, thisArg) {
        return this._addListener(Events.PackageRestoreStarted, listener, thisArg);
    }
    onPackageRestore(listener, thisArg) {
        return this._addListener(Events.PackageRestoreFinished, listener, thisArg);
    }
    onProjectChange(listener, thisArg) {
        return this._addListener(Events.ProjectChanged, listener, thisArg);
    }
    onProjectAdded(listener, thisArg) {
        return this._addListener(Events.ProjectAdded, listener, thisArg);
    }
    onProjectRemoved(listener, thisArg) {
        return this._addListener(Events.ProjectRemoved, listener, thisArg);
    }
    onMsBuildProjectDiagnostics(listener, thisArg) {
        return this._addListener(Events.MsBuildProjectDiagnostics, listener, thisArg);
    }
    onTestMessage(listener, thisArg) {
        return this._addListener(Events.TestMessage, listener, thisArg);
    }
    onBeforeServerInstall(listener) {
        return this._addListener(Events.BeforeServerInstall, listener);
    }
    onBeforeServerStart(listener) {
        return this._addListener(Events.BeforeServerStart, listener);
    }
    onServerStart(listener) {
        return this._addListener(Events.ServerStart, listener);
    }
    onServerStop(listener) {
        return this._addListener(Events.ServerStop, listener);
    }
    onMultipleLaunchTargets(listener, thisArg) {
        return this._addListener(Events.MultipleLaunchTargets, listener, thisArg);
    }
    onOmnisharpStart(listener) {
        return this._addListener(Events.Started, listener);
    }
    _addListener(event, listener, thisArg) {
        listener = thisArg ? listener.bind(thisArg) : listener;
        this._eventBus.addListener(event, listener);
        return new vscode.Disposable(() => this._eventBus.removeListener(event, listener));
    }
    _fireEvent(event, args) {
        this._eventBus.emit(event, args);
    }
    // --- start, stop, and connect
    _start(launchTarget) {
        return __awaiter(this, void 0, void 0, function* () {
            this._setState(ServerState.Starting);
            this._launchTarget = launchTarget;
            const solutionPath = launchTarget.target;
            const cwd = path.dirname(solutionPath);
            this._options = options_1.Options.Read();
            let args = [
                '-s', solutionPath,
                '--hostPID', process.pid.toString(),
                '--stdio',
                'DotNet:enablePackageRestore=false',
                '--encoding', 'utf-8',
                '--loglevel', this._options.loggingLevel
            ];
            if (this._options.waitForDebugger === true) {
                args.push('--debug');
            }
            let launchPath;
            if (this._options.path) {
                try {
                    let extensionPath = utils.getExtensionPath();
                    let manager = new OmnisharpManager_1.OmnisharpManager(this._csharpChannel, this._csharpLogger, this._packageJSON, this._reporter);
                    let platformInfo = yield platform_1.PlatformInformation.GetCurrent();
                    launchPath = yield manager.GetOmnisharpPath(this._options.path, this._options.useMono, serverUrl, latestVersionFileServerPath, installPath, extensionPath, platformInfo);
                }
                catch (error) {
                    this._logger.appendLine('Error occured in loading omnisharp from omnisharp.path');
                    this._logger.appendLine(`Could not start the server due to ${error.toString()}`);
                    this._logger.appendLine();
                    return;
                }
            }
            this._logger.appendLine(`Starting OmniSharp server at ${new Date().toLocaleString()}`);
            this._logger.increaseIndent();
            this._logger.appendLine(`Target: ${solutionPath}`);
            this._logger.decreaseIndent();
            this._logger.appendLine();
            this._fireEvent(Events.BeforeServerStart, solutionPath);
            return launcher_1.launchOmniSharp(cwd, args, launchPath).then(value => {
                if (value.usingMono) {
                    this._logger.appendLine(`OmniSharp server started with Mono`);
                }
                else {
                    this._logger.appendLine(`OmniSharp server started`);
                }
                this._logger.increaseIndent();
                this._logger.appendLine(`Path: ${value.command}`);
                this._logger.appendLine(`PID: ${value.process.pid}`);
                this._logger.decreaseIndent();
                this._logger.appendLine();
                this._serverProcess = value.process;
                this._delayTrackers = {};
                this._setState(ServerState.Started);
                this._fireEvent(Events.ServerStart, solutionPath);
                return this._doConnect();
            }).then(() => {
                // Start telemetry reporting
                this._telemetryIntervalId = setInterval(() => this._reportTelemetry(), TelemetryReportingDelay);
            }).then(() => {
                this._requestQueue.drain();
            }).catch(err => {
                this._fireEvent(Events.ServerError, err);
                return this.stop();
            });
        });
    }
    stop() {
        while (this._disposables.length) {
            this._disposables.pop().dispose();
        }
        let cleanupPromise;
        if (this._telemetryIntervalId !== undefined) {
            // Stop reporting telemetry
            clearInterval(this._telemetryIntervalId);
            this._telemetryIntervalId = undefined;
            this._reportTelemetry();
        }
        if (!this._serverProcess) {
            // nothing to kill
            cleanupPromise = Promise.resolve();
        }
        else if (process.platform === 'win32') {
            // when killing a process in windows its child
            // processes are *not* killed but become root
            // processes. Therefore we use TASKKILL.EXE
            cleanupPromise = new Promise((resolve, reject) => {
                const killer = child_process_1.exec(`taskkill /F /T /PID ${this._serverProcess.pid}`, (err, stdout, stderr) => {
                    if (err) {
                        return reject(err);
                    }
                });
                killer.on('exit', resolve);
                killer.on('error', reject);
            });
        }
        else {
            // Kill Unix process and children
            cleanupPromise = utils.getUnixChildProcessIds(this._serverProcess.pid)
                .then(children => {
                for (let child of children) {
                    process.kill(child, 'SIGTERM');
                }
                this._serverProcess.kill('SIGTERM');
            });
        }
        return cleanupPromise.then(() => {
            this._serverProcess = null;
            this._setState(ServerState.Stopped);
            this._fireEvent(Events.ServerStop, this);
        });
    }
    restart(launchTarget = this._launchTarget) {
        return __awaiter(this, void 0, void 0, function* () {
            if (launchTarget) {
                yield this.stop();
                yield this._start(launchTarget);
            }
        });
    }
    autoStart(preferredPath) {
        return launcher_2.findLaunchTargets().then(launchTargets => {
            // If there aren't any potential launch targets, we create file watcher and try to
            // start the server again once a *.sln, *.csproj, project.json, CSX or Cake file is created.
            if (launchTargets.length === 0) {
                return new Promise((resolve, reject) => {
                    // 1st watch for files
                    let watcher = vscode.workspace.createFileSystemWatcher('{**/*.sln,**/*.csproj,**/project.json,**/*.csx,**/*.cake}', 
                    /*ignoreCreateEvents*/ false, 
                    /*ignoreChangeEvents*/ true, 
                    /*ignoreDeleteEvents*/ true);
                    watcher.onDidCreate(uri => {
                        watcher.dispose();
                        resolve();
                    });
                }).then(() => {
                    // 2nd try again
                    return this.autoStart(preferredPath);
                });
            }
            // If there's more than one launch target, we start the server if one of the targets
            // matches the preferred path. Otherwise, we fire the "MultipleLaunchTargets" event,
            // which is handled in status.ts to display the launch target selector.
            if (launchTargets.length > 1 && preferredPath) {
                for (let launchTarget of launchTargets) {
                    if (launchTarget.target === preferredPath) {
                        // start preferred path
                        return this.restart(launchTarget);
                    }
                }
                this._fireEvent(Events.MultipleLaunchTargets, launchTargets);
                return Promise.reject(undefined);
            }
            // If there's only one target, just start
            return this.restart(launchTargets[0]);
        });
    }
    // --- requests et al
    makeRequest(command, data, token) {
        if (this._getState() !== ServerState.Started) {
            return Promise.reject('server has been stopped or not started');
        }
        let startTime;
        let request;
        let promise = new Promise((resolve, reject) => {
            startTime = Date.now();
            request = {
                command,
                data,
                onSuccess: value => resolve(value),
                onError: err => reject(err)
            };
            this._requestQueue.enqueue(request);
        });
        if (token) {
            token.onCancellationRequested(() => {
                this._requestQueue.cancelRequest(request);
            });
        }
        return promise.then(response => {
            let endTime = Date.now();
            let elapsedTime = endTime - startTime;
            this._recordRequestDelay(command, elapsedTime);
            return response;
        });
    }
    _doConnect() {
        this._serverProcess.stderr.on('data', (data) => {
            this._fireEvent('stderr', String(data));
        });
        this._readLine = readline_1.createInterface({
            input: this._serverProcess.stdout,
            output: this._serverProcess.stdin,
            terminal: false
        });
        const promise = new Promise((resolve, reject) => {
            let listener;
            // Convert the timeout from the seconds to milliseconds, which is required by setTimeout().
            const timeoutDuration = this._options.projectLoadTimeout * 1000;
            // timeout logic
            const handle = timers_1.setTimeout(() => {
                if (listener) {
                    listener.dispose();
                }
                reject(new Error("OmniSharp server load timed out. Use the 'omnisharp.projectLoadTimeout' setting to override the default delay (one minute)."));
            }, timeoutDuration);
            // handle started-event
            listener = this.onOmnisharpStart(() => {
                if (listener) {
                    listener.dispose();
                }
                clearTimeout(handle);
                resolve();
            });
        });
        const lineReceived = this._onLineReceived.bind(this);
        this._readLine.addListener('line', lineReceived);
        this._disposables.push(new vscode.Disposable(() => {
            this._readLine.removeListener('line', lineReceived);
        }));
        return promise;
    }
    _onLineReceived(line) {
        line = line.trim();
        if (line[0] !== '{') {
            this._logger.appendLine(line);
            return;
        }
        let packet;
        try {
            packet = JSON.parse(line);
        }
        catch (err) {
            // This isn't JSON
            return;
        }
        if (!packet.Type) {
            // Bogus packet
            return;
        }
        switch (packet.Type) {
            case 'response':
                this._handleResponsePacket(packet);
                break;
            case 'event':
                this._handleEventPacket(packet);
                break;
            default:
                console.warn(`Unknown packet type: ${packet.Type}`);
                break;
        }
    }
    _handleResponsePacket(packet) {
        const request = this._requestQueue.dequeue(packet.Command, packet.Request_seq);
        if (!request) {
            this._logger.appendLine(`Received response for ${packet.Command} but could not find request.`);
            return;
        }
        if (this._debugMode) {
            this._logger.appendLine(`handleResponse: ${packet.Command} (${packet.Request_seq})`);
        }
        if (packet.Success) {
            request.onSuccess(packet.Body);
        }
        else {
            request.onError(packet.Message || packet.Body);
        }
        this._requestQueue.drain();
    }
    _handleEventPacket(packet) {
        if (packet.Event === 'log') {
            const entry = packet.Body;
            this._logOutput(entry.LogLevel, entry.Name, entry.Message);
        }
        else {
            // fwd all other events
            this._fireEvent(packet.Event, packet.Body);
        }
    }
    _makeRequest(request) {
        const id = OmniSharpServer._nextId++;
        const requestPacket = {
            Type: 'request',
            Seq: id,
            Command: request.command,
            Arguments: request.data
        };
        if (this._debugMode) {
            this._logger.append(`makeRequest: ${request.command} (${id})`);
            if (request.data) {
                this._logger.append(`, data=${JSON.stringify(request.data)}`);
            }
            this._logger.appendLine();
        }
        this._serverProcess.stdin.write(JSON.stringify(requestPacket) + '\n');
        return id;
    }
    static getLogLevelPrefix(logLevel) {
        switch (logLevel) {
            case "TRACE": return "trce";
            case "DEBUG": return "dbug";
            case "INFORMATION": return "info";
            case "WARNING": return "warn";
            case "ERROR": return "fail";
            case "CRITICAL": return "crit";
            default: throw new Error(`Unknown log level value: ${logLevel}`);
        }
    }
    _isFilterableOutput(logLevel, name, message) {
        // filter messages like: /codecheck: 200 339ms
        const timing200Pattern = /^\/[\/\w]+: 200 \d+ms/;
        return logLevel === "INFORMATION"
            && name === "OmniSharp.Middleware.LoggingMiddleware"
            && timing200Pattern.test(message);
    }
    _logOutput(logLevel, name, message) {
        if (this._debugMode || !this._isFilterableOutput(logLevel, name, message)) {
            let output = `[${OmniSharpServer.getLogLevelPrefix(logLevel)}]: ${name}${os.EOL}${message}`;
            const newLinePlusPadding = os.EOL + "        ";
            output = output.replace(os.EOL, newLinePlusPadding);
            this._logger.appendLine(output);
        }
    }
}
OmniSharpServer._nextId = 1;
exports.OmniSharpServer = OmniSharpServer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL29tbmlzaGFycC9zZXJ2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7O0FBRWhHLG1DQUFzQztBQUN0QyxpREFBbUQ7QUFDbkQsdUNBQXFEO0FBQ3JELHlDQUE2QztBQUM3Qyx1Q0FBb0M7QUFDcEMsc0NBQW1DO0FBQ25DLGlEQUE4QztBQUM5Qyx5Q0FBNkQ7QUFDN0QsaURBQWlFO0FBRWpFLHlCQUF5QjtBQUN6Qiw2QkFBNkI7QUFFN0IsbUNBQW1DO0FBQ25DLGlDQUFpQztBQUNqQyxtQ0FBb0M7QUFDcEMseURBQXNEO0FBQ3RELDBDQUFrRDtBQUVsRCxJQUFLLFdBSUo7QUFKRCxXQUFLLFdBQVc7SUFDWixxREFBUSxDQUFBO0lBQ1IsbURBQU8sQ0FBQTtJQUNQLG1EQUFPLENBQUE7QUFDWCxDQUFDLEVBSkksV0FBVyxLQUFYLFdBQVcsUUFJZjtBQUVELElBQU8sTUFBTSxDQTZCWjtBQTdCRCxXQUFPLE1BQU07SUFDSSxtQkFBWSxHQUFHLGNBQWMsQ0FBQztJQUU5QixhQUFNLEdBQUcsUUFBUSxDQUFDO0lBQ2xCLGFBQU0sR0FBRyxRQUFRLENBQUM7SUFFbEIsWUFBSyxHQUFHLE9BQU8sQ0FBQztJQUNoQixrQkFBVyxHQUFHLGFBQWEsQ0FBQztJQUU1Qiw2QkFBc0IsR0FBRyx3QkFBd0IsQ0FBQztJQUNsRCw0QkFBcUIsR0FBRyx1QkFBdUIsQ0FBQztJQUNoRCw2QkFBc0IsR0FBRyx3QkFBd0IsQ0FBQztJQUVsRCxxQkFBYyxHQUFHLGdCQUFnQixDQUFDO0lBQ2xDLG1CQUFZLEdBQUcsY0FBYyxDQUFDO0lBQzlCLHFCQUFjLEdBQUcsZ0JBQWdCLENBQUM7SUFFbEMsZ0NBQXlCLEdBQUcsMkJBQTJCLENBQUM7SUFFeEQsa0JBQVcsR0FBRyxhQUFhLENBQUM7SUFFNUIsMEJBQW1CLEdBQUcscUJBQXFCLENBQUM7SUFDNUMs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