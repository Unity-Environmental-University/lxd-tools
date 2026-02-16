import { IContentHaver } from "@ueu/ueu-canvas";

import { BaseContentItem } from "@ueu/ueu-canvas";
import { badContentFixFunc, badContentRunFunc } from "@publish/fixesAndUpdates/validations/utils";
import { ContentTextReplaceFix } from "@publish/fixesAndUpdates/validations/types";

const oldAiRegex = /(https:[^<>]*citing-generative-ai\/)/gi;
const newAiReplace =
  "https://unity.edu/distance-education/commhub/using-generative-ai/acknowledging-generative-ai-use/";

export const aiLinkValidation: ContentTextReplaceFix<IContentHaver, BaseContentItem> = {
  name: "AI Citing Link Validation",
  description: "Changes old Citing AI link to new AI link everywhere it appears",
  beforeAndAfters: [
    [
      `<div><a href="https://unity.edu/commhub/using-generative-ai/citing-generative-ai/">AI LINK</a></div>`,
      `<div><a href="https://unity.edu/distance-education/commhub/using-generative-ai/acknowledging-generative-ai-use/">AI LINK</a></div>`,
    ],
  ],
  run: badContentRunFunc(oldAiRegex),
  fix: badContentFixFunc(oldAiRegex, newAiReplace),
};

export default aiLinkValidation;
