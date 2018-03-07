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
class OmnisharpWorkspaceSymbolProvider extends abstractProvider_1.default {
    provideWorkspaceSymbols(search, token) {
        return serverUtils.findSymbols(this._server, { Filter: search, FileName: '' }, token).then(res => {
            if (res && Array.isArray(res.QuickFixes)) {
                return res.QuickFixes.map(OmnisharpWorkspaceSymbolProvider._asSymbolInformation);
            }
        });
    }
    static _asSymbolInformation(symbolInfo) {
        return new vscode_1.SymbolInformation(symbolInfo.Text, OmnisharpWorkspaceSymbolProvider._toKind(symbolInfo), typeConvertion_1.toRange(symbolInfo), vscode_1.Uri.file(symbolInfo.FileName));
    }
    static _toKind(symbolInfo) {
        switch (symbolInfo.Kind) {
            case 'Method':
                return vscode_1.SymbolKind.Method;
            case 'Field':
                return vscode_1.SymbolKind.Field;
            case 'Property':
                return vscode_1.SymbolKind.Property;
            case 'Interface':
                return vscode_1.SymbolKind.Interface;
            case 'Enum':
                return vscode_1.SymbolKind.Enum;
            case 'Struct':
                return vscode_1.SymbolKind.Struct;
            case 'Event':
                return vscode_1.SymbolKind.Event;
            case 'EnumMember':
                return vscode_1.SymbolKind.EnumMember;
            case 'Class':
                return vscode_1.SymbolKind.Class;
            default:
                return vscode_1.SymbolKind.Class;
        }
    }
}
exports.default = OmnisharpWorkspaceSymbolProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya3NwYWNlU3ltYm9sUHJvdmlkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvZmVhdHVyZXMvd29ya3NwYWNlU3ltYm9sUHJvdmlkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7QUFFaEcsWUFBWSxDQUFDOztBQUViLHlEQUFpRDtBQUVqRCxrREFBa0Q7QUFDbEQsZ0VBQW9EO0FBQ3BELG1DQUFzRztBQUd0RyxzQ0FBc0QsU0FBUSwwQkFBZTtJQUVsRSx1QkFBdUIsQ0FBQyxNQUFjLEVBQUUsS0FBd0I7UUFFbkUsTUFBTSxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUM3RixFQUFFLENBQUMsQ0FBQyxHQUFHLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN2QyxNQUFNLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsZ0NBQWdDLENBQUMsb0JBQW9CLENBQUMsQ0FBQztZQUNyRixDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU8sTUFBTSxDQUFDLG9CQUFvQixDQUFDLFVBQW1DO1FBRW5FLE1BQU0sQ0FBQyxJQUFJLDBCQUFpQixDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsZ0NBQWdDLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxFQUM5Rix3QkFBTyxDQUFDLFVBQVUsQ0FBQyxFQUNuQixZQUFHLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO0lBQ3ZDLENBQUM7SUFFTyxNQUFNLENBQUMsT0FBTyxDQUFDLFVBQW1DO1FBQ3RELE1BQU0sQ0FBQyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ3RCLEtBQUssUUFBUTtnQkFDVCxNQUFNLENBQUMsbUJBQVUsQ0FBQyxNQUFNLENBQUM7WUFDN0IsS0FBSyxPQUFPO2dCQUNSLE1BQU0sQ0FBQyxtQkFBVSxDQUFDLEtBQUssQ0FBQztZQUM1QixLQUFLLFVBQVU7Z0JBQ1gsTUFBTSxDQUFDLG1CQUFVLENBQUMsUUFBUSxDQUFDO1lBQy9CLEtBQUssV0FBVztnQkFDWixNQUFNLENBQUMsbUJBQVUsQ0FBQyxTQUFTLENBQUM7WUFDaEMsS0FBSyxNQUFNO2dCQUNQLE1BQU0sQ0FBQyxtQkFBVSxDQUFDLElBQUksQ0FBQztZQUMzQixLQUFLLFFBQVE7Z0JBQ1QsTUFBTSxDQUFDLG1CQUFVLENBQUMsTUFBTSxDQUFDO1lBQzdCLEtBQUssT0FBTztnQkFDUixNQUFNLENBQUMsbUJBQVUsQ0FBQyxLQUFLLENBQUM7WUFDNUIsS0FBSyxZQUFZO2dCQUNiLE1BQU0sQ0FBQyxtQkFBVSxDQUFDLFVBQVUsQ0FBQztZQUNqQyxLQUFLLE9BQU87Z0JBQ1IsTUFBTSxDQUFDLG1CQUFVLENBQUMsS0FBSyxDQUFDO1lBQzVCO2dCQUNJLE1BQU0sQ0FBQyxtQkFBVSxDQUFDLEtBQUssQ0FBQztRQUVoQyxDQUFDO0lBQ0wsQ0FBQztDQUNKO0FBM0NELG1EQTJDQyJ9