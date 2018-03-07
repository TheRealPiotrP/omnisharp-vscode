"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const abstractProvider_1 = require("./abstractProvider");
const serverUtils = require("../omnisharp/utils");
const typeConvertion_1 = require("../omnisharp/typeConvertion");
const vscode = require("vscode");
class Advisor {
    constructor(server) {
        this._packageRestoreCounter = 0;
        this._projectSourceFileCounts = Object.create(null);
        this._server = server;
        let d1 = server.onProjectChange(this._onProjectChange, this);
        let d2 = server.onProjectAdded(this._onProjectAdded, this);
        let d3 = server.onProjectRemoved(this._onProjectRemoved, this);
        let d4 = server.onBeforePackageRestore(this._onBeforePackageRestore, this);
        let d5 = server.onPackageRestore(this._onPackageRestore, this);
        this._disposable = vscode.Disposable.from(d1, d2, d3, d4, d5);
    }
    dispose() {
        this._disposable.dispose();
    }
    shouldValidateFiles() {
        return this._isServerStarted()
            && !this._isRestoringPackages();
    }
    shouldValidateProject() {
        return this._isServerStarted()
            && !this._isRestoringPackages()
            && !this._isHugeProject();
    }
    _updateProjectFileCount(path, fileCount) {
        this._projectSourceFileCounts[path] = fileCount;
    }
    _addOrUpdateProjectFileCount(info) {
        if (info.DotNetProject && info.DotNetProject.SourceFiles) {
            this._updateProjectFileCount(info.DotNetProject.Path, info.DotNetProject.SourceFiles.length);
        }
        if (info.MsBuildProject && info.MsBuildProject.SourceFiles) {
            this._updateProjectFileCount(info.MsBuildProject.Path, info.MsBuildProject.SourceFiles.length);
        }
    }
    _removeProjectFileCount(info) {
        if (info.DotNetProject && info.DotNetProject.SourceFiles) {
            delete this._updateProjectFileCount[info.DotNetProject.Path];
        }
        if (info.MsBuildProject && info.MsBuildProject.SourceFiles) {
            delete this._updateProjectFileCount[info.MsBuildProject.Path];
        }
    }
    _onProjectAdded(info) {
        this._addOrUpdateProjectFileCount(info);
    }
    _onProjectRemoved(info) {
        this._removeProjectFileCount(info);
    }
    _onProjectChange(info) {
        this._addOrUpdateProjectFileCount(info);
    }
    _onBeforePackageRestore() {
        this._packageRestoreCounter += 1;
    }
    _onPackageRestore() {
        this._packageRestoreCounter -= 1;
    }
    _isRestoringPackages() {
        return this._packageRestoreCounter > 0;
    }
    _isServerStarted() {
        return this._server.isRunning();
    }
    _isHugeProject() {
        let sourceFileCount = 0;
        for (let key in this._projectSourceFileCounts) {
            sourceFileCount += this._projectSourceFileCounts[key];
            if (sourceFileCount > 1000) {
                return true;
            }
        }
        return false;
    }
}
exports.Advisor = Advisor;
function reportDiagnostics(server, reporter, advisor) {
    return new DiagnosticsProvider(server, reporter, advisor);
}
exports.default = reportDiagnostics;
class DiagnosticsProvider extends abstractProvider_1.default {
    constructor(server, reporter, validationAdvisor) {
        super(server, reporter);
        this._documentValidations = Object.create(null);
        this._validationAdvisor = validationAdvisor;
        this._diagnostics = vscode.languages.createDiagnosticCollection('csharp');
        let d1 = this._server.onPackageRestore(this._validateProject, this);
        let d2 = this._server.onProjectChange(this._validateProject, this);
        let d4 = vscode.workspace.onDidOpenTextDocument(event => this._onDocumentAddOrChange(event), this);
        let d3 = vscode.workspace.onDidChangeTextDocument(event => this._onDocumentAddOrChange(event.document), this);
        let d5 = vscode.workspace.onDidCloseTextDocument(this._onDocumentRemove, this);
        this._disposable = vscode.Disposable.from(this._diagnostics, d1, d2, d3, d4, d5);
        // Go ahead and check for diagnostics in the currently visible editors.
        for (let editor of vscode.window.visibleTextEditors) {
            let document = editor.document;
            if (document.languageId === 'csharp' && document.uri.scheme === 'file') {
                this._validateDocument(document);
            }
        }
    }
    dispose() {
        if (this._projectValidation) {
            this._projectValidation.dispose();
        }
        for (let key in this._documentValidations) {
            this._documentValidations[key].dispose();
        }
        this._disposable.dispose();
    }
    _onDocumentAddOrChange(document) {
        if (document.languageId === 'csharp' && document.uri.scheme === 'file') {
            this._validateDocument(document);
            this._validateProject();
        }
    }
    _onDocumentRemove(document) {
        let key = document.uri.toString();
        let didChange = false;
        if (this._diagnostics[key]) {
            didChange = true;
            this._diagnostics[key].dispose();
            delete this._diagnostics[key];
        }
        if (this._documentValidations[key]) {
            didChange = true;
            this._documentValidations[key].cancel();
            delete this._documentValidations[key];
        }
        if (didChange) {
            this._validateProject();
        }
    }
    _validateDocument(document) {
        // If we've already started computing for this document, cancel that work.
        let key = document.uri.toString();
        if (this._documentValidations[key]) {
            this._documentValidations[key].cancel();
        }
        if (!this._validationAdvisor.shouldValidateFiles()) {
            return;
        }
        let source = new vscode.CancellationTokenSource();
        let handle = setTimeout(() => {
            serverUtils.codeCheck(this._server, { FileName: document.fileName }, source.token).then(value => {
                let quickFixes = value.QuickFixes.filter(DiagnosticsProvider._shouldInclude);
                // Easy case: If there are no diagnostics in the file, we can clear it quickly.
                if (quickFixes.length === 0) {
                    if (this._diagnostics.has(document.uri)) {
                        this._diagnostics.delete(document.uri);
                    }
                    return;
                }
                // (re)set new diagnostics for this document
                let diagnostics = quickFixes.map(DiagnosticsProvider._asDiagnostic);
                this._diagnostics.set(document.uri, diagnostics);
            });
        }, 750);
        source.token.onCancellationRequested(() => clearTimeout(handle));
        this._documentValidations[key] = source;
    }
    _validateProject() {
        // If we've already started computing for this project, cancel that work.
        if (this._projectValidation) {
            this._projectValidation.cancel();
        }
        if (!this._validationAdvisor.shouldValidateProject()) {
            return;
        }
        this._projectValidation = new vscode.CancellationTokenSource();
        let handle = setTimeout(() => {
            serverUtils.codeCheck(this._server, { FileName: null }, this._projectValidation.token).then(value => {
                let quickFixes = value.QuickFixes
                    .filter(DiagnosticsProvider._shouldInclude)
                    .sort((a, b) => a.FileName.localeCompare(b.FileName));
                let entries = [];
                let lastEntry;
                for (let quickFix of quickFixes) {
                    let diag = DiagnosticsProvider._asDiagnostic(quickFix);
                    let uri = vscode.Uri.file(quickFix.FileName);
                    if (lastEntry && lastEntry[0].toString() === uri.toString()) {
                        lastEntry[1].push(diag);
                    }
                    else {
                        // We're replacing all diagnostics in this file. Pushing an entry with undefined for
                        // the diagnostics first ensures that the previous diagnostics for this file are
                        // cleared. Otherwise, new entries will be merged with the old ones.
                        entries.push([uri, undefined]);
                        lastEntry = [uri, [diag]];
                        entries.push(lastEntry);
                    }
                }
                // Clear diagnostics for files that no longer have any diagnostics.
                this._diagnostics.forEach((uri, diagnostics) => {
                    if (!entries.find(tuple => tuple[0].toString() === uri.toString())) {
                        this._diagnostics.delete(uri);
                    }
                });
                // replace all entries
                this._diagnostics.set(entries);
            });
        }, 3000);
        // clear timeout on cancellation
        this._projectValidation.token.onCancellationRequested(() => {
            clearTimeout(handle);
        });
    }
    static _shouldInclude(quickFix) {
        const config = vscode.workspace.getConfiguration('csharp');
        if (config.get('suppressHiddenDiagnostics', true)) {
            return quickFix.LogLevel.toLowerCase() !== 'hidden';
        }
        else {
            return true;
        }
    }
    // --- data converter
    static _asDiagnostic(quickFix) {
        let severity = DiagnosticsProvider._asDiagnosticSeverity(quickFix.LogLevel);
        let message = `${quickFix.Text} [${quickFix.Projects.map(n => DiagnosticsProvider._asProjectLabel(n)).join(', ')}]`;
        return new vscode.Diagnostic(typeConvertion_1.toRange(quickFix), message, severity);
    }
    static _asDiagnosticSeverity(logLevel) {
        switch (logLevel.toLowerCase()) {
            case 'error':
                return vscode.DiagnosticSeverity.Error;
            case 'warning':
                return vscode.DiagnosticSeverity.Warning;
            // info and hidden
            default:
                return vscode.DiagnosticSeverity.Information;
        }
    }
    static _asProjectLabel(projectName) {
        const idx = projectName.indexOf('+');
        return projectName.substr(idx + 1);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlhZ25vc3RpY3NQcm92aWRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9mZWF0dXJlcy9kaWFnbm9zdGljc1Byb3ZpZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O2dHQUdnRzs7QUFHaEcseURBQWlEO0FBRWpELGtEQUFrRDtBQUNsRCxnRUFBc0Q7QUFDdEQsaUNBQWlDO0FBR2pDO0lBT0ksWUFBWSxNQUF1QjtRQUgzQiwyQkFBc0IsR0FBVyxDQUFDLENBQUM7UUFDbkMsNkJBQXdCLEdBQStCLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7UUFHL0UsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7UUFFdEIsSUFBSSxFQUFFLEdBQUcsTUFBTSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDN0QsSUFBSSxFQUFFLEdBQUcsTUFBTSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQzNELElBQUksRUFBRSxHQUFHLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDL0QsSUFBSSxFQUFFLEdBQUcsTUFBTSxDQUFDLHNCQUFzQixDQUFDLElBQUksQ0FBQyx1QkFBdUIsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUMzRSxJQUFJLEVBQUUsR0FBRyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLElBQUksQ0FBQyxDQUFDO1FBQy9ELElBQUksQ0FBQyxXQUFXLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQ2xFLENBQUM7SUFFTSxPQUFPO1FBQ1YsSUFBSSxDQUFDLFdBQVcsQ0FB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