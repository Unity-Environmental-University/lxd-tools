import {IContentHaver} from "@ueu/ueu-canvas/course/courseTypes";
import {Page} from "@ueu/ueu-canvas/content/pages/Page";
import badContentReplaceFuncs from "@publish/fixesAndUpdates/validations/courseContent/badContentReplaceFuncs";
import {ContentTextReplaceFix} from "@publish/fixesAndUpdates/validations/types";

export const codeAndCodeOfCodeTest: ContentTextReplaceFix<IContentHaver, Page> = {
    name: "Code and Code of Code",
    beforeAndAfters: [
        ['<p>Honor Code and Code of Code of Conduct</p>', '<p>Honor Code and Code of Conduct</p>']
    ],
    description: 'First bullet of course overview should read ... Unity DE Honor Code and Code of Conduct ..., not ',
    ...badContentReplaceFuncs(/Code and Code of Code of Conduct/ig, 'Code and Code of Conduct')
}

export default codeAndCodeOfCodeTest;