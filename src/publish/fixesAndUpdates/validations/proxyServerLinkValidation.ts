import {badContentFixFunc, badContentRunFunc, CourseValidation} from "./";

import {IContentHaver} from "../../../canvas/course/courseTypes";


const oldProxyRegex =/(proxy1\.unity\.edu|unity.idn.oclc.org)/g;
const newProxyReplace = 'unity.idm.oclc.org';
export const proxyServerLinkValidation: CourseValidation<IContentHaver> = {
    name: "Proxy Server Link Validation",
    description: `proxy1.unity.edu => unity.idm.oclc.org`,
    run: badContentRunFunc(oldProxyRegex),
    fix: badContentFixFunc(oldProxyRegex, newProxyReplace),
}


export default proxyServerLinkValidation;