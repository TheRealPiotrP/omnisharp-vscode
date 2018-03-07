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
const documentation_1 = require("./documentation");
class OmniSharpHoverProvider extends abstractProvider_1.default {
    provideHover(document, position, token) {
        let req = typeConvertion_1.createRequest(document, position);
        req.IncludeDocumentation = true;
        return serverUtils.typeLookup(this._server, req, token).then(value => {
            if (value && value.Type) {
                let documentation = documentation_1.GetDocumentationString(value.StructuredDocumentation);
                let contents = [documentation, { language: 'csharp', value: value.Type }];
                return new vscode_1.Hover(contents);
            }
        });
    }
}
exports.default = OmniSharpHoverProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaG92ZXJQcm92aWRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9mZWF0dXJlcy9ob3ZlclByb3ZpZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHO0FBRWhHLFlBQVksQ0FBQzs7QUFFYix5REFBaUQ7QUFFakQsa0RBQWtEO0FBQ2xELGdFQUE0RDtBQUM1RCxtQ0FBeUY7QUFDekYsbURBQXlEO0FBRXpELDRCQUE0QyxTQUFRLDBCQUFlO0lBRXhELFlBQVksQ0FBQyxRQUFzQixFQUFFLFFBQWtCLEVBQUUsS0FBd0I7UUFFcEYsSUFBSSxHQUFHLEdBQUcsOEJBQWEsQ0FBNkIsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ3hFLEdBQUcsQ0FBQyxvQkFBb0IsR0FBRyxJQUFJLENBQUM7UUFFaEMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQ2pFLEVBQUUsQ0FBQyxDQUFDLEtBQUssSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDdEIsSUFBSSxhQUFhLEdBQUcsc0NBQXNCLENBQUMsS0FBSyxDQUFDLHVCQUF1QixDQUFDLENBQUM7Z0JBQzFFLElBQUksUUFBUSxHQUFHLENBQUMsYUFBYSxFQUFFLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7Z0JBQzFFLE1BQU0sQ0FBQyxJQUFJLGNBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUMvQixDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0NBQ0o7QUFmRCx5Q0FlQyJ9