import proxyServerLinkValidation from "../proxyServerLinkValidation";

import {badContentTextValidationFixTest, badContentTextValidationTest} from "../__mocks__";


jest.mock('../../../../canvas/fetch');
describe("Bad Link Tests and Fixes", () => {
    const proxiedUrl = encodeURI('https://unity.instructure.com')
    const badProxyLinkPageHtml = `<div><a href="https://login.proxy1.unity.edu/login?auth=shibboleth&amp;url=${proxiedUrl}">PROXY LINK</a></div>`;
    const goodProxyLinkPageHtml = `<div><a href="https://login.unity.idm.oclc.org/login?url=${proxiedUrl}">PROXY LINK</a></div>`;
    test("Old Proxy Server link exists in course test works", badContentTextValidationTest(proxyServerLinkValidation, badProxyLinkPageHtml, goodProxyLinkPageHtml));
    test("Old Proxy Server link replace fix works.", badContentTextValidationFixTest(proxyServerLinkValidation, badProxyLinkPageHtml, goodProxyLinkPageHtml));

});