/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
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
    timeout: 10000,
    ui: 'tdd',
    useColors: true // colored output from test results
});
module.exports = testRunner;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi90ZXN0L2ZlYXR1cmVUZXN0cy9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRztBQUVoRyxFQUFFO0FBQ0YsbUVBQW1FO0FBQ25FLEVBQUU7QUFDRiw4RUFBOEU7QUFDOUUsb0RBQW9EO0FBQ3BELEVBQUU7QUFDRiwrRUFBK0U7QUFDL0Usa0ZBQWtGO0FBQ2xGLGlGQUFpRjtBQUNqRixnRkFBZ0Y7QUFDaEYsb0RBQW9EO0FBRXBELElBQUksVUFBVSxHQUFHLE9BQU8sQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO0FBRWxELDZFQUE2RTtBQUM3RSxtR0FBbUc7QUFFbkcsVUFBVSxDQUFDLFNBQVMsQ0FBQztJQUNqQixPQUFPLEVBQUUsS0FBSztJQUNkLEVBQUUsRUFBRSxLQUFLO0lBQ1QsU0FBUyxFQUFFLElBQUksQ0FBQyxtQ0FBbUM7Q0FDdEQsQ0FBQyxDQUFDO0FBRUgsTUFBTSxDQUFDLE9BQU8sR0FBRyxVQUFVLENBQUMifQ==