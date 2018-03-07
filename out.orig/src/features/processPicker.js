"use strict";
/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * See LICENSE.md in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
Object.defineProperty(exports, "__esModule", { value: true });
const child_process = require("child_process");
const fs = require("fs-extra");
const os = require("os");
const path = require("path");
const vscode = require("vscode");
const platform_1 = require("../platform");
const common_1 = require("../common");
class AttachPicker {
    constructor(attachItemsProvider) {
        this.attachItemsProvider = attachItemsProvider;
    }
    ShowAttachEntries() {
        return this.attachItemsProvider.getAttachItems()
            .then(processEntries => {
            let attachPickOptions = {
                matchOnDescription: true,
                matchOnDetail: true,
                placeHolder: "Select the process to attach to"
            };
            return vscode.window.showQuickPick(processEntries, attachPickOptions)
                .then(chosenProcess => {
                return chosenProcess ? chosenProcess.id : null;
            });
        });
    }
}
exports.AttachPicker = AttachPicker;
class RemoteAttachPicker {
    static get commColumnTitle() { return Array(PsOutputParser.secondColumnCharacters).join("a"); }
    static get linuxPsCommand() { return `ps -axww -o pid=,comm=${RemoteAttachPicker.commColumnTitle},args=`; }
    static get osxPsCommand() { return `ps -axww -o pid=,comm=${RemoteAttachPicker.commColumnTitle},args= -c`; }
    static get debuggerCommand() { return "${debuggerCommand}"; }
    static get scriptShellCmd() { return "sh -s"; }
    static ValidateAndFixPipeProgram(program) {
        return platform_1.PlatformInformation.GetCurrent().then(platformInfo => {
            // Check if we are on a 64 bit Windows
            if (platformInfo.isWindows() && platformInfo.architecture === "x86_64") {
                let sysRoot = process.env.SystemRoot;
                let oldPath = path.join(sysRoot, 'System32');
                let newPath = path.join(sysRoot, 'sysnative');
                // Escape backslashes, replace and ignore casing
                let regex = RegExp(oldPath.replace(/\\/g, '\\\\'), "ig");
                // Replace System32 with sysnative
                let newProgram = program.replace(regex, newPath);
                // Check if program strong contains System32 directory.
                // And if the program does not exist in System32, but it does in sysnative.
                // Return sysnative program
                if (program.toLowerCase().startsWith(oldPath.toLowerCase()) &&
                    !fs.existsSync(program) && fs.existsSync(newProgram)) {
                    return newProgram;
                }
            }
            // Return original program and let it fall through
            return program;
        });
    }
    // Note: osPlatform is passed as an argument for testing.
    static getPipeTransportOptions(pipeTransport, osPlatform) {
        let pipeProgram = pipeTransport.pipeProgram;
        let pipeArgs = pipeTransport.pipeArgs;
        let quoteArgs = pipeTransport.quoteArgs != null ? pipeTransport.quoteArgs : true; // default value is true
        let platformSpecificPipeTransportOptions = this.getPlatformSpecificPipeTransportOptions(pipeTransport, osPlatform);
        if (platformSpecificPipeTransportOptions) {
            pipeProgram = platformSpecificPipeTransportOptions.pipeProgram || pipeProgram;
            pipeArgs = platformSpecificPipeTransportOptions.pipeArgs || pipeArgs;
            quoteArgs = platformSpecificPipeTransportOptions.quoteArgs != null ? platformSpecificPipeTransportOptions.quoteArgs : quoteArgs;
        }
        return {
            pipeProgram: pipeProgram,
            pipeArgs: pipeArgs,
            quoteArgs: quoteArgs
        };
    }
    // If the current process is on a current operating system and a specific pipe transport
    // is included, then use that specific pipe transport configuration.
    //
    // Note: osPlatform is passed as an argument for testing.
    static getPlatformSpecificPipeTransportOptions(config, osPlatform) {
        if (osPlatform === "darwin" && config.osx) {
            return config.osx;
        }
        else if (osPlatform === "linux" && config.linux) {
            return config.linux;
        }
        else if (osPlatform === "win32" && config.windows) {
            return config.windows;
        }
        return null;
    }
    // Creates a pipe command string based on the type of pipe args.
    static createPipeCmd(pipeProgram, pipeArgs, quoteArgs) {
        return this.ValidateAndFixPipeProgram(pipeProgram).then(fixedPipeProgram => {
            if (typeof pipeArgs === "string") {
                return Promise.resolve(this.createPipeCmdFromString(fixedPipeProgram, pipeArgs, quoteArgs));
            }
            else if (pipeArgs instanceof Array) {
                return Promise.resolve(this.createPipeCmdFromArray(fixedPipeProgram, pipeArgs, quoteArgs));
            }
            else {
                // Invalid args type
                return Promise.reject(new Error("pipeArgs must be a string or a string array type"));
            }
        });
    }
    static createPipeCmdFromString(pipeProgram, pipeArgs, quoteArgs) {
        // Quote program if quoteArgs is true.
        let pipeCmd = this.quoteArg(pipeProgram);
        // If ${debuggerCommand} exists in pipeArgs, replace. No quoting is applied to the command here.
        if (pipeArgs.indexOf(this.debuggerCommand) >= 0) {
            pipeCmd = pipeCmd.concat(" ", pipeArgs.replace(/\$\{debuggerCommand\}/g, this.scriptShellCmd));
        }
        else {
            pipeCmd = pipeCmd.concat(" ", pipeArgs.concat(" ", this.quoteArg(this.scriptShellCmd, quoteArgs)));
        }
        return pipeCmd;
    }
    static createPipeCmdFromArray(pipeProgram, pipeArgs, quoteArgs) {
        let pipeCmdList = [];
        // Add pipeProgram to the start. Quoting is handeled later.
        pipeCmdList.push(pipeProgram);
        // If ${debuggerCommand} exists, replace it.
        if (pipeArgs.filter(arg => arg.indexOf(this.debuggerCommand) >= 0).length > 0) {
            for (let arg of pipeArgs) {
                while (arg.indexOf(this.debuggerCommand) >= 0) {
                    arg = arg.replace(this.debuggerCommand, RemoteAttachPicker.scriptShellCmd);
                }
                pipeCmdList.push(arg);
            }
        }
        else {
            pipeCmdList = pipeCmdList.concat(pipeArgs);
            pipeCmdList.push(this.scriptShellCmd);
        }
        // Quote if enabled.
        return quoteArgs ? this.createArgumentList(pipeCmdList) : pipeCmdList.join(' ');
    }
    // Quote the arg if the flag is enabled and there is a space.
    static quoteArg(arg, quoteArg = true) {
        if (quoteArg && arg.includes(' ')) {
            return `"${arg}"`;
        }
        return arg;
    }
    // Converts an array of string arguments to a string version. Always quotes any arguments with spaces.
    static createArgumentList(args) {
        return args.map(arg => this.quoteArg(arg)).join(" ");
    }
    static ShowAttachEntries(args) {
        // Create remote attach output channel for errors.
        if (!RemoteAttachPicker._channel) {
            RemoteAttachPicker._channel = vscode.window.createOutputChannel('remote-attach');
        }
        else {
            RemoteAttachPicker._channel.clear();
        }
        // Grab selected name from UI
        // Args may be null if ran with F1
        let name = args ? args.name : null;
        if (!name) {
            // Config name not found. 
            return Promise.reject(new Error("Name not defined in current configuration."));
        }
        if (!args.pipeTransport || !args.pipeTransport.debuggerPath) {
            // Missing PipeTransport and debuggerPath, prompt if user wanted to just do local attach.
            return Promise.reject(new Error("Configuration \"" + name + "\" in launch.json does not have a " +
                "pipeTransport argument with debuggerPath for pickRemoteProcess. Use pickProcess for local attach."));
        }
        else {
            let pipeTransport = this.getPipeTransportOptions(args.pipeTransport, os.platform());
            return RemoteAttachPicker.createPipeCmd(pipeTransport.pipeProgram, pipeTransport.pipeArgs, pipeTransport.quoteArgs)
                .then(pipeCmd => RemoteAttachPicker.getRemoteOSAndProcesses(pipeCmd))
                .then(processes => {
                let attachPickOptions = {
                    matchOnDescription: true,
                    matchOnDetail: true,
                    placeHolder: "Select the process to attach to"
                };
                return vscode.window.showQuickPick(processes, attachPickOptions);
            })
                .then(item => { return item ? item.id : Promise.reject(new Error("Could not find a process id to attach.")); });
        }
    }
    static getRemoteOSAndProcesses(pipeCmd) {
        const scriptPath = path.join(common_1.getExtensionPath(), 'scripts', 'remoteProcessPickerScript');
        return execChildProcessAndOutputErrorToChannel(`${pipeCmd} < ${scriptPath}`, null, RemoteAttachPicker._channel).then(output => {
            // OS will be on first line
            // Processess will follow if listed
            let lines = output.split(/\r?\n/);
            if (lines.length == 0) {
                return Promise.reject(new Error("Pipe transport failed to get OS and processes."));
            }
            else {
                let remoteOS = lines[0].replace(/[\r\n]+/g, '');
                if (remoteOS != "Linux" && remoteOS != "Darwin") {
                    return Promise.reject(new Error(`Operating system "${remoteOS}"" not supported.`));
                }
                // Only got OS from uname
                if (lines.length == 1) {
                    return Promise.reject(new Error("Transport attach could not obtain processes list."));
                }
                else {
                    let processes = lines.slice(1);
                    return sortProcessEntries(PsOutputParser.parseProcessFromPsArray(processes), remoteOS);
                }
            }
        });
    }
}
RemoteAttachPicker._channel = null;
exports.RemoteAttachPicker = RemoteAttachPicker;
class Process {
    constructor(name, pid, commandLine) {
        this.name = name;
        this.pid = pid;
        this.commandLine = commandLine;
    }
    toAttachItem() {
        return {
            label: this.name,
            description: this.pid,
            detail: this.commandLine,
            id: this.pid
        };
    }
}
class DotNetAttachItemsProviderFactory {
    static Get() {
        if (os.platform() === 'win32') {
            return new WmicAttachItemsProvider();
        }
        else {
            return new PsAttachItemsProvider();
        }
    }
}
exports.DotNetAttachItemsProviderFactory = DotNetAttachItemsProviderFactory;
class DotNetAttachItemsProvider {
    getAttachItems() {
        return this.getInternalProcessEntries().then(processEntries => {
            return sortProcessEntries(processEntries, os.platform());
        });
    }
}
function sortProcessEntries(processEntries, osPlatform) {
    // localeCompare is significantly slower than < and > (2000 ms vs 80 ms for 10,000 elements)
    // We can change to localeCompare if this becomes an issue
    let dotnetProcessName = (osPlatform === 'win32') ? 'dotnet.exe' : 'dotnet';
    processEntries = processEntries.sort((a, b) => {
        if (a.name.toLowerCase() === dotnetProcessName && b.name.toLowerCase() === dotnetProcessName) {
            return a.commandLine.toLowerCase() < b.commandLine.toLowerCase() ? -1 : 1;
        }
        else if (a.name.toLowerCase() === dotnetProcessName) {
            return -1;
        }
        else if (b.name.toLowerCase() === dotnetProcessName) {
            return 1;
        }
        else {
            return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1;
        }
    });
    let attachItems = processEntries.map(p => p.toAttachItem());
    return attachItems;
}
class PsAttachItemsProvider extends DotNetAttachItemsProvider {
    getInternalProcessEntries() {
        // the BSD version of ps uses '-c' to have 'comm' only output the executable name and not
        // the full path. The Linux version of ps has 'comm' to only display the name of the executable
        // Note that comm on Linux systems is truncated to 16 characters:
        // https://bugzilla.redhat.com/show_bug.cgi?id=429565
        // Since 'args' contains the full path to the executable, even if truncated, searching will work as desired.
        const psCommand = os.platform() === 'darwin' ? RemoteAttachPicker.osxPsCommand : RemoteAttachPicker.linuxPsCommand;
        return execChildProcess(psCommand, null).then(processes => {
            return PsOutputParser.parseProcessFromPs(processes);
        });
    }
}
exports.PsAttachItemsProvider = PsAttachItemsProvider;
class PsOutputParser {
    // Perf numbers:
    // OS X 10.10
    // | # of processes | Time (ms) |
    // |----------------+-----------|
    // |            272 |        52 |
    // |            296 |        49 |
    // |            384 |        53 |
    // |            784 |       116 |
    //
    // Ubuntu 16.04
    // | # of processes | Time (ms) |
    // |----------------+-----------|
    // |            232 |        26 |
    // |            336 |        34 |
    // |            736 |        62 |
    // |           1039 |       115 |
    // |           1239 |       182 |
    // ps outputs as a table. With the option "ww", ps will use as much width as necessary.
    // However, that only applies to the right-most column. Here we use a hack of setting
    // the column header to 50 a's so that the second column will have at least that many
    // characters. 50 was chosen because that's the maximum length of a "label" in the
    // QuickPick UI in VSCode.
    static get secondColumnCharacters() { return 50; }
    // Only public for tests.
    static parseProcessFromPs(processes) {
        let lines = processes.split(os.EOL);
        let processEntries = [];
        // lines[0] is the header of the table
        for (let i = 1; i < lines.length; i++) {
            let line = lines[i];
            if (!line) {
                continue;
            }
            let process = this.parseLineFromPs(line);
            if (process) {
                processEntries.push(process);
            }
        }
        return processEntries;
    }
    static parseProcessFromPsArray(lines) {
        let processEntries = [];
        // lines[0] is the header of the table
        for (let i = 1; i < lines.length; i++) {
            let line = lines[i];
            if (!line) {
                continue;
            }
            let process = this.parseLineFromPs(line);
            if (process) {
                processEntries.push(process);
            }
        }
        return processEntries;
    }
    static parseLineFromPs(line) {
        // Explanation of the regex:
        //   - any leading whitespace
        //   - PID
        //   - whitespace
        //   - executable name --> this is PsAttachItemsProvider.secondColumnCharacters - 1 because ps reserves one character
        //     for the whitespace separator
        //   - whitespace
        //   - args (might be empty)
        const psEntry = new RegExp(`^\\s*([0-9]+)\\s+(.{${PsOutputParser.secondColumnCharacters - 1}})\\s+(.*)$`);
        const matches = psEntry.exec(line);
        if (matches && matches.length === 4) {
            const pid = matches[1].trim();
            const executable = matches[2].trim();
            const cmdline = matches[3].trim();
            return new Process(executable, pid, cmdline);
        }
    }
}
exports.PsOutputParser = PsOutputParser;
class WmicAttachItemsProvider extends DotNetAttachItemsProvider {
    getInternalProcessEntries() {
        const wmicCommand = 'wmic process get Name,ProcessId,CommandLine /FORMAT:list';
        return execChildProcess(wmicCommand, null).then(processes => {
            return WmicOutputParser.parseProcessFromWmic(processes);
        });
    }
}
exports.WmicAttachItemsProvider = WmicAttachItemsProvider;
class WmicOutputParser {
    // Perf numbers on Win10:
    // | # of processes | Time (ms) |
    // |----------------+-----------|
    // |            309 |       413 |
    // |            407 |       463 |
    // |            887 |       746 |
    // |           1308 |      1132 |
    static get wmicNameTitle() { return 'Name'; }
    static get wmicCommandLineTitle() { return 'CommandLine'; }
    static get wmicPidTitle() { return 'ProcessId'; }
    // Only public for tests.
    static parseProcessFromWmic(processes) {
        let lines = processes.split(os.EOL);
        let currentProcess = new Process(null, null, null);
        let processEntries = [];
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            if (!line) {
                continue;
            }
            this.parseLineFromWmic(line, currentProcess);
            // Each entry of processes has ProcessId as the last line
            if (line.startsWith(WmicOutputParser.wmicPidTitle)) {
                processEntries.push(currentProcess);
                currentProcess = new Process(null, null, null);
            }
        }
        return processEntries;
    }
    static parseLineFromWmic(line, process) {
        let splitter = line.indexOf('=');
        if (splitter >= 0) {
            let key = line.slice(0, line.indexOf('='));
            let value = line.slice(line.indexOf('=') + 1);
            if (key === WmicOutputParser.wmicNameTitle) {
                process.name = value.trim();
            }
            else if (key === WmicOutputParser.wmicPidTitle) {
                process.pid = value.trim();
            }
            else if (key === WmicOutputParser.wmicCommandLineTitle) {
                const extendedLengthPath = '\\??\\';
                if (value.startsWith(extendedLengthPath)) {
                    value = value.slice(extendedLengthPath.length).trim();
                }
                process.commandLine = value.trim();
            }
        }
    }
}
exports.WmicOutputParser = WmicOutputParser;
function execChildProcess(process, workingDirectory) {
    return new Promise((resolve, reject) => {
        child_process.exec(process, { cwd: workingDirectory, maxBuffer: 500 * 1024 }, (error, stdout, stderr) => {
            if (error) {
                reject(error);
                return;
            }
            if (stderr && stderr.length > 0) {
                reject(new Error(stderr));
                return;
            }
            resolve(stdout);
        });
    });
}
// VSCode cannot find the path "c:\windows\system32\bash.exe" as bash.exe is only available on 64bit OS. 
// It can be invoked from "c:\windows\sysnative\bash.exe", so adding "c:\windows\sysnative" to path if we identify
// VSCode is running in windows and doesn't have it in the path.
function GetSysNativePathIfNeeded() {
    return platform_1.PlatformInformation.GetCurrent().then(platformInfo => {
        let env = process.env;
        if (platformInfo.isWindows() && platformInfo.architecture === "x86_64") {
            let sysnative = process.env.WINDIR + "\\sysnative";
            env.Path = process.env.PATH + ";" + sysnative;
        }
        return env;
    });
}
function execChildProcessAndOutputErrorToChannel(process, workingDirectory, channel) {
    channel.appendLine(`Executing: ${process}`);
    return new Promise((resolve, reject) => {
        return GetSysNativePathIfNeeded().then(newEnv => {
            child_process.exec(process, { cwd: workingDirectory, env: newEnv, maxBuffer: 500 * 1024 }, (error, stdout, stderr) => {
                let channelOutput = "";
                if (stdout && stdout.length > 0) {
                    channelOutput = channelOutput.concat(stdout);
                }
                if (stderr && stderr.length > 0) {
                    channelOutput = channelOutput.concat("stderr: " + stderr);
                }
                if (error) {
                    channelOutput = channelOutput.concat("Error Message: " + error.message);
                }
                if (error || (stderr && stderr.length > 0)) {
                    channel.append(channelOutput);
                    channel.show();
                    reject(new Error("See remote-attach output"));
                    return;
                }
                resolve(stdout);
            });
        });
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvY2Vzc1BpY2tlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9mZWF0dXJlcy9wcm9jZXNzUGlja2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O2dHQUdnRzs7QUFFaEcsK0NBQStDO0FBQy9DLCtCQUErQjtBQUMvQix5QkFBeUI7QUFDekIsNkJBQTZCO0FBQzdCLGlDQUFpQztBQUVqQywwQ0FBa0Q7QUFDbEQsc0NBQTZDO0FBVTdDO0lBQ0ksWUFBb0IsbUJBQXdDO1FBQXhDLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBcUI7SUFBSSxDQUFDO0lBRTFELGlCQUFpQjtRQUNwQixNQUFNLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLGNBQWMsRUFBRTthQUMzQyxJQUFJLENBQUMsY0FBYyxDQUFDLEVBQUU7WUFDbkIsSUFBSSxpQkFBaUIsR0FBNEI7Z0JBQzdDLGtCQUFrQixFQUFFLElBQUk7Z0JBQ3hCLGFBQWEsRUFBRSxJQUFJO2dCQUNuQixXQUFXLEVBQUUsaUNBQWlDO2FBQ2pELENBQUM7WUFFRixNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsY0FBYyxFQUFFLGlCQUFpQixDQUFDO2lCQUNoRSxJQUFJLENBQUMsYUFBYSxDQUFDLEVBQUU7Z0JBQ2xCLE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUNuRCxDQUFDLENBQUMsQ0FBQztRQUNYLENBQUMsQ0FBQyxDQUFDO0lBQ1gsQ0FBQztDQUNKO0FBbEJELG9DQWtCQztBQVFEO0lBQ1csTUFBTSxLQUFLLGVBQWUsS0FBSyxNQUFNLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDL0YsTUFBTSxLQUFLLGNBQWMsS0FBSyxNQUFNLENBQUMseUJBQXlC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