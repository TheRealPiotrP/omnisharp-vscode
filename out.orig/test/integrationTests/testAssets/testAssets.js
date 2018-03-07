"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("async-file");
const path = require("path");
const vscode = require("vscode");
const cp = require("child_process");
class TestAssetProject {
    constructor(project) {
        this.relativePath = project.relativePath;
    }
    get projectDirectoryPath() {
        return path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, this.relativePath);
    }
    get binDirectoryPath() {
        return path.join(this.projectDirectoryPath, 'bin');
    }
    get objDirectoryPath() {
        return path.join(this.projectDirectoryPath, 'obj');
    }
    deleteBuildArtifacts() {
        return __awaiter(this, void 0, void 0, function* () {
            yield fs.rimraf(this.binDirectoryPath);
            yield fs.rimraf(this.objDirectoryPath);
        });
    }
    addFileWithContents(fileName, contents) {
        return __awaiter(this, void 0, void 0, function* () {
            let dir = path.dirname(this.projectDirectoryPath);
            let loc = path.join(dir, fileName);
            yield fs.writeTextFile(loc, contents);
            return vscode.Uri.file(loc);
        });
    }
}
exports.TestAssetProject = TestAssetProject;
class TestAssetWorkspace {
    constructor(workspace) {
        this.projects = workspace.projects.map(w => new TestAssetProject(w));
        this.description = workspace.description;
    }
    deleteBuildArtifacts() {
        return __awaiter(this, void 0, void 0, function* () {
            this.projects.forEach((p) => __awaiter(this, void 0, void 0, function* () { return yield p.deleteBuildArtifacts(); }));
        });
    }
    get vsCodeDirectoryPath() {
        return path.join(vscode.workspace.rootPath, ".vscode");
    }
    get launchJsonPath() {
        return path.join(this.vsCodeDirectoryPath, "launch.json");
    }
    get tasksJsonPath() {
        return path.join(this.vsCodeDirectoryPath, "tasks.json");
    }
    cleanupWorkspace() {
        return __awaiter(this, void 0, void 0, function* () {
            for (let project of this.projects) {
                let wd = path.dirname(project.projectDirectoryPath);
                yield this.invokeGit("clean -xdf . ", wd);
                yield this.invokeGit("checkout -- .", wd);
            }
        });
    }
    invokeGit(args, workingDirectory) {
        return new Promise((resolve, reject) => {
            let child = cp.exec('git ' + args, { cwd: path.dirname(workingDirectory) }, (err, stdout, stderr) => {
                return err ? reject(err) : resolve({
                    stdout: stdout,
                    stderr: stderr
                });
            });
        });
    }
}
exports.TestAssetWorkspace = TestAssetWorkspace;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdEFzc2V0cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Rlc3QvaW50ZWdyYXRpb25UZXN0cy90ZXN0QXNzZXRzL3Rlc3RBc3NldHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7O0FBRWhHLGlDQUFpQztBQUNqQyw2QkFBNkI7QUFDN0IsaUNBQWlDO0FBQ2pDLG9DQUFvQztBQUVwQztJQUNJLFlBQVksT0FBMEI7UUFDbEMsSUFBSSxDQUFDLFlBQVksR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDO0lBQzdDLENBQUM7SUFJRCxJQUFJLG9CQUFvQjtRQUNwQixNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQzVELElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUMzQixDQUFDO0lBRUQsSUFBSSxnQkFBZ0I7UUFDaEIsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLG9CQUFvQixFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ3ZELENBQUM7SUFFRCxJQUFJLGdCQUFnQjtRQUNoQixNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsb0JBQW9CLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDdkQsQ0FBQztJQUVLLG9CQUFvQjs7WUFDdEIsTUFBTSxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1lBQ3ZDLE1BQU0sRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUMzQyxDQUFDO0tBQUE7SUFFSyxtQkFBbUIsQ0FBQyxRQUFnQixFQUFFLFFBQWdCOztZQUN4RCxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxvQkFBb0Is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