/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const abstractProvider_1 = require("./abstractProvider");
const serverUtils = require("../omnisharp/utils");
const typeConvertion_1 = require("../omnisharp/typeConvertion");
class OmnisharpDocumentSymbolProvider extends abstractProvider_1.default {
    provideDocumentSymbols(document, token) {
        return serverUtils.currentFileMembersAsTree(this._server, { FileName: document.fileName }, token).then(tree => {
            let ret = [];
            for (let node of tree.TopLevelTypeDefinitions) {
                typeConvertion_1.toDocumentSymbol(ret, node);
            }
            return ret;
        });
    }
}
exports.default = OmnisharpDocumentSymbolProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG9jdW1lbnRTeW1ib2xQcm92aWRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9mZWF0dXJlcy9kb2N1bWVudFN5bWJvbFByb3ZpZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHO0FBRWhHLFlBQVksQ0FBQzs7QUFFYix5REFBaUQ7QUFDakQsa0RBQWtEO0FBQ2xELGdFQUE2RDtBQUc3RCxxQ0FBcUQsU0FBUSwwQkFBZTtJQUVqRSxzQkFBc0IsQ0FBQyxRQUFzQixFQUFFLEtBQXdCO1FBRTFFLE1BQU0sQ0FBQyxXQUFXLENBQUMsd0JBQXdCLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxFQUFFLFFBQVEsRUFBRSxRQUFRLENBQUMsUUFBUSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQzFHLElBQUksR0FBRyxHQUF3QixFQUFFLENBQUM7WUFDbEMsR0FBRyxDQUFDLENBQUMsSUFBSSxJQUFJLElBQUksSUFBSSxDQUFDLHVCQUF1QixDQUFDLENBQUMsQ0FBQztnQkFDNUMsaUNBQWdCLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ2hDLENBQUM7WUFDRCxNQUFNLENBQUMsR0FBRyxDQUFDO1FBQ2YsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0NBQ0o7QUFaRCxrREFZQyJ9