"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
let Subscriber;
function SubscribeToAllLoggers(subscriber) {
    Subscriber = subscriber;
}
exports.SubscribeToAllLoggers = SubscribeToAllLoggers;
class Logger {
    constructor(writer, prefix) {
        this._indentLevel = 0;
        this._indentSize = 4;
        this._atLineStart = false;
        this._writer = writer;
        this._prefix = prefix;
    }
    _appendCore(message) {
        if (this._atLineStart) {
            if (this._indentLevel > 0) {
                const indent = " ".repeat(this._indentLevel * this._indentSize);
                this.write(indent);
            }
            if (this._prefix) {
                this.write(`[${this._prefix}] `);
            }
            this._atLineStart = false;
        }
        this.write(message);
    }
    increaseIndent() {
        this._indentLevel += 1;
    }
    decreaseIndent() {
        if (this._indentLevel > 0) {
            this._indentLevel -= 1;
        }
    }
    append(message) {
        message = message || "";
        this._appendCore(message);
    }
    appendLine(message) {
        message = message || "";
        this._appendCore(message + '\n');
        this._atLineStart = true;
    }
    write(message) {
        this._writer(message);
        if (Subscriber) {
            Subscriber(message);
        }
    }
}
exports.Logger = Logger;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2xvZ2dlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7OztnR0FHZ0c7O0FBRWhHLElBQUksVUFBcUMsQ0FBQztBQUUxQywrQkFBc0MsVUFBb0M7SUFDdEUsVUFBVSxHQUFHLFVBQVUsQ0FBQztBQUM1QixDQUFDO0FBRkQsc0RBRUM7QUFFRDtJQVFJLFlBQVksTUFBaUMsRUFBRSxNQUFlO1FBSnRELGlCQUFZLEdBQVcsQ0FBQyxDQUFDO1FBQ3pCLGdCQUFXLEdBQVcsQ0FBQyxDQUFDO1FBQ3hCLGlCQUFZLEdBQVksS0FBSyxDQUFDO1FBR2xDLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO1FBQ3RCLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO0lBQzFCLENBQUM7SUFFTyxXQUFXLENBQUMsT0FBZTtRQUMvQixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztZQUNwQixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3hCLE1BQU0sTUFBTSxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7Z0JBQ2hFLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDdkIsQ0FBQztZQUVELEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO2dCQUNmLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUMsT0FBTyxJQUFJLENBQUMsQ0FBQztZQUNyQyxDQUFDO1lBRUQsSUFBSSxDQUFDLFlBQVksR0FBRyxLQUFLLENBQUM7UUFDOUIsQ0FBQztRQUVELElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDeEIsQ0FBQztJQUVNLGNBQWM7UUFDakIsSUFBSSxDQUFDLFlBQVksSUFBSSxDQUFDLENBQUM7SUFDM0IsQ0FBQztJQUVNLGNBQWM7UUFDakIsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3hCLElBQUksQ0FBQyxZQUFZLElBQUksQ0FBQyxDQUFDO1FBQzNCLENBQUM7SUFDTCxDQUFDO0lBRU0sTUFBTSxDQUFDLE9BQWdCO1FBQzFCLE9BQU8sR0FBRyxPQUFPLElBQUksRUFBRSxDQUFDO1FBQ3hCLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDOUIsQ0FBQztJQUVNLFVBQVUsQ0FBQyxPQUFnQjtRQUM5QixPQUFPLEdBQUcsT0FBTyxJQUFJLEVBQUUsQ0FBQztRQUN4QixJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsQ0FBQztRQUNqQyxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQztJQUM3QixDQUFDO0lBRU8sS0FBSyxDQUFDLE9BQWU7UUFDekIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUV0QixFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1lBQ2IsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3hCLENBQUM7SUFDTCxDQUFDO0NBQ0o7QUExREQsd0JBMERDIn0=