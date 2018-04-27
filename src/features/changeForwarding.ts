/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import {Disposable, Uri, workspace} from 'vscode';
import {OmniSharpServer} from '../omnisharp/server';
import * as serverUtils from '../omnisharp/utils';
import { FileChangeType } from '../omnisharp/protocol';

function forwardDocumentChanges(server: OmniSharpServer): Disposable {

    return workspace.onDidChangeTextDocument(event => {

        let {document} = event;
        if (document.isUntitled || document.languageId !== 'csharp') {
            return;
        }

        if (!server.isRunning()) {
            return;
        }

        serverUtils.updateBuffer(server, {Buffer: document.getText(), FileName: document.fileName}).catch(err => {
            console.error(err);
            return err;
        });
    });
}

function forwardFileChanges(server: OmniSharpServer): Disposable {

    function onFileSystemEvent(changeType: FileChangeType): (uri: Uri) => void {
        return function(uri: Uri) 
        {
            if (!server.isRunning()) {
                return;
            }
            
            let req = { FileName: uri.fsPath, changeType};
            
            serverUtils.filesChanged(server, [req]).catch(err => {
                console.warn(`[o] failed to forward file change event for ${uri.fsPath}`, err);
                return err;
            });
        };  
    }

    const watcher = workspace.createFileSystemWatcher('**/*.*');
    let d1 = watcher.onDidCreate(onFileSystemEvent(FileChangeType.Create));
    let d2 = watcher.onDidDelete(onFileSystemEvent(FileChangeType.Delete));
    let d3 = watcher.onDidChange(onFileSystemEvent(FileChangeType.Change));

    return Disposable.from(watcher, d1, d2, d3);
}

export default function forwardChanges(server: OmniSharpServer): Disposable {

    // combine file watching and text document watching
    return Disposable.from(
        forwardDocumentChanges(server),
        forwardFileChanges(server));
}
