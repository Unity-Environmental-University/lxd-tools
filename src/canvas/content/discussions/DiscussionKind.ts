import {ICanvasCallConfig} from "@/canvas/canvasUtils";
import {fetchJson} from "@/canvas/fetch/fetchJson";
import {getPagedDataGenerator} from "@/canvas/fetch/getPagedDataGenerator";
import {IDiscussionData, SaveDiscussionData} from "@/canvas/content/discussions/types";
import {ContentKind, contentUrlFuncs, putContentFunc} from "@/canvas/content/ContentKind";

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
        return await fetchJson(discussionUrlFuncs.getApiUrl(courseId, contentId), config) as IDiscussionData;
    },
    dataGenerator: (courseId, config) => getPagedDataGenerator<IDiscussionData>(discussionUrlFuncs.getAllApiUrl(courseId), config),
    put: putContentFunc<SaveDiscussionData, IDiscussionData>(discussionUrlFuncs.getApiUrl),
}