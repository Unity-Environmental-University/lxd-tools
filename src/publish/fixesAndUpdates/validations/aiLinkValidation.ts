import {IContentHaver} from "@/canvas/course/courseTypes";

import {BaseContentItem} from "@/canvas/content/BaseContentItem";
import {
    badContentFixFunc,
    badContentRunFunc
} from "@publish/fixesAndUpdates/validations/utils";
import {ContentTextReplaceFix} from "@publish/fixesAndUpdates/validations/types";

const oldAiRegex = /(https:[^<>]*citing-generative-ai\/)/ig;
const newAiReplace = 'https://unity.edu/distance-education/commhub/using-generative-ai/acknowledging-generative-ai-use/';

export const aiLinkValidation:ContentTextReplaceFix<IContentHaver, BaseContentItem> = {
  name: "AI Citing Link Validation",
  description: "Changes old Citing AI link to new AI link everywhere it appears",
  beforeAndAfters: [[
    `<div><a href="https://unity.edu/commhub/using-generative-ai/citing-generative-ai/">AI LINK</a></div>`,
    `<div><a href="https://unity.edu/distance-education/commhub/using-generative-ai/acknowledging-generative-ai-use/">AI LINK</a></div>`
  ]],
  run: badContentRunFunc(oldAiRegex),
  fix: badContentFixFunc(oldAiRegex, newAiReplace),
}

export default aiLinkValidation;