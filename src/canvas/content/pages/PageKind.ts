import { fetchJson } from "@/canvas/fetch/fetchJson";
import { getPagedDataGenerator } from "@/canvas/fetch/getPagedDataGenerator";
import {ICanvasCallConfig, renderAsyncGen} from "@/canvas/canvasUtils";
import { IPageData } from "@/canvas/content/pages/types";
import {
    ContentKind,
    contentUrlFuncs,
    courseContentUrlFunc,
    postContentFunc,
    putContentFunc
} from "@/canvas/content/ContentKind";

export const PageUrlFuncs = contentUrlFuncs('pages')
export type GetPageOptions = Record<string, any>;
export type SavePageOptions = Record<string, any>;
export type GetByStringIdOptions = {
    allowPartialMatch?: boolean
}

const getStringApiUrl = courseContentUrlFunc<string>(`/api/v1/courses/{courseId}/pages/{contentId}`)

const PageKind: Required<
    ContentKind<IPageData, GetPageOptions, SavePageOptions>
>= {
    ...PageUrlFuncs,
    dataIsThisKind: (data): data is IPageData => {
        return 'page_id' in data
    },
    getName: page => page.title,
    getBody: page => page.body,
    getId: page => page.id,
    get: (id, courseId, config) =>
        fetchJson(PageUrlFuncs.getApiUrl(courseId, id), config),
    getByString: async (
        courseId: number,
        contentId: string,
        config?: ICanvasCallConfig<GetPageOptions>,
        options?: GetByStringIdOptions
    ): Promise<IPageData | { message: string; }> => {
        const {allowPartialMatch} = options ?? {};
        // 1) try an exact match
        const res = await fetchJson<IPageData | { message: string; }>(
            getStringApiUrl(courseId, contentId),
            config
        );

        // 2) if not found, fall back to any URL that *starts* with contentId
        if ("message" in res && allowPartialMatch) {
                const pageGen = getPagedDataGenerator<IPageData>(
                    PageUrlFuncs.getAllApiUrl(courseId),
                    {queryParams: {include: ["body"]}});

                for await (const page of pageGen) {
                    if(page.url.startsWith(contentId)) return page;
                }
        }

        return res;
    },
    dataGenerator: (courseId, config = {queryParams: {include: ["body"]}}) => getPagedDataGenerator(PageUrlFuncs.getAllApiUrl(courseId), config),
    put: putContentFunc(PageUrlFuncs.getApiUrl),
    post: postContentFunc(PageUrlFuncs.getAllApiUrl),
    get: function (courseId: number, contentId: number, config?: ICanvasCallConfig<GetPageOptions> | undefined): Promise<IPageData> {
        throw new Error("Function not implemented.");
    }
};

export default PageKind;