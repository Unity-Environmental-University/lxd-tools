import {IContentHaver} from "@ueu/ueu-canvas/course/courseTypes";
import {Page} from "@ueu/ueu-canvas/content/pages/Page";
import PageKind from "@ueu/ueu-canvas/content/pages/PageKind";
import {renderAsyncGen} from "@ueu/ueu-canvas/canvasUtils";
import badContentReplaceFuncs from "@publish/fixesAndUpdates/validations/courseContent/badContentReplaceFuncs";
import {ContentTextReplaceFix} from "@publish/fixesAndUpdates/validations/types";

export const overviewDiscMornToNightTest: ContentTextReplaceFix<IContentHaver, Page> = {
    name: "overview discussion 3AM night -> morning",
    description: "Overview Discussion times say 3AM Thursday/Monday morning, not 'night'",
    beforeAndAfters: [
        ['3AM ET Thursday night 3AM ET Monday night', '3AM ET Thursday morning 3AM ET Monday morning'],
        ['3AM ET thursday night 3AM ET weds night', '3AM ET Thursday morning 3AM ET weds night'],
    ],
    async getContent(course) {
        const pageGen = PageKind.dataGenerator(course.id, {
            queryParams: {
                search_term: 'course overview'
            }
        })
        const pageDatas = await renderAsyncGen(pageGen);
        return pageDatas.map(a => new Page(a, course.id))
    },
    ...badContentReplaceFuncs(/3AM ET (Thursday|Monday) night/ig, "3AM ET $1 morning")
}

export default overviewDiscMornToNightTest;