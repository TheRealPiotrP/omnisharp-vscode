/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import AbstractSupport from './abstractProvider';
import { FindImplementationsRequest } from '../omnisharp/protocol';
import * as serverUtils from '../omnisharp/utils';
import { createRequest, toLocation } from '../omnisharp/typeConvertion';
import { TextDocument, Position, CancellationToken, ImplementationProvider, ProviderResult, Definition } from 'vscode';

export default class CSharpImplementationProvider extends AbstractSupport implements ImplementationProvider {
    public provideImplementation(document: TextDocument, position: Position, token: CancellationToken): ProviderResult<Definition> {
        const request = <FindImplementationsRequest>createRequest(document, position);

        return serverUtils.findImplementations(this._server, request, token).then(response => {
            if (!response || !response.QuickFixes) {
                return undefined;
            }

            return response.QuickFixes.map(fix => toLocation(fix));
        });
    }
}
