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
const OmniSharp = require("./omnisharp/extension");
const coreclrdebug = require("./coreclr-debug/activate");
const util = require("./common");
const vscode = require("vscode");
const CSharpExtDownloader_1 = require("./CSharpExtDownloader");
const logger_1 = require("./logger");
const vscode_extension_telemetry_1 = require("vscode-extension-telemetry");
const jsonContributions_1 = require("./features/json/jsonContributions");
let _channel = null;
function activate(context) {
    return __awaiter(this, void 0, void 0, function* () {
        const extensionId = 'ms-vscode.csharp';
        const extension = vscode.extensions.getExtension(extensionId);
        const extensionVersion = extension.packageJSON.version;
        const aiKey = extension.packageJSON.contributes.debuggers[0].aiKey;
        const reporter = new vscode_extension_telemetry_1.default(extensionId, extensionVersion, aiKey);
        util.setExtensionPath(extension.extensionPath);
        _channel = vscode.window.createOutputChannel('C#');
        let logger = new logger_1.Logger(text => _channel.append(text));
        let runtimeDependenciesExist = yield ensureRuntimeDependencies(extension, logger, reporter);
        // activate language services
        let omniSharpPromise = OmniSharp.activate(context, reporter, _channel, logger, extension.packageJSON);
        // register JSON completion & hover providers for project.json
        context.subscriptions.push(jsonContributions_1.addJSONProviders());
        let coreClrDebugPromise = Promise.resolve();
        if (runtimeDependenciesExist) {
            // activate coreclr-debug
            coreClrDebugPromise = coreclrdebug.activate(extension, context, reporter, logger, _channel);
        }
        return {
            initializationFinished: Promise.all([omniSharpPromise, coreClrDebugPromise])
                .then(promiseResult => {
                // This promise resolver simply swallows the result of Promise.all. When we decide we want to expose this level of detail
                // to other extensions then we will design that return type and implement it here.
            })
        };
    });
}
exports.activate = activate;
function ensureRuntimeDependencies(extension, logger, reporter) {
    return util.installFileExists(util.InstallFileType.Lock)
        .then(exists => {
        if (!exists) {
            const downloader = new CSharpExtDownloader_1.CSharpExtDownloader(_channel, logger, reporter, extension.packageJSON);
            return downloader.installRuntimeDependencies();
        }
        else {
            return true;
        }
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O2dHQUdnRzs7Ozs7Ozs7OztBQUVoRyxtREFBbUQ7QUFDbkQseURBQXlEO0FBQ3pELGlDQUFpQztBQUNqQyxpQ0FBaUM7QUFFakMsK0RBQTREO0FBQzVELHFDQUFrQztBQUNsQywyRUFBMkQ7QUFDM0QseUVBQXFFO0FBRXJFLElBQUksUUFBUSxHQUF5QixJQUFJLENBQUM7QUFFMUMsa0JBQStCLE9BQWdDOztRQUUzRCxNQUFNLFdBQVcsR0FBRyxrQkFBa0IsQ0FBQztRQUN2QyxNQUFNLFNBQVMsR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUM5RCxNQUFNLGdCQUFnQixHQUFHLFNBQVMsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDO1FBQ3ZELE1BQU0sS0FBSyxHQUFHLFNBQVMsQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7UUFDbkUsTUFBTSxRQUFRLEdBQUcsSUFBSSxvQ0FBaUIsQ0FBQyxXQUFXLEVBQUUsZ0JBQWdCLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFN0UsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUUvQyxRQUFRLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUVuRCxJQUFJLE1BQU0sR0FBRyxJQUFJLGVBQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUV2RCxJQUFJLHdCQUF3QixHQUFHLE1BQU0seUJBQXlCLENBQUMsU0FBUyxFQUFFLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQztRQUU1Riw2QkFBNkI7UUFDN0IsSUFBSSxnQkFBZ0IsR0FBRyxTQUFTLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxTQUFTLENBQUMsV0FBVyxDQUFDLENBQUM7UUFFdEcsOERBQThEO1FBQzlELE9BQU8sQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLG9DQUFnQixFQUFFLENBQUMsQ0FBQztRQUUvQyxJQUFJLG1CQUFtQixHQUFHLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUM1QyxFQUFFLENBQUMsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDLENBQUM7WUFDM0IseUJBQXlCO1lBQ3pCLG1CQUFtQixHQUFHLFlBQVksQ0FBQyxRQUFRLENBQUMsU0FBUyxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ2hHLENBQUM7UUFFRCxNQUFNLENBQUM7WUFDSCxzQkFBc0IsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsZ0JBQWdCLEVBQUUsbUJBQW1CLENBQUMsQ0FBQztpQkFDM0UsSUFBSSxDQUFDLGFBQWEsQ0FBQyxFQUFFO2dCQUNsQix5SEFBeUg7Z0JBQ3pILGtGQUFrRjtZQUN0RixDQUFDLENBQUM7U0FDTCxDQUFDO0lBQ04sQ0FBQztDQUFBO0FBbkNELDRCQW1DQztBQUVELG1DQUFtQyxTQUFnQyxFQUFFLE1BQWMsRUFBRSxRQUEyQjtJQUM1RyxNQUFNLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDO1NBQ25ELElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRTtRQUNYLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUNWLE1BQU0sVUFBVSxHQUFHLElBQUkseUNBQW1CLENBQUMsUUFBUSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQzlGLE1BQU0sQ0FBQyxVQUFVLENBQUMsMEJBQTBCLEVBQUUsQ0FBQztRQUNuRCxDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDSixNQUFNLENBQUMsSUFBSSxDQUFDO1FBQ2hCLENBQUM7SUFDTCxDQUFDLENBQUMsQ0FBQztBQUNYLENBQUMifQ==