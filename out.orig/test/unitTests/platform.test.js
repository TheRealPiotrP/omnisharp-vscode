"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const platform_1 = require("../../src/platform");
const chai_1 = require("chai");
suite("Platform", () => {
    suiteSetup(() => chai_1.should());
    test("Retrieve correct information for Ubuntu 14.04", () => {
        const dist = distro_ubuntu_14_04();
        dist.name.should.equal('ubuntu');
        dist.version.should.equal('14.04');
    });
    test("Retrieve correct information for Fedora 23", () => {
        const dist = distro_fedora_23();
        dist.name.should.equal('fedora');
        dist.version.should.equal('23');
    });
    test("Retrieve correct information for Debian 8", () => {
        const dist = distro_debian_8();
        dist.name.should.equal('debian');
        dist.version.should.equal('8');
    });
    test("Retrieve correct information for CentOS 7", () => {
        const dist = distro_centos_7();
        dist.name.should.equal('centos');
        dist.version.should.equal('7');
    });
});
function distro_ubuntu_14_04() {
    // Copied from /etc/os-release on Ubuntu 14.04
    const input = `
NAME="Ubuntu"
VERSION="14.04.5 LTS, Trusty Tahr"
ID=ubuntu
ID_LIKE=debian
PRETTY_NAME="Ubuntu 14.04.5 LTS"
VERSION_ID="14.04"
HOME_URL="http://www.ubuntu.com/"
SUPPORT_URL="http://help.ubuntu.com/"
BUG_REPORT_URL="http://bugs.launchpad.net/ubuntu/"`;
    return platform_1.LinuxDistribution.FromReleaseInfo(input, '\n');
}
function distro_fedora_23() {
    // Copied from /etc/os-release on Fedora 23
    const input = `
NAME=Fedora
VERSION="23 (Workstation Edition)"
ID=fedora
VERSION_ID=23
PRETTY_NAME="Fedora 23 (Workstation Edition)"
ANSI_COLOR="0;34"
CPE_NAME="cpe:/o:fedoraproject:fedora:23"
HOME_URL="https://fedoraproject.org/"
BUG_REPORT_URL="https://bugzilla.redhat.com/"
REDHAT_BUGZILLA_PRODUCT="Fedora"
REDHAT_BUGZILLA_PRODUCT_VERSION=23
REDHAT_SUPPORT_PRODUCT="Fedora"
REDHAT_SUPPORT_PRODUCT_VERSION=23
PRIVACY_POLICY_URL=https://fedoraproject.org/wiki/Legal:PrivacyPolicy
VARIANT="Workstation Edition"
VARIANT_ID=workstation`;
    return platform_1.LinuxDistribution.FromReleaseInfo(input, '\n');
}
function distro_debian_8() {
    // Copied from /etc/os-release on Debian 8
    const input = `
PRETTY_NAME="Debian GNU/Linux 8 (jessie)"
NAME="Debian GNU/Linux"
VERSION_ID="8"
VERSION="8 (jessie)"
ID=debian
HOME_URL="http://www.debian.org/"
SUPPORT_URL="http://www.debian.org/support"
BUG_REPORT_URL="https://bugs.debian.org/"`;
    return platform_1.LinuxDistribution.FromReleaseInfo(input, '\n');
}
function distro_centos_7() {
    // Copied from /etc/os-release on CentOS 7
    const input = `
NAME="CentOS Linux"
VERSION="7 (Core)"
ID="centos"
ID_LIKE="rhel fedora"
VERSION_ID="7"
PRETTY_NAME="CentOS Linux 7 (Core)"
ANSI_COLOR="0;31"
CPE_NAME="cpe:/o:centos:centos:7"
HOME_URL="https://www.centos.org/"
BUG_REPORT_URL="https://bugs.centos.org/"

CENTOS_MANTISBT_PROJECT="CentOS-7"
CENTOS_MANTISBT_PROJECT_VERSION="7"
REDHAT_SUPPORT_PRODUCT="centos"
REDHAT_SUPPORT_PRODUCT_VERSION="7"`;
    return platform_1.LinuxDistribution.FromReleaseInfo(input, '\n');
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGxhdGZvcm0udGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3Rlc3QvdW5pdFRlc3RzL3BsYXRmb3JtLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Z0dBR2dHOztBQUVoRyxpREFBdUQ7QUFDdkQsK0JBQThCO0FBRTlCLEtBQUssQ0FBQyxVQUFVLEVBQUUsR0FBRyxFQUFFO0lBQ25CLFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxhQUFNLEVBQUUsQ0FBQyxDQUFDO0lBRTNCLElBQUksQ0FBQywrQ0FBK0MsRUFBRSxHQUFHLEVBQUU7UUFDdkQsTUFBTSxJQUFJLEdBQUcsbUJBQW1CLEVBQUUsQ0FBQztRQUVuQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDakMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ3ZDLENBQUMsQ0FBQyxDQUFDO0lBRUgsSUFBSSxDQUFDLDRDQUE0QyxFQUFFLEdBQUcsRUFBRTtRQUNwRCxNQUFNLElBQUksR0FBRyxnQkFBZ0IsRUFBRSxDQUFDO1FBRWhDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNqQyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDcEMsQ0FBQyxDQUFDLENBQUM7SUFFSCxJQUFJLENBQUMsMkNBQTJDLEVBQUUsR0FBRyxFQUFFO1FBQ25ELE1BQU0sSUFBSSxHQUFHLGVBQWUsRUFBRSxDQUFDO1FBRS9CLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNqQyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDbkMsQ0FBQyxDQUFDLENBQUM7SUFFSCxJQUFJLENBQUMsMkNBQTJDLEVBQUUsR0FBRyxFQUFFO1FBQ25ELE1BQU0sSUFBSSxHQUFHLGVBQWUsRUFBRSxDQUFDO1FBRS9CLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNqQyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDbkMsQ0FBQyxDQUFDLENBQUM7QUFDUCxDQUFDLENBQUMsQ0FBQztBQUVIO0lBQ0ksOENBQThDO0lBQzlDLE1BQU0sS0FBSyxHQUFHOzs7Ozs7Ozs7bURBU2lDLENBQUM7SUFFaEQsTUFBTSxDQUFDLDRCQUFpQixDQUFDLGVBQWUsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDMUQsQ0FBQztBQUVEO0lBQ0ksMkNBQTJDO0lBQzNDLE1BQU0sS0FBSyxHQUFHOzs7Ozs7Ozs7Ozs7Ozs7O3VCQWdCSyxDQUFDO0lBRXBCLE1BQU0sQ0FBQyw0QkFBaUIsQ0FBQyxlQUFlLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQzFELENBQUM7QUFFRDtJQUNJLDBDQUEwQztJQUMxQyxNQUFNLEtBQUssR0FBRzs7Ozs7Ozs7MENBUXdCLENBQUM7SUFFdkMsTUFBTSxDQUFDLDRCQUFpQixDQUFDLGVBQWUsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDMUQsQ0FBQztBQUVEO0lBQ0ksMENBQTBDO0lBQzFDLE1BQU0sS0FBSyxHQUFHOzs7Ozs7Ozs7Ozs7Ozs7bUNBZWlCLENBQUM7SUFFaEMsTUFBTSxDQUFDLDRCQUFpQixDQUFDLGVBQWUsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDMUQsQ0FBQyJ9