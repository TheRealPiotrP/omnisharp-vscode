"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const crypto = require("crypto");
const fs = require("fs");
const os = require("os");
const util = require("./common");
const unknown = 'unknown';
/**
 * There is no standard way on Linux to find the distribution name and version.
 * Recently, systemd has pushed to standardize the os-release file. This has
 * seen adoption in "recent" versions of all major distributions.
 * https://www.freedesktop.org/software/systemd/man/os-release.html
 */
class LinuxDistribution {
    constructor(name, version, idLike) {
        this.name = name;
        this.version = version;
        this.idLike = idLike;
    }
    static GetCurrent() {
        // Try /etc/os-release and fallback to /usr/lib/os-release per the synopsis
        // at https://www.freedesktop.org/software/systemd/man/os-release.html.
        return LinuxDistribution.FromFilePath('/etc/os-release')
            .catch(() => LinuxDistribution.FromFilePath('/usr/lib/os-release'))
            .catch(() => Promise.resolve(new LinuxDistribution(unknown, unknown)));
    }
    toString() {
        return `name=${this.name}, version=${this.version}`;
    }
    /**
     * Returns a string representation of LinuxDistribution that only returns the
     * distro name if it appears on an allowed list of known distros. Otherwise,
     * it returns 'other'.
     */
    toTelemetryString() {
        const allowedList = [
            'antergos', 'arch', 'centos', 'debian', 'deepin', 'elementary', 'fedora',
            'galliumos', 'gentoo', 'kali', 'linuxmint', 'manjoro', 'neon', 'opensuse',
            'parrot', 'rhel', 'ubuntu', 'zorin'
        ];
        if (this.name === unknown || allowedList.indexOf(this.name) >= 0) {
            return this.toString();
        }
        else {
            // Having a hash of the name will be helpful to identify spikes in the 'other'
            // bucket when a new distro becomes popular and needs to be added to the
            // allowed list above.
            const hash = crypto.createHash('sha256');
            hash.update(this.name);
            const hashedName = hash.digest('hex');
            return `other (${hashedName})`;
        }
    }
    static FromFilePath(filePath) {
        return new Promise((resolve, reject) => {
            fs.readFile(filePath, 'utf8', (error, data) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(LinuxDistribution.FromReleaseInfo(data));
                }
            });
        });
    }
    static FromReleaseInfo(releaseInfo, eol = os.EOL) {
        let name = unknown;
        let version = unknown;
        let idLike = null;
        const lines = releaseInfo.split(eol);
        for (let line of lines) {
            line = line.trim();
            let equalsIndex = line.indexOf('=');
            if (equalsIndex >= 0) {
                let key = line.substring(0, equalsIndex);
                let value = line.substring(equalsIndex + 1);
                // Strip double quotes if necessary
                if (value.length > 1 && value.startsWith('"') && value.endsWith('"')) {
                    value = value.substring(1, value.length - 1);
                }
                if (key === 'ID') {
                    name = value;
                }
                else if (key === 'VERSION_ID') {
                    version = value;
                }
                else if (key === 'ID_LIKE') {
                    idLike = value.split(" ");
                }
                if (name !== unknown && version !== unknown && idLike !== null) {
                    break;
                }
            }
        }
        return new LinuxDistribution(name, version, idLike);
    }
}
exports.LinuxDistribution = LinuxDistribution;
class PlatformInformation {
    constructor(platform, architecture, distribution = null) {
        this.platform = platform;
        this.architecture = architecture;
        this.distribution = distribution;
    }
    isWindows() {
        return this.platform === 'win32';
    }
    isMacOS() {
        return this.platform === 'darwin';
    }
    isLinux() {
        return this.platform === 'linux';
    }
    toString() {
        let result = this.platform;
        if (this.architecture) {
            if (result) {
                result += ', ';
            }
            result += this.architecture;
        }
        if (this.distribution) {
            if (result) {
                result += ', ';
            }
            result += this.distribution.toString();
        }
        return result;
    }
    static GetCurrent() {
        let platform = os.platform();
        let architecturePromise;
        let distributionPromise;
        switch (platform) {
            case 'win32':
                architecturePromise = PlatformInformation.GetWindowsArchitecture();
                distributionPromise = Promise.resolve(null);
                break;
            case 'darwin':
                architecturePromise = PlatformInformation.GetUnixArchitecture();
                distributionPromise = Promise.resolve(null);
                break;
            case 'linux':
                architecturePromise = PlatformInformation.GetUnixArchitecture();
                distributionPromise = LinuxDistribution.GetCurrent();
                break;
            default:
                throw new Error(`Unsupported platform: ${platform}`);
        }
        return Promise.all([architecturePromise, distributionPromise])
            .then(([arch, distro]) => {
            return new PlatformInformation(platform, arch, distro);
        });
    }
    static GetWindowsArchitecture() {
        return new Promise((resolve, reject) => {
            if (process.env.PROCESSOR_ARCHITECTURE === 'x86' && process.env.PROCESSOR_ARCHITEW6432 === undefined) {
                resolve('x86');
            }
            else {
                resolve('x86_64');
            }
        });
    }
    static GetUnixArchitecture() {
        return util.execChildProcess('uname -m')
            .then(architecture => {
            if (architecture) {
                return architecture.trim();
            }
            return null;
        });
    }
}
exports.PlatformInformation = PlatformInformation;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGxhdGZvcm0uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvcGxhdGZvcm0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Z0dBR2dHOztBQUVoRyxpQ0FBaUM7QUFDakMseUJBQXlCO0FBQ3pCLHlCQUF5QjtBQUN6QixpQ0FBaUM7QUFFakMsTUFBTSxPQUFPLEdBQUcsU0FBUyxDQUFDO0FBRTFCOzs7OztHQUtHO0FBQ0g7SUFDSSxZQUNXLElBQVksRUFDWixPQUFlLEVBQ2YsTUFBaUI7UUFGakIsU0FBSSxHQUFKLElBQUksQ0FBUTtRQUNaLFlBQU8sR0FBUCxPQUFPLENBQVE7UUFDZixXQUFNLEdBQU4sTUFBTSxDQUFXO0lBQUksQ0FBQztJQUUxQixNQUFNLENBQUMsVUFBVTtRQUNwQiwyRUFBMkU7UUFDM0UsdUVBQXVFO1FBQ3ZFLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxZQUFZLENBQUMsaUJBQWlCLENBQUM7YUFDbkQsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLGlCQUFpQixDQUFDLFlBQVksQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO2FBQ2xFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksaUJBQWlCLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMvRSxDQUFDO0lBRU0sUUFBUTtRQUNYLE1BQU0sQ0FBQyxRQUFRLElBQUksQ0FBQyxJQUFJLGFBQWEsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQ3hELENBQUM7SUFFRDs7OztPQUlHO0lBQ0ksaUJBQWlCO1FBQ3BCLE1BQU0sV0FBVyxHQUFHO1lBQ2hCLFVBQVUsRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsWUFBWSxFQUFFLFFBQVE7WUFDeEUsV0FBVyxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsV0FBVyxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUs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