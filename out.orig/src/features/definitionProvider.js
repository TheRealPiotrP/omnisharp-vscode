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
class CSharpDefinitionProvider extends abstractProvider_1.default {
    constructor(server, reporter, definitionMetadataDocumentProvider) {
        super(server, reporter);
        this._definitionMetadataDocumentProvider = definitionMetadataDocumentProvider;
    }
    provideDefinition(document, position, token) {
        let req = typeConvertion_1.createRequest(document, position);
        req.WantMetadata = true;
        return serverUtils.goToDefinition(this._server, req, token).then(gotoDefinitionResponse => {
            // the defintion is in source
            if (gotoDefinitionResponse && gotoDefinitionResponse.FileName) {
                // if it is part of an already used metadata file, retrieve its uri instead of going to the physical file
                if (gotoDefinitionResponse.FileName.startsWith("$metadata$")) {
                    const uri = this._definitionMetadataDocumentProvider.getExistingMetadataResponseUri(gotoDefinitionResponse.FileName);
                    return typeConvertion_1.toLocationFromUri(uri, gotoDefinitionResponse);
                }
                // if it is a normal source definition, convert the response to a location
                return typeConvertion_1.toLocation(gotoDefinitionResponse);
                // the definition is in metadata
            }
            else if (gotoDefinitionResponse.MetadataSource) {
                const metadataSource = gotoDefinitionResponse.MetadataSource;
                // go to metadata endpoint for more information
                return serverUtils.getMetadata(this._server, {
                    Timeout: 5000,
                    AssemblyName: metadataSource.AssemblyName,
                    VersionNumber: metadataSource.VersionNumber,
                    ProjectName: metadataSource.ProjectName,
                    Language: metadataSource.Language,
                    TypeName: metadataSource.TypeName
                }).then(metadataResponse => {
                    if (!metadataResponse || !metadataResponse.Source || !metadataResponse.SourceName) {
                        return;
                    }
                    const uri = this._definitionMetadataDocumentProvider.addMetadataResponse(metadataResponse);
                    return new vscode_1.Location(uri, new vscode_1.Position(gotoDefinitionResponse.Line - 1, gotoDefinitionResponse.Column - 1));
                });
            }
        });
    }
}
exports.default = CSharpDefinitionProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVmaW5pdGlvblByb3ZpZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2ZlYXR1cmVzL2RlZmluaXRpb25Qcm92aWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRztBQUVoRyxZQUFZLENBQUM7O0FBRWIseURBQWlEO0FBRWpELGtEQUFrRDtBQUNsRCxnRUFBeUY7QUFDekYsbUNBQW9HO0FBSXBHLDhCQUE4QyxTQUFRLDBCQUFlO0lBR2pFLFlBQVksTUFBTSxFQUFDLFFBQTJCLEVBQUUsa0NBQXNFO1FBQ2xILEtBQUssQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFFeEIsSUFBSSxDQUFDLG1DQUFtQyxHQUFHLGtDQUFrQyxDQUFDO0lBQ2xGLENBQUM7SUFFTSxpQkFBaUIsQ0FBQyxRQUFzQixFQUFFLFFBQWtCLEVBQUUsS0FBd0I7UUFFekYsSUFBSSxHQUFHLEdBQTBCLDhCQUFhLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ25FLEdBQUcsQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDO1FBRXhCLE1BQU0sQ0FBQyxXQUFXLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxFQUFFO1lBRXRGLDZCQUE2QjtZQUM3QixFQUFFLENBQUMsQ0FBQyxzQkFBc0IsSUFBSSxzQkFBc0IsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO2dCQUU1RCx5R0FBeUc7Z0JBQ3pHLEVBQUUsQ0FBQyxDQUFDLHNCQUFzQixDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUMzRCxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsbUNBQW1DLENBQUMsOEJBQThCLENBQUMsc0JBQXNCLENBQUMsUUFBUSxDQUFDLENBQUM7b0JBQ3JILE1BQU0sQ0FBQyxrQ0FBaUIsQ0FBQyxHQUFHLEVBQUUsc0JBQXNCLENBQUMsQ0FBQztnQkFDMUQsQ0FBQztnQkFFRCwwRUFBMEU7Z0JBQzFFLE1BQU0sQ0FBQywyQkFBVSxDQUFDLHNCQUFzQixDQUFDLENBQUM7Z0JBRTlDLGdDQUFnQztZQUNoQyxDQUFDO1lBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLHNCQUFzQixDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUM7Z0JBQy9DLE1BQU0sY0FBYyxHQUFtQixzQkFBc0IsQ0FBQyxjQUFjLENBQUM7Z0JBRTdFLCtDQUErQztnQkFDL0MsTUFBTSxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBb0I7b0JBQzNELE9BQU8sRUFBRSxJQUFJO29CQUNiLFlBQVksRUFBRSxjQUFjLENBQUMsWUFBWTtvQkFDekMsYUFBYSxFQUFFLGNBQWMsQ0FBQyxhQUFhO29CQUMzQyxXQUFXLEVBQUUsY0FBYyxDQUFDLFdBQVc7b0JBQ3ZDLFFBQVEsRUFBRSxjQUFjLENBQUMsUUFBUTtvQkFDakMsUUFBUSxFQUFFLGNBQWMsQ0FBQyxRQUFRO2lCQUNwQyxDQUFDLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEVBQUU7b0JBQ3ZCLEVBQUUsQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO3dCQUNoRixNQUFNLENBQUM7b0JBQ1gsQ0FBQztvQkFFRCxNQUFNLEdBQUcsR0FBUSxJQUFJLENBQUMsbUNBQW1DLENBQUMsbUJBQW1CLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztvQkFDaEcsTUFBTSxDQUFDLElBQUksaUJBQVEsQ0FBQyxHQUFHLEVBQUUsSUFBSSxpQkFBUSxDQUFDLHNCQUFzQixDQUFDLElBQUksR0FBRyxDQUFDLEVBQUUsc0JBQXNCLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQy9HLENBQUMsQ0FBQyxDQUFDO1lBQ1AsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztDQUNKO0FBbkRELDJDQW1EQyJ9