/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const protocol = require("./protocol");
function autoComplete(server, request) {
    return server.makeRequest(protocol.Requests.AutoComplete, request);
}
exports.autoComplete = autoComplete;
function codeCheck(server, request, token) {
    return server.makeRequest(protocol.Requests.CodeCheck, request, token);
}
exports.codeCheck = codeCheck;
function currentFileMembersAsTree(server, request, token) {
    return server.makeRequest(protocol.Requests.CurrentFileMembersAsTree, request, token);
}
exports.currentFileMembersAsTree = currentFileMembersAsTree;
function filesChanged(server, requests) {
    return server.makeRequest(protocol.Requests.FilesChanged, requests);
}
exports.filesChanged = filesChanged;
function findImplementations(server, request, token) {
    return server.makeRequest(protocol.Requests.FindImplementations, request);
}
exports.findImplementations = findImplementations;
function findSymbols(server, request, token) {
    return server.makeRequest(protocol.Requests.FindSymbols, request, token);
}
exports.findSymbols = findSymbols;
function findUsages(server, request, token) {
    return server.makeRequest(protocol.Requests.FindUsages, request, token);
}
exports.findUsages = findUsages;
function formatAfterKeystroke(server, request, token) {
    return server.makeRequest(protocol.Requests.FormatAfterKeystroke, request, token);
}
exports.formatAfterKeystroke = formatAfterKeystroke;
function formatRange(server, request, token) {
    return server.makeRequest(protocol.Requests.FormatRange, request, token);
}
exports.formatRange = formatRange;
function getCodeActions(server, request, token) {
    return server.makeRequest(protocol.V2.Requests.GetCodeActions, request, token);
}
exports.getCodeActions = getCodeActions;
function goToDefinition(server, request, token) {
    return server.makeRequest(protocol.Requests.GoToDefinition, request);
}
exports.goToDefinition = goToDefinition;
function rename(server, request, token) {
    return server.makeRequest(protocol.Requests.Rename, request, token);
}
exports.rename = rename;
function requestProjectInformation(server, request) {
    return server.makeRequest(protocol.Requests.Project, request);
}
exports.requestProjectInformation = requestProjectInformation;
function requestWorkspaceInformation(server) {
    return server.makeRequest(protocol.Requests.Projects);
}
exports.requestWorkspaceInformation = requestWorkspaceInformation;
function runCodeAction(server, request) {
    return server.makeRequest(protocol.V2.Requests.RunCodeAction, request);
}
exports.runCodeAction = runCodeAction;
function signatureHelp(server, request, token) {
    return server.makeRequest(protocol.Requests.SignatureHelp, request, token);
}
exports.signatureHelp = signatureHelp;
function typeLookup(server, request, token) {
    return server.makeRequest(protocol.Requests.TypeLookup, request, token);
}
exports.typeLookup = typeLookup;
function updateBuffer(server, request) {
    return server.makeRequest(protocol.Requests.UpdateBuffer, request);
}
exports.updateBuffer = updateBuffer;
function getMetadata(server, request) {
    return server.makeRequest(protocol.Requests.Metadata, request);
}
exports.getMetadata = getMetadata;
function getTestStartInfo(server, request) {
    return server.makeRequest(protocol.V2.Requests.GetTestStartInfo, request);
}
exports.getTestStartInfo = getTestStartInfo;
function runTest(server, request) {
    return server.makeRequest(protocol.V2.Requests.RunTest, request);
}
exports.runTest = runTest;
function runTestsInClass(server, request) {
    return server.makeRequest(protocol.V2.Requests.RunAllTestsInClass, request);
}
exports.runTestsInClass = runTestsInClass;
function debugTestGetStartInfo(server, request) {
    return server.makeRequest(protocol.V2.Requests.DebugTestGetStartInfo, request);
}
exports.debugTestGetStartInfo = debugTestGetStartInfo;
function debugTestClassGetStartInfo(server, request) {
    return server.makeRequest(protocol.V2.Requests.DebugTestsInClassGetStartInfo, request);
}
exports.debugTestClassGetStartInfo = debugTestClassGetStartInfo;
function debugTestLaunch(server, request) {
    return server.makeRequest(protocol.V2.Requests.DebugTestLaunch, request);
}
exports.debugTestLaunch = debugTestLaunch;
function debugTestStop(server, request) {
    return server.makeRequest(protocol.V2.Requests.DebugTestStop, request);
}
exports.debugTestStop = debugTestStop;
function isNetCoreProject(project) {
    return project.TargetFrameworks.find(tf => tf.ShortName.startsWith('netcoreapp') || tf.ShortName.startsWith('netstandard')) !== undefined;
}
exports.isNetCoreProject = isNetCoreProject;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvb21uaXNoYXJwL3V0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHO0FBRWhHLFlBQVksQ0FBQzs7QUFHYix1Q0FBdUM7QUFHdkMsc0JBQTZCLE1BQXVCLEVBQUUsT0FBcUM7SUFDdkYsTUFBTSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQWtDLFFBQVEsQ0FBQyxRQUFRLENBQUMsWUFBWSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQ3hHLENBQUM7QUFGRCxvQ0FFQztBQUVELG1CQUEwQixNQUF1QixFQUFFLE9BQXlCLEVBQUUsS0FBK0I7SUFDekcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQTRCLFFBQVEsQ0FBQyxRQUFRLENBQUMsU0FBUyxFQUFFLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztBQUN0RyxDQUFDO0FBRkQsOEJBRUM7QUFFRCxrQ0FBeUMsTUFBdUIsRUFBRSxPQUF5QixFQUFFLEtBQStCO0lBQ3hILE1BQU0sQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUE0QyxRQUFRLENBQUMsUUFBUSxDQUFDLHdCQUF3QixFQUFFLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztBQUNySSxDQUFDO0FBRkQsNERBRUM7QUFFRCxzQkFBNkIsTUFBdUIsRUFBRSxRQUE0QjtJQUM5RSxNQUFNLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBTyxRQUFRLENBQUMsUUFBUSxDQUFDLFlBQVksRUFBRSxRQUFRLENBQUMsQ0FBQztBQUM5RSxDQUFDO0FBRkQsb0NBRUM7QUFFRCw2QkFBb0MsTUFBdUIsRUFBRSxPQUE0QyxFQUFFLEtBQStCO0lBQ3RJLE1BQU0sQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUE0QixRQUFRLENBQUMsUUFBUSxDQUFDLG1CQUFtQixFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQ3pHLENBQUM7QUFGRCxrREFFQztBQUVELHFCQUE0QixNQUF1QixF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