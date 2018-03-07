/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const jsonc_parser_1 = require("jsonc-parser");
const projectJSONContribution_1 = require("./projectJSONContribution");
const request_light_1 = require("request-light");
const vscode_1 = require("vscode");
function addJSONProviders() {
    let subscriptions = [];
    // configure the XHR library with the latest proxy settings
    function configureHttpRequest() {
        let httpSettings = vscode_1.workspace.getConfiguration('http');
        request_light_1.configure(httpSettings.get('proxy'), httpSettings.get('proxyStrictSSL'));
    }
    configureHttpRequest();
    subscriptions.push(vscode_1.workspace.onDidChangeConfiguration(e => configureHttpRequest()));
    // register completion and hove providers for JSON setting file(s)
    let contributions = [new projectJSONContribution_1.ProjectJSONContribution(request_light_1.xhr)];
    contributions.forEach(contribution => {
        let selector = contribution.getDocumentSelector();
        let triggerCharacters = ['"', ':', '.', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
        subscriptions.push(vscode_1.languages.registerCompletionItemProvider(selector, new JSONCompletionItemProvider(contribution), ...triggerCharacters));
        subscriptions.push(vscode_1.languages.registerHoverProvider(selector, new JSONHoverProvider(contribution)));
    });
    return vscode_1.Disposable.from(...subscriptions);
}
exports.addJSONProviders = addJSONProviders;
class JSONHoverProvider {
    constructor(jsonContribution) {
        this.jsonContribution = jsonContribution;
    }
    provideHover(document, position, token) {
        let offset = document.offsetAt(position);
        let location = jsonc_parser_1.getLocation(document.getText(), offset);
        let node = location.previousNode;
        if (node && node.offset <= offset && offset <= node.offset + node.length) {
            let promise = this.jsonContribution.getInfoContribution(document.fileName, location);
            if (promise) {
                return promise.then(htmlContent => {
                    let range = new vscode_1.Range(document.positionAt(node.offset), document.positionAt(node.offset + node.length));
                    let result = {
                        contents: htmlContent,
                        range: range
                    };
                    return result;
                });
            }
        }
        return null;
    }
}
exports.JSONHoverProvider = JSONHoverProvider;
class JSONCompletionItemProvider {
    constructor(jsonContribution) {
        this.jsonContribution = jsonContribution;
    }
    resolveCompletionItem(item, token) {
        if (this.jsonContribution.resolveSuggestion) {
            let resolver = this.jsonContribution.resolveSuggestion(item);
            if (resolver) {
                return resolver;
            }
        }
        return Promise.resolve(item);
    }
    provideCompletionItems(document, position, token) {
        let currentWord = this.getCurrentWord(document, position);
        let overwriteRange = null;
        let items = [];
        let isIncomplete = false;
        let offset = document.offsetAt(position);
        let location = jsonc_parser_1.getLocation(document.getText(), offset);
        let node = location.previousNode;
        if (node && node.offset <= offset && offset <= node.offset + node.length && (node.type === 'property' || node.type === 'string' || node.type === 'number' || node.type === 'boolean' || node.type === 'null')) {
            overwriteRange = new vscode_1.Range(document.positionAt(node.offset), document.positionAt(node.offset + node.length));
        }
        else {
            overwriteRange = new vscode_1.Range(document.positionAt(offset - currentWord.length), position);
        }
        let proposed = {};
        let collector = {
            add: (suggestion) => {
                if (!proposed[suggestion.label]) {
                    proposed[suggestion.label] = true;
                    if (overwriteRange) {
                        suggestion.textEdit = vscode_1.TextEdit.replace(overwriteRange, suggestion.insertText);
                    }
                    items.push(suggestion);
                }
            },
            setAsIncomplete: () => isIncomplete = true,
            error: (message) => console.error(message),
            log: (message) => console.log(message)
        };
        let collectPromise = null;
        if (location.isAtPropertyKey) {
            let addValue = !location.previousNode || !location.previousNode.columnOffset && (offset == (location.previousNode.offset + location.previousNode.length));
            let scanner = jsonc_parser_1.createScanner(document.getText(), true);
            scanner.setPosition(offset);
            scanner.scan();
            let isLast = scanner.getToken() === jsonc_parser_1.SyntaxKind.CloseBraceToken || scanner.getToken() === jsonc_parser_1.SyntaxKind.EOF;
            collectPromise = this.jsonContribution.collectPropertySuggestions(document.fileName, location, currentWord, addValue, isLast, collector);
        }
        else {
            if (location.path.length === 0) {
                collectPromise = this.jsonContribution.collectDefaultSuggestions(document.fileName, collector);
            }
            else {
                collectPromise = this.jsonContribution.collectValueSuggestions(document.fileName, location, collector);
            }
        }
        if (collectPromise) {
            return collectPromise.then(() => {
                if (items.length > 0) {
                    return new vscode_1.CompletionList(items, isIncomplete);
                }
                return null;
            });
        }
        return null;
    }
    getCurrentWord(document, position) {
        let i = position.character - 1;
        let text = document.lineAt(position.line).text;
        while (i >= 0 && ' \t\n\r\v":{[,'.indexOf(text.charAt(i)) === -1) {
            i--;
        }
        return text.substring(i + 1, position.character);
    }
}
exports.JSONCompletionItemProvider = JSONCompletionItemProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvbkNvbnRyaWJ1dGlvbnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvZmVhdHVyZXMvanNvbi9qc29uQ29udHJpYnV0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRztBQUNoRyxZQUFZLENBQUM7O0FBRWIsK0NBQWdGO0FBQ2hGLHVFQUFvRTtBQUNwRSxpREFBK0Q7QUFFL0QsbUNBR2dCO0FBa0JoQjtJQUNJLElBQUksYUFBYSxHQUFpQixFQUFFLENBQUM7SUFFckMsMkRBQTJEO0lBQzNEO1FBQ0ksSUFBSSxZQUFZLEdBQUcsa0JBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN0RCx5QkFBWSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQVMsT0FBTyxDQUFDLEVBQUUsWUFBWSxDQUFDLEdBQUcsQ0FBVSxnQkFBZ0IsQ0FBQyxDQUFDLENBQUM7SUFDakcsQ0FBQztJQUVELG9CQUFvQixFQUFFLENBQUM7SUFDdkIsYUFBYSxDQUFDLElBQUksQ0FBQyxrQkFBUyxDQUFDLHdCQUF3QixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsb0JBQW9CLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFFcEYsa0VBQWtFO0lBQ2xFLElBQUksYUFBYSxHQUFHLENBQUMsSUFBSSxpREFBdUIsQ0FBQyxtQkFBRyxDQUFDLENBQUMsQ0FBQztJQUN2RCxhQUFhLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxFQUFFO1FBQ2pDLElBQUksUUFBUSxHQUFHLFlBQVksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO1FBQ2xELElBQUksaUJBQWlCLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUMx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