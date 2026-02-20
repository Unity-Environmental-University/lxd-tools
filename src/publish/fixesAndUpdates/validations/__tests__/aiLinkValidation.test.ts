import aiLinkValidation from "../aiLinkValidation";

import {badContentTextValidationFixTest, badContentTextValidationTest} from "../__mocks__/validations";


jest.mock('@ueu/ueu-canvas/fetch/fetchJson')
describe("Bad Link Tests and Fixes", () => {
    describe('works for AI link', () => {
        const badAiLinkPageHtml = `<div><a href="https://unity.edu/commhub/using-generative-ai/citing-generative-ai/">AI LINK</a></div>`;
        const goodAiLinkPageHtml = `<div><a href="https://unity.edu/distance-education/commhub/using-generative-ai/acknowledging-generative-ai-use/">AI LINK</a></div>`;
        test("Old AI link exists in course test works", badContentTextValidationTest(aiLinkValidation, badAiLinkPageHtml, goodAiLinkPageHtml));
        test("Old AI link replace fix works.", badContentTextValidationFixTest(aiLinkValidation));
    })
});