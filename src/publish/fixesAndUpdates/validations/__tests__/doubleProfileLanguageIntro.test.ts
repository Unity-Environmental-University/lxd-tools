import doubleProfileLanguageIntro from "../doubleProfileLanguageIntro";

import {badContentTextValidationFixTest, badContentTextValidationTest} from "../__mocks__/validations";

const badUrl = "https://community.canvaslms.com/docs/DOC-1285"; // TODO yet another duplicate of these. Put them in utils?
const goodUrl = "https://community.instructure.com/en/kb/articles/662765-what-are-profile-settings";

// TODO these are also duplicates of the ones in doubleProfileLanguageIntro.ts
const badHTML = `For more information, read this Canvas Guide about updating your profile</span><span> blahblah </span><span> blah </span></p><p>For more information, read this <a id="" class="" title="" href="${badUrl}" target="">Canvas Guide about updating your profile</a>.</p>`;
const goodHTML = `</span>For more information, read this <a class="inline_disabled" href="${goodUrl}" target="_blank" rel="noopener">Canvas Guide about updating your profile</a>.</p>`;

jest.mock('@ueu/ueu-canvas/fetch/fetchJson')
describe("Introductions double language validation tests", () => {
    describe('works for double profile settings language in Introductions Discussion', () => {
        test("double language in introduction detection test works", badContentTextValidationTest(doubleProfileLanguageIntro, badHTML, goodHTML));
        test("double language un-doubling works.", badContentTextValidationFixTest(doubleProfileLanguageIntro));
    })
});

// the fix test uses the before and afters but the detection test needs its own bad and good html snippets
// idk why but I roll with it