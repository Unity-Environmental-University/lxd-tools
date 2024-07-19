import {BaseContentItem} from "@/canvas/content/BaseContentItem";
import {ICanvasCallConfig} from "@/canvas/canvasUtils";
import {ContentKind, IPageData} from "@/canvas/content/types";
import {contentUrlFuncs, putContentFunc} from "@/canvas/content/getContentFuncs";
import {fetchJson} from "@/canvas/fetch/fetchJson";
import {getPagedDataGenerator} from "@/canvas/fetch/getPagedDataGenerator";


const PageUrlFuncs = contentUrlFuncs('pages')
export type GetPageOptions = Record<string, any>;
export type SavePageOptions = Record<string, any>;
export const PageKind:ContentKind<IPageData, GetPageOptions, SavePageOptions> = {
    ...PageUrlFuncs,
    dataIsThisKind: (data): data is IPageData => {
        return 'page_id' in data
    },
    getName: page => page.title,
    getBody: page => page.body,
    getId: page => page.id,
    get: (id, courseId, config) =>
        fetchJson(PageUrlFuncs.getApiUrl(courseId, id), config),
    dataGenerator: (courseId, config) =>
        getPagedDataGenerator(PageUrlFuncs.getAllApiUrl(courseId), config),
    put: putContentFunc(PageUrlFuncs.getApiUrl),

}

export class Page extends BaseContentItem {
    static kindInfo = PageKind
    static idProperty = 'page_id';
    static nameProperty = 'title';
    static bodyProperty = 'body';
    static contentUrlTemplate = "/api/v1/courses/{course_id}/pages/{content_id}";
    static allContentUrlTemplate = "/api/v1/courses/{course_id}/pages";

    constructor(canvasData: IPageData, courseId: number) {
        super(canvasData, courseId);
    }

    get body(): string {
        return this.canvasData[this.bodyKey];
    }

    async updateContent(text?: string | null, name?: string | null, config?: ICanvasCallConfig) {
        let data: Record<string, any> = {};
        if (text) {
            this.canvasData[this.bodyKey] = text;
            data['wiki_page[body]'] = text;
        }
        if (name) {
            this.canvasData[this.nameKey] = name;
            data[this.nameKey] = name;
        }
        return this.saveData(data, config);
    }
}