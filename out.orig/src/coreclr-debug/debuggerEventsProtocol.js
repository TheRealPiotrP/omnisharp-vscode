/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
// This contains the definition of messages that VsDbg-UI can send back to a listener which registers itself via the 'debuggerEventsPipeName'
// property on a launch or attach request.
// 
// All messages are sent as UTF-8 JSON text with a tailing '\n'
var DebuggerEventsProtocol;
(function (DebuggerEventsProtocol) {
    let EventType;
    (function (EventType) {
        // Indicates that the vsdbg-ui has received the attach or launch request and is starting up
        EventType.Starting = "starting";
        // Indicates that vsdbg-ui has successfully launched the specified process.
        // The ProcessLaunchedEvent interface details the event payload.
        EventType.ProcessLaunched = "processLaunched";
        // Debug session is ending
        EventType.DebuggingStopped = "debuggingStopped";
    })(EventType = DebuggerEventsProtocol.EventType || (DebuggerEventsProtocol.EventType = {}));
    // Decodes a packet received from the debugger into an event
    function decodePacket(packet) {
        // Verify the message ends in a newline
        if (packet[packet.length - 1] != 10 /*\n*/) {
            throw new Error("Unexpected message received from debugger.");
        }
        const message = packet.toString('utf-8', 0, packet.length - 1);
        return JSON.parse(message);
    }
    DebuggerEventsProtocol.decodePacket = decodePacket;
})(DebuggerEventsProtocol = exports.DebuggerEventsProtocol || (exports.DebuggerEventsProtocol = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVidWdnZXJFdmVudHNQcm90b2NvbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlY2xyLWRlYnVnL2RlYnVnZ2VyRXZlbnRzUHJvdG9jb2wudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7QUFFaEcsWUFBWSxDQUFDOztBQUViLDZJQUE2STtBQUM3SSwwQ0FBMEM7QUFDMUMsR0FBRztBQUNILCtEQUErRDtBQUMvRCxJQUFpQixzQkFBc0IsQ0ErQnRDO0FBL0JELFdBQWlCLHNCQUFzQjtJQUNuQyxJQUFjLFNBQVMsQ0FRdEI7SUFSRCxXQUFjLFNBQVM7UUFDbkIsMkZBQTJGO1FBQzlFLGtCQUFRLEdBQUcsVUFBVSxDQUFDO1FBQ25DLDJFQUEyRTtRQUMzRSxnRUFBZ0U7UUFDbkQseUJBQWUsR0FBRyxpQkFBaUIsQ0FBQztRQUNqRCwwQkFBMEI7UUFDYiwwQkFBZ0IsR0FBRyxrQkFBa0IsQ0FBQztJQUN2RCxDQUFDLEVBUmEsU0FBUyxHQUFULGdDQUFTLEtBQVQsZ0NBQVMsUUFRdEI7SUFZRCw0REFBNEQ7SUFDNUQsc0JBQTZCLE1BQWM7UUFDdkMsdUNBQXVDO1FBQ3ZDLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQ3ZDLE1BQU0sSUFBSSxLQUFLLENBQUMsNENBQTRDLENBQUMsQ0FBQztRQUNsRSxDQUFDO1FBRUQsTUFBTSxPQUFPLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxNQUFNLEdBQUMsQ0FBQyxDQUFDLENBQUM7UUFDN0QsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDL0IsQ0FBQztJQVJlLG1DQUFZLGVBUTNCLENBQUE7QUFDTCxDQUFDLEVBL0JnQixzQkFBc0IsR0FBdEIsOEJBQXNCLEtBQXRCLDhCQUFzQixRQStCdEMifQ==