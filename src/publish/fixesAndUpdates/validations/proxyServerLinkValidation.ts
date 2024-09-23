
import {IContentHaver} from "@/canvas/course/courseTypes";

import {BaseContentItem} from "@/canvas/content/BaseContentItem";
import {
    badContentFixFunc,
    badContentRunFunc,
    ContentTextReplaceFix
} from "@publish/fixesAndUpdates/validations/utils";


const oldProxyRegex = /(proxy1\.unity\.edu|unity.idn.oclc.org)/g;
const newProxyReplace = 'unity.idm.oclc.org';

const proxiedUrl = 'www.google.com'
export const proxyServerLinkValidation:ContentTextReplaceFix<IContentHaver, BaseContentItem> = {
    name: "Proxy Server Link Validation",
    description: `proxy1.unity.edu => unity.idm.oclc.org`,
    beforeAndAfters: [[
        `<div><a href="https://login.proxy1.unity.edu/login?auth=shibboleth&amp;url=${proxiedUrl}">PROXY LINK</a></div>`,
        `<div><a href="https://login.unity.idm.oclc.org/login?url=${proxiedUrl}">PROXY LINK</a></div>`
    ]],
    run: badContentRunFunc(oldProxyRegex),
    fix: badContentFixFunc(oldProxyRegex, newProxyReplace),
}


export default proxyServerLinkValidation;