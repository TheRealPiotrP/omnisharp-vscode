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
class OmnisharpRenameProvider extends abstractProvider_1.default {
    provideRenameEdits(document, position, newName, token) {
        let req = typeConvertion_1.createRequest(document, position);
        req.WantsTextChanges = true;
        req.RenameTo = newName;
        return serverUtils.rename(this._server, req, token).then(response => {
            if (!response) {
                return;
            }
            const edit = new vscode_1.WorkspaceEdit();
            response.Changes.forEach(change => {
                const uri = vscode_1.Uri.file(change.FileName);
                change.Changes.forEach(change => {
                    edit.replace(uri, new vscode_1.Range(change.StartLine - 1, change.StartColumn - 1, change.EndLine - 1, change.EndColumn - 1), change.NewText);
                });
            });
            return edit;
        });
    }
}
exports.default = OmnisharpRenameProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVuYW1lUHJvdmlkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvZmVhdHVyZXMvcmVuYW1lUHJvdmlkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7QUFFaEcsWUFBWSxDQUFDOztBQUViLHlEQUFpRDtBQUVqRCxrREFBa0Q7QUFDbEQsZ0VBQTBEO0FBQzFELG1DQUE0RztBQUU1Ryw2QkFBNkMsU0FBUSwwQkFBZTtJQUV6RCxrQkFBa0IsQ0FBQyxRQUFzQixFQUFFLFFBQWtCLEVBQUUsT0FBZSxFQUFFLEtBQXdCO1FBRTNHLElBQUksR0FBRyxHQUFHLDhCQUFhLENBQXlCLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUNwRSxHQUFHLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDO1FBQzVCLEdBQUcsQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDO1FBRXZCLE1BQU0sQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRTtZQUVoRSxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7Z0JBQ1osTUFBTSxDQUFDO1lBQ1gsQ0FBQztZQUVELE1BQU0sSUFBSSxHQUFHLElBQUksc0JBQWEsRUFBRSxDQUFDO1lBQ2pDLFFBQVEsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFO2dCQUM5QixNQUFNLEdBQUcsR0FBRyxZQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDdEMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUU7b0JBQzVCLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUNaLElBQUksY0FBSyxDQUFDLE1BQU0sQ0FBQyxTQUFTLEdBQUcsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxXQUFXLEdBQUcsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxPQUFPLEdBQUcsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDLEVBQ2pHLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDeEIsQ0FBQyxDQUFDLENBQUM7WUFDUCxDQUFDLENBQUMsQ0FBQztZQUVILE1BQU0sQ0FBQyxJQUFJLENBQUM7UUFDaEIsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0NBQ0o7QUEzQkQsMENBMkJDIn0=