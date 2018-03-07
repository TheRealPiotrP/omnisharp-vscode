"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const os = require("os");
function updatePackageDependencies() {
    const urlsIndex = process.argv.indexOf("--urls");
    const newPrimaryUrls = urlsIndex >= 0 ? process.argv[urlsIndex + 1] : undefined;
    const fallbackUrlsIndex = process.argv.indexOf("--fallbackUrls");
    const newFallbackUrls = fallbackUrlsIndex >= 0 ? process.argv[fallbackUrlsIndex + 1] : undefined;
    if (newPrimaryUrls === undefined || newPrimaryUrls === "-?" || newPrimaryUrls === "-h") {
        console.log("This command will update the URLs for package dependencies in package.json");
        console.log();
        console.log("Syntax: updatePackageDependencies --urls \"<url1>,<url2>,...\" [--fallbackUrls \"<fallback-url-1>,<fallback-url-2>...\"]");
        console.log();
        return;
    }
    if (newPrimaryUrls.length === 0) {
        throw new Error("Invalid first argument to updatePackageDependencies. URL string argument expected.");
    }
    let packageJSON = JSON.parse(fs.readFileSync('package.json').toString());
    // map from lowercase filename to Package
    const mapFileNameToDependency = {};
    // First build the map
    packageJSON.runtimeDependencies.forEach(dependency => {
        let fileName = getLowercaseFileNameFromUrl(dependency.url);
        let existingDependency = mapFileNameToDependency[fileName];
        if (existingDependency !== undefined) {
            throw new Error(`Multiple dependencies found with filename '${fileName}': '${existingDependency.url}' and '${dependency.url}'.`);
        }
        mapFileNameToDependency[fileName] = dependency;
    });
    let findDependencyToUpdate = (url) => {
        let fileName = getLowercaseFileNameFromUrl(url);
        let dependency = mapFileNameToDependency[fileName];
        if (dependency === undefined) {
            throw new Error(`Unable to update item for url '${url}'. No 'runtimeDependency' found with filename '${fileName}'.`);
        }
        console.log(`Updating ${url}`);
        return dependency;
    };
    newPrimaryUrls.split(',').forEach(urlToUpdate => {
        console.log(`Trying to update ${urlToUpdate}`);
        let dependency = findDependencyToUpdate(urlToUpdate);
        dependency.url = urlToUpdate;
    });
    if (newFallbackUrls !== undefined) {
        newFallbackUrls.split(',').forEach(urlToUpdate => {
            console.log(`Trying to update ${urlToUpdate}`);
            let dependency = findDependencyToUpdate(urlToUpdate);
            dependency.fallbackUrl = urlToUpdate;
        });
    }
    let content = JSON.stringify(packageJSON, null, 2);
    if (os.platform() === 'win32') {
        content = content.replace(/\n/gm, "\r\n");
    }
    // We use '\u200b' (unicode zero-length space character) to break VS Code's URL detection regex for URLs that are examples. This process will
    // convert that from the readable espace sequence, to just an invisible character. Convert it back to the visible espace sequence.
    content = content.replace(/\u200b/gm, "\\u200b");
    fs.writeFileSync('package.json', content);
}
exports.updatePackageDependencies = updatePackageDependencies;
function getLowercaseFileNameFromUrl(url) {
    if (!url.startsWith("https://")) {
        throw new Error(`Unexpected URL '${url}'. URL expected to start with 'https://'.`);
    }
    if (!url.endsWith(".zip")) {
        throw new Error(`Unexpected URL '${url}'. URL expected to end with '.zip'.`);
    }
    let index = url.lastIndexOf("/");
    return url.substr(index + 1).toLowerCase();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXBkYXRlUGFja2FnZURlcGVuZGVuY2llcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy90b29scy9VcGRhdGVQYWNrYWdlRGVwZW5kZW5jaWVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O2dHQUdnRzs7QUFFaEcseUJBQXlCO0FBQ3pCLHlCQUF5QjtBQVN6QjtJQUVJLE1BQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ2pELE1BQU0sY0FBYyxHQUFHLFNBQVMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7SUFFOUUsTUFBTSxpQkFBaUIsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0lBQ2pFLE1BQU0sZUFBZSxHQUFHLGlCQUFpQixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsR0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO0lBRS9GLEVBQUUsQ0FBQyxDQUFDLGNBQWMsS0FBSyxTQUFTLElBQUksY0FBYyxLQUFLLElBQUksSUFBSSxjQUFjLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNyRixPQUFPLENBQUMsR0FBRyxDQUFDLDRFQUE0RSxDQUFDLENBQUM7UUFDMUYsT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ2QsT0FBTyxDQUFDLEdBQUcsQ0FBQywwSEFBMEgsQ0FBQyxDQUFDO1FBQ3hJLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUNkLE1BQU0sQ0FBQztJQUNYLENBQUM7SUFFRCxFQUFFLENBQUMsQ0FBQyxjQUFjLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDOUIs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