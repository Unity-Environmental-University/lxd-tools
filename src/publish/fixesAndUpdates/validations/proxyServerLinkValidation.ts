import {badContentFixFunc, badContentRunFunc, CourseValidation} from "./";
import {IContentHaver} from "../../../canvas/course/index"


const oldProxyRegex =/https:\/\/login\.proxy1\.unity\.edu\/login\?auth=shibboleth&(?:amp;)?url=([^"]*)/g;
const newProxyReplace = 'https://login.unity.idn.oclc.org/login?url=$1';
const oldProxy = 'https://login.proxy1.unity.edu/login?auth=shibboleth&url='
export const proxyServerLinkValidation: CourseValidation<IContentHaver> = {
    name: "Proxy Server Link Validation",
    description: `proxy server link should be ${newProxyReplace.replace('$1', '')} not ${oldProxy}`,
    run: badContentRunFunc(oldProxyRegex),
    fix: badContentFixFunc(oldProxyRegex, newProxyReplace),
}


export default proxyServerLinkValidation;