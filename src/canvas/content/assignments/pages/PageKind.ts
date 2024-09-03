import {fetchJson} from "@/canvas/fetch/fetchJson";
import {getPagedDataGenerator} from "@/canvas/fetch/getPagedDataGenerator";
import {IPageData} from "@/canvas/content/pages/types";
import {ContentKind, contentUrlFuncs, courseContentUrlFunc, putContentFunc} from "@/canvas/content/ContentKind";

export const PageUrlFuncs = contentUrlFuncs('pages')
export type GetPageOptions = Record<string, any>;
export type SavePageOptions = Record<string, any>;


const getStringApiUrl = courseContentUrlFunc<string>(`/api/v1/courses/{courseId}/pages/{contentId}`)

export const PageKind: Required<
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
    getByString: (courseId, contentId, config) =>
        fetchJson(getStringApiUrl(courseId, contentId), config),
    dataGenerator: (courseId, config) =>
        getPagedDataGenerator(PageUrlFuncs.getAllApiUrl(courseId), config),
    put: putContentFunc(PageUrlFuncs.getApiUrl),

}