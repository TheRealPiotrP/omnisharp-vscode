/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { should, expect } from 'chai';
import { getNullChannel } from '../testAssets/Fakes';
import { CsharpChannelObserver } from '../../../src/observers/CsharpChannelObserver';
import { InstallationFailure, DebuggerNotInstalledFailure, DebuggerPrerequisiteFailure, ProjectJsonDeprecatedWarning, BaseEvent, DownloadStart } from '../../../src/omnisharp/loggingEvents';

suite("CsharpChannelObserver", () => {
    suiteSetup(() => should());
    [
        new InstallationFailure("someStage", "someError"),
        new DownloadStart("somePackage"),
        new DebuggerNotInstalledFailure(),
        new DebuggerPrerequisiteFailure("some failure"),
        new ProjectJsonDeprecatedWarning()
    ].forEach((event: BaseEvent) => {
        test(`${event.constructor.name}: Channel is shown`, () => {
            let hasShown = false;

            let observer = new CsharpChannelObserver({
                ...getNullChannel(),
                show: () => { hasShown = true; }
            });

            observer.post(event);
            expect(hasShown).to.be.true;
        });
    });
});
