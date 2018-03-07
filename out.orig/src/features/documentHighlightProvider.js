/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const abstractProvider_1 = require("./abstractProvider");
const serverUtils = require("../omnisharp/utils");
const typeConvertion_1 = require("../omnisharp/typeConvertion");
const vscode_1 = require("vscode");
class OmnisharpDocumentHighlightProvider extends abstractProvider_1.default {
    provideDocumentHighlights(resource, position, token) {
        let req = typeConvertion_1.createRequest(resource, position);
        req.OnlyThisFile = true;
        req.ExcludeDefinition = false;
        return serverUtils.findUsages(this._server, req, token).then(res => {
            if (res && Array.isArray(res.QuickFixes)) {
                return res.QuickFixes.map(OmnisharpDocumentHighlightProvider._asDocumentHighlight);
            }
        });
    }
    static _asDocumentHighlight(quickFix) {
        return new vscode_1.DocumentHighlight(typeConvertion_1.toRange(quickFix), vscode_1.DocumentHighlightKind.Read);
    }
}
exports.default = OmnisharpDocumentHighlightProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG9jdW1lbnRIaWdobGlnaHRQcm92aWRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9mZWF0dXJlcy9kb2N1bWVudEhpZ2hsaWdodFByb3ZpZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHO0FBRWhHLFlBQVksQ0FBQzs7QUFFYix5REFBaUQ7QUFFakQsa0RBQWtEO0FBQ2xELGdFQUFtRTtBQUNuRSxtQ0FBc0k7QUFFdEksd0NBQXdELFNBQVEsMEJBQWU7SUFFcEUseUJBQXlCLENBQUMsUUFBc0IsRUFBRSxRQUFrQixFQUFFLEtBQXdCO1FBRWpHLElBQUksR0FBRyxHQUFHLDhCQUFhLENBQTZCLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUN4RSxHQUFHLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQztRQUN4QixHQUFHLENBQUMsaUJBQWlCLEdBQUcsS0FBSyxDQUFDO1FBRTlCLE1BQU0sQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUMvRCxFQUFFLENBQUMsQ0FBQyxHQUFHLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN2QyxNQUFNLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsa0NBQWtDLENBQUMsb0JBQW9CLENBQUMsQ0FBQztZQUN2RixDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU8sTUFBTSxDQUFDLG9CQUFvQixDQUFDLFFBQTJCO1FBQzNELE1BQU0sQ0FBQyxJQUFJLDBCQUFpQixDQUFDLHdCQUFPLENBQUMsUUFBUSxDQUFDLEVBQUUsOEJBQXFCLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDaEYsQ0FBQztDQUNKO0FBbEJELHFEQWtCQyJ9