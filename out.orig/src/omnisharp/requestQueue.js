"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const prioritization = require("./prioritization");
/**
 * This data structure manages a queue of requests that have been made and requests that have been
 * sent to the OmniSharp server and are waiting on a response.
 */
class RequestQueue {
    constructor(_name, _maxSize, _logger, _makeRequest) {
        this._name = _name;
        this._maxSize = _maxSize;
        this._logger = _logger;
        this._makeRequest = _makeRequest;
        this._pending = [];
        this._waiting = new Map();
    }
    /**
     * Enqueue a new request.
     */
    enqueue(request) {
        this._logger.appendLine(`Enqueue ${this._name} request for ${request.command}.`);
        this._pending.push(request);
    }
    /**
     * Dequeue a request that has completed.
     */
    dequeue(id) {
        const request = this._waiting.get(id);
        if (request) {
            this._waiting.delete(id);
            this._logger.appendLine(`Dequeue ${this._name} request for ${request.command} (${id}).`);
        }
        return request;
    }
    cancelRequest(request) {
        let index = this._pending.indexOf(request);
        if (index !== -1) {
            this._pending.splice(index, 1);
            // Note: This calls reject() on the promise returned by OmniSharpServer.makeRequest
            request.onError(new Error(`Pending request cancelled: ${request.command}`));
        }
        // TODO: Handle cancellation of a request already waiting on the OmniSharp server.
    }
    /**
     * Returns true if there are any requests pending to be sent to the OmniSharp server.
     */
    hasPending() {
        return this._pending.length > 0;
    }
    /**
     * Returns true if the maximum number of requests waiting on the OmniSharp server has been reached.
     */
    isFull() {
        return this._waiting.size >= this._maxSize;
    }
    /**
     * Process any pending requests and send them to the OmniSharp server.
     */
    processPending() {
        if (this._pending.length === 0) {
            return;
        }
        this._logger.appendLine(`Processing ${this._name} queue`);
        this._logger.increaseIndent();
        const slots = this._maxSize - this._waiting.size;
        for (let i = 0; i < slots && this._pending.length > 0; i++) {
            const item = this._pending.shift();
            item.startTime = Date.now();
            const id = this._makeRequest(item);
            this._waiting.set(id, item);
            if (this.isFull()) {
                break;
            }
        }
        this._logger.decreaseIndent();
    }
}
class RequestQueueCollection {
    constructor(logger, concurrency, makeRequest) {
        this._priorityQueue = new RequestQueue('Priority', 1, logger, makeRequest);
        this._normalQueue = new RequestQueue('Normal', concurrency, logger, makeRequest);
        this._deferredQueue = new RequestQueue('Deferred', Math.max(Math.floor(concurrency / 4), 2), logger, makeRequest);
    }
    getQueue(command) {
        if (prioritization.isPriorityCommand(command)) {
            return this._priorityQueue;
        }
        else if (prioritization.isNormalCommand(command)) {
            return this._normalQueue;
        }
        else {
            return this._deferredQueue;
        }
    }
    isEmpty() {
        return !this._deferredQueue.hasPending()
            && !this._normalQueue.hasPending()
            && !this._priorityQueue.hasPending();
    }
    enqueue(request) {
        const queue = this.getQueue(request.command);
        queue.enqueue(request);
        this.drain();
    }
    dequeue(command, seq) {
        const queue = this.getQueue(command);
        return queue.dequeue(seq);
    }
    cancelRequest(request) {
        const queue = this.getQueue(request.command);
        queue.cancelRequest(request);
    }
    drain() {
        if (this._isProcessing) {
            return false;
        }
        if (this._priorityQueue.isFull()) {
            return false;
        }
        if (this._normalQueue.isFull() && this._deferredQueue.isFull()) {
            return false;
        }
        this._isProcessing = true;
        if (this._priorityQueue.hasPending()) {
            this._priorityQueue.processPending();
            this._isProcessing = false;
            return;
        }
        if (this._normalQueue.hasPending()) {
            this._normalQueue.processPending();
        }
        if (this._deferredQueue.hasPending()) {
            this._deferredQueue.processPending();
        }
        this._isProcessing = false;
    }
}
exports.RequestQueueCollection = RequestQueueCollection;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVxdWVzdFF1ZXVlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL29tbmlzaGFycC9yZXF1ZXN0UXVldWUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Z0dBR2dHOztBQUdoRyxtREFBbUQ7QUFXbkQ7OztHQUdHO0FBQ0g7SUFJSSxZQUNZLEtBQWEsRUFDYixRQUFnQixFQUNoQixPQUFlLEVBQ2YsWUFBMEM7UUFIMUMsVUFBSyxHQUFMLEtBQUssQ0FBUTtRQUNiLGFBQVEsR0FBUixRQUFRLENBQVE7UUFDaEIsWUFBTyxHQUFQLE9BQU8sQ0FBUTtRQUNmLGlCQUFZLEdBQVosWUFBWSxDQUE4QjtRQVA5QyxhQUFRLEdBQWMsRUFBRSxDQUFDO1FBQ3pCLGFBQVEsR0FBeUIsSUFBSSxHQUFHLEVBQW1CLENBQUM7SUFPcEUsQ0FBQztJQUVEOztPQUVHO0lBQ0ksT0FBTyxDQUFDLE9BQWdCO1FBQzNCLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLFdBQVcsSUFBSSxDQUFDLEtBQUssZ0JBQWdCLE9BQU8sQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDO1FBQ2pGLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ2hDLENBQUM7SUFFRDs7T0FFRztJQUNJLE9BQU8sQ0FBQyxFQUFVO1FBQ3JCLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBRXRDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFDVixJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUN6QixJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxXQUFXLElBQUksQ0FBQyxLQUFLLGdCQUFnQixPQUFPLENBQUMsT0FBTyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDN0YsQ0FBQztRQUVELE1B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