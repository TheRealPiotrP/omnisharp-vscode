/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const url_1 = require("url");
const common_1 = require("./common");
const HttpProxyAgent = require("http-proxy-agent");
const HttpsProxyAgent = require("https-proxy-agent");
function getSystemProxyURL(requestURL) {
    if (requestURL.protocol === 'http:') {
        return process.env.HTTP_PROXY || process.env.http_proxy || null;
    }
    else if (requestURL.protocol === 'https:') {
        return process.env.HTTPS_PROXY || process.env.https_proxy || process.env.HTTP_PROXY || process.env.http_proxy || null;
    }
    return null;
}
function getProxyAgent(requestURL, proxy, strictSSL) {
    const proxyURL = proxy || getSystemProxyURL(requestURL);
    if (!proxyURL) {
        return null;
    }
    const proxyEndpoint = url_1.parse(proxyURL);
    if (!/^https?:$/.test(proxyEndpoint.protocol)) {
        return null;
    }
    const opts = {
        host: proxyEndpoint.hostname,
        port: Number(proxyEndpoint.port),
        auth: proxyEndpoint.auth,
        rejectUnauthorized: common_1.isBoolean(strictSSL) ? strictSSL : true
    };
    return requestURL.protocol === 'http:' ? new HttpProxyAgent(opts) : new HttpsProxyAgent(opts);
}
exports.getProxyAgent = getProxyAgent;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJveHkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvcHJveHkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7QUFFaEcsWUFBWSxDQUFDOztBQUViLDZCQUE2QztBQUM3QyxxQ0FBcUM7QUFDckMsbURBQW9EO0FBQ3BELHFEQUFzRDtBQUV0RCwyQkFBMkIsVUFBZTtJQUN0QyxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsUUFBUSxLQUFLLE9BQU8sQ0FBQyxDQUFDLENBQUM7UUFDbEMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxJQUFJLElBQUksQ0FBQztJQUNwRSxDQUFDO0lBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxRQUFRLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQztRQUMxQyxNQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLElBQUksSUFBSSxDQUFDO0lBQzFILENBQUM7SUFFRCxNQUFNLENBQUMsSUFBSSxDQUFDO0FBQ2hCLENBQUM7QUFFRCx1QkFBOEIsVUFBZSxFQUFFLEtBQWEsRUFBRSxTQUFrQjtJQUM1RSxNQUFNLFFBQVEsR0FBRyxLQUFLLElBQUksaUJBQWlCLENBQUMsVUFBVSxDQUFDLENBQUM7SUFFeEQsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBQ1osTUFBTSxDQUFDLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRUQsTUFBTSxhQUFhLEdBQUcsV0FBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBRXpDLEVBQUUsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzVDLE1BQU0sQ0FBQyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUVELE1BQU0sSUFBSSxHQUFHO1FBQ1QsSUFBSSxFQUFFLGFBQWEsQ0FBQyxRQUFRO1FBQzVCLElBQUksRUFBRSxNQUFNLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQztRQUNoQyxJQUFJLEVBQUUsYUFBYSxDQUFDLElBQUk7UUFDeEIsa0JBQWtCLEVBQUUsa0JBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJO0tBQzlELENBQUM7SUFFRixNQUFNLENBQUMsVUFBVSxDQUFDLFFBQVEsS0FBSyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNsRyxDQUFDO0FBckJELHNDQXFCQyJ9