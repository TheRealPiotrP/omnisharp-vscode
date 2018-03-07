/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
function toLocation(location) {
    const fileName = vscode.Uri.file(location.FileName);
    return toLocationFromUri(fileName, location);
}
exports.toLocation = toLocation;
function toLocationFromUri(uri, location) {
    const position = new vscode.Position(location.Line - 1, location.Column - 1);
    const endLine = location.EndLine;
    const endColumn = location.EndColumn;
    if (endLine !== undefined && endColumn !== undefined) {
        const endPosition = new vscode.Position(endLine - 1, endColumn - 1);
        return new vscode.Location(uri, new vscode.Range(position, endPosition));
    }
    return new vscode.Location(uri, position);
}
exports.toLocationFromUri = toLocationFromUri;
function toRange(rangeLike) {
    let { Line, Column, EndLine, EndColumn } = rangeLike;
    return new vscode.Range(Line - 1, Column - 1, EndLine - 1, EndColumn - 1);
}
exports.toRange = toRange;
function toRange2(rangeLike) {
    let { StartLine, StartColumn, EndLine, EndColumn } = rangeLike;
    return new vscode.Range(StartLine - 1, StartColumn - 1, EndLine - 1, EndColumn - 1);
}
exports.toRange2 = toRange2;
function createRequest(document, where, includeBuffer = false) {
    let Line, Column;
    if (where instanceof vscode.Position) {
        Line = where.line + 1;
        Column = where.character + 1;
    }
    else if (where instanceof vscode.Range) {
        Line = where.start.line + 1;
        Column = where.start.character + 1;
    }
    // for metadata sources, we need to remove the [metadata] from the filename, and prepend the $metadata$ authority
    // this is expected by the Omnisharp server to support metadata-to-metadata navigation
    let fileName = document.uri.scheme === "omnisharp-metadata" ?
        `${document.uri.authority}${document.fileName.replace("[metadata] ", "")}` :
        document.fileName;
    let request = {
        FileName: fileName,
        Buffer: includeBuffer ? document.getText() : undefined,
        Line,
        Column
    };
    return request;
}
exports.createRequest = createRequest;
function toDocumentSymbol(bucket, node, containerLabel) {
    let ret = new vscode.SymbolInformation(node.Location.Text, kinds[node.Kind], toRange(node.Location), undefined, containerLabel);
    if (node.ChildNodes) {
        for (let child of node.ChildNodes) {
            toDocumentSymbol(bucket, child, ret.name);
        }
    }
    bucket.push(ret);
}
exports.toDocumentSymbol = toDocumentSymbol;
let kinds = Object.create(null);
kinds['NamespaceDeclaration'] = vscode.SymbolKind.Namespace;
kinds['ClassDeclaration'] = vscode.SymbolKind.Class;
kinds['FieldDeclaration'] = vscode.SymbolKind.Field;
kinds['PropertyDeclaration'] = vscode.SymbolKind.Property;
kinds['EventFieldDeclaration'] = vscode.SymbolKind.Property;
kinds['MethodDeclaration'] = vscode.SymbolKind.Method;
kinds['EnumDeclaration'] = vscode.SymbolKind.Enum;
kinds['StructDeclaration'] = vscode.SymbolKind.Enum;
kinds['EnumMemberDeclaration'] = vscode.SymbolKind.Property;
kinds['InterfaceDeclaration'] = vscode.SymbolKind.Interface;
kinds['VariableDeclaration'] = vscode.SymbolKind.Variable;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHlwZUNvbnZlcnRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvb21uaXNoYXJwL3R5cGVDb252ZXJ0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHO0FBQ2hHLFlBQVksQ0FBQzs7QUFHYixpQ0FBaUM7QUFFakMsb0JBQTJCLFFBQXVEO0lBQzlFLE1BQU0sUUFBUSxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUNwRCxNQUFNLENBQUMsaUJBQWlCLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQ2pELENBQUM7QUFIRCxnQ0FHQztBQUVELDJCQUFrQyxHQUFlLEVBQUUsUUFBdUQ7SUFDdEcsTUFBTSxRQUFRLEdBQUcsSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFFN0UsTUFBTSxPQUFPLEdBQXVCLFFBQVMsQ0FBQyxPQUFPLENBQUM7SUFDdEQsTUFBTSxTQUFTLEdBQXVCLFFBQVMsQ0FBQyxTQUFTLENBQUM7SUFFMUQsRUFBRSxDQUFDLENBQUMsT0FBTyxLQUFLLFNBQVMsSUFBSSxTQUFTLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQztRQUNuRCxNQUFNLFdBQVcsR0FBRyxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsT0FBTyxHQUFHLENBQUMsRUFBRSxTQUFTLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDcEUsTUFBTSxDQUFDLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsSUFBSSxNQUFNLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxXQUFXLENBQUMsQ0FBQyxDQUFDO0lBQzdFLENBQUM7SUFFRCxNQUFNLENBQUMsSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxR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QUFJLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDckIsQ0FBQztBQVpELDRDQVlDO0FBRUQsSUFBSSxLQUFLLEdBQTJDLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDeEUsS0FBSyxDQUFDLHNCQUFzQixDQUFDLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUM7QUFDNUQsS0FBSyxDQUFDLGtCQUFrQixDQUFDLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUM7QUFDcEQsS0FBSyxDQUFDLGtCQUFrQixDQUFDLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUM7QUFDcEQsS0FBSyxDQUFDLHFCQUFxQixDQUFDLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUM7QUFDMUQsS0FBSyxDQUFDLHVCQUF1QixDQUFDLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUM7QUFDNUQsS0FBSyxDQUFDLG1CQUFtQixDQUFDLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUM7QUFDdEQsS0FBSyxDQUFDLGlCQUFpQixDQUFDLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUM7QUFDbEQsS0FBSyxDQUFDLG1CQUFtQixDQUFDLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUM7QUFDcEQsS0FBSyxDQUFDLHVCQUF1QixDQUFDLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUM7QUFDNUQsS0FBSyxDQUFDLHNCQUFzQixDQUFDLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUM7QUFDNUQsS0FBSyxDQUFDLHFCQUFxQixDQUFDLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMifQ==