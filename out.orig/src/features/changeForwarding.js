/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const serverUtils = require("../omnisharp/utils");
const protocol_1 = require("../omnisharp/protocol");
function forwardDocumentChanges(server) {
    return vscode_1.workspace.onDidChangeTextDocument(event => {
        let { document } = event;
        if (document.isUntitled || document.languageId !== 'csharp') {
            return;
        }
        if (!server.isRunning()) {
            return;
        }
        serverUtils.updateBuffer(server, { Buffer: document.getText(), FileName: document.fileName }).catch(err => {
            console.error(err);
            return err;
        });
    });
}
function forwardFileChanges(server) {
    function onFileSystemEvent(changeType) {
        return function (uri) {
            if (!server.isRunning()) {
                return;
            }
            let req = { FileName: uri.fsPath, changeType };
            serverUtils.filesChanged(server, [req]).catch(err => {
                console.warn(`[o] failed to forward file change event for ${uri.fsPath}`, err);
                return err;
            });
        };
    }
    const watcher = vscode_1.workspace.createFileSystemWatcher('**/*.*');
    let d1 = watcher.onDidCreate(onFileSystemEvent(protocol_1.FileChangeType.Create));
    let d2 = watcher.onDidDelete(onFileSystemEvent(protocol_1.FileChangeType.Delete));
    let d3 = watcher.onDidChange(onFileSystemEvent(protocol_1.FileChangeType.Change));
    return vscode_1.Disposable.from(watcher, d1, d2, d3);
}
function forwardChanges(server) {
    // combine file watching and text document watching
    return vscode_1.Disposable.from(forwardDocumentChanges(server), forwardFileChanges(server));
}
exports.default = forwardChanges;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhbmdlRm9yd2FyZGluZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9mZWF0dXJlcy9jaGFuZ2VGb3J3YXJkaW5nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHO0FBRWhHLFlBQVksQ0FBQzs7QUFFYixtQ0FBa0Q7QUFFbEQsa0RBQWtEO0FBQ2xELG9EQUF1RDtBQUV2RCxnQ0FBZ0MsTUFBdUI7SUFFbkQsTUFBTSxDQUFDLGtCQUFTLENBQUMsdUJBQXVCLENBQUMsS0FBSyxDQUFDLEVBQUU7UUFFN0MsSUFBSSxFQUFDLFFBQVEsRUFBQyxHQUFHLEtBQUssQ0FBQztRQUN2QixFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsVUFBVSxJQUFJLFFBQVEsQ0FBQyxVQUFVLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQztZQUMxRCxNQUFNLENBQUM7UUFDWCxDQUFDO1FBRUQsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3RCLE1BQU0sQ0FBQztRQUNYLENBQUM7UUFFRCxXQUFXLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxFQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsT0FBTyxFQUFFLEVBQUUsUUFBUSxFQUFFLFFBQVEsQ0FBQyxRQUFRLEVBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUNwRyxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ25CLE1BQU0sQ0FBQyxHQUFHLENBQUM7UUFDZixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQztBQUVELDRCQUE0QixNQUF1QjtJQUUvQywyQkFBMkIsVUFBMEI7UUFDakQsTUFBTSxDQUFDLFVBQVMsR0FBUTtZQUVwQixFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQ3RCLE1BQU0sQ0FBQztZQUNYLENBQUM7WUFFRCxJQUFJLEdBQUcsR0FBRyxFQUFFLFFBQVEsRUFBRSxHQUFHLENBQUMsTUFBTSxFQUFFLFVBQVUsRUFBQyxDQUFDO1lBRTlDLFdBQVcsQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQ2hELE9BQU8sQ0FBQyxJQUFJLENBQUMsK0NBQStDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQztnQkFDL0UsTUFBTSxDQUFDLEdBQUcsQ0FBQztZQUNmLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDO0lBQ04sQ0FBQztJQUVELE1BQU0sT0FBTyxHQUFHLGtCQUFTLENBQUMsdUJBQXVCLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDNUQsSUFBSSxFQUFFLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQyxpQkFBaUIsQ0FBQyx5QkFBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7SUFDdkUsSUFBSSxFQUFFLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQyxpQkFBaUIsQ0FBQyx5QkFBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7SUFDdkUsSUFBSSxFQUFFLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQyxpQkFBaUIsQ0FBQyx5QkFBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7SUFFdkUsTUFBTSxDQUFDLG1CQUFVLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQ2hELENBQUM7QUFFRCx3QkFBdUMsTUFBdUI7SUFFMUQsbURBQW1EO0lBQ25ELE1BQU0sQ0FBQyxtQkFBVSxDQUFDLElBQUksQ0FDbEIsc0JBQXNCLENBQUMsTUFBTSxDQUFDLEVBQzlCLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7QUFDcEMsQ0FBQztBQU5ELGlDQU1DIn0=