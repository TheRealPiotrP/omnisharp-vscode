/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const os = require("os");
const path = require("path");
const vscode = require("vscode");
const common = require("./../common");
const util_1 = require("./util");
const logger_1 = require("./../logger");
const platform_1 = require("./../platform");
let _debugUtil = null;
let _logger = null;
function activate(thisExtension, context, reporter, logger, channel) {
    return __awaiter(this, void 0, void 0, function* () {
        _debugUtil = new util_1.CoreClrDebugUtil(context.extensionPath, logger);
        _logger = logger;
        if (!util_1.CoreClrDebugUtil.existsSync(_debugUtil.debugAdapterDir())) {
            let platformInformation;
            try {
                platformInformation = yield platform_1.PlatformInformation.GetCurrent();
            }
            catch (err) {
                // Somehow we couldn't figure out the platform we are on
                logger.appendLine("[ERROR]: C# Extension failed to install the debugger package");
                showInstallErrorMessage(channel);
            }
            if (platformInformation) {
                if (platformInformation.architecture !== "x86_64") {
                    if (platformInformation.isWindows() && platformInformation.architecture === "x86") {
                        logger.appendLine(`[WARNING]: x86 Windows is not currently supported by the .NET Core debugger. Debugging will not be available.`);
                    }
                    else {
                        logger.appendLine(`[WARNING]: Processor architecture '${platformInformation.architecture}' is not currently supported by the .NET Core debugger. Debugging will not be available.`);
                    }
                }
                else {
                    logger.appendLine("[ERROR]: C# Extension failed to install the debugger package");
                    showInstallErrorMessage(channel);
                }
            }
        }
        else if (!util_1.CoreClrDebugUtil.existsSync(_debugUtil.installCompleteFilePath())) {
            completeDebuggerInstall(logger, channel);
        }
    });
}
exports.activate = activate;
function completeDebuggerInstall(logger, channel) {
    return __awaiter(this, void 0, void 0, function* () {
        return _debugUtil.checkDotNetCli()
            .then((dotnetInfo) => {
            if (os.platform() === "darwin" && !util_1.CoreClrDebugUtil.isMacOSSupported()) {
                logger.appendLine("[ERROR] The debugger cannot be installed. The debugger requires macOS 10.12 (Sierra) or newer.");
                channel.show();
                return false;
            }
            // Write install.complete
            util_1.CoreClrDebugUtil.writeEmptyFile(_debugUtil.installCompleteFilePath());
            vscode.window.setStatusBarMessage('Successfully installed .NET Core Debugger.', 5000);
            return true;
        }, (err) => {
            // Check for dotnet tools failed. pop the UI
            // err is a DotNetCliError but use defaults in the unexpected case that it's not
            showDotnetToolsWarning(err.ErrorMessage || _debugUtil.defaultDotNetCliErrorMessage());
            _logger.appendLine(err.ErrorString || err);
            // TODO: log telemetry?
            return false;
        });
    });
}
function showInstallErrorMessage(channel) {
    channel.show();
    vscode.window.showErrorMessage("An error occured during installation of the .NET Core Debugger. The C# extension may need to be reinstalled.");
}
function showDotnetToolsWarning(message) {
    const config = vscode.workspace.getConfiguration('csharp');
    if (!config.get('suppressDotnetInstallWarning', false)) {
        const getDotNetMessage = 'Get .NET CLI tools';
        const goToSettingsMessage = 'Disable this message in user settings';
        // Buttons are shown in right-to-left order, with a close button to the right of everything;
        // getDotNetMessage will be the first button, then goToSettingsMessage, then the close button.
        vscode.window.showErrorMessage(message, goToSettingsMessage, getDotNetMessage).then(value => {
            if (value === getDotNetMessage) {
                let open = require('open');
                let dotnetcoreURL = 'https://www.microsoft.com/net/core';
                // Windows redirects https://www.microsoft.com/net/core to https://www.microsoft.com/net/core#windowsvs2015
                if (process.platform == "win32") {
                    dotnetcoreURL = dotnetcoreURL + '#windowscmd';
                }
                open(dotnetcoreURL);
            }
            else if (value === goToSettingsMessage) {
                vscode.commands.executeCommand('workbench.action.openGlobalSettings');
            }
        });
    }
}
// The default extension manifest calls this command as the adapterExecutableCommand
// If the debugger components have not finished downloading, the proxy displays an error message to the user
// Else it will launch the debug adapter
function getAdapterExecutionCommand(channel) {
    return __awaiter(this, void 0, void 0, function* () {
        let logger = new logger_1.Logger(text => channel.append(text));
        let util = new util_1.CoreClrDebugUtil(common.getExtensionPath(), logger);
        // Check for .debugger folder. Handle if it does not exist.
        if (!util_1.CoreClrDebugUtil.existsSync(util.debugAdapterDir())) {
            // our install.complete file does not exist yet, meaning we have not completed the installation. Try to figure out what if anything the package manager is doing
            // the order in which files are dealt with is this:
            // 1. install.Begin is created
            // 2. install.Lock is created
            // 3. install.Begin is deleted
            // 4. install.complete is created
            // install.Lock does not exist, need to wait for packages to finish downloading.
            let installLock = yield common.installFileExists(common.InstallFileType.Lock);
            if (!installLock) {
                channel.show();
                throw new Error('The C# extension is still downloading packages. Please see progress in the output window below.');
            }
            else if (!util_1.CoreClrDebugUtil.existsSync(util.installCompleteFilePath())) {
                let success = yield completeDebuggerInstall(logger, channel);
                if (!success) {
                    channel.show();
                    throw new Error('Failed to complete the installation of the C# extension. Please see the error in the output window below.');
                }
            }
        }
        // debugger has finished install, kick off our debugger process
        return {
            command: path.join(common.getExtensionPath(), ".debugger", "vsdbg-ui" + util_1.CoreClrDebugUtil.getPlatformExeExtension())
        };
    });
}
exports.getAdapterExecutionCommand = getAdapterExecutionCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWN0aXZhdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29yZWNsci1kZWJ1Zy9hY3RpdmF0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRztBQUNoRyxZQUFZLENBQUM7Ozs7Ozs7Ozs7QUFFYix5QkFBeUI7QUFDekIsNkJBQTZCO0FBQzdCLGlDQUFpQztBQUNqQyxzQ0FBc0M7QUFFdEMsaUNBQXVEO0FBRXZELHdDQUFxQztBQUNyQyw0Q0FBb0Q7QUFHcEQsSUFBSSxVQUFVLEdBQXFCLElBQUksQ0FBQztBQUN4QyxJQUFJLE9BQU8sR0FBVyxJQUFJLENBQUM7QUFFM0Isa0JBQStCLGFBQXFDLEVBQUUsT0FBZ0MsRUFBRSxRQUEyQixFQUFFLE1BQWMsRUFBRSxPQUE2Qjs7UUFDOUssVUFBVSxHQUFHLElBQUksdUJBQWdCLENBQUMsT0FBTyxDQUFDLGFBQWEsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUNqRSxPQUFPLEdBQUcsTUFBTSxDQUFDO1FBRWpCLEVBQUUsQ0FBQyxDQUFDLENBQUMsdUJBQWdCLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM3RCxJQUFJLG1CQUF3QyxDQUFDO1lBRTdDLElBQUksQ0FBQztnQkFDRCxtQkFBbUIsR0FBRyxNQUFNLDhCQUFtQixDQUFDLFVBQVUsRUFBRSxDQUFDO1lBQ2pFLENBQUM7WUFDRCxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUNULHdEQUF3RDtnQkFDeEQsTUFBTSxDQUFDLFVBQVUsQ0FBQyw4REFBOEQsQ0FBQyxDQUFDO2dCQUNsRix1QkFBdUIsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUNyQyxDQUFDO1lBRUQsRUFBRSxDQUFDLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDO2dCQUN0QixFQUFFLENBQUMsQ0FBQyxtQkFBbUIsQ0FBQyxZQUFZLEtBQUssUUFBUSxDQUFD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