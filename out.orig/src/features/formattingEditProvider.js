/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const abstractProvider_1 = require("./abstractProvider");
const serverUtils = require("../omnisharp/utils");
const vscode_1 = require("vscode");
class FormattingSupport extends abstractProvider_1.default {
    provideDocumentRangeFormattingEdits(document, range, options, token) {
        let request = {
            FileName: document.fileName,
            Line: range.start.line + 1,
            Column: range.start.character + 1,
            EndLine: range.end.line + 1,
            EndColumn: range.end.character + 1
        };
        return serverUtils.formatRange(this._server, request, token).then(res => {
            if (res && Array.isArray(res.Changes)) {
                return res.Changes.map(FormattingSupport._asEditOptionation);
            }
        });
    }
    provideOnTypeFormattingEdits(document, position, ch, options, token) {
        let request = {
            FileName: document.fileName,
            Line: position.line + 1,
            Column: position.character + 1,
            Character: ch
        };
        return serverUtils.formatAfterKeystroke(this._server, request, token).then(res => {
            if (res && Array.isArray(res.Changes)) {
                return res.Changes.map(FormattingSupport._asEditOptionation);
            }
        });
    }
    static _asEditOptionation(change) {
        return new vscode_1.TextEdit(new vscode_1.Range(change.StartLine - 1, change.StartColumn - 1, change.EndLine - 1, change.EndColumn - 1), change.NewText);
    }
}
exports.default = FormattingSupport;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybWF0dGluZ0VkaXRQcm92aWRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9mZWF0dXJlcy9mb3JtYXR0aW5nRWRpdFByb3ZpZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHO0FBRWhHLFlBQVksQ0FBQzs7QUFFYix5REFBaUQ7QUFFakQsa0RBQWtEO0FBQ2xELG1DQUEwSTtBQUUxSSx1QkFBdUMsU0FBUSwwQkFBZTtJQUVuRCxtQ0FBbUMsQ0FBQyxRQUFzQixFQUFFLEtBQVksRUFBRSxPQUEwQixFQUFFLEtBQXdCO1FBRWpJLElBQUksT0FBTyxHQUFnQztZQUN2QyxRQUFRLEVBQUUsUUFBUSxDQUFDLFFBQVE7WUFDM0IsSUFBSSxFQUFFLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFHLENBQUM7WUFDMUIsTUFBTSxFQUFFLEtBQUssQ0FBQyxLQUFLLENBQUMsU0FBUyxHQUFHLENBQUM7WUFDakMsT0FBTyxFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLENBQUM7WUFDM0IsU0FBUyxFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsU0FBUyxHQUFHLENBQUM7U0FDckMsQ0FBQztRQUVGLE1BQU0sQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUNwRSxFQUFFLENBQUMsQ0FBQyxHQUFHLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNwQyxNQUFNLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUMsa0JBQWtCLENBQUMsQ0FBQztZQUNqRSxDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU0sNEJBQTRCLENBQUMsUUFBc0IsRUFBRSxRQUFrQixFQUFFLEVBQVUsRUFBRSxPQUEwQixFQUFFLEtBQXdCO1FBRTVJLElBQUksT0FBTyxHQUEwQztZQUNqRCxRQUFRLEVBQUUsUUFBUSxDQUFDLFFBQVE7WUFDM0IsSUFBSSxFQUFFLFFBQVEsQ0FBQyxJQUFJLEdBQUcsQ0FBQztZQUN2QixNQUFNLEVBQUUsUUFBUSxDQUFDLFNBQVMsR0FBRyxDQUFDO1lBQzlCLFNBQVMsRUFBRSxFQUFFO1NBQ2hCLENBQUM7UUFFRixNQUFNLENBQUMsV0FBVyxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUM3RSxFQUFFLENBQUMsQ0FBQyxHQUFHLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNwQyxNQUFNLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUMsa0JBQWtCLENBQUMsQ0FBQztZQUNqRSxDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU8sTUFBTSxDQUFDLGtCQUFrQixDQUFDLE1BQTJCO1FBQ3pELE1BQU0sQ0FBQyxJQUFJLGlCQUFRLENBQ2YsSUFBSSxjQUFLLENBQUMsTUFBTSxDQUFDLFNBQVMsR0FBRyxDQUFDLEVBQUUsTUFBTSxDQUFDLFdBQVcsR0FBRyxDQUFDLEVBQUUsTUFBTSxDQUFDLE9BQU8sR0FBRyxDQUFDLEVBQUUsTUFBTSxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUMsRUFDakcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ3hCLENBQUM7Q0FDSjtBQXhDRCxvQ0F3Q0MifQ==