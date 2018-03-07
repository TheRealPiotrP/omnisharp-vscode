/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const abstractProvider_1 = require("./abstractProvider");
const typeConvertion_1 = require("../omnisharp/typeConvertion");
const serverUtils = require("../omnisharp/utils");
const options_1 = require("../omnisharp/options");
const protocol_1 = require("../omnisharp/protocol");
const vscode_1 = require("vscode");
class CodeActionProvider extends abstractProvider_1.default {
    constructor(server, reporter) {
        super(server, reporter);
        this._commandId = 'omnisharp.runCodeAction';
        this._resetCachedOptions();
        let d1 = vscode.workspace.onDidChangeConfiguration(this._resetCachedOptions, this);
        let d2 = vscode.commands.registerCommand(this._commandId, this._runCodeAction, this);
        this.addDisposables(d1, d2);
    }
    _resetCachedOptions() {
        this._options = options_1.Options.Read();
    }
    provideCodeActions(document, range, context, token) {
        if (this._options.disableCodeActions) {
            return;
        }
        let line;
        let column;
        let selection;
        // VS Code will pass the range of the word at the editor caret, even if there isn't a selection.
        // To ensure that we don't suggest selection-based refactorings when there isn't a selection, we first
        // find the text editor for this document and verify that there is a selection.
        let editor = vscode.window.visibleTextEditors.find(e => e.document === document);
        if (editor) {
            if (editor.selection.isEmpty) {
                // The editor does not have a selection. Use the active position of the selection (i.e. the caret).
                let active = editor.selection.active;
                line = active.line + 1;
                column = active.character + 1;
            }
            else {
                // The editor has a selection. Use it.
                let start = editor.selection.start;
                let end = editor.selection.end;
                selection = {
                    Start: { Line: start.line + 1, Column: start.character + 1 },
                    End: { Line: end.line + 1, Column: end.character + 1 }
                };
            }
        }
        else {
            // We couldn't find the editor, so just use the range we were provided.
            selection = {
                Start: { Line: range.start.line + 1, Column: range.start.character + 1 },
                End: { Line: range.end.line + 1, Column: range.end.character + 1 }
            };
        }
        let request = {
            FileName: document.fileName,
            Line: line,
            Column: column,
            Selection: selection
        };
        return serverUtils.getCodeActions(this._server, request, token).then(response => {
            return response.CodeActions.map(codeAction => {
                let runRequest = {
                    FileName: document.fileName,
                    Line: line,
                    Column: column,
                    Selection: selection,
                    Identifier: codeAction.Identifier,
                    WantsTextChanges: true,
                    WantsAllCodeActionOperations: true
                };
                return {
                    title: codeAction.Name,
                    command: this._commandId,
                    arguments: [runRequest]
                };
            });
        }, (error) => {
            return Promise.reject(`Problem invoking 'GetCodeActions' on OmniSharp server: ${error}`);
        });
    }
    _runCodeAction(req) {
        return serverUtils.runCodeAction(this._server, req).then(response => {
            if (response && Array.isArray(response.Changes)) {
                let edit = new vscode.WorkspaceEdit();
                let fileToOpen = null;
                let renamedFiles = [];
                for (let change of response.Changes) {
                    if (change.ModificationType == protocol_1.FileModificationType.Renamed) {
                        // The file was renamed. Omnisharp has already persisted
                        // the right changes to disk. We don't need to try to
                        // apply text changes (and will skip this file if we see an edit)
                        renamedFiles.push(vscode_1.Uri.file(change.FileName));
                    }
                }
                for (let change of response.Changes) {
                    if (change.ModificationType == protocol_1.FileModificationType.Opened) {
                        // The CodeAction requested that we open a file. 
                        // Record that file name and keep processing CodeActions.
                        // If a CodeAction requests that we open multiple files 
                        // we only open the last one (what would it mean to open multiple files?)
                        fileToOpen = vscode.Uri.file(change.FileName);
                    }
                    if (change.ModificationType == protocol_1.FileModificationType.Modified) {
                        let uri = vscode.Uri.file(change.FileName);
                        if (renamedFiles.some(r => r == uri)) {
                            // This file got renamed. Omnisharp has already
                            // persisted the new file with any applicable changes.
                            continue;
                        }
                        let edits = [];
                        for (let textChange of change.Changes) {
                            edits.push(vscode.TextEdit.replace(typeConvertion_1.toRange2(textChange), textChange.NewText));
                        }
                        edit.set(uri, edits);
                    }
                }
                let applyEditPromise = vscode.workspace.applyEdit(edit);
                // Unfortunately, the textEditor.Close() API has been deprecated
                // and replaced with a command that can only close the active editor.
                // If files were renamed that weren't the active editor, their tabs will
                // be left open and marked as "deleted" by VS Code
                let next = applyEditPromise;
                if (renamedFiles.some(r => r.fsPath == vscode.window.activeTextEditor.document.uri.fsPath)) {
                    next = applyEditPromise.then(_ => {
                        return vscode.commands.executeCommand("workbench.action.closeActiveEditor");
                    });
                }
                return fileToOpen != null
                    ? next.then(_ => {
                        return vscode.commands.executeCommand("vscode.open", fileToOpen);
                    })
                    : next;
            }
        }, (error) => {
            return Promise.reject(`Problem invoking 'RunCodeAction' on OmniSharp server: ${error}`);
        });
    }
}
exports.default = CodeActionProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29kZUFjdGlvblByb3ZpZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2ZlYXR1cmVzL2NvZGVBY3Rpb25Qcm92aWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRztBQUVoRyxZQUFZLENBQUM7O0FBRWIsaUNBQWlDO0FBRWpDLHlEQUFrRDtBQUVsRCxnRUFBdUQ7QUFDdkQsa0RBQWtEO0FBQ2xELGtEQUErQztBQUUvQyxvREFBNkQ7QUFDN0QsbUNBQTZCO0FBRTdCLHdCQUF3QyxTQUFRLDBCQUFnQjtJQUs1RCxZQUFZLE1BQXVCLEVBQUUsUUFBMkI7UUFDNUQsS0FBSyxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQztRQUV4QixJQUFJLENBQUMsVUFBVSxHQUFHLHlCQUF5QixDQUFDO1FBRTVDLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO1FBRTNCLElBQUksRUFBRSxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUMsd0JBQXdCLENBQUMsSUFBSSxDQUFDLG1CQUFtQixFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ25GLElBQUksRUFBRSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNyRixJQUFJLENBQUMsY0FBYyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUNoQyxDQUFDO0lBRU8sbUJBQW1CO1FBQ3ZCLElBQUksQ0FBQyxRQUFRLEdBQUcsaUJBQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUNuQyxDQUFDO0lBRU0sa0JBQWtCLENBQUMsUUFBNkIsRUFBRSxLQUFtQixFQUFFLE9BQWlDLEVBQUUsS0FBK0I7UUFDNUksRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUM7WUFDbkMsTUFBTSxDQUFDO1FBQ1gs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