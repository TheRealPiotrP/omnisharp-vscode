/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { should, expect } from 'chai';
import { getNullChannel } from '../testAssets/Fakes';
import { OmnisharpChannelObserver } from '../../../src/observers/OmnisharpChannelObserver';
import { OmnisharpFailure } from '../../../src/omnisharp/loggingEvents';

suite("OmnisharpChannelObserver", () => {
    suiteSetup(() => should());
    test(`OmnisharpFailure: Shows the channel`, () => {
        let event = new OmnisharpFailure("errorMessage", new Error("error"));
        let hasShown = false;
        let observer = new OmnisharpChannelObserver({
            ...getNullChannel(),
            show: () => { hasShown = true; }
        });

        observer.post(event);
        expect(hasShown).to.be.true;
    });
});