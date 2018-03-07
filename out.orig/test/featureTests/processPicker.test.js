"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const processPicker_1 = require("../../src/features/processPicker");
const chai_1 = require("chai");
suite("Remote Process Picker: Validate quoting arguments.", () => {
    suiteSetup(() => chai_1.should());
    test("Argument with no spaces", () => {
        let nonQuotedArg = processPicker_1.RemoteAttachPicker.quoteArg("C:\\Users\\nospace\\program.exe");
        nonQuotedArg.should.deep.equal("C:\\Users\\nospace\\program.exe");
    });
    test("Argument with spaces", () => {
        let nonQuotedArg = processPicker_1.RemoteAttachPicker.quoteArg("C:\\Users\\s p a c e\\program.exe");
        nonQuotedArg.should.deep.equal("\"C:\\Users\\s p a c e\\program.exe\"");
    });
    test("Argument with spaces with no quotes", () => {
        let nonQuotedArg = processPicker_1.RemoteAttachPicker.quoteArg("C:\\Users\\s p a c e\\program.exe", false);
        nonQuotedArg.should.deep.equal("C:\\Users\\s p a c e\\program.exe");
    });
    test("WSL with array arguments and quote args", () => {
        let pipeTransport = GetWindowsWSLLaunchJSONWithArrayArgs();
        let pipeCmd = processPicker_1.RemoteAttachPicker.createPipeCmdFromArray(pipeTransport.pipeProgram, pipeTransport.pipeArgs, true);
        pipeCmd.should.deep.equal("C:\\System32\\bash.exe -c \"" + processPicker_1.RemoteAttachPicker.scriptShellCmd + "\"");
    });
    test("WSL with array arguments and no quote args", () => {
        let pipeTransport = GetWindowsWSLLaunchJSONWithArrayArgs();
        let pipeCmd = processPicker_1.RemoteAttachPicker.createPipeCmdFromArray(pipeTransport.pipeProgram, pipeTransport.pipeArgs, false);
        pipeCmd.should.deep.equal("C:\\System32\\bash.exe -c " + processPicker_1.RemoteAttachPicker.scriptShellCmd);
    });
    test("WSL with array arguments + debugger command and quote args", () => {
        let pipeTransport = GetWindowsWSLLaunchJSONWithArrayArgsAndDebuggerCommand();
        let pipeCmd = processPicker_1.RemoteAttachPicker.createPipeCmdFromArray(pipeTransport.pipeProgram, pipeTransport.pipeArgs, true);
        pipeCmd.should.deep.equal("C:\\System32\\bash.exe -c \"" + processPicker_1.RemoteAttachPicker.scriptShellCmd + "\" -- ignored");
    });
    test("WSL with array arguments + debugger command and no quote args", () => {
        let pipeTransport = GetWindowsWSLLaunchJSONWithArrayArgsAndDebuggerCommand();
        let pipeCmd = processPicker_1.RemoteAttachPicker.createPipeCmdFromArray(pipeTransport.pipeProgram, pipeTransport.pipeArgs, false);
        pipeCmd.should.deep.equal("C:\\System32\\bash.exe -c " + processPicker_1.RemoteAttachPicker.scriptShellCmd + " -- ignored");
    });
    test("WSL with string arguments and quote args", () => {
        let pipeTransport = GetWindowsWSLLaunchJSONWithStringArgs();
        let pipeCmd = processPicker_1.RemoteAttachPicker.createPipeCmdFromString(pipeTransport.pipeProgram, pipeTransport.pipeArgs, true);
        pipeCmd.should.deep.equal("C:\\System32\\bash.exe -c \"" + processPicker_1.RemoteAttachPicker.scriptShellCmd + "\"");
    });
    test("WSL with string arguments and no quote args", () => {
        let pipeTransport = GetWindowsWSLLaunchJSONWithStringArgs();
        let pipeCmd = processPicker_1.RemoteAttachPicker.createPipeCmdFromString(pipeTransport.pipeProgram, pipeTransport.pipeArgs, false);
        pipeCmd.should.deep.equal("C:\\System32\\bash.exe -c " + processPicker_1.RemoteAttachPicker.scriptShellCmd);
    });
    test("WSL with string arguments + debugger command and quote args", () => {
        let pipeTransport = GetWindowsWSLLaunchJSONWithStringArgsAndDebuggerCommand();
        let pipeCmd = processPicker_1.RemoteAttachPicker.createPipeCmdFromString(pipeTransport.pipeProgram, pipeTransport.pipeArgs, true);
        pipeCmd.should.deep.equal("C:\\System32\\bash.exe -c " + processPicker_1.RemoteAttachPicker.scriptShellCmd + " -- ignored");
    });
    test("WSL with string arguments + debugger command and no quote args", () => {
        let pipeTransport = GetWindowsWSLLaunchJSONWithStringArgsAndDebuggerCommand();
        let pipeCmd = processPicker_1.RemoteAttachPicker.createPipeCmdFromString(pipeTransport.pipeProgram, pipeTransport.pipeArgs, false);
        pipeCmd.should.deep.equal("C:\\System32\\bash.exe -c " + processPicker_1.RemoteAttachPicker.scriptShellCmd + " -- ignored");
    });
    test("Windows Docker with string args, debuggerCommand", () => {
        let pipeTransport = GetWindowsDockerLaunchJSONWithStringArgsAndDebuggerCommand();
        // quoteArgs flag should be ignored
        let pipeCmd = processPicker_1.RemoteAttachPicker.createPipeCmdFromString(pipeTransport.pipeProgram, pipeTransport.pipeArgs, pipeTransport.quoteArgs);
        pipeCmd.should.deep.equal("docker -i exec 1234567 " + processPicker_1.RemoteAttachPicker.scriptShellCmd);
    });
    test("Windows Docker with array args", () => {
        let pipeTransport = GetWindowsDockerLaunchJSONWithArrayArgs();
        let pipeCmd = processPicker_1.RemoteAttachPicker.createPipeCmdFromArray(pipeTransport.pipeProgram, pipeTransport.pipeArgs, pipeTransport.quoteArgs);
        pipeCmd.should.deep.equal("docker -i exec 1234567 " + processPicker_1.RemoteAttachPicker.scriptShellCmd);
    });
    test("Windows Docker with array args with quotes", () => {
        let pipeTransport = GetWindowsDockerLaunchJSONWithArrayArgs();
        let pipeCmd = processPicker_1.RemoteAttachPicker.createPipeCmdFromArray(pipeTransport.pipeProgram, pipeTransport.pipeArgs, true);
        pipeCmd.should.deep.equal("docker -i exec 1234567 \"" + processPicker_1.RemoteAttachPicker.scriptShellCmd + "\"");
    });
    test("Linux dotnet with array args and spaces", () => {
        let pipeTransport = GetLinuxLaunchJSONWithArrayArgs();
        let pipeCmd = processPicker_1.RemoteAttachPicker.createPipeCmdFromArray(pipeTransport.pipeProgram, pipeTransport.pipeArgs, true);
        pipeCmd.should.deep.equal(`/usr/bin/shared/dotnet bin/framework/myprogram.dll \"argument with spaces\" \"${processPicker_1.RemoteAttachPicker.scriptShellCmd}\"`);
    });
    test("Multiple ${debuggerCommand} in string args", () => {
        let pipeCmd = processPicker_1.RemoteAttachPicker.createPipeCmdFromString("program.exe", "".concat(processPicker_1.RemoteAttachPicker.debuggerCommand, " ", processPicker_1.RemoteAttachPicker.debuggerCommand, " ", processPicker_1.RemoteAttachPicker.debuggerCommand), true);
        pipeCmd.should.deep.equal("program.exe " + processPicker_1.RemoteAttachPicker.scriptShellCmd + " " + processPicker_1.RemoteAttachPicker.scriptShellCmd + " " + processPicker_1.RemoteAttachPicker.scriptShellCmd);
    });
    test("Multiple ${debuggerCommand} in array args", () => {
        let pipeCmd = processPicker_1.RemoteAttachPicker.createPipeCmdFromArray("program.exe", [processPicker_1.RemoteAttachPicker.debuggerCommand, processPicker_1.RemoteAttachPicker.debuggerCommand, processPicker_1.RemoteAttachPicker.debuggerCommand], true);
        pipeCmd.should.deep.equal("program.exe \"" + processPicker_1.RemoteAttachPicker.scriptShellCmd + "\" \"" + processPicker_1.RemoteAttachPicker.scriptShellCmd + "\" \"" + processPicker_1.RemoteAttachPicker.scriptShellCmd + "\"");
    });
    test("OS Specific Configurations", () => {
        let launch = GetOSSpecificJSON();
        let pipeTransport = processPicker_1.RemoteAttachPicker.getPipeTransportOptions(launch, "win32");
        pipeTransport.pipeProgram.should.deep.equal("Windows pipeProgram");
        pipeTransport.pipeArgs.should.deep.equal("windows");
        pipeTransport = processPicker_1.RemoteAttachPicker.getPipeTransportOptions(launch, "darwin");
        pipeTransport.pipeProgram.should.deep.equal("OSX pipeProgram");
        pipeTransport.pipeArgs.should.deep.equal(["osx"]);
        pipeTransport = processPicker_1.RemoteAttachPicker.getPipeTransportOptions(launch, "linux");
        pipeTransport.pipeProgram.should.deep.equal("Linux pipeProgram");
        // Linux pipeTransport does not have args defined, should use the one defined in pipeTransport.
        pipeTransport.pipeArgs.should.deep.equal([]);
    });
});
function GetWindowsWSLLaunchJSONWithArrayArgs() {
    return {
        pipeCwd: "${workspaceFolder}",
        pipeProgram: "C:\\System32\\bash.exe",
        pipeArgs: ["-c"]
    };
}
function GetWindowsWSLLaunchJSONWithArrayArgsAndDebuggerCommand() {
    return {
        pipeCwd: "${workspaceFolder}",
        pipeProgram: "C:\\System32\\bash.exe",
        pipeArgs: ["-c", "${debuggerCommand}", "--", "ignored"]
    };
}
function GetWindowsWSLLaunchJSONWithStringArgs() {
    return {
        pipeCwd: "${workspaceFolder}",
        pipeProgram: "C:\\System32\\bash.exe",
        pipeArgs: "-c"
    };
}
function GetWindowsWSLLaunchJSONWithStringArgsAndDebuggerCommand() {
    return {
        pipeCwd: "${workspaceFolder}",
        pipeProgram: "C:\\System32\\bash.exe",
        pipeArgs: "-c ${debuggerCommand} -- ignored"
    };
}
function GetWindowsDockerLaunchJSONWithArrayArgs() {
    return {
        pipeCwd: "${workspaceFolder}",
        pipeProgram: "docker",
        pipeArgs: ["-i", "exec", "1234567"],
        quoteArgs: false
    };
}
function GetWindowsDockerLaunchJSONWithStringArgsAndDebuggerCommand() {
    return {
        pipeCwd: "${workspaceFolder}",
        pipeProgram: "docker",
        pipeArgs: "-i exec 1234567 ${debuggerCommand}",
        quoteArgs: false
    };
}
function GetLinuxLaunchJSONWithArrayArgs() {
    return {
        pipeCwd: "${workspaceFolder}",
        pipeProgram: "/usr/bin/shared/dotnet",
        pipeArgs: ["bin/framework/myprogram.dll", "argument with spaces"],
        quoteArg: true
    };
}
function GetOSSpecificJSON() {
    return {
        pipeCwd: "${workspaceFolder}",
        pipeProgram: "pipeProgram",
        pipeArgs: [],
        windows: {
            pipeProgram: "Windows pipeProgram",
            pipeArgs: "windows"
        },
        osx: {
            pipeProgram: "OSX pipeProgram",
            pipeArgs: ["osx"]
        },
        linux: {
            pipeProgram: "Linux pipeProgram",
        }
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvY2Vzc1BpY2tlci50ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vdGVzdC9mZWF0dXJlVGVzdHMvcHJvY2Vzc1BpY2tlci50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O2dHQUdnRzs7QUFFaEcsb0VBQXNFO0FBQ3RFLCtCQUE4QjtBQUU5QixLQUFLLENBQUMsb0RBQW9ELEVBQUUsR0FBRyxFQUFFO0lBQzdELFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxhQUFNLEVBQUUsQ0FBQyxDQUFDO0lBQzNCLElBQUksQ0FBQyx5QkFBeUIsRUFBRSxHQUFHLEVBQUU7UUFDakMsSUFBSSxZQUFZLEdBQUcsa0NBQWtCLENBQUMsUUFBUSxDQUFDLGlDQUFpQyxDQUFDLENBQUM7UUFFbEYsWUFBWSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLGlDQUFpQyxDQUFDLENBQUM7SUFDdEUsQ0FBQyxDQUFDLENBQUM7SUFFSCxJQUFJLENBQUMsc0JBQXNCLEVBQUUsR0FBRyxFQUFFO1FBQzlCLElBQUksWUFBWSxHQUFHLGtDQUFrQixDQUFDLFFBQVEsQ0FBQyxtQ0FBbUMsQ0FBQyxDQUFDO1FBRXBGLFlBQVksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyx1Q0FBdUMsQ0FBQyxDQUFDO0lBQzVFLENBQUMsQ0FBQyxDQUFDO0lBRUgsSUFBSSxDQUFDLHFDQUFxQyxFQUFFLEdBQUcsRUFBRTtRQUM3QyxJQUFJLFlBQVksR0FBRyxrQ0FBa0IsQ0FBQyxRQUFRLENBQUMsbUNBQW1DLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFM0YsWUFBWSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLG1DQUFtQyxDQUFDLENBQUM7SUFDeEUsQ0FBQyxDQUFDLENBQUM7SUFFSCxJQUFJLENBQUMseUNBQXlDLEVBQUUsR0FBRyxFQUFFO1FBQ2pELElBQUksYUFBYSxHQUFHLG9DQUFvQyxFQUFF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