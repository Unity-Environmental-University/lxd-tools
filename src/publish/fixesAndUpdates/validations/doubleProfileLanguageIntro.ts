import {IContentHaver} from "@ueu/ueu-canvas"

import {BaseContentItem} from "@ueu/ueu-canvas"
import {
    badContentFixFunc,
    badContentRunFunc
} from "@publish/fixesAndUpdates/validations/utils";
import {ContentTextReplaceFix} from "@publish/fixesAndUpdates/validations/types";

const oldRegex = /For more information, read this Canvas Guide about updating your profile[\s\S]*?<\/p>\s*<p>For more information, read this <a[^>]*>Canvas Guide about updating your profile<\/a>\.?<\/p>/ig;
const newReplace = '</span>For more information, read this <a class="inline_disabled" href="https://community.instructure.com/en/kb/articles/662765-what-are-profile-settings" target="_blank" rel="noopener">Canvas Guide about updating your profile</a>.</p>';

const beforeString = 'For more information, read this Canvas Guide about updating your profile</span><p>For more information, read this <a id="" class="" title="" href="https://community.canvaslms.com/docs/DOC-1285" target="">Canvas Guide about updating your profile</a>.</p>';
const afterString = newReplace;

export const doubleProfileLanguageIntro:ContentTextReplaceFix<IContentHaver, BaseContentItem> = {
  name: "Introductions Discussion Double Profile Language Fix",
  description: "Removes duplicated profile settings language in the Introductions discussion. Fixes link if needed.",
  beforeAndAfters: [[
    beforeString,
    afterString
  ]],
  run: badContentRunFunc(oldRegex),
  fix: badContentFixFunc(oldRegex, newReplace),
}

export default doubleProfileLanguageIntro;

// // todo what do the beforeAndAfters even do in this context?
// // try running test w no test file for this and see if beforeAndAfters do anything there
// beforeAndAfters - if put in, can use the test just like the ai stuff does 