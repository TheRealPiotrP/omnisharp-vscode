/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const summaryStartTag = /<summary>/i;
const summaryEndTag = /<\/summary>/i;
function extractSummaryText(xmlDocComment) {
    if (!xmlDocComment) {
        return xmlDocComment;
    }
    let summary = xmlDocComment;
    let startIndex = summary.search(summaryStartTag);
    if (startIndex < 0) {
        return summary;
    }
    summary = summary.slice(startIndex + '<summary>'.length);
    let endIndex = summary.search(summaryEndTag);
    if (endIndex < 0) {
        return summary;
    }
    return summary.slice(0, endIndex);
}
exports.extractSummaryText = extractSummaryText;
function GetDocumentationString(structDoc) {
    let newLine = "\n\n";
    let indentSpaces = "\t\t";
    let documentation = "";
    if (structDoc) {
        if (structDoc.SummaryText) {
            documentation += structDoc.SummaryText + newLine;
        }
        if (structDoc.TypeParamElements && structDoc.TypeParamElements.length > 0) {
            documentation += "Type Parameters:" + newLine;
            documentation += indentSpaces + structDoc.TypeParamElements.map(displayDocumentationObject).join("\n" + indentSpaces) + newLine;
        }
        if (structDoc.ParamElements && structDoc.ParamElements.length > 0) {
            documentation += "Parameters:" + newLine;
            documentation += indentSpaces + structDoc.ParamElements.map(displayDocumentationObject).join("\n" + indentSpaces) + newLine;
        }
        if (structDoc.ReturnsText) {
            documentation += structDoc.ReturnsText + newLine;
        }
        if (structDoc.RemarksText) {
            documentation += structDoc.RemarksText + newLine;
        }
        if (structDoc.ExampleText) {
            documentation += structDoc.ExampleText + newLine;
        }
        if (structDoc.ValueText) {
            documentation += structDoc.ValueText + newLine;
        }
        if (structDoc.Exception && structDoc.Exception.length > 0) {
            documentation += "Exceptions:" + newLine;
            documentation += indentSpaces + structDoc.Exception.map(displayDocumentationObject).join("\n" + indentSpaces) + newLine;
        }
        documentation = documentation.trim();
    }
    return documentation;
}
exports.GetDocumentationString = GetDocumentationString;
function displayDocumentationObject(obj) {
    return obj.Name + ": " + obj.Documentation;
}
exports.displayDocumentationObject = displayDocumentationObject;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG9jdW1lbnRhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9mZWF0dXJlcy9kb2N1bWVudGF0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHO0FBRWhHLFlBQVksQ0FBQzs7QUFHYixNQUFNLGVBQWUsR0FBRyxZQUFZLENBQUM7QUFDckMsTUFBTSxhQUFhLEdBQUcsY0FBYyxDQUFDO0FBRXJDLDRCQUFtQyxhQUFxQjtJQUNwRCxFQUFFLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxDQUFDLGFBQWEsQ0FBQztJQUN6QixDQUFDO0lBRUQsSUFBSSxPQUFPLEdBQUcsYUFBYSxDQUFDO0lBRTVCLElBQUksVUFBVSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLENBQUM7SUFDakQsRUFBRSxDQUFDLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDakIsTUFBTSxDQUFDLE9BQU8sQ0FBQztJQUNuQixDQUFDO0lBRUQsT0FBTyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsVUFBVSxHQUFHLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUV6RCxJQUFJLFFBQVEsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQzdDLEVBQUUsQ0FBQyxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2YsTUFBTSxDQUFDLE9BQU8sQ0FBQztJQUNuQixDQUFDO0lBRUQsTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQ3RDLENBQUM7QUFwQkQsZ0RBb0JDO0FBRUQsZ0NBQXVDLFNBQXdDO0lBQzNFLElBQUksT0FBTyxHQUFHLE1BQU0sQ0FBQztJQUNyQixJQUFJLFlBQVksR0FBRyxNQUFNLENBQUM7SUFDMUIsSUFBSSxhQUFhLEdBQUcsRUFBRSxDQUFDO0lBRXZCLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7UUFDWixFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztZQUN4QixhQUFhLElBQUksU0FBUyxDQUFDLFdBQVcsR0FBRyxPQUFPLENBQUM7UUFDckQsQ0FBQztRQUVELEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxpQkFBaUIsSUFBSSxTQUFTLENBQUMsaUJBQWlCLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDeEUsYUFBYSxJQUFJLGtCQUFrQixHQUFHLE9BQU8sQ0FBQztZQUM5QyxhQUFhLElBQUksWUFBWSxHQUFHLFNBQVMsQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsMEJBQTBCLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFHLFlBQVksQ0FBQyxHQUFHLE9BQU8sQ0FBQztRQUNwSSxDQUFDO1FBRUQsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLGFBQWEsSUFBSSxTQUFTLENBQUMsYUFBYSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2hFLGFBQWEsSUFBSSxhQUFhLEdBQUcsT0FBTyxDQUFDO1lBQ3pDLGFBQWEsSUFBSSxZQUFZLEdBQUcsU0FBUyxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsMEJBQTBCLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFHLFlBQVksQ0FBQyxHQUFHLE9BQU8sQ0FBQztRQUNoSSxDQUFDO1FBRUQsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7WUFDeEIsYUFBYSxJQUFJLFNBQVMsQ0FBQyxXQUFXLEdBQUcsT0FBTyxDQUFDO1FBQ3JELENBQUM7UUFFRCxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztZQUN4QixhQUFhLElBQUksU0FBUyxDQUFDLFdBQVcsR0FBRyxPQUFPLENBQUM7UUFDckQsQ0FBQztRQUVELEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO1lBQ3hCLGFBQWEsSUFBSSxTQUFTLENBQUMsV0FBVyxHQUFHLE9BQU8sQ0FBQztRQUNyRCxDQUFDO1FBRUQsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDdEIsYUFBYSxJQUFJLFNBQVMsQ0FBQyxTQUFTLEdBQUcsT0FBTyxDQUFDO1FBQ25ELENBQUM7UUFFRCxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsU0FBUyxJQUFJLFNBQVMsQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDeEQsYUFBYSxJQUFJLGFBQWEsR0FBRyxPQUFPLENBQUM7WUFDekMsYUFBYSxJQUFJLFlBQVksR0FBRyxTQUFTLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLEdBQUcsWUFBWSxDQUFDLEdBQUcsT0FBTyxDQUFDO1FBQzVILENBQUM7UUFFRCxhQUFhLEdBQUcsYUFBYSxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ3pDLENBQUM7SUFFRCxNQUFNLENBQUMsYUFBYSxDQUFDO0FBQ3pCLENBQUM7QUE3Q0Qsd0RBNkNDO0FBRUQsb0NBQTJDLEdBQStCO0lBQ3RFLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLElBQUksR0FBRyxHQUFHLENBQUMsYUFBYSxDQUFDO0FBQy9DLENBQUM7QUFGRCxnRUFFQyJ9