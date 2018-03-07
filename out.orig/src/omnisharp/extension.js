"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const utils = require("./utils");
const vscode = require("vscode");
const assets_1 = require("../assets");
const diagnosticsProvider_1 = require("../features/diagnosticsProvider");
const common_1 = require("../common");
const configurationProvider_1 = require("../configurationProvider");
const codeActionProvider_1 = require("../features/codeActionProvider");
const codeLensProvider_1 = require("../features/codeLensProvider");
const completionItemProvider_1 = require("../features/completionItemProvider");
const definitionMetadataDocumentProvider_1 = require("../features/definitionMetadataDocumentProvider");
const definitionProvider_1 = require("../features/definitionProvider");
const documentHighlightProvider_1 = require("../features/documentHighlightProvider");
const documentSymbolProvider_1 = require("../features/documentSymbolProvider");
const formattingEditProvider_1 = require("../features/formattingEditProvider");
const hoverProvider_1 = require("../features/hoverProvider");
const implementationProvider_1 = require("../features/implementationProvider");
const server_1 = require("./server");
const options_1 = require("./options");
const referenceProvider_1 = require("../features/referenceProvider");
const renameProvider_1 = require("../features/renameProvider");
const signatureHelpProvider_1 = require("../features/signatureHelpProvider");
const dotnetTest_1 = require("../features/dotnetTest");
const workspaceSymbolProvider_1 = require("../features/workspaceSymbolProvider");
const changeForwarding_1 = require("../features/changeForwarding");
const commands_1 = require("../features/commands");
const status_1 = require("../features/status");
function activate(context, reporter, channel, logger, packageJSON) {
    const documentSelector = {
        language: 'csharp',
        scheme: 'file' // only files from disk
    };
    const options = options_1.Options.Read();
    const server = new server_1.OmniSharpServer(reporter, logger, channel, packageJSON);
    exports.omnisharp = server;
    const advisor = new diagnosticsProvider_1.Advisor(server); // create before server is started
    const disposables = [];
    const localDisposables = [];
    disposables.push(server.onServerStart(() => {
        // register language feature provider on start
        const definitionMetadataDocumentProvider = new definitionMetadataDocumentProvider_1.default();
        definitionMetadataDocumentProvider.register();
        localDisposables.push(definitionMetadataDocumentProvider);
        const definitionProvider = new definitionProvider_1.default(server, reporter, definitionMetadataDocumentProvider);
        localDisposables.push(vscode.languages.registerDefinitionProvider(documentSelector, definitionProvider));
        localDisposables.push(vscode.languages.registerDefinitionProvider({ scheme: definitionMetadataDocumentProvider.scheme }, definitionProvider));
        localDisposables.push(vscode.languages.registerImplementationProvider(documentSelector, new implementationProvider_1.default(server, reporter)));
        const testManager = new dotnetTest_1.default(server, reporter);
        localDisposables.push(testManager);
        localDisposables.push(vscode.languages.registerCodeLensProvider(documentSelector, new codeLensProvider_1.default(server, reporter, testManager)));
        localDisposables.push(vscode.languages.registerDocumentHighlightProvider(documentSelector, new documentHighlightProvider_1.default(server, reporter)));
        localDisposables.push(vscode.languages.registerDocumentSymbolProvider(documentSelector, new documentSymbolProvider_1.default(server, reporter)));
        localDisposables.push(vscode.languages.registerReferenceProvider(documentSelector, new referenceProvider_1.default(server, reporter)));
        localDisposables.push(vscode.languages.registerHoverProvider(documentSelector, new hoverProvider_1.default(server, reporter)));
        localDisposables.push(vscode.languages.registerRenameProvider(documentSelector, new renameProvider_1.default(server, reporter)));
        if (options.useFormatting) {
            localDisposables.push(vscode.languages.registerDocumentRangeFormattingEditProvider(documentSelector, new formattingEditProvider_1.default(server, reporter)));
            localDisposables.push(vscode.languages.registerOnTypeFormattingEditProvider(documentSelector, new formattingEditProvider_1.default(server, reporter), '}', ';'));
        }
        localDisposables.push(vscode.languages.registerCompletionItemProvider(documentSelector, new completionItemProvider_1.default(server, reporter), '.', ' '));
        localDisposables.push(vscode.languages.registerWorkspaceSymbolProvider(new workspaceSymbolProvider_1.default(server, reporter)));
        localDisposables.push(vscode.languages.registerSignatureHelpProvider(documentSelector, new signatureHelpProvider_1.default(server, reporter), '(', ','));
        const codeActionProvider = new codeActionProvider_1.default(server, reporter);
        localDisposables.push(codeActionProvider);
        localDisposables.push(vscode.languages.registerCodeActionsProvider(documentSelector, codeActionProvider));
        localDisposables.push(diagnosticsProvider_1.default(server, reporter, advisor));
        localDisposables.push(changeForwarding_1.default(server));
    }));
    disposables.push(server.onServerStop(() => {
        // remove language feature providers on stop
        vscode.Disposable.from(...localDisposables).dispose();
    }));
    disposables.push(commands_1.default(server, reporter, channel));
    disposables.push(status_1.default(server));
    if (!context.workspaceState.get('assetPromptDisabled')) {
        disposables.push(server.onServerStart(() => {
            // Update or add tasks.json and launch.json
            assets_1.addAssetsIfNecessary(server).then(result => {
                if (result === assets_1.AddAssetResult.Disable) {
                    context.workspaceState.update('assetPromptDisabled', true);
                }
            });
        }));
    }
    // After server is started (and projects are loaded), check to see if there are
    // any project.json projects if the suppress option is not set. If so, notify the user about migration.
    let csharpConfig = vscode.workspace.getConfiguration('csharp');
    if (!csharpConfig.get('suppressProjectJsonWarning')) {
        disposables.push(server.onServerStart(() => {
            utils.requestWorkspaceInformation(server)
                .then(workspaceInfo => {
                if (workspaceInfo.DotNet && workspaceInfo.DotNet.Projects.length > 0) {
                    const shortMessage = 'project.json is no longer a supported project format for .NET Core applications.';
                    const detailedMessage = "Warning: project.json is no longer a supported project format for .NET Core applications. Update to the latest version of .NET Core (https://aka.ms/netcoredownload) and use 'dotnet migrate' to upgrade your project (see https://aka.ms/netcoremigrate for details).";
                    const moreDetailItem = { title: 'More Detail' };
                    vscode.window.showWarningMessage(shortMessage, moreDetailItem)
                        .then(item => {
                        channel.appendLine(detailedMessage);
                        channel.show();
                    });
                }
            });
        }));
    }
    // Send telemetry about the sorts of projects the server was started on.
    disposables.push(server.onServerStart(() => {
        let measures = {};
        utils.requestWorkspaceInformation(server)
            .then(workspaceInfo => {
            if (workspaceInfo.DotNet && workspaceInfo.DotNet.Projects.length > 0) {
                measures['projectjson.projectcount'] = workspaceInfo.DotNet.Projects.length;
                measures['projectjson.filecount'] = common_1.sum(workspaceInfo.DotNet.Projects, p => common_1.safeLength(p.SourceFiles));
            }
            if (workspaceInfo.MsBuild && workspaceInfo.MsBuild.Projects.length > 0) {
                measures['msbuild.projectcount'] = workspaceInfo.MsBuild.Projects.length;
                measures['msbuild.filecount'] = common_1.sum(workspaceInfo.MsBuild.Projects, p => common_1.safeLength(p.SourceFiles));
                measures['msbuild.unityprojectcount'] = common_1.sum(workspaceInfo.MsBuild.Projects, p => p.IsUnityProject ? 1 : 0);
                measures['msbuild.netcoreprojectcount'] = common_1.sum(workspaceInfo.MsBuild.Projects, p => utils.isNetCoreProject(p) ? 1 : 0);
            }
            // TODO: Add measurements for script.
            reporter.sendTelemetryEvent('OmniSharp.Start', null, measures);
        });
    }));
    // read and store last solution or folder path
    disposables.push(server.onBeforeServerStart(path => context.workspaceState.update('lastSolutionPathOrFolder', path)));
    if (options.autoStart) {
        server.autoStart(context.workspaceState.get('lastSolutionPathOrFolder'));
    }
    // stop server on deactivate
    disposables.push(new vscode.Disposable(() => {
        advisor.dispose();
        server.stop();
    }));
    // Register ConfigurationProvider
    disposables.push(vscode.debug.registerDebugConfigurationProvider('coreclr', new configurationProvider_1.CSharpConfigurationProvider(server)));
    context.subscriptions.push(...disposables);
    return new Promise(resolve => server.onServerStart(e => resolve(e)));
}
exports.activate = activate;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL29tbmlzaGFycC9leHRlbnNpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Z0dBR2dHOztBQUVoRyxpQ0FBaUM7QUFDakMsaUNBQWlDO0FBRWpDLHNDQUFpRTtBQUNqRSx5RUFBNkU7QUFDN0Usc0NBQTRDO0FBRTVDLG9FQUF1RTtBQUN2RSx1RUFBZ0U7QUFDaEUsbUVBQTREO0FBQzVELCtFQUF3RTtBQUN4RSx1R0FBZ0c7QUFDaEcsdUVBQWdFO0FBQ2hFLHFGQUE4RTtBQUM5RSwrRUFBd0U7QUFDeEUsK0VBQWdFO0FBQ2hFLDZEQUFzRDtBQUN0RCwrRUFBd0U7QUFDeEUscUNBQTJDO0FBQzNDLHVDQUFvQztBQUNwQyxxRUFBOEQ7QUFDOUQsK0RBQXdEO0FBQ3hELDZFQUFzRTtBQUV0RSx1REFBaUQ7QUFDakQsaUZBQTBFO0FBQzFFLG1FQUEwRDtBQUMxRCxtREFBb0Q7QUFDcEQsK0NBQThDO0FBSzlDLGtCQUF5QixPQUFnQyxFQUFFLFFBQTJCLEVBQUUsT0FBNkIsRUFBRSxNQUFjLEVBQUUsV0FBZ0I7SUFDbkosTUFBTSxnQkFBZ0IsR0FBNEI7UUFDOUMsUUFBUSxFQUFFLFFBQVE7UUFDbEIsTUFBTSxFQUFFLE1BQU0sQ0FBQyx1QkFBdUI7S0FDekMsQ0FBQztJQUVGLE1BQU0sT0FBTyxHQUFHLGlCQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7SUFFL0IsTUFBTSxNQUFNLEdBQUcsSUFBSSx3QkFBZSxDQUFDLFFBQVEsRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLFdBQVcsQ0FBQyxDQUFDO0lBQzNFLGlCQUFTLEdBQUcsTUFBTSxDQUFDO0lBQ25CLE1BQU0sT0FBTyxHQUFHLElBQUksNkJBQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLGtDQUFrQztJQUN2RSxNQUFNLFdBQVcsR0FBd0IsRUFBRSxDQUFDO0lBQzVDLE1BQU0sZ0JBQWdCLEdBQXdCLEVBQUUsQ0FBQztJQUVqRCxXQUFXLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsR0FBRyxFQUFFO1FBQ3ZDLDhDQUE4QztRQUM5QyxNQUFNLGtDQUFrQyxHQUFHLElBQUksNENBQWtDLEVBQUUsQ0FBQztRQUNwRixrQ0FBa0MsQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUM5QyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsa0NBQWtDLENBQUMsQ0FBQztRQUUxRCxNQUFNLGtCQUFrQixHQUFHLElBQUksNEJBQWtCLENBQUMsTUFBTSxFQUFFLFFBQVEsRUFBRSxrQ0FBa0MsQ0FBQyxDQUFDO1FBQ3hHLGdCQUFnQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLDBCQUEwQixDQUFDLGdCQUFnQixFQUFFLGtCQUFrQixDQUFDLENBQUMsQ0FBQztRQUN6RyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQywwQkFBMEIsQ0FBQyxFQUFFLE1BQU0sRUFBRSxrQ0FBa0MsQ0FBQyxNQUFNLEVBQUUsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDLENBQUM7UUFDOUksZ0JBQWdCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsOEJBQThCLENBQUMsZ0JBQWdCLEVBQUUsSUFBSSxnQ0FBc0IsQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3ZJLE1BQU0sV0FBVyxHQUFHLElBQUksb0JBQVcsQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDdEQsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ25DLGdCQUFnQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLHdCQUF3QixDQUFDLGdCQUFnQixFQUFFLElBQUksMEJBQWdCLENBQUMsTUFBTSxFQUFFLFFBQVEsRUFBRSxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDeEksZ0JBQWdCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsaUNBQWlDLENBQUMsZ0JBQWdCLEVBQUUsSUFBSSxtQ0FBeUIsQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzdJLGdCQUFnQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLDhCQUE4QixDQUFDLGdCQUFnQixFQUFFLElBQUksZ0NBQXNCLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN2SSxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyx5QkFBeUIsQ0FBQyxnQkFBZ0IsRUFBRSxJQUFJLDJCQUFpQixDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDN0gsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMscUJBQXFCLENBQUMsZ0JBQWdCLEVBQUUsSUFBSSx1QkFBYSxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDckgsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsc0JBQXNCLENBQUMsZ0JBQWdCLEVBQUUsSUFBSSx3QkFBYyxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdkgsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7WUFDeEIsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsMkNBQTJDLENBQUMsZ0JBQWdCLEVBQUUsSUFBSSxnQ0FBYyxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDNUksZ0JBQWdCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsb0NBQW9DLENBQUMsZ0JBQWdCLEVBQUUsSUFBSSxnQ0FBYyxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNuSixDQUFDO1FBQ0QsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsOEJBQThCLENBQUMsZ0JBQWdCLEVBQUUsSUFBSSxnQ0FBc0IsQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDakosZ0JBQWdCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsK0JBQStCLENBQUMsSUFBSSxpQ0FBdUIsQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3ZILGdCQUFnQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLDZCQUE2QixDQUFDLGdCQUFnQixFQUFFLElBQUksK0JBQXFCLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQy9JLE1BQU0sa0JBQWtCLEdBQUcsSUFBSSw0QkFBa0IsQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDcEUsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUM7UUFDMUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsMkJBQTJCLENBQUMsZ0JBQWdCLEVBQUUsa0JBQWtCLENBQUMsQ0FBQyxDQUFDO1FBQzFHLGdCQUFnQixDQUFDLElBQUksQ0FBQyw2QkFBaUIsQ0FBQyxNQUFNLEVBQUUsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7UUFDcEUsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLDBCQUFjLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUNsRCxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBRUosV0FBVyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLEdBQUcsRUFBRTtRQUN0Qyw0Q0FBNEM7UUFDNUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsR0FBRyxnQkFBZ0IsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQzFELENBQUMsQ0FBQyxDQUFDLENBQUM7SUFFSixXQUFXLENBQUMsSUFBSSxDQUFDLGtCQUFnQixDQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQztJQUM5RCxXQUFXLENBQUMsSUFBSSxDQUFDLGdCQUFZLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUV2QyxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFVLHFCQUFxQixDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzlELFdBQVcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxHQUFHLEVBQUU7WUFDdkMsMkNBQTJDO1lBQzNDLDZCQUFvQixDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRTtnQkFDdkMsRUFBRSxDQUFDLENBQUMsTUFBTSxLQUFLLHVCQUFjLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztvQkFDcEMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMscUJBQXFCLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQy9ELENBQUM7WUFDTCxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDUixDQUFDO0lBRUQsK0VBQStFO0lBQy9FLHVHQUF1RztJQUN2RyxJQUFJLFlBQVksR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQy9ELEVBQUUsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBVSw0QkFBNEIsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMzRCxXQUFXLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsR0FBRyxFQUFFO1lBQ3ZDLEtBQUssQ0FBQywyQkFBMkIsQ0FBQyxNQUFNLENBQUM7aUJBQ3BDLElBQUksQ0FBQyxhQUFhLENBQUMsRUFBRTtnQkFDbEIsRUFBRSxDQUFDLENBQUMsYUFBYSxDQUFDLE1BQU0sSUFBSSxhQUFhLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDbkUsTUFBTSxZQUFZLEdBQUcsa0ZBQWtGLENBQUM7b0JBQ3hHLE1BQU0sZUFBZSxHQUFHLHdRQUF3USxDQUFDO29CQUNqUyxNQUFNLGNBQWMsR0FBdUIsRUFBRSxLQUFLLEVBQUUsYUFBYSxFQUFFLENBQUM7b0JBQ3BFLE1BQU0sQ0FBQyxNQUFNLENBQUMsa0JBQWtCLENBQUMsWUFBWSxFQUFFLGNBQWMsQ0FBQzt5QkFDekQsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFO3dCQUNULE9BQU8sQ0FBQyxVQUFVLENBQUMsZUFBZSxDQUFDLENBQUM7d0JBQ3BDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztvQkFDbkIsQ0FBQyxDQUFDLENBQUM7Z0JBQ1gsQ0FBQztZQUNMLENBQUMsQ0FBQyxDQUFDO1FBQ1gsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNSLENBQUM7SUFFRCx3RUFBd0U7SUFDeEUsV0FBVyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLEdBQUcsRUFBRTtRQUN2QyxJQUFJLFFBQVEsR0FBOEIsRUFBRSxDQUFDO1FBRTVDLEtBQUssQ0FBQywyQkFBMkIsQ0FBQyxNQUFNLENBQUM7YUFDckMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxFQUFFO1lBQ2xCLEVBQUUsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxNQUFNLElBQUksYUFBYSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ25FLFFBQVEsQ0FBQywwQkFBMEIsQ0FBQyxHQUFHLGFBQWEsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQztnQkFDNUUsUUFBUSxDQUFDLHVCQUF1QixDQUFDLEdBQUcsWUFBRyxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsbUJBQVUsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztZQUMzRyxDQUFDO1lBRUQsRUFBRSxDQUFDLENBQUMsYUFBYSxDQUFDLE9BQU8sSUFBSSxhQUFhLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDckUsUUFBUSxDQUFDLHNCQUFzQixDQUFDLEdBQUcsYUFBYSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDO2dCQUN6RSxRQUFRLENBQUMsbUJBQW1CLENBQUMsR0FBRyxZQUFHLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxtQkFBVSxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO2dCQUNwRyxRQUFRLENBQUMsMkJBQTJCLENBQUMsR0FBRyxZQUFHLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUMzRyxRQUFRLENBQUMsNkJBQTZCLENBQUMsR0FBRyxZQUFHLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDMUgsQ0FBQztZQUVELHFDQUFxQztZQUVyQyxRQUFRLENBQUMsa0JBQWtCLENBQUMsaUJBQWlCLEVBQUUsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ25FLENBQUMsQ0FBQyxDQUFDO0lBQ1gsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUVKLDhDQUE4QztJQUM5QyxXQUFXLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLDBCQUEwQixFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUV0SCxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztRQUNwQixNQUFNLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFTLDBCQUEwQixDQUFDLENBQUMsQ0FBQztJQUNyRixDQUFDO0lBRUQsNEJBQTRCO0lBQzVCLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxNQUFNLENBQUMsVUFBVSxDQUFDLEdBQUcsRUFBRTtRQUN4QyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDbEIsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ2xCLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFFSixpQ0FBaUM7SUFDakMsV0FBVyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLGtDQUFrQyxDQUFDLFNBQVMsRUFBRSxJQUFJLG1EQUEyQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUV0SCxPQUFPLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxHQUFHLFdBQVcsQ0FBQyxDQUFDO0lBRTNDLE1BQU0sQ0FBQyxJQUFJLE9BQU8sQ0FBUyxPQUFPLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2pGLENBQUM7QUFqSUQsNEJBaUlDIn0=