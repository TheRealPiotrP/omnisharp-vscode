/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/

import { BaseChannelObserver } from "./BaseChannelObserver";
import { BaseEvent, CommandShowOutput, OmnisharpFailure } from '../omnisharp/loggingEvents';

export class OmnisharpChannelObserver extends BaseChannelObserver {

    public post = (event: BaseEvent) => {
        switch (event.constructor.name) {
            case CommandShowOutput.name:
                this.showChannel();
                break;
            case OmnisharpFailure.name:
                this.showChannel();
                break;
        }
    }
}