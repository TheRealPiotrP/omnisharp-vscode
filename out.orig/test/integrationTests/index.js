"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const logger_1 = require("../../src/logger");
//
// PLEASE DO NOT MODIFY / DELETE UNLESS YOU KNOW WHAT YOU ARE DOING
//
// This file is providing the test runner to use when running extension tests.
// By default the test runner in use is Mocha based.
//
// You can provide your own test runner if you want to override it by exporting
// a function run(testRoot: string, clb: (error:Error) => void) that the extension
// host can call to run the tests. The test runner is expected to use console.log
// to report the results back to the caller. When the tests are finished, return
// a possible error to the callback or null if none.
let testRunner = require('vscode/lib/testrunner');
// You can directly control Mocha options by uncommenting the following lines
// See https://github.com/mochajs/mocha/wiki/Using-mocha-programmatically#set-options for more info
testRunner.configure({
    timeout: 60000,
    ui: 'tdd',
    useColors: true // colored output from test results
});
if (process.env.OSVC_SUITE) {
    if (!fs.existsSync("./.logs")) {
        fs.mkdirSync("./.logs");
    }
    let logFilePath = `./.logs/${process.env.OSVC_SUITE}.log`;
    logger_1.SubscribeToAllLoggers(message => fs.appendFileSync(logFilePath, message));
}
module.exports = testRunner;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi90ZXN0L2ludGVncmF0aW9uVGVzdHMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Z0dBR2dHOztBQUVoRyx5QkFBeUI7QUFFekIsNkNBQXlEO0FBRXpELEVBQUU7QUFDRixtRUFBbUU7QUFDbkUsRUFBRTtBQUNGLDhFQUE4RTtBQUM5RSxvREFBb0Q7QUFDcEQsRUFBRTtBQUNGLCtFQUErRTtBQUMvRSxrRkFBa0Y7QUFDbEYsaUZBQWlGO0FBQ2pGLGdGQUFnRjtBQUNoRixvREFBb0Q7QUFFcEQsSUFBSSxVQUFVLEdBQUcsT0FBTyxDQUFDLHVCQUF1QixDQUFDLENBQUM7QUFFbEQsNkVBQTZFO0FBQzdFLG1HQUFtRztBQUVuRyxVQUFVLENBQUMsU0FBUyxDQUFDO0lBQ2pCLE9BQU8sRUFBRSxLQUFLO0lBQ2QsRUFBRSxFQUFFLEtBQUs7SUFDVCxTQUFTLEVBQUUsSUFBSSxDQUFDLG1DQUFtQztDQUN0RCxDQUFDLENBQUM7QUFFSCxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7SUFDekIsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM1QixFQUFFLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQzVCLENBQUM7SUFFRCxJQUFJLFdBQVcsR0FBRyxXQUFXLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxNQUFNLENBQUM7SUFFMUQsOEJBQXFCLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsY0FBYyxDQUFDLFdBQVcsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO0FBQzlFLENBQUM7QUFFRCxNQUFNLENBQUMsT0FBTyxHQUFHLFVBQVUsQ0FBQyJ9