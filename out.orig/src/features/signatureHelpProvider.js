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
const vscode_2 = require("vscode");
class OmniSharpSignatureHelpProvider extends abstractProvider_1.default {
    provideSignatureHelp(document, position, token) {
        let req = typeConvertion_1.createRequest(document, position);
        return serverUtils.signatureHelp(this._server, req, token).then(res => {
            if (!res) {
                return undefined;
            }
            let ret = new vscode_1.SignatureHelp();
            ret.activeSignature = res.ActiveSignature;
            ret.activeParameter = res.ActiveParameter;
            for (let signature of res.Signatures) {
                let signatureInfo = new vscode_1.SignatureInformation(signature.Label, signature.StructuredDocumentation.SummaryText);
                ret.signatures.push(signatureInfo);
                for (let parameter of signature.Parameters) {
                    let parameterInfo = new vscode_1.ParameterInformation(parameter.Label, this.GetParameterDocumentation(parameter));
                    signatureInfo.parameters.push(parameterInfo);
                }
            }
            return ret;
        });
    }
    GetParameterDocumentation(parameter) {
        let summary = parameter.Documentation;
        if (summary.length > 0) {
            let paramText = `**${parameter.Name}**: ${summary}`;
            return new vscode_2.MarkdownString(paramText);
        }
        return "";
    }
}
exports.default = OmniSharpSignatureHelpProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2lnbmF0dXJlSGVscFByb3ZpZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2ZlYXR1cmVzL3NpZ25hdHVyZUhlbHBQcm92aWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRztBQUVoRyxZQUFZLENBQUM7O0FBRWIseURBQWlEO0FBQ2pELGtEQUFrRDtBQUNsRCxnRUFBNEQ7QUFDNUQsbUNBQXFKO0FBQ3JKLG1DQUF3QztBQUd4QyxvQ0FBb0QsU0FBUSwwQkFBZTtJQUVoRSxvQkFBb0IsQ0FBQyxRQUFzQixFQUFFLFFBQWtCLEVBQUUsS0FBd0I7UUFFNUYsSUFBSSxHQUFHLEdBQUcsOEJBQWEsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFFNUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFO1lBRWxFLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDUCxNQUFNLENBQUMsU0FBUyxDQUFDO1lBQ3JCLENBQUM7WUFFRCxJQUFJLEdBQUcsR0FBRyxJQUFJLHNCQUFhLEVBQUUsQ0FBQztZQUM5QixHQUFHLENBQUMsZUFBZSxHQUFHLEdBQUcsQ0FBQyxlQUFlLENBQUM7WUFDMUMsR0FBRyxDQUFDLGVBQWUsR0FBRyxHQUFHLENBQUMsZUFBZSxDQUFDO1lBRTFDLEdBQUcsQ0FBQyxDQUFDLElBQUksU0FBUyxJQUFJLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO2dCQUVuQyxJQUFJLGFBQWEsR0FBRyxJQUFJLDZCQUFvQixDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsU0FBUyxDQUFDLHVCQUF1QixDQUFDLFdBQVcsQ0FBQyxDQUFDO2dCQUM3RyxHQUFHLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztnQkFFbkMsR0FBRyxDQUFDLENBQUMsSUFBSSxTQUFTLElBQUksU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7b0JBQ3pDLElBQUksYUFBYSxHQUFHLElBQUksNkJBQW9CLENBQ3hDLFNBQVMsQ0FBQyxLQUFLLEVBQ2YsSUFBSSxDQUFDLHlCQUF5QixDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7b0JBRS9DLGFBQWEsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO2dCQUNqRCxDQUFDO1lBQ0wsQ0FBQztZQUVELE1BQU0sQ0FBQyxHQUFHLENBQUM7UUFDZixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTyx5QkFBeUIsQ0FBQyxTQUFpQztRQUMvRCxJQUFJLE9BQU8sR0FBRyxTQUFTLENBQUMsYUFBYSxDQUFDO1FBQ3RDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNyQixJQUFJLFNBQVMsR0FBRyxLQUFLLFNBQVMsQ0FBQyxJQUFJLE9BQU8sT0FBTyxFQUFFLENBQUM7WUFDcEQsTUFBTSxDQUFDLElBQUksdUJBQWMsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUN6QyxDQUFDO1FBRUQsTUFBTSxDQUFDLEVBQUUsQ0FBQztJQUNkLENBQUM7Q0FDSjtBQTNDRCxpREEyQ0MifQ==