/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const ImmedateDelayMax = 25;
const NearImmediateDelayMax = 50;
const ShortDelayMax = 250;
const MediumDelayMax = 500;
const IdleDelayMax = 1500;
const NonFocusDelayMax = 3000;
class DelayTracker {
    constructor(name) {
        this._immediateDelays = 0; // 0-25 milliseconds
        this._nearImmediateDelays = 0; // 26-50 milliseconds
        this._shortDelays = 0; // 51-250 milliseconds
        this._mediumDelays = 0; // 251-500 milliseconds
        this._idleDelays = 0; // 501-1500 milliseconds
        this._nonFocusDelays = 0; // 1501-3000 milliseconds
        this._bigDelays = 0; // 3000+ milliseconds
        this._name = name;
    }
    reportDelay(elapsedTime) {
        if (elapsedTime <= ImmedateDelayMax) {
            this._immediateDelays += 1;
        }
        else if (elapsedTime <= NearImmediateDelayMax) {
            this._nearImmediateDelays += 1;
        }
        else if (elapsedTime <= ShortDelayMax) {
            this._shortDelays += 1;
        }
        else if (elapsedTime <= MediumDelayMax) {
            this._mediumDelays += 1;
        }
        else if (elapsedTime <= IdleDelayMax) {
            this._idleDelays += 1;
        }
        else if (elapsedTime <= NonFocusDelayMax) {
            this._nonFocusDelays += 1;
        }
        else {
            this._bigDelays += 1;
        }
    }
    name() {
        return this._name;
    }
    clearMeasures() {
        this._immediateDelays = 0;
        this._nearImmediateDelays = 0;
        this._shortDelays = 0;
        this._mediumDelays = 0;
        this._idleDelays = 0;
        this._nonFocusDelays = 0;
        this._bigDelays = 0;
    }
    hasMeasures() {
        return this._immediateDelays > 0
            || this._nearImmediateDelays > 0
            || this._shortDelays > 0
            || this._mediumDelays > 0
            || this._idleDelays > 0
            || this._nonFocusDelays > 0
            || this._bigDelays > 0;
    }
    getMeasures() {
        return {
            immediateDelays: this._immediateDelays,
            nearImmediateDelays: this._nearImmediateDelays,
            shortDelays: this._shortDelays,
            mediumDelays: this._mediumDelays,
            idleDelays: this._idleDelays,
            nonFocusDelays: this._nonFocusDelays,
            bigDelays: this._bigDelays
        };
    }
}
exports.DelayTracker = DelayTracker;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVsYXlUcmFja2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL29tbmlzaGFycC9kZWxheVRyYWNrZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7QUFFaEcsWUFBWSxDQUFDOztBQUViLE1BQU0sZ0JBQWdCLEdBQUcsRUFBRSxDQUFDO0FBQzVCLE1BQU0scUJBQXFCLEdBQUcsRUFBRSxDQUFDO0FBQ2pDLE1BQU0sYUFBYSxHQUFHLEdBQUcsQ0FBQztBQUMxQixNQUFNLGNBQWMsR0FBRyxHQUFHLENBQUM7QUFDM0IsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDO0FBQzFCLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDO0FBRTlCO0lBV0ksWUFBWSxJQUFZO1FBUmhCLHFCQUFnQixHQUFXLENBQUMsQ0FBQyxDQUFNLG9CQUFvQjtRQUN2RCx5QkFBb0IsR0FBVyxDQUFDLENBQUMsQ0FBRSxxQkFBcUI7UUFDeEQsaUJBQVksR0FBVyxDQUFDLENBQUMsQ0FBVSxzQkFBc0I7UUFDekQsa0JBQWEsR0FBVyxDQUFDLENBQUMsQ0FBUyx1QkFBdUI7UUFDMUQsZ0JBQVcsR0FBVyxDQUFDLENBQUMsQ0FBVyx3QkFBd0I7UUFDM0Qsb0JBQWUsR0FBVyxDQUFDLENBQUMsQ0FBTyx5QkFBeUI7UUFDNUQsZUFBVSxHQUFXLENBQUMsQ0FBQyxDQUFZLHFCQUFxQjtRQUc1RCxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztJQUN0QixDQUFDO0lBRU0sV0FBVyxDQUFDLFdBQW1CO1FBQ2xDLEVBQUUsQ0FBQyxDQUFDLFdBQVcsSUFBSSxnQkFBZ0IsQ0FBQyxDQUFDLENBQUM7WUFDbEMsSUFBSSxDQUFDLGdCQUFnQixJQUFJLENBQUMsQ0FBQztRQUMvQixDQUFDO1FBQ0QsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFdBQVcsSUFBSSxxQkFBcUIsQ0FBQyxDQUFDLENBQUM7WUFDNUMsSUFBSSxDQUFDLG9CQUFvQixJQUFJLENBQUMsQ0FBQztRQUNuQyxDQUFDO1FBQ0QsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFdBQVcsSUFBSSxhQUFhLENBQUMsQ0FBQyxDQUFDO1lBQ3BDLElBQUksQ0FBQyxZQUFZLElBQUksQ0FBQyxDQUFDO1FBQzNCLENBQUM7UUFDRCxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsV0FBVyxJQUFJLGNBQWMsQ0FBQyxDQUFDLENBQUM7WUFDckMsSUFBSSxDQUFDLGFBQWEsSUFBSSxDQUFDLENBQUM7UUFDNUIsQ0FBQztRQUNELElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxXQUFXLElBQUksWUFBWSxDQUFDLENBQUMsQ0FBQztZQUNuQyxJQUFJLENBQUMsV0FBVyxJQUFJLENBQUMsQ0FBQztRQUMxQixDQUFDO1FBQ0QsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFdBQVcsSUFBSSxnQkFBZ0IsQ0FBQyxDQUFDLENBQUM7WUFDdkMsSUFBSSxDQUFDLGVBQWUsSUFBSSxDQUFDLENBQUM7UUFDOUIsQ0FBQztRQUNELElBQUksQ0FBQyxDQUFDO1lBQ0YsSUFBSSxDQUFDLFVBQVUsSUFBSSxDQUFDLENBQUM7UUFDekIsQ0FBQztJQUNMLENBQUM7SUFFTSxJQUFJO1FBQ1AsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7SUFDdEIsQ0FBQztJQUVNLGFBQWE7UUFDaEIsSUFBSSxDQUFDLGdCQUFnQixHQUFHLENBQUMsQ0FBQztRQUMxQixJQUFJLENBQUMsb0JBQW9CLEdBQUcsQ0FBQyxDQUFDO1FBQzlCLElBQUksQ0FBQyxZQUFZLEdBQUcsQ0FBQyxDQUFDO1FBQ3RCLElBQUksQ0FBQyxhQUFhLEdBQUcsQ0FBQyxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDO1FBQ3JCLElBQUksQ0FBQyxlQUFlLEdBQUcsQ0FBQyxDQUFDO1FBQ3pCLElBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDO0lBQ3hCLENBQUM7SUFFTSxXQUFXO1FBQ2QsTUFBTSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxDQUFDO2VBQ3pCLElBQUksQ0FBQyxvQkFBb0IsR0FBRyxDQUFDO2VBQzdCLElBQUksQ0FBQyxZQUFZLEdBQUcsQ0FBQztlQUNyQixJQUFJLENBQUMsYUFBYSxHQUFHLENBQUM7ZUFDdEIsSUFBSSxDQUFDLFdBQVcsR0FBRyxDQUFDO2VBQ3BCLElBQUksQ0FBQyxlQUFlLEdBQUcsQ0FBQztlQUN4QixJQUFJLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQztJQUMvQixDQUFDO0lBRU0sV0FBVztRQUNkLE1BQU0sQ0FBQztZQUNILGVBQWUsRUFBRSxJQUFJLENBQUMsZ0JBQWdCO1lBQ3RDLG1CQUFtQixFQUFFLElBQUksQ0FBQyxvQkFBb0I7WUFDOUMsV0FBVyxFQUFFLElBQUksQ0FBQyxZQUFZO1lBQzlCLFlBQVksRUFBRSxJQUFJLENBQUMsYUFBYTtZQUNoQyxVQUFVLEVBQUUsSUFBSSxDQUFDLFdBQVc7WUFDNUIsY0FBYyxFQUFFLElBQUksQ0FBQyxlQUFlO1lBQ3BDLFNBQVMsRUFBRSxJQUFJLENBQUMsVUFBVTtTQUM3QixDQUFDO0lBQ04sQ0FBQztDQUNKO0FBMUVELG9DQTBFQyJ9