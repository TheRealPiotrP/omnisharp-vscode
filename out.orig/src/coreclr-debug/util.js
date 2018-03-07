/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const fs = require("fs");
const semver = require("semver");
const os = require("os");
const common_1 = require("./../common");
const MINIMUM_SUPPORTED_DOTNET_CLI = '1.0.0-preview2-003121';
class DotnetInfo {
}
exports.DotnetInfo = DotnetInfo;
class DotNetCliError extends Error {
}
exports.DotNetCliError = DotNetCliError;
class CoreClrDebugUtil {
    constructor(extensionDir, logger) {
        this._extensionDir = '';
        this._debugAdapterDir = '';
        this._installCompleteFilePath = '';
        this._extensionDir = extensionDir;
        this._debugAdapterDir = path.join(this._extensionDir, '.debugger');
        this._installCompleteFilePath = path.join(this._debugAdapterDir, 'install.complete');
    }
    extensionDir() {
        if (this._extensionDir === '') {
            throw new Error('Failed to set extension directory');
        }
        return this._extensionDir;
    }
    debugAdapterDir() {
        if (this._debugAdapterDir === '') {
            throw new Error('Failed to set debugadpter directory');
        }
        return this._debugAdapterDir;
    }
    installCompleteFilePath() {
        if (this._installCompleteFilePath === '') {
            throw new Error('Failed to set install complete file path');
        }
        return this._installCompleteFilePath;
    }
    static writeEmptyFile(path) {
        return new Promise((resolve, reject) => {
            fs.writeFile(path, '', (err) => {
                if (err) {
                    reject(err.code);
                }
                else {
                    resolve();
                }
            });
        });
    }
    defaultDotNetCliErrorMessage() {
        return 'Failed to find up to date dotnet cli on the path.';
    }
    // This function checks for the presence of dotnet on the path and ensures the Version
    // is new enough for us. 
    // Returns: a promise that returns a DotnetInfo class
    // Throws: An DotNetCliError() from the return promise if either dotnet does not exist or is too old. 
    checkDotNetCli() {
        let dotnetInfo = new DotnetInfo();
        return common_1.execChildProcess('dotnet --info', process.cwd())
            .then((data) => {
            let lines = data.replace(/\r/mg, '').split('\n');
            lines.forEach(line => {
                let match;
                if (match = /^\ Version:\s*([^\s].*)$/.exec(line)) {
                    dotnetInfo.Version = match[1];
                }
                else if (match = /^\ OS Version:\s*([^\s].*)$/.exec(line)) {
                    dotnetInfo.OsVersion = match[1];
                }
                else if (match = /^\ RID:\s*([\w\-\.]+)$/.exec(line)) {
                    dotnetInfo.RuntimeId = match[1];
                }
            });
        }).catch((error) => {
            // something went wrong with spawning 'dotnet --info'
            let dotnetError = new DotNetCliError();
            dotnetError.ErrorMessage = 'The .NET CLI tools cannot be located. .NET Core debugging will not be enabled. Make sure .NET CLI tools are installed and are on the path.';
            dotnetError.ErrorString = "Failed to spawn 'dotnet --info'";
            throw dotnetError;
        }).then(() => {
            // succesfully spawned 'dotnet --info', check the Version
            if (semver.lt(dotnetInfo.Version, MINIMUM_SUPPORTED_DOTNET_CLI)) {
                let dotnetError = new DotNetCliError();
                dotnetError.ErrorMessage = 'The .NET CLI tools on the path are too old. .NET Core debugging will not be enabled. The minimum supported version is ' + MINIMUM_SUPPORTED_DOTNET_CLI + '.';
                dotnetError.ErrorString = "dotnet cli is too old";
                throw dotnetError;
            }
            return dotnetInfo;
        });
    }
    static isMacOSSupported() {
        // .NET Core 2.0 requires macOS 10.12 (Sierra), which is Darwin 16.0+
        // Darwin version chart: https://en.wikipedia.org/wiki/Darwin_(operating_system)
        return semver.gte(os.release(), "16.0.0");
    }
    static existsSync(path) {
        try {
            fs.accessSync(path, fs.constants.F_OK);
            return true;
        }
        catch (err) {
            if (err.code === 'ENOENT' || err.code === 'ENOTDIR') {
                return false;
            }
            else {
                throw Error(err.code);
            }
        }
    }
    static getPlatformExeExtension() {
        if (process.platform === 'win32') {
            return '.exe';
        }
        return '';
    }
}
exports.CoreClrDebugUtil = CoreClrDebugUtil;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlY2xyLWRlYnVnL3V0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7QUFDaEcsWUFBWSxDQUFDOztBQUViLDZCQUE2QjtBQUM3Qix5QkFBeUI7QUFDekIsaUNBQWlDO0FBQ2pDLHlCQUF5QjtBQUN6Qix3Q0FBK0M7QUFHL0MsTUFBTSw0QkFBNEIsR0FBVyx1QkFBdUIsQ0FBQztBQUVyRTtDQUtDO0FBTEQsZ0NBS0M7QUFFRCxvQkFBNEIsU0FBUSxLQUFLO0NBR3hDO0FBSEQsd0NBR0M7QUFFRDtJQU1JLFlBQVksWUFBb0IsRUFBRSxNQUFjO1FBSnhDLGtCQUFhLEdBQVcsRUFBRSxDQUFDO1FBQzNCLHFCQUFnQixHQUFXLEVBQUUsQ0FBQztRQUM5Qiw2QkFBd0IsR0FBVyxFQUFFLENBQUM7UUFHMUMsSUFBSSxDQUFDLGFBQWEsR0FBRyxZQUFZLENBQUM7UUFDbEMsSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxXQUFXLENBQUMsQ0FBQztRQUNuRSxJQUFJLENBQUMsd0JBQXdCLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztJQUN6RixDQUFDO0lBRU0sWUFBWTtRQUNmLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxhQUFhLEtBQUssRUFBRSxDQUFDLENBQzlCLENBQUM7WUFDRyxNQUFNLElBQUksS0FBSyxDQUFDLG1DQUFtQyxDQUFDLENBQUM7UUFDekQsQ0FBQztRQUNELE1BQU0sQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDO0lBQzlCLENBQUM7SUFFTSxlQUFlO1FBQ2xCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQy9CLE1BQU0sSUFBSSxLQUFLLENBQUMscUNBQXFDLENBQUMsQ0FBQztRQUMzRCxDQUFDO1FBQ0QsTUFBTSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQztJQUNqQyxDQUFDO0lBRU0sdUJBQXVCO1FBQzFCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyx3QkFBd0IsS0FBSyxFQUFFLENBQUMsQ0FDekMsQ0FBQztZQUNHLE1BQU0sSUFBSSxLQUFLLENBQUMsMENBQTBDLENBQUMsQ0FBQztRQUNoRSxDQUFDO1FBQ0QsTUFBTSxDQUFDLElBQUksQ0FBQyx3QkFBd0IsQ0FBQztJQUN6QyxDQUFDO0lBRU0sTUFBTSxDQUFDLGNBQWMsQ0FBQyxJQUFZO1FBQ3JDLE1BQU0sQ0FBQyxJQUFJLE9BQU8sQ0FBTyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtZQUN6QyxFQUFFLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxFQUFFLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRTtnQkFDM0IsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztvQkFDTixNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNyQixDQUFDO2dCQUFDLElBQUksQ0FBQyxDQUFDO29CQUNKLE9BQU8sRUFBRSxDQUFDO2dCQUNkLENBQUM7WUFDTCxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVNLDRCQUE0QjtRQUMvQixNQUFNLENBQUMsbURBQW1ELENBQUM7SUFDL0QsQ0FBQztJQUVELHNGQUFzRjtJQUN0Rix5QkFBeUI7SUFDekIscURBQXFEO0lBQ3JELHNHQUFzRztJQUMvRixjQUFjO1FBRWpCLElBQUksVUFBVSxHQUFHLElBQUksVUFBVSxFQUFFLENBQUM7UUFFbEMsTUFBTSxDQUFDLHlCQUFnQixDQUFDLGVBQWUsRUFBRSxPQUFPLENBQUMsR0FBRyxFQUFFLENBQUM7YUFDdEQsSUFBSSxDQUFDLENBQUMsSUFBWSxFQUFFLEVBQUU7WUFDbkIsSUFBSSxLQUFLLEdBQWEsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzNELEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQ2pCLElBQUksS0FBdUIsQ0FBQztnQkFDNUIsRUFBRSxDQUFDLENBQUMsS0FBSyxHQUFHLDBCQUEwQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ2hELFVBQVUsQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNsQyxDQUFDO2dCQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLEdBQUcsNkJBQTZCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDMUQsVUFBVSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3BDLENBQUM7Z0JBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssR0FBRyx3QkFBd0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNyRCxVQUFVLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDcEMsQ0FBQztZQUNMLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUU7WUFDZixxREFBcUQ7WUFDckQsSUFBSSxXQUFXLEdBQUcsSUFBSSxjQUFjLEVBQUUsQ0FBQztZQUN2QyxXQUFXLENBQUMsWUFBWSxHQUFHLDRJQUE0SSxDQUFDO1lBQ3hLLFdBQVcsQ0FBQyxXQUFXLEdBQUcsaUNBQWlDLENBQUM7WUFDNUQsTUFBTSxXQUFXLENBQUM7UUFDdEIsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRTtZQUNULHlEQUF5RDtZQUN6RCxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsNEJBQTRCLENBQUMsQ0FBQyxDQUNoRSxDQUFDO2dCQUNHLElBQUksV0FBVyxHQUFHLElBQUksY0FBYyxFQUFFLENBQUM7Z0JBQ3ZDLFdBQVcsQ0FBQyxZQUFZLEdBQUcsd0hBQXdILEdBQUcsNEJBQTRCLEdBQUcsR0FBRyxDQUFDO2dCQUN6TCxXQUFXLENBQUMsV0FBVyxHQUFHLHVCQUF1QixDQUFDO2dCQUNsRCxNQUFNLFdBQVcsQ0FBQztZQUN0QixDQUFDO1lBRUQsTUFBTSxDQUFDLFVBQVUsQ0FBQztRQUN0QixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTSxNQUFNLENBQUMsZ0JBQWdCO1FBQzFCLHFFQUFxRTtRQUNyRSxnRkFBZ0Y7UUFDaEYsTUFBTSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQzlDLENBQUM7SUFFTSxNQUFNLENBQUMsVUFBVSxDQUFDLElBQVk7UUFDakMsSUFBSSxDQUFDO1lBQ0QsRUFBRSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUN2QyxNQUFNLENBQUMsSUFBSSxDQUFDO1FBQ2hCLENBQUM7UUFBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ1gsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksS0FBSyxRQUFRLElBQUksR0FBRyxDQUFDLElBQUksS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDO2dCQUNsRCxNQUFNLENBQUMsS0FBSyxDQUFDO1lBQ2pCLENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDSixNQUFNLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDMUIsQ0FBQztRQUNMLENBQUM7SUFDTCxDQUFDO0lBRU0sTUFBTSxDQUFDLHVCQUF1QjtRQUNqQyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsUUFBUSxLQUFLLE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFDL0IsTUFBTSxDQUFDLE1BQU0sQ0FBQztRQUNsQixDQUFDO1FBRUQsTUFBTSxDQUFDLEVBQUUsQ0FBQztJQUNkLENBQUM7Q0FDSjtBQXRIRCw0Q0FzSEMifQ==