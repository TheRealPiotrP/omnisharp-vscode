"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const os = require("os");
function AppendFieldsToObject(reference, obj) {
    // Make sure it is an object type
    if (typeof obj == 'object') {
        for (let referenceKey in reference) {
            // If key exists in original object and is an object. 
            if (obj.hasOwnProperty(referenceKey)) {
                obj[referenceKey] = AppendFieldsToObject(reference[referenceKey], obj[referenceKey]);
            }
            else {
                // Does not exist in current object context
                obj[referenceKey] = reference[referenceKey];
            }
        }
    }
    return obj;
}
// Combines two object's fields, giving the parentDefault a higher precedence. 
function MergeDefaults(parentDefault, childDefault) {
    let newDefault = {};
    for (let attrname in childDefault) {
        newDefault[attrname] = childDefault[attrname];
    }
    for (let attrname in parentDefault) {
        newDefault[attrname] = parentDefault[attrname];
    }
    return newDefault;
}
function UpdateDefaults(object, defaults) {
    if (defaults != null) {
        for (let key in object) {
            if (object[key].hasOwnProperty('type') && object[key].type === 'object' && object[key].properties !== null) {
                object[key].properties = UpdateDefaults(object[key].properties, MergeDefaults(defaults, object[key].default));
            }
            else if (key in defaults) {
                object[key].default = defaults[key];
            }
        }
    }
    return object;
}
function ReplaceReferences(definitions, objects) {
    for (let key in objects) {
        if (objects[key].hasOwnProperty('$ref')) {
            // $ref is formatted as "#/definitions/ObjectName"
            let referenceStringArray = objects[key]['$ref'].split('/');
            // Getting "ObjectName"
            let referenceName = referenceStringArray[referenceStringArray.length - 1];
            // Make sure reference has replaced its own $ref fields and hope there are no recursive references.
            definitions[referenceName] = ReplaceReferences(definitions, definitions[referenceName]);
            // Retrieve ObjectName from definitions. (TODO: Does not retrieve inner objects)
            // Need to deep copy, there are no functions in these objects.
            let reference = JSON.parse(JSON.stringify(definitions[referenceName]));
            objects[key] = AppendFieldsToObject(reference, objects[key]);
            // Remove $ref field
            delete objects[key]['$ref'];
        }
        // Recursively replace references if this object has properties. 
        if (objects[key].hasOwnProperty('type') && objects[key].type === 'object' && objects[key].properties !== null) {
            objects[key].properties = ReplaceReferences(definitions, objects[key].properties);
            objects[key].properties = UpdateDefaults(objects[key].properties, objects[key].default);
        }
    }
    return objects;
}
function mergeReferences(baseDefinitions, additionalDefinitions) {
    for (let key in additionalDefinitions) {
        if (baseDefinitions[key]) {
            throw `Error: '${key}' defined in multiple schema files.`;
        }
        baseDefinitions[key] = additionalDefinitions[key];
    }
}
function GenerateOptionsSchema() {
    let packageJSON = JSON.parse(fs.readFileSync('package.json').toString());
    let schemaJSON = JSON.parse(fs.readFileSync('src/tools/OptionsSchema.json').toString());
    let symbolSettingsJSON = JSON.parse(fs.readFileSync('src/tools/VSSymbolSettings.json').toString());
    mergeReferences(schemaJSON.definitions, symbolSettingsJSON.definitions);
    schemaJSON.definitions = ReplaceReferences(schemaJSON.definitions, schemaJSON.definitions);
    // Hard Code adding in configurationAttributes launch and attach.
    // .NET Core
    packageJSON.contributes.debuggers[0].configurationAttributes.launch = schemaJSON.definitions.LaunchOptions;
    packageJSON.contributes.debuggers[0].configurationAttributes.attach = schemaJSON.definitions.AttachOptions;
    // Full .NET Framework
    packageJSON.contributes.debuggers[1].configurationAttributes.launch = schemaJSON.definitions.LaunchOptions;
    packageJSON.contributes.debuggers[1].configurationAttributes.attach = schemaJSON.definitions.AttachOptions;
    // Make a copy of the options for unit test debugging
    let unitTestDebuggingOptions = JSON.parse(JSON.stringify(schemaJSON.definitions.AttachOptions.properties));
    // Remove the options we don't want
    delete unitTestDebuggingOptions.processName;
    delete unitTestDebuggingOptions.processId;
    delete unitTestDebuggingOptions.pipeTransport;
    // Add the additional options we do want
    unitTestDebuggingOptions["type"] = {
        "type": "string",
        "enum": [
            "coreclr",
            "clr"
        ],
        "description": "Type type of code to debug. Can be either 'coreclr' for .NET Core debugging, or 'clr' for Desktop .NET Framework. 'clr' only works on Windows as the Desktop framework is Windows-only.",
        "default": "coreclr"
    };
    unitTestDebuggingOptions["debugServer"] = {
        "type": "number",
        "description": "For debug extension development only: if a port is specified VS Code tries to connect to a debug adapter running in server mode",
        "default": 4711
    };
    packageJSON.contributes.configuration.properties["csharp.unitTestDebuggingOptions"].properties = unitTestDebuggingOptions;
    let content = JSON.stringify(packageJSON, null, 2);
    if (os.platform() === 'win32') {
        content = content.replace(/\n/gm, "\r\n");
    }
    // We use '\u200b' (unicode zero-length space character) to break VS Code's URL detection regex for URLs that are examples. This process will
    // convert that from the readable espace sequence, to just an invisible character. Convert it back to the visible espace sequence.
    content = content.replace(/\u200b/gm, "\\u200b");
    fs.writeFileSync('package.json', content);
}
exports.GenerateOptionsSchema = GenerateOptionsSchema;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2VuZXJhdGVPcHRpb25zU2NoZW1hLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3Rvb2xzL0dlbmVyYXRlT3B0aW9uc1NjaGVtYS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7OztnR0FHZ0c7O0FBRWhHLHlCQUF5QjtBQUN6Qix5QkFBeUI7QUFFekIsOEJBQThCLFNBQWMsRUFBRSxHQUFRO0lBRWxELGlDQUFpQztJQUNqQyxFQUFFLENBQUMsQ0FBQyxPQUFPLEdBQUcsSUFBSSxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBQ3pCLEdBQUcsQ0FBQyxDQUFDLElBQUksWUFBWSxJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDakMsc0RBQXNEO1lBQ3RELEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNuQyxHQUFHLENBQUMsWUFBWSxDQUFDLEdBQUcsb0JBQW9CLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO1lBQ3pGLENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDSiwyQ0FBMkM7Z0JBQzNDLEdBQUcsQ0FBQyxZQUFZLENBQUMsR0FBRyxTQUFTLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDaEQsQ0FBQztRQUNMLENBQUM7SUFDTCxDQUFDO0lBRUQsTUFBTSxDQUFDLEdBQUcsQ0FBQztBQUNmLENBQUM7QUFFRCwrRUFBK0U7QUFDL0UsdUJBQXVCLGFBQWtCLEVBQUUsWUFBaUI7SUFDeEQsSUFBSSxVQUFVLEdBQVEsRUFBRSxDQUFDO0lBRXpCLEdBQUcsQ0FBQyxDQUFDLElBQUksUUFBUSxJQUFJLFlBQVksQ0FBQyxDQUFDLENBQUM7UUFDaEMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxHQUFHLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUNsRCxDQUFDO0lBRUQsR0FBRyxDQUFDLENBQUMs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