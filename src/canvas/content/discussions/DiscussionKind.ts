import {ICanvasCallConfig} from "@/canvas/canvasUtils";
import {fetchJson} from "@/canvas/fetch/fetchJson";
import {getPagedDataGenerator} from "@/canvas/fetch/getPagedDataGenerator";
import {IDiscussionData} from "@/canvas/content/discussions/types";
import {ContentKind, contentUrlFuncs, putContentFunc} from "@/canvas/content/ContentKind";

export type SaveDiscussionData = Record<string, any>;
export type GetDiscussionOptions = Record<string, any>;
export const discussionUrlFuncs = contentUrlFuncs('discussion_topics');
export const DiscussionKind: ContentKind<
    IDiscussionData,
    GetDiscussionOptions,
    SaveDiscussionData
> = {
    ...discussionUrlFuncs,
    dataIsThisKind(data): data is IDiscussionData {
        return data.hasOwnProperty('discussion_type');
    },
    getId: (data) => data.id,
    getName: (data) => data.title,
    getBody: (data) => data.message,
    async get(courseId: number, contentId: number, config?: ICanvasCallConfig<GetDiscussionOptions>) {
        const data = await fetchJson(this.getApiUrl(courseId, contentId), config) as IDiscussionData;
        return data;
    },
    dataGenerator: (courseId, config) => getPagedDataGenerator<IDiscussionData>(discussionUrlFuncs.getAllApiUrl(courseId), config),
    put: putContentFunc<SaveDiscussionData, IDiscussionData>(discussionUrlFuncs.getApiUrl),
}