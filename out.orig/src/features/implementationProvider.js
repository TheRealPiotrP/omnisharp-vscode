/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const abstractProvider_1 = require("./abstractProvider");
const serverUtils = require("../omnisharp/utils");
const typeConvertion_1 = require("../omnisharp/typeConvertion");
class CSharpImplementationProvider extends abstractProvider_1.default {
    provideImplementation(document, position, token) {
        const request = typeConvertion_1.createRequest(document, position);
        return serverUtils.findImplementations(this._server, request, token).then(response => {
            if (!response || !response.QuickFixes) {
                return;
            }
            return response.QuickFixes.map(fix => typeConvertion_1.toLocation(fix));
        });
    }
}
exports.default = CSharpImplementationProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW1wbGVtZW50YXRpb25Qcm92aWRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9mZWF0dXJlcy9pbXBsZW1lbnRhdGlvblByb3ZpZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHO0FBRWhHLFlBQVksQ0FBQzs7QUFFYix5REFBaUQ7QUFFakQsa0RBQWtEO0FBQ2xELGdFQUF3RTtBQUd4RSxrQ0FBa0QsU0FBUSwwQkFBZTtJQUM5RCxxQkFBcUIsQ0FBQyxRQUFzQixFQUFFLFFBQWtCLEVBQUUsS0FBd0I7UUFDN0YsTUFBTSxPQUFPLEdBQStCLDhCQUFhLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBRTlFLE1BQU0sQ0FBQyxXQUFXLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFO1lBQ2pGLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7Z0JBQ3BDLE1BQU0sQ0FBQztZQUNYLENBQUM7WUFFRCxNQUFNLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQywyQkFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDM0QsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0NBQ0o7QUFaRCwrQ0FZQyJ9