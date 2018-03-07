"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
class Options {
    constructor(path, useMono, waitForDebugger, loggingLevel, autoStart, projectLoadTimeout, maxProjectResults, useEditorFormattingSettings, useFormatting, showReferencesCodeLens, showTestsCodeLens, disableCodeActions) {
        this.path = path;
        this.useMono = useMono;
        this.waitForDebugger = waitForDebugger;
        this.loggingLevel = loggingLevel;
        this.autoStart = autoStart;
        this.projectLoadTimeout = projectLoadTimeout;
        this.maxProjectResults = maxProjectResults;
        this.useEditorFormattingSettings = useEditorFormattingSettings;
        this.useFormatting = useFormatting;
        this.showReferencesCodeLens = showReferencesCodeLens;
        this.showTestsCodeLens = showTestsCodeLens;
        this.disableCodeActions = disableCodeActions;
    }
    static Read() {
        // Extra effort is taken below to ensure that legacy versions of options
        // are supported below. In particular, these are:
        //
        // - "csharp.omnisharp" -> "omnisharp.path"
        // - "csharp.omnisharpUsesMono" -> "omnisharp.useMono"
        const omnisharpConfig = vscode.workspace.getConfiguration('omnisharp');
        const csharpConfig = vscode.workspace.getConfiguration('csharp');
        const path = csharpConfig.has('omnisharp')
            ? csharpConfig.get('omnisharp')
            : omnisharpConfig.get('path');
        const useMono = csharpConfig.has('omnisharpUsesMono')
            ? csharpConfig.get('omnisharpUsesMono')
            : omnisharpConfig.get('useMono');
        const waitForDebugger = omnisharpConfig.get('waitForDebugger', false);
        // support the legacy "verbose" level as "debug"
        let loggingLevel = omnisharpConfig.get('loggingLevel');
        if (loggingLevel.toLowerCase() === 'verbose') {
            loggingLevel = 'debug';
        }
        const autoStart = omnisharpConfig.get('autoStart', true);
        const projectLoadTimeout = omnisharpConfig.get('projectLoadTimeout', 60);
        const maxProjectResults = omnisharpConfig.get('maxProjectResults', 250);
        const useEditorFormattingSettings = omnisharpConfig.get('useEditorFormattingSettings', true);
        const useFormatting = csharpConfig.get('format.enable', true);
        const showReferencesCodeLens = csharpConfig.get('referencesCodeLens.enabled', true);
        const showTestsCodeLens = csharpConfig.get('testsCodeLens.enabled', true);
        const disableCodeActions = csharpConfig.get('disableCodeActions', false);
        return new Options(path, useMono, waitForDebugger, loggingLevel, autoStart, projectLoadTimeout, maxProjectResults, useEditorFormattingSettings, useFormatting, showReferencesCodeLens, showTestsCodeLens, disableCodeActions);
    }
}
exports.Options = Options;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3B0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9vbW5pc2hhcnAvb3B0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7OztnR0FHZ0c7O0FBRWhHLGlDQUFpQztBQUVqQztJQUNJLFlBQ1csSUFBYSxFQUNiLE9BQWlCLEVBQ2pCLGVBQXlCLEVBQ3pCLFlBQXFCLEVBQ3JCLFNBQW1CLEVBQ25CLGtCQUEyQixFQUMzQixpQkFBMEIsRUFDMUIsMkJBQXFDLEVBQ3JDLGFBQXVCLEVBQ3ZCLHNCQUFnQyxFQUNoQyxpQkFBMkIsRUFDM0Isa0JBQTRCO1FBWDVCLFNBQUksR0FBSixJQUFJLENBQVM7UUFDYixZQUFPLEdBQVAsT0FBTyxDQUFVO1FBQ2pCLG9CQUFlLEdBQWYsZUFBZSxDQUFVO1FBQ3pCLGlCQUFZLEdBQVosWUFBWSxDQUFTO1FBQ3JCLGNBQVMsR0FBVCxTQUFTLENBQVU7UUFDbkIsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFTO1FBQzNCLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBUztRQUMxQixnQ0FBMkIsR0FBM0IsMkJBQTJCLENBQVU7UUFDckMsa0JBQWEsR0FBYixhQUFhLENBQVU7UUFDdkIsMkJBQXNCLEdBQXRCLHNCQUFzQixDQUFVO1FBQ2hDLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBVTtRQUMzQix1QkFBa0IsR0FBbEIsa0JBQWtCLENBQVU7SUFBSSxDQUFDO0lBRXJDLE1BQU0sQ0FBQyxJQUFJO1FBQ2Qsd0VBQXdFO1FBQ3hFLGlEQUFpRDtRQUNqRCxFQUFFO1FBQ0YsMkNBQTJDO1FBQzNDLHNEQUFzRDtRQUV0RCxNQUFNLGVBQWUsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ3ZFLE1BQU0sWUFBWSxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLENBQUM7UUFFakUsTUFBTSxJQUFJLEdBQUcsWUFBWSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUM7WUFDdEMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQVMsV0FBVyxDQUFDO1lBQ3ZDLENBQUMsQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFTLE1BQU0sQ0FBQyxDQUFDO1FBRTFDLE1BQU0sT0FBTyxHQUFHLFlBQVksQ0FBQyxHQUFHLENBQUMsbUJBQW1CLENBQUM7WUFDakQsQ0FBQyxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQVUsbUJBQW1CLENBQUM7WUFDaEQsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQVUsU0FBUyxDQUFDLENBQUM7UUFFOUMsTUFBTSxlQUFlLEdBQUcsZUFBZSxDQUFDLEdBQUcsQ0FBVSxpQkFBaUIsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUUvRSxnREFBZ0Q7UUFDaEQsSUFBSSxZQUFZLEdBQUcsZUFBZSxDQUFDLEdBQUcsQ0FBUyxjQUFjLENBQUMsQ0FBQztRQUMvRCxFQUFFLENBQUMsQ0FBQyxZQUFZLENBQUMsV0FBVyxFQUFFLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQztZQUMzQyxZQUFZLEdBQUcsT0FBTyxDQUFDO1FBQzNCLENBQUM7UUFFRCxNQUFNLFNBQVMsR0FBRyxlQUFlLENBQUMsR0FBRyxDQUFVLFdBQVcsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUVsRSxNQUFNLGtCQUFrQixHQUFHLGVBQWUsQ0FBQyxHQUFHLENBQVMsb0JBQW9CLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDakYsTUFBTSxpQkFBaUIsR0FBRyxlQUFlLENBQUMsR0FBRyxDQUFTLG1CQUFtQixFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ2hGLE1BQU0sMkJBQTJCLEdBQUcsZUFBZSxDQUFDLEdBQUcsQ0FBVSw2QkFBNkIsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUV0RyxNQUFNLGFBQWEsR0FBRyxZQUFZLENBQUMsR0FBRyxDQUFVLGVBQWUsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUV2RSxNQUFNLHNCQUFzQixHQUFHLFlBQVksQ0FBQyxHQUFHLENBQVUsNEJBQTRCLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDN0YsTUFBTSxpQkFBaUIsR0FBRyxZQUFZLENBQUMsR0FBRyxDQUFVLHVCQUF1QixFQUFFLElBQUksQ0FBQyxDQUFDO1FBRW5GLE1BQU0sa0JBQWtCLEdBQUcsWUFBWSxDQUFDLEdBQUcsQ0FBVSxvQkFBb0IsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUVsRixNQUFNLENBQUMsSUFBSSxPQUFPLENBQUMsSUFBSSxFQUNuQixPQUFPLEVBQ1AsZUFBZSxFQUNmLFlBQVksRUFDWixTQUFTLEVBQ1Qsa0JBQWtCLEVBQ2xCLGlCQUFpQixFQUNqQiwyQkFBMkIsRUFDM0IsYUFBYSxFQUNiLHNCQUFzQixFQUN0QixpQkFBaUIsRUFDakIsa0JBQWtCLENBQUMsQ0FBQztJQUM1QixDQUFDO0NBQ0o7QUFuRUQsMEJBbUVDIn0=