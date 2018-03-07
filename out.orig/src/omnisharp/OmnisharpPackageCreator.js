"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
function GetPackagesFromVersion(version, runTimeDependencies, serverUrl, installPath) {
    if (!version) {
        throw new Error('Invalid version');
    }
    let versionPackages = new Array();
    for (let inputPackage of runTimeDependencies) {
        if (inputPackage.platformId) {
            versionPackages.push(SetBinaryAndGetPackage(inputPackage, serverUrl, version, installPath));
        }
    }
    return versionPackages;
}
exports.GetPackagesFromVersion = GetPackagesFromVersion;
function SetBinaryAndGetPackage(inputPackage, serverUrl, version, installPath) {
    let installBinary;
    if (inputPackage.platformId == "win-x86" || inputPackage.platformId == "win-x64") {
        installBinary = "OmniSharp.exe";
    }
    else if (inputPackage.platformId == "osx") {
        installBinary = "mono.osx";
    }
    else if (inputPackage.platformId == "linux-x86") {
        installBinary = "mono.linux-x86";
    }
    else if (inputPackage.platformId == "linux-x64") {
        installBinary = "mono.linux-x86_64";
    }
    return GetPackage(inputPackage, serverUrl, version, installPath, installBinary);
}
exports.SetBinaryAndGetPackage = SetBinaryAndGetPackage;
function GetPackage(inputPackage, serverUrl, version, installPath, installBinary) {
    if (!version) {
        throw new Error('Invalid version');
    }
    let versionPackage = Object.assign({}, inputPackage, { "description": `${inputPackage.description}, Version = ${version}`, "url": `${serverUrl}/releases/${version}/omnisharp-${inputPackage.platformId}.zip`, "installPath": `${installPath}/${version}`, "installTestPath": `./${installPath}/${version}/${installBinary}` });
    return versionPackage;
}
function GetVersionFilePackage(serverUrl, pathInServer) {
    return {
        "description": "Latest version information file",
        "url": `${serverUrl}/${pathInServer}`
    };
}
exports.GetVersionFilePackage = GetVersionFilePackage;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT21uaXNoYXJwUGFja2FnZUNyZWF0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvb21uaXNoYXJwL09tbmlzaGFycFBhY2thZ2VDcmVhdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O2dHQUdnRzs7QUFJaEcsZ0NBQXVDLE9BQWUsRUFBRSxtQkFBOEIsRUFBRSxTQUFpQixFQUFFLFdBQW1CO0lBQzFILEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUNYLE1BQU0sSUFBSSxLQUFLLENBQUMsaUJBQWlCLENBQUMsQ0FBQztJQUN2QyxDQUFDO0lBRUQsSUFBSSxlQUFlLEdBQUcsSUFBSSxLQUFLLEVBQVcsQ0FBQztJQUMzQyxHQUFHLENBQUMsQ0FBQyxJQUFJLFlBQVksSUFBSSxtQkFBbUIsQ0FBQyxDQUFDLENBQUM7UUFDM0MsRUFBRSxDQUFDLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7WUFDMUIsZUFBZSxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxZQUFZLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxXQUFXLENBQUMsQ0FBQyxDQUFDO1FBQ2hHLENBQUM7SUFDTCxDQUFDO0lBRUQsTUFBTSxDQUFDLGVBQWUsQ0FBQztBQUMzQixDQUFDO0FBYkQsd0RBYUM7QUFFRCxnQ0FBdUMsWUFBcUIsRUFBRSxTQUFpQixFQUFFLE9BQWUsRUFBRSxXQUFtQjtJQUNqSCxJQUFJLGFBQXFCLENBQUM7SUFDMUIsRUFBRSxDQUFDLENBQUMsWUFBWSxDQUFDLFVBQVUsSUFBSSxTQUFTLElBQUksWUFBWSxDQUFDLFVBQVUsSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDO1FBQy9FLGFBQWEsR0FBRyxlQUFlLENBQUM7SUFDcEMsQ0FBQztJQUNELElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxZQUFZLENBQUMsVUFBVSxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDeEMsYUFBYSxHQUFHLFVBQVUsQ0FBQztJQUMvQixDQUFDO0lBQ0QsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFlBQVksQ0FBQyxVQUFVLElBQUksV0FBVyxDQUFDLENBQUMsQ0FBQztRQUM5QyxhQUFhLEdBQUcsZ0JBQWdCLENBQUM7SUFDckMsQ0FBQztJQUNELElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxZQUFZLENBQUMsVUFBVSxJQUFJLFdBQVcsQ0FBQyxDQUFDLENBQUM7UUFDOUMsYUFBYSxHQUFHLG1CQUFtQixDQUFDO0lBQ3hDLENBQUM7SUFFRCxNQUFNLENBQUMsVUFBVSxDQUFDLFlBQVksRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLFdBQVcsRUFBRSxhQUFhLENBQUMsQ0FBQztBQUNwRixDQUFDO0FBaEJELHdEQWdCQztBQUVELG9CQUFvQixZQUFxQixFQUFFLFNBQWlCLEVBQUUsT0FBZSxFQUFFLFdBQW1CLEVBQUUsYUFBcUI7SUFDckgsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1FBQ1gsTUFBTSxJQUFJLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0lBQ3ZDLENBQUM7SUFFRCxJQUFJLGNBQWMscUJBQU8sWUFBWSxJQUNqQyxhQUFhLEVBQUUsR0FBRyxZQUFZLENBQUMsV0FBVyxlQUFlLE9BQU8sRUFBRSxFQUNsRSxLQUFLLEVBQUUsR0FBRyxTQUFTLGFBQWEsT0FBTyxjQUFjLFlBQVksQ0FBQyxVQUFVLE1BQU0sRUFDbEYsYUFBYSxFQUFFLEdBQUcsV0FBVyxJQUFJLE9BQU8sRUFBRSxFQUMxQyxpQkFBaUIsRUFBRSxLQUFLLFdBQVcsSUFBSSxPQUFPLElBQUksYUFBYSxFQUFFLEdBQ3BFLENBQUM7SUFFRixNQUFNLENBQUMsY0FBYyxDQUFDO0FBQzFCLENBQUM7QUFFRCwrQkFBc0MsU0FBaUIsRUFBRSxZQUFvQjtJQUN6RSxNQUFNLENBQVU7UUFDWixhQUFhLEVBQUUsaUNBQWlDO1FBQ2hELEtBQUssRUFBRSxHQUFHLFNBQVMsSUFBSSxZQUFZLEVBQUU7S0FDeEMsQ0FBQztBQUNOLENBQUM7QUFMRCxzREFLQyJ9