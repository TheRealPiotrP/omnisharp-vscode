"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
function poll(getValue, duration, step) {
    return __awaiter(this, void 0, void 0, function* () {
        while (duration > 0) {
            let value = yield getValue();
            if (value) {
                return value;
            }
            yield sleep(step);
            duration -= step;
        }
        throw new Error("Polling did not succeed within the alotted duration.");
    });
}
exports.default = poll;
function sleep(ms = 0) {
    return new Promise(r => setTimeout(r, ms));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9sbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3Rlc3QvaW50ZWdyYXRpb25UZXN0cy9wb2xsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O2dHQUdnRzs7Ozs7Ozs7OztBQUVoRyxjQUFzQyxRQUFpQixFQUFFLFFBQWdCLEVBQUUsSUFBWTs7UUFDbkYsT0FBTyxRQUFRLEdBQUcsQ0FBQyxFQUFFLENBQUM7WUFDbEIsSUFBSSxLQUFLLEdBQUcsTUFBTSxRQUFRLEVBQUUsQ0FBQztZQUU3QixFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO2dCQUNSLE1BQU0sQ0FBQyxLQUFLLENBQUM7WUFDakIsQ0FBQztZQUVELE1BQU0sS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRWxCLFFBQVEsSUFBSSxJQUFJLENBQUM7UUFDckIsQ0FBQztRQUVELE1BQU0sSUFBSSxLQUFLLENBQUMsc0RBQXNELENBQUMsQ0FBQztJQUM1RSxDQUFDO0NBQUE7QUFkRCx1QkFjQztBQUVELGVBQWUsRUFBRSxHQUFHLENBQUM7SUFDakIsTUFBTSxDQUFDLElBQUksT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQy9DLENBQUMifQ==