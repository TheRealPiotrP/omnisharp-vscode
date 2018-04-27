/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Disposable } from 'vscode';
import { OmniSharpServer } from '../omnisharp/server';

export default abstract class AbstractProvider {

    protected _server: OmniSharpServer;
    private _disposables: Disposable[];

    constructor(server: OmniSharpServer) {
        this._server = server;
        this._disposables = [];
    }

    protected addDisposables(...disposables: Disposable[]) {
        this._disposables.push(...disposables);
    }

    dispose() {
        while (this._disposables.length) {
            this._disposables.pop().dispose();
        }
    }
}
