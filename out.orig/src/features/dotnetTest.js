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
const debuggerEventsProtocol_1 = require("../coreclr-debug/debuggerEventsProtocol");
const vscode = require("vscode");
const serverUtils = require("../omnisharp/utils");
const protocol = require("../omnisharp/protocol");
const utils = require("../common");
const net = require("net");
const os = require("os");
const path = require("path");
const abstractProvider_1 = require("./abstractProvider");
const TelemetryReportingDelay = 2 * 60 * 1000; // two minutes
class TestManager extends abstractProvider_1.default {
    constructor(server, reporter) {
        super(server, reporter);
        this._telemetryIntervalId = undefined;
        // register commands
        let d1 = vscode.commands.registerCommand('dotnet.test.run', (testMethod, fileName, testFrameworkName) => this._runDotnetTest(testMethod, fileName, testFrameworkName));
        let d2 = vscode.commands.registerCommand('dotnet.test.debug', (testMethod, fileName, testFrameworkName) => this._debugDotnetTest(testMethod, fileName, testFrameworkName));
        let d4 = vscode.commands.registerCommand('dotnet.classTests.run', (methodsInClass, fileName, testFrameworkName) => this._runDotnetTestsInClass(methodsInClass, fileName, testFrameworkName));
        let d5 = vscode.commands.registerCommand('dotnet.classTests.debug', (methodsInClass, fileName, testFrameworkName) => this._debugDotnetTestsInClass(methodsInClass, fileName, testFrameworkName));
        this._telemetryIntervalId = setInterval(() => this._reportTelemetry(), TelemetryReportingDelay);
        let d3 = new vscode.Disposable(() => {
            if (this._telemetryIntervalId !== undefined) {
                // Stop reporting telemetry
                clearInterval(this._telemetryIntervalId);
                this._telemetryIntervalId = undefined;
                this._reportTelemetry();
            }
        });
        this.addDisposables(d1, d2, d3, d4, d5);
    }
    _getOutputChannel() {
        if (this._channel === undefined) {
            this._channel = vscode.window.createOutputChannel(".NET Test Log");
            this.addDisposables(this._channel);
        }
        return this._channel;
    }
    _recordRunRequest(testFrameworkName) {
        if (this._runCounts === undefined) {
            this._runCounts = {};
        }
        let count = this._runCounts[testFrameworkName];
        if (!count) {
            count = 1;
        }
        else {
            count += 1;
        }
        this._runCounts[testFrameworkName] = count;
    }
    _recordDebugRequest(testFrameworkName) {
        if (this._debugCounts === undefined) {
            this._debugCounts = {};
        }
        let count = this._debugCounts[testFrameworkName];
        if (!count) {
            count = 1;
        }
        else {
            count += 1;
        }
        this._debugCounts[testFrameworkName] = count;
    }
    _reportTelemetry() {
        if (this._runCounts) {
            this._reporter.sendTelemetryEvent('RunTest', null, this._runCounts);
        }
        if (this._debugCounts) {
            this._reporter.sendTelemetryEvent('DebugTest', null, this._debugCounts);
        }
        this._runCounts = undefined;
        this._debugCounts = undefined;
    }
    _saveDirtyFiles() {
        return Promise.resolve(vscode.workspace.saveAll(/*includeUntitled*/ false));
    }
    _runTest(fileName, testMethod, testFrameworkName, targetFrameworkVersion) {
        const request = {
            FileName: fileName,
            MethodName: testMethod,
            TestFrameworkName: testFrameworkName,
            TargetFrameworkVersion: targetFrameworkVersion
        };
        return serverUtils.runTest(this._server, request)
            .then(response => response.Results);
    }
    _reportResults(results) {
        const totalTests = results.length;
        const output = this._getOutputChannel();
        let totalPassed = 0, totalFailed = 0, totalSkipped = 0;
        for (let result of results) {
            output.appendLine(`${result.MethodName}: ${result.Outcome}`);
            switch (result.Outcome) {
                case protocol.V2.TestOutcomes.Failed:
                    totalFailed += 1;
                    break;
                case protocol.V2.TestOutcomes.Passed:
                    totalPassed += 1;
                    break;
                case protocol.V2.TestOutcomes.Skipped:
                    totalSkipped += 1;
                    break;
            }
        }
        output.appendLine('');
        output.appendLine(`Total tests: ${totalTests}. Passed: ${totalPassed}. Failed: ${totalFailed}. Skipped: ${totalSkipped}`);
        output.appendLine('');
        return Promise.resolve();
    }
    _recordRunAndGetFrameworkVersion(fileName, testFrameworkName) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._saveDirtyFiles();
            this._recordRunRequest(testFrameworkName);
            let projectInfo = yield serverUtils.requestProjectInformation(this._server, { FileName: fileName });
            let targetFrameworkVersion;
            if (projectInfo.DotNetProject) {
                targetFrameworkVersion = undefined;
            }
            else if (projectInfo.MsBuildProject) {
                targetFrameworkVersion = projectInfo.MsBuildProject.TargetFramework;
            }
            else {
                throw new Error('Expected project.json or .csproj project.');
            }
            return targetFrameworkVersion;
        });
    }
    _runDotnetTest(testMethod, fileName, testFrameworkName) {
        return __awaiter(this, void 0, void 0, function* () {
            const output = this._getOutputChannel();
            output.show();
            output.appendLine(`Running test ${testMethod}...`);
            output.appendLine('');
            const listener = this._server.onTestMessage(e => {
                output.appendLine(e.Message);
            });
            let targetFrameworkVersion = yield this._recordRunAndGetFrameworkVersion(fileName, testFrameworkName);
            return this._runTest(fileName, testMethod, testFrameworkName, targetFrameworkVersion)
                .then(results => this._reportResults(results))
                .then(() => listener.dispose())
                .catch(reason => {
                listener.dispose();
                vscode.window.showErrorMessage(`Failed to run test because ${reason}.`);
            });
        });
    }
    _runDotnetTestsInClass(methodsInClass, fileName, testFrameworkName) {
        return __awaiter(this, void 0, void 0, function* () {
            const output = this._getOutputChannel();
            output.show();
            const listener = this._server.onTestMessage(e => {
                output.appendLine(e.Message);
            });
            let targetFrameworkVersion = yield this._recordRunAndGetFrameworkVersion(fileName, testFrameworkName);
            return this._runTestsInClass(fileName, testFrameworkName, targetFrameworkVersion, methodsInClass)
                .then(results => this._reportResults(results))
                .then(() => listener.dispose())
                .catch(reason => {
                listener.dispose();
                vscode.window.showErrorMessage(`Failed to run tests because ${reason}.`);
            });
        });
    }
    _runTestsInClass(fileName, testFrameworkName, targetFrameworkVersion, methodsToRun) {
        const request = {
            FileName: fileName,
            TestFrameworkName: testFrameworkName,
            TargetFrameworkVersion: targetFrameworkVersion,
            MethodNames: methodsToRun
        };
        return serverUtils.runTestsInClass(this._server, request)
            .then(response => response.Results);
    }
    _createLaunchConfiguration(program, args, cwd, debuggerEventsPipeName) {
        let debugOptions = vscode.workspace.getConfiguration('csharp').get('unitTestDebuggingOptions');
        // Get the initial set of options from the workspace setting
        let result;
        if (typeof debugOptions === "object") {
            // clone the options object to avoid changing it
            result = JSON.parse(JSON.stringify(debugOptions));
        }
        else {
            result = {};
        }
        if (!result.type) {
            result.type = "coreclr";
        }
        // Now fill in the rest of the options
        result.name = ".NET Test Launch";
        result.request = "launch";
        result.debuggerEventsPipeName = debuggerEventsPipeName;
        result.program = program;
        result.args = args;
        result.cwd = cwd;
        return result;
    }
    _getLaunchConfigurationForVSTest(fileName, testMethod, testFrameworkName, targetFrameworkVersion, debugEventListener) {
        const output = this._getOutputChannel();
        // Listen for test messages while getting start info.
        const listener = this._server.onTestMessage(e => {
            output.appendLine(e.Message);
        });
        const request = {
            FileName: fileName,
            MethodName: testMethod,
            TestFrameworkName: testFrameworkName,
            TargetFrameworkVersion: targetFrameworkVersion
        };
        return serverUtils.debugTestGetStartInfo(this._server, request)
            .then(response => {
            listener.dispose();
            return this._createLaunchConfiguration(response.FileName, response.Arguments, response.WorkingDirectory, debugEventListener.pipePath());
        });
    }
    _getLaunchConfigurationForLegacy(fileName, testMethod, testFrameworkName, targetFrameworkVersion) {
        const output = this._getOutputChannel();
        // Listen for test messages while getting start info.
        const listener = this._server.onTestMessage(e => {
            output.appendLine(e.Message);
        });
        const request = {
            FileName: fileName,
            MethodName: testMethod,
            TestFrameworkName: testFrameworkName,
            TargetFrameworkVersion: targetFrameworkVersion
        };
        return serverUtils.getTestStartInfo(this._server, request)
            .then(response => {
            listener.dispose();
            return this._createLaunchConfiguration(response.Executable, response.Argument, response.WorkingDirectory, null);
        });
    }
    _getLaunchConfiguration(debugType, fileName, testMethod, testFrameworkName, targetFrameworkVersion, debugEventListener) {
        switch (debugType) {
            case 'legacy':
                return this._getLaunchConfigurationForLegacy(fileName, testMethod, testFrameworkName, targetFrameworkVersion);
            case 'vstest':
                return this._getLaunchConfigurationForVSTest(fileName, testMethod, testFrameworkName, targetFrameworkVersion, debugEventListener);
            default:
                throw new Error(`Unexpected debug type: ${debugType}`);
        }
    }
    _recordDebugAndGetDebugValues(fileName, testFrameworkName, output) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._saveDirtyFiles();
            this._recordDebugRequest(testFrameworkName);
            let projectInfo = yield serverUtils.requestProjectInformation(this._server, { FileName: fileName });
            let debugType;
            let debugEventListener = null;
            let targetFrameworkVersion;
            if (projectInfo.DotNetProject) {
                debugType = 'legacy';
                targetFrameworkVersion = '';
            }
            else if (projectInfo.MsBuildProject) {
                debugType = 'vstest';
                targetFrameworkVersion = projectInfo.MsBuildProject.TargetFramework;
                debugEventListener = new DebugEventListener(fileName, this._server, output);
                debugEventListener.start();
            }
            else {
                throw new Error('Expected project.json or .csproj project.');
            }
            return { debugType, debugEventListener, targetFrameworkVersion };
        });
    }
    _debugDotnetTest(testMethod, fileName, testFrameworkName) {
        return __awaiter(this, void 0, void 0, function* () {
            // We support to styles of 'dotnet test' for debugging: The legacy 'project.json' testing, and the newer csproj support
            // using VS Test. These require a different level of communication.
            const output = this._getOutputChannel();
            output.show();
            output.appendLine(`Debugging method '${testMethod}'...`);
            output.appendLine('');
            let { debugType, debugEventListener, targetFrameworkVersion } = yield this._recordDebugAndGetDebugValues(fileName, testFrameworkName, output);
            return this._getLaunchConfiguration(debugType, fileName, testMethod, testFrameworkName, targetFrameworkVersion, debugEventListener)
                .then(config => {
                const workspaceFolder = vscode.workspace.getWorkspaceFolder(vscode.Uri.file(fileName));
                return vscode.debug.startDebugging(workspaceFolder, config);
            })
                .catch(reason => {
                vscode.window.showErrorMessage(`Failed to start debugger: ${reason}`);
                if (debugEventListener != null) {
                    debugEventListener.close();
                }
            });
        });
    }
    _debugDotnetTestsInClass(methodsToRun, fileName, testFrameworkName) {
        return __awaiter(this, void 0, void 0, function* () {
            const output = this._getOutputChannel();
            let { debugType, debugEventListener, targetFrameworkVersion } = yield this._recordDebugAndGetDebugValues(fileName, testFrameworkName, output);
            return yield this._getLaunchConfigurationForClass(debugType, fileName, methodsToRun, testFrameworkName, targetFrameworkVersion, debugEventListener)
                .then(config => {
                const workspaceFolder = vscode.workspace.getWorkspaceFolder(vscode.Uri.file(fileName));
                return vscode.debug.startDebugging(workspaceFolder, config);
            })
                .catch(reason => {
                vscode.window.showErrorMessage(`Failed to start debugger: ${reason}`);
                if (debugEventListener != null) {
                    debugEventListener.close();
                }
            });
        });
    }
    _getLaunchConfigurationForClass(debugType, fileName, methodsToRun, testFrameworkName, targetFrameworkVersion, debugEventListener) {
        if (debugType == 'vstest') {
            return this._getLaunchConfigurationForVSTestClass(fileName, methodsToRun, testFrameworkName, targetFrameworkVersion, debugEventListener);
        }
        throw new Error(`Unexpected debug type: ${debugType}`);
    }
    _getLaunchConfigurationForVSTestClass(fileName, methodsToRun, testFrameworkName, targetFrameworkVersion, debugEventListener) {
        const output = this._getOutputChannel();
        const listener = this._server.onTestMessage(e => {
            output.appendLine(e.Message);
        });
        const request = {
            FileName: fileName,
            MethodNames: methodsToRun,
            TestFrameworkName: testFrameworkName,
            TargetFrameworkVersion: targetFrameworkVersion
        };
        return serverUtils.debugTestClassGetStartInfo(this._server, request)
            .then(response => {
            listener.dispose();
            return this._createLaunchConfiguration(response.FileName, response.Arguments, response.WorkingDirectory, debugEventListener.pipePath());
        });
    }
}
exports.default = TestManager;
class DebugEventListener {
    constructor(fileName, server, outputChannel) {
        this._isClosed = false;
        this._fileName = fileName;
        this._server = server;
        this._outputChannel = outputChannel;
        // NOTE: The max pipe name on OSX is fairly small, so this name shouldn't bee too long.
        const pipeSuffix = "TestDebugEvents-" + process.pid;
        if (os.platform() === 'win32') {
            this._pipePath = "\\\\.\\pipe\\Microsoft.VSCode.CSharpExt." + pipeSuffix;
        }
        else {
            this._pipePath = path.join(utils.getExtensionPath(), "." + pipeSuffix);
        }
    }
    start() {
        // We use our process id as part of the pipe name, so if we still somehow have an old instance running, close it.
        if (DebugEventListener.s_activeInstance !== null) {
            DebugEventListener.s_activeInstance.close();
        }
        DebugEventListener.s_activeInstance = this;
        this._serverSocket = net.createServer((socket) => {
            socket.on('data', (buffer) => {
                let event;
                try {
                    event = debuggerEventsProtocol_1.DebuggerEventsProtocol.decodePacket(buffer);
                }
                catch (e) {
                    this._outputChannel.appendLine("Warning: Invalid event received from debugger");
                    return;
                }
                switch (event.eventType) {
                    case debuggerEventsProtocol_1.DebuggerEventsProtocol.EventType.ProcessLaunched:
                        let processLaunchedEvent = (event);
                        this._outputChannel.appendLine(`Started debugging process #${processLaunchedEvent.targetProcessId}.`);
                        this.onProcessLaunched(processLaunchedEvent.targetProcessId);
                        break;
                    case debuggerEventsProtocol_1.DebuggerEventsProtocol.EventType.DebuggingStopped:
                        this._outputChannel.appendLine("Debugging complete.\n");
                        this.onDebuggingStopped();
                        break;
                }
            });
            socket.on('end', () => {
                this.onDebuggingStopped();
            });
        });
        return this.removeSocketFileIfExists().then(() => {
            return new Promise((resolve, reject) => {
                let isStarted = false;
                this._serverSocket.on('error', (err) => {
                    if (!isStarted) {
                        reject(err.message);
                    }
                    else {
                        this._outputChannel.appendLine("Warning: Communications error on debugger event channel. " + err.message);
                    }
                });
                this._serverSocket.listen(this._pipePath, () => {
                    isStarted = true;
                    resolve();
                });
            });
        });
    }
    pipePath() {
        return this._pipePath;
    }
    close() {
        if (this === DebugEventListener.s_activeInstance) {
            DebugEventListener.s_activeInstance = null;
        }
        if (this._isClosed) {
            return;
        }
        this._isClosed = true;
        if (this._serverSocket !== null) {
            this._serverSocket.close();
        }
    }
    onProcessLaunched(targetProcessId) {
        let request = {
            FileName: this._fileName,
            TargetProcessId: targetProcessId
        };
        const disposable = this._server.onTestMessage(e => {
            this._outputChannel.appendLine(e.Message);
        });
        serverUtils.debugTestLaunch(this._server, request)
            .then(_ => {
            disposable.dispose();
        });
    }
    onDebuggingStopped() {
        if (this._isClosed) {
            return;
        }
        let request = {
            FileName: this._fileName
        };
        serverUtils.debugTestStop(this._server, request);
        this.close();
    }
    removeSocketFileIfExists() {
        if (os.platform() === 'win32') {
            // Win32 doesn't use the file system for pipe names
            return Promise.resolve();
        }
        else {
            return utils.deleteIfExists(this._pipePath);
        }
    }
}
DebugEventListener.s_activeInstance = null;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG90bmV0VGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9mZWF0dXJlcy9kb3RuZXRUZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O2dHQUdnRzs7Ozs7Ozs7OztBQUdoRyxvRkFBaUY7QUFDakYsaUNBQWlDO0FBQ2pDLGtEQUFrRDtBQUNsRCxrREFBa0Q7QUFDbEQsbUNBQW1DO0FBQ25DLDJCQUEyQjtBQUMzQix5QkFBeUI7QUFDekIsNkJBQTZCO0FBRTdCLHlEQUFrRDtBQUVsRCxNQUFNLHVCQUF1QixHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUMsY0FBYztBQUU3RCxpQkFBaUMsU0FBUSwwQkFBZ0I7SUFPckQsWUFBWSxNQUF1QixFQUFFLFFBQTJCO1FBQzVELEtBQUssQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFIcEIseUJBQW9CLEdBQWlCLFNBQVMsQ0FBQztRQUtuRCxvQkFBb0I7UUFDcEIsSUFBSSxFQUFFLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQ3BDLGlCQUFpQixFQUNqQixDQUFDLFVBQVUsRUFBRSxRQUFRLEVBQUUsaUJBQWlCLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsVUFBVSxFQUFFLFFBQVEsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDLENBQUM7UUFFL0csSUFBSSxFQUFFLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQ3BDLG1CQUFtQixFQUNuQixDQUFDLFVBQVUsRUFBRSxRQUFRLEVBQUUsaUJBQWlCLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLEVBQUUsUUFBUSxFQUFFLGlCQUFpQixDQUFDLENBQUMsQ0FBQztRQUVqSCxJQUFJLEVBQUUsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FDcEMsdUJBQXVCLEVBQ3ZCLENBQUMsY0FBYyxFQUFFLFFBQVEs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