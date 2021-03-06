/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { use, should, expect } from 'chai';
import { getNullChannel } from './Fakes';
import { OmnisharpServerVerboseMessage, EventWithMessage, OmnisharpRequestMessage, OmnisharpServerEnqueueRequest, OmnisharpServerDequeueRequest, OmnisharpServerProcessRequestStart, OmnisharpEventPacketReceived, OmnisharpServerProcessRequestComplete } from '../../../src/omnisharp/loggingEvents';
import { OmnisharpDebugModeLoggerObserver } from '../../../src/observers/OmnisharpDebugModeLoggerObserver';

use(require("chai-string"));

suite("OmnisharpLoggerObserver", () => {
    suiteSetup(() => should());
    let logOutput = "";
    let observer = new OmnisharpDebugModeLoggerObserver({
        ...getNullChannel(),
        append: (text: string) => { logOutput += text; },
    });

    setup(() => {
        logOutput = "";
    });

    [
        new OmnisharpServerVerboseMessage("server verbose message")
    ].forEach((event: EventWithMessage) => {
        test(`${event.constructor.name}: Message is logged`, () => {
            observer.post(event);
            expect(logOutput).to.contain(event.message);
        });
    });

    test(`OmnisharpRequestMessage: Request Command and Id is logged`, () => {
        let event = new OmnisharpRequestMessage({ command: "someCommand", onSuccess: () => { }, onError: () => { } }, 1);
        observer.post(event);
        expect(logOutput).to.contain(event.id);
        expect(logOutput).to.contain(event.request.command);
    });

    test(`OmnisharpRequestMessage: Request Data is logged when it is not empty`, () => {
        let event = new OmnisharpRequestMessage({ command: "someCommand", onSuccess: () => { }, onError: () => { }, data: "someData" }, 1);
        observer.post(event);
        expect(logOutput).to.contain(event.request.data);
    });

    test(`OmnisharpServerEnqueueRequest: Name and Command is logged`, () => {
        let event = new OmnisharpServerEnqueueRequest("foo", "someCommand");
        observer.post(event);
        expect(logOutput).to.contain(event.name);
        expect(logOutput).to.contain(event.command);
    });

    test(`OmnisharpServerDequeueRequest: Name and Command is logged`, () => {
        let event = new OmnisharpServerDequeueRequest("foo", "someCommand", 1);
        observer.post(event);
        expect(logOutput).to.contain(event.name);
        expect(logOutput).to.contain(event.command);
        expect(logOutput).to.contain(event.id);
    });

    test(`OmnisharpProcessRequestStart: Name is logged`, () => {
        let event = new OmnisharpServerProcessRequestStart("foobar");
        observer.post(event);
        expect(logOutput).to.contain(event.name);
    });

    test(`OmnisharpEventPacketReceived: Information messages with name OmniSharp.Middleware.LoggingMiddleware and follow pattern /^\/[\/\w]+: 200 \d+ms/ are not logged`, () => {
        let event = new OmnisharpEventPacketReceived("INFORMATION", "OmniSharp.Middleware.LoggingMiddleware", "/codecheck: 200 339ms");
        observer.post(event);
        expect(logOutput).to.contain(event.message);
        expect(logOutput).to.contain(event.name);
    });

    test(`OmnisharpServer messages increase and decrease indent`, () => {
        observer.post(new OmnisharpServerVerboseMessage("!indented_1"));
        observer.post(new OmnisharpServerProcessRequestStart("name"));
        observer.post(new OmnisharpServerVerboseMessage("indented"));
        observer.post(new OmnisharpServerProcessRequestComplete());
        observer.post(new OmnisharpServerVerboseMessage("!indented_2"));
        
        expect(logOutput).to.startWith("    !indented_1");
        expect(logOutput).to.contain("\n        indented");
        expect(logOutput).to.contain("\n    !indented_2");
    });

    [
        new OmnisharpEventPacketReceived("TRACE", "foo", "someMessage"),
        new OmnisharpEventPacketReceived("DEBUG", "foo", "someMessage"),
        new OmnisharpEventPacketReceived("INFORMATION", "foo", "someMessage"),
        new OmnisharpEventPacketReceived("WARNING", "foo", "someMessage"),
        new OmnisharpEventPacketReceived("ERROR", "foo", "someMessage"),
        new OmnisharpEventPacketReceived("CRITICAL", "foo", "someMessage"),
    ].forEach((event: OmnisharpEventPacketReceived) => {
        test(`OmnisharpEventPacketReceived: ${event.logLevel} messages are logged with name and the message`, () => {
            observer.post(event);
            expect(logOutput).to.be.empty;
        });
    });
});