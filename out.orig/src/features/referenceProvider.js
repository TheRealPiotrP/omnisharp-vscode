/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const abstractProvider_1 = require("./abstractProvider");
const serverUtils = require("../omnisharp/utils");
const typeConvertion_1 = require("../omnisharp/typeConvertion");
class OmnisharpReferenceProvider extends abstractProvider_1.default {
    provideReferences(document, position, options, token) {
        let req = typeConvertion_1.createRequest(document, position);
        req.OnlyThisFile = false;
        req.ExcludeDefinition = false;
        return serverUtils.findUsages(this._server, req, token).then(res => {
            if (res && Array.isArray(res.QuickFixes)) {
                return res.QuickFixes.map(typeConvertion_1.toLocation);
            }
        });
    }
}
exports.default = OmnisharpReferenceProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVmZXJlbmNlUHJvdmlkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvZmVhdHVyZXMvcmVmZXJlbmNlUHJvdmlkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7QUFFaEcsWUFBWSxDQUFDOztBQUViLHlEQUFpRDtBQUVqRCxrREFBa0Q7QUFDbEQsZ0VBQXNFO0FBR3RFLGdDQUFnRCxTQUFRLDBCQUFlO0lBRTVELGlCQUFpQixDQUFDLFFBQXNCLEVBQUUsUUFBa0IsRUFBRSxPQUF3QyxFQUFFLEtBQXdCO1FBRW5JLElBQUksR0FBRyxHQUFHLDhCQUFhLENBQTZCLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUN4RSxHQUFHLENBQUMsWUFBWSxHQUFHLEtBQUssQ0FBQztRQUN6QixHQUFHLENBQUMsaUJBQWlCLEdBQUcsS0FBSyxDQUFDO1FBRTlCLE1BQU0sQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUMvRCxFQUFFLENBQUMsQ0FBQyxHQUFHLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN2QyxNQUFNLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsMkJBQVUsQ0FBQyxDQUFDO1lBQzFDLENBQUM7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7Q0FDSjtBQWRELDZDQWNDIn0=