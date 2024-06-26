import proxyServerLinkValidation from "../proxyServerLinkValidation";

import {badContentTextValidationFixTest, badContentTextValidationTest} from "../__mocks__";


jest.mock('../../../../canvas/fetch');
describe("Bad Link Tests and Fixes", () => {
    describe('works for login proxies', () => {
        const proxiedUrl = encodeURI('https://unity.instructure.com')
        const badProxyLinkPageHtml = `<div><a href="https://login.proxy1.unity.edu/login?auth=shibboleth&amp;url=${proxiedUrl}">PROXY LINK</a></div>`;
        const goodProxyLinkPageHtml = `<div><a href="https://login.unity.idm.oclc.org/login?url=${proxiedUrl}">PROXY LINK</a></div>`;
        test("Old Proxy Server link exists in course test works", badContentTextValidationTest(proxyServerLinkValidation, badProxyLinkPageHtml, goodProxyLinkPageHtml));
        test("Old Proxy Server link replace fix works.", badContentTextValidationFixTest(proxyServerLinkValidation, badProxyLinkPageHtml, goodProxyLinkPageHtml));
    })

    describe('works for docuseek entries', () => {
        const badProxyLinkPageHtml = `<div><a href="https://docuseek2-com.proxy1.unity.edu/bf-scod">PROXY LINK</a></div>`;
        const goodProxyLinkPageHtml = `<div><a href="https://docuseek2-com.unity.idm.oclc.org/bf-scod">PROXY LINK</a></div>`;
        test("Old Proxy Server link exists in course test works", badContentTextValidationTest(proxyServerLinkValidation, badProxyLinkPageHtml, goodProxyLinkPageHtml));
        test("Old Proxy Server link replace fix works.", badContentTextValidationFixTest(proxyServerLinkValidation, badProxyLinkPageHtml, goodProxyLinkPageHtml));
    })
});