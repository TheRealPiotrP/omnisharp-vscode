/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const documentation_1 = require("./documentation");
const abstractProvider_1 = require("./abstractProvider");
const serverUtils = require("../omnisharp/utils");
const typeConvertion_1 = require("../omnisharp/typeConvertion");
const vscode_1 = require("vscode");
class OmniSharpCompletionItemProvider extends abstractProvider_1.default {
    provideCompletionItems(document, position, token, context) {
        let wordToComplete = '';
        let range = document.getWordRangeAtPosition(position);
        if (range) {
            wordToComplete = document.getText(new vscode_1.Range(range.start, position));
        }
        let req = typeConvertion_1.createRequest(document, position);
        req.WordToComplete = wordToComplete;
        req.WantDocumentationForEveryCompletionResult = true;
        req.WantKind = true;
        req.WantReturnType = true;
        if (context.triggerKind == vscode_1.CompletionTriggerKind.TriggerCharacter) {
            req.TriggerCharacter = context.triggerCharacter;
        }
        return serverUtils.autoComplete(this._server, req).then(responses => {
            if (!responses) {
                return;
            }
            let result = [];
            let completions = Object.create(null);
            // transform AutoCompleteResponse to CompletionItem and
            // group by code snippet
            for (let response of responses) {
                let completion = new vscode_1.CompletionItem(response.CompletionText);
                completion.detail = response.ReturnType
                    ? `${response.ReturnType} ${response.DisplayText}`
                    : response.DisplayText;
                completion.documentation = documentation_1.extractSummaryText(response.Description);
                completion.kind = _kinds[response.Kind] || vscode_1.CompletionItemKind.Property;
                completion.insertText = response.CompletionText.replace(/<>/g, '');
                completion.commitCharacters = response.IsSuggestionMode
                    ? OmniSharpCompletionItemProvider.CommitCharactersWithoutSpace
                    : OmniSharpCompletionItemProvider.AllCommitCharacters;
                let array = completions[completion.label];
                if (!array) {
                    completions[completion.label] = [completion];
                }
                else {
                    array.push(completion);
                }
            }
            // per suggestion group, select on and indicate overloads
            for (let key in completions) {
                let suggestion = completions[key][0], overloadCount = completions[key].length - 1;
                if (overloadCount === 0) {
                    // remove non overloaded items
                    delete completions[key];
                }
                else {
                    // indicate that there is more
                    suggestion.detail = `${suggestion.detail} (+ ${overloadCount} overload(s))`;
                }
                result.push(suggestion);
            }
            // for short completions (up to 1 character), treat the list as incomplete
            // because the server has likely witheld some matches due to performance constraints
            return new vscode_1.CompletionList(result, wordToComplete.length > 1 ? false : true);
        });
    }
}
// copied from Roslyn here: https://github.com/dotnet/roslyn/blob/6e8f6d600b6c4bc0b92bc3d782a9e0b07e1c9f8e/src/Features/Core/Portable/Completion/CompletionRules.cs#L166-L169
OmniSharpCompletionItemProvider.AllCommitCharacters = [
    ' ', '{', '}', '[', ']', '(', ')', '.', ',', ':',
    ';', '+', '-', '*', '/', '%', '&', '|', '^', '!',
    '~', '=', '<', '>', '?', '@', '#', '\'', '\"', '\\'
];
OmniSharpCompletionItemProvider.CommitCharactersWithoutSpace = [
    '{', '}', '[', ']', '(', ')', '.', ',', ':',
    ';', '+', '-', '*', '/', '%', '&', '|', '^', '!',
    '~', '=', '<', '>', '?', '@', '#', '\'', '\"', '\\'
];
exports.default = OmniSharpCompletionItemProvider;
const _kinds = Object.create(null);
// types
_kinds['Class'] = vscode_1.CompletionItemKind.Class;
_kinds['Delegate'] = vscode_1.CompletionItemKind.Class; // need a better option for this.
_kinds['Enum'] = vscode_1.CompletionItemKind.Enum;
_kinds['Interface'] = vscode_1.CompletionItemKind.Interface;
_kinds['Struct'] = vscode_1.CompletionItemKind.Struct;
// variables
_kinds['Local'] = vscode_1.CompletionItemKind.Variable;
_kinds['Parameter'] = vscode_1.CompletionItemKind.Variable;
_kinds['RangeVariable'] = vscode_1.CompletionItemKind.Variable;
// members
_kinds['Const'] = vscode_1.CompletionItemKind.Constant;
_kinds['EnumMember'] = vscode_1.CompletionItemKind.EnumMember;
_kinds['Event'] = vscode_1.CompletionItemKind.Event;
_kinds['Field'] = vscode_1.CompletionItemKind.Field;
_kinds['Method'] = vscode_1.CompletionItemKind.Method;
_kinds['Property'] = vscode_1.CompletionItemKind.Property;
// other stuff
_kinds['Label'] = vscode_1.CompletionItemKind.Unit; // need a better option for this.
_kinds['Keyword'] = vscode_1.CompletionItemKind.Keyword;
_kinds['Namespace'] = vscode_1.CompletionItemKind.Module;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcGxldGlvbkl0ZW1Qcm92aWRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9mZWF0dXJlcy9jb21wbGV0aW9uSXRlbVByb3ZpZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHO0FBRWhHLFlBQVksQ0FBQzs7QUFFYixtREFBbUQ7QUFDbkQseURBQWlEO0FBRWpELGtEQUFrRDtBQUNsRCxnRUFBMEQ7QUFDMUQsbUNBQThMO0FBRTlMLHFDQUFxRCxTQUFRLDBCQUFlO0lBYWpFLHNCQUFzQixDQUFDLFFBQXNCLEVBQUUsUUFBa0IsRUFBRSxLQUF3QixFQUFFLE9BQTBCO1FBRTFILElBQUksY0FBYyxHQUFHLEVBQUUsQ0FBQztRQUN4QixJQUFJLEtBQUssR0FBRyxRQUFRLENBQUMsc0JBQXNCLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDdEQsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUNSLGNBQWMsR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDLElBQUksY0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQztRQUN4RSxDQUFDO1FBRUQsSUFBSSxHQUFHLEdBQUcsOEJBQWEsQ0FBK0IsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQzFFLEdBQUcsQ0FBQyxjQUFjLEdBQUcsY0FBYyxDQUFDO1FBQ3BDLEdBQUcsQ0FBQyx5Q0FBeUMsR0FBRyxJQUFJLENBQUM7UUFDckQsR0FBRyxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7UUFDcEIsR0FBRyxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUM7UUFDMUIsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLFdBQVcsSUFBSSw4QkFBcUIsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUNsRSxDQUFDO1lBQ0csR0FBRyxDQUFDLGdCQUFnQixHQUFHLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQztRQUNwRCxDQUFDO1FBRUQs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