/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const nls = require("vscode-nls");
const vscode_1 = require("vscode");
const request_light_1 = require("request-light");
const localize = nls.loadMessageBundle();
const FEED_INDEX_URL = 'https://api.nuget.org/v3/index.json';
const LIMIT = 30;
class ProjectJSONContribution {
    constructor(requestService) {
        this.requestService = requestService;
    }
    getDocumentSelector() {
        return [{ language: 'json', pattern: '**/project.json' }];
    }
    getNugetIndex() {
        if (!this.nugetIndexPromise) {
            this.nugetIndexPromise = this.makeJSONRequest(FEED_INDEX_URL).then(indexContent => {
                let services = {};
                if (indexContent && Array.isArray(indexContent.resources)) {
                    let resources = indexContent.resources;
                    for (let i = resources.length - 1; i >= 0; i--) {
                        let type = resources[i]['@type'];
                        let id = resources[i]['@id'];
                        if (type && id) {
                            services[type] = id;
                        }
                    }
                }
                return services;
            });
        }
        return this.nugetIndexPromise;
    }
    getNugetService(serviceType) {
        return this.getNugetIndex().then(services => {
            let serviceURL = services[serviceType];
            if (!serviceURL) {
                return Promise.reject(localize('json.nugget.error.missingservice', 'NuGet index document is missing service {0}', serviceType));
            }
            return serviceURL;
        });
    }
    makeJSONRequest(url) {
        return this.requestService({
            url: url
        }).then(success => {
            if (success.status === 200) {
                try {
                    return JSON.parse(success.responseText);
                }
                catch (e) {
                    return Promise.reject(localize('json.nugget.error.invalidformat', '{0} is not a valid JSON document', url));
                }
            }
            return Promise.reject(localize('json.nugget.error.indexaccess', 'Request to {0} failed: {1}', url, success.responseText));
        }, (error) => {
            return Promise.reject(localize('json.nugget.error.access', 'Request to {0} failed: {1}', url, request_light_1.getErrorStatusDescription(error.status)));
        });
    }
    collectPropertySuggestions(resource, location, currentWord, addValue, isLast, result) {
        if ((location.matches(['dependencies']) || location.matches(['frameworks', '*', 'dependencies']) || location.matches(['frameworks', '*', 'frameworkAssemblies']))) {
            return this.getNugetService('SearchAutocompleteService').then(service => {
                let queryUrl;
                if (currentWord.length > 0) {
                    queryUrl = service + '?q=' + encodeURIComponent(currentWord) + '&take=' + LIMIT;
                }
                else {
                    queryUrl = service + '?take=' + LIMIT;
                }
                return this.makeJSONRequest(queryUrl).then(resultObj => {
                    if (Array.isArray(resultObj.data)) {
                        let results = resultObj.data;
                        for (let i = 0; i < results.length; i++) {
                            let name = results[i];
                            let insertText = JSON.stringify(name);
                            if (addValue) {
                                insertText += ': "{{}}"';
                                if (!isLast) {
                                    insertText += ',';
                                }
                            }
                            let proposal = new vscode_1.CompletionItem(name);
                            proposal.kind = vscode_1.CompletionItemKind.Property;
                            proposal.insertText = insertText;
                            proposal.filterText = JSON.stringify(name);
                            result.add(proposal);
                        }
                        if (results.length === LIMIT) {
                            result.setAsIncomplete();
                        }
                    }
                }, error => {
                    result.error(error);
                });
            }, error => {
                result.error(error);
            });
        }
        return null;
    }
    collectValueSuggestions(resource, location, result) {
        if ((location.matches(['dependencies', '*']) || location.matches(['frameworks', '*', 'dependencies', '*']) || location.matches(['frameworks', '*', 'frameworkAssemblies', '*']))) {
            return this.getNugetService('PackageBaseAddress/3.0.0').then(service => {
                let currentKey = location.path[location.path.length - 1];
                if (typeof currentKey === 'string') {
                    let queryUrl = service + currentKey + '/index.json';
                    return this.makeJSONRequest(queryUrl).then(obj => {
                        if (Array.isArray(obj.versions)) {
                            let results = obj.versions;
                            for (let i = 0; i < results.length; i++) {
                                let curr = results[i];
                                let name = JSON.stringify(curr);
                                let proposal = new vscode_1.CompletionItem(name);
                                proposal.kind = vscode_1.CompletionItemKind.Class;
                                proposal.insertText = name;
                                proposal.documentation = '';
                                result.add(proposal);
                            }
                            if (results.length === LIMIT) {
                                result.setAsIncomplete();
                            }
                        }
                    }, error => {
                        result.error(error);
                    });
                }
            }, error => {
                result.error(error);
            });
        }
        return null;
    }
    collectDefaultSuggestions(resource, result) {
        let defaultValue = {
            'version': '{{1.0.0-*}}',
            'dependencies': {},
            'frameworks': {
                'dnx451': {},
                'dnxcore50': {}
            }
        };
        let proposal = new vscode_1.CompletionItem(localize('json.project.default', 'Default project.json'));
        proposal.kind = vscode_1.CompletionItemKind.Module;
        proposal.insertText = JSON.stringify(defaultValue, null, '\t');
        result.add(proposal);
        return null;
    }
    resolveSuggestion(item) {
        if (item.kind === vscode_1.CompletionItemKind.Property) {
            let pack = item.label;
            return this.getInfo(pack).then(info => {
                if (info.description) {
                    item.documentation = info.description;
                }
                if (info.version) {
                    item.detail = info.version;
                    item.insertText = item.insertText.replace(/\{\{\}\}/, '{{' + info.version + '}}');
                }
                return item;
            });
        }
        return null;
    }
    getInfo(pack) {
        return this.getNugetService('SearchQueryService').then(service => {
            let queryUrl = service + '?q=' + encodeURIComponent(pack) + '&take=' + 5;
            return this.makeJSONRequest(queryUrl).then(resultObj => {
                if (Array.isArray(resultObj.data)) {
                    let results = resultObj.data;
                    let info = {};
                    for (let i = 0; i < results.length; i++) {
                        let res = results[i];
                        if (res.id === pack) {
                            info.description = res.description;
                            info.version = localize('json.nugget.version.hover', 'Latest version: {0}', res.version);
                        }
                    }
                    return info;
                }
                return null;
            }, (error) => {
                return null;
            });
        }, (error) => {
            return null;
        });
    }
    getInfoContribution(resource, location) {
        if ((location.matches(['dependencies', '*']) || location.matches(['frameworks', '*', 'dependencies', '*']) || location.matches(['frameworks', '*', 'frameworkAssemblies', '*']))) {
            let pack = location.path[location.path.length - 1];
            if (typeof pack === 'string') {
                return this.getInfo(pack).then(info => {
                    let htmlContent = [];
                    htmlContent.push(localize('json.nugget.package.hover', '{0}', pack));
                    if (info.description) {
                        htmlContent.push(info.description);
                    }
                    if (info.version) {
                        htmlContent.push(info.version);
                    }
                    return htmlContent;
                });
            }
        }
        return null;
    }
}
exports.ProjectJSONContribution = ProjectJSONContribution;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvamVjdEpTT05Db250cmlidXRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvZmVhdHVyZXMvanNvbi9wcm9qZWN0SlNPTkNvbnRyaWJ1dGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRztBQUNoRyxZQUFZLENBQUM7O0FBRWIsa0NBQWtDO0FBRWxDLG1DQUE0RjtBQUU1RixpREFBbUY7QUFJbkYsTUFBTSxRQUFRLEdBQUcsR0FBRyxDQUFDLGlCQUFpQixFQUFFLENBQUM7QUFFekMsTUFBTSxjQUFjLEdBQUcscUNBQXFDLENBQUM7QUFDN0QsTUFBTSxLQUFLLEdBQUcsRUFBRSxDQUFDO0FBU2pCO0lBSUksWUFBMkIsY0FBMEI7UUFBMUIsbUJBQWMsR0FBZCxjQUFjLENBQVk7SUFDckQsQ0FBQztJQUVNLG1CQUFtQjtRQUN0QixNQUFNLENBQUMsQ0FBQyxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLGlCQUFpQixFQUFFLENBQUMsQ0FBQztJQUM5RCxDQUFDO0lBRU8sYUFBYTtRQUNqQixFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUM7WUFDMUIsSUFBSSxDQUFDLGlCQUFpQixHQUFHLElBQUksQ0FBQyxlQUFlLENBQU0sY0FBYyxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxFQUFFO2dCQUNuRixJQUFJLFFBQVEsR0FBa0IsRUFBRSxDQUFDO2dCQUNqQyxFQUFFLENBQUMsQ0FBQyxZQUFZLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUN4RCxJQUFJLFNBQVMsR0FBVSxZQUFZLENBQUMsU0FBUyxDQUFDO29CQUM5QyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FB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