import {BaseContentItem} from "@/canvas/content/BaseContentItem";
import {ICanvasCallConfig} from "@/canvas/canvasUtils";
import {Temporal} from "temporal-polyfill";
import {ContentKind, IDiscussionData} from "@/canvas/content/types";
import {contentUrlFuncs, putContentFunc} from "@/canvas/content/getContentFuncs";
import {CanvasData} from "@/canvas/canvasDataDefs";
import {fetchJson} from "@/canvas/fetch/fetchJson";
import {getPagedDataGenerator} from "@/canvas/fetch/getPagedDataGenerator";
import {IAssignmentData, UpdateAssignmentDataOptions} from "@/canvas/content/assignments/types";

type SaveDiscussionData = Record<string, any>;
type GetDiscussionOptions = Record<string, any>
const DiscussionUrlFuncs = contentUrlFuncs('discussion_topics');

export const DiscussionKind:ContentKind<
    IDiscussionData,
    GetDiscussionOptions,
    SaveDiscussionData
> = {
    ...DiscussionUrlFuncs,
    dataIsThisKind(data): data is IDiscussionData {
        return data.hasOwnProperty('discussion_type');
    },
    getId: (data) => data.id,
    getName: (data) => data.title,
    getBody: (data) => data.message,
    async get(courseId:number, contentId: number, config?:ICanvasCallConfig<GetDiscussionOptions>) {
        const data = await fetchJson(this.getApiUrl(courseId, contentId), config) as IDiscussionData;
        return data;
    },
    dataGenerator: (courseId, config) => getPagedDataGenerator<IDiscussionData>(DiscussionUrlFuncs.getAllApiUrl(courseId), config),
    put: putContentFunc<SaveDiscussionData, IDiscussionData>(DiscussionUrlFuncs.getApiUrl),
}

export class Discussion extends BaseContentItem {
    static kindInfo = DiscussionKind;
    static nameProperty = 'title';
    static bodyProperty = 'message';
    static contentUrlTemplate = "/api/v1/courses/{course_id}/discussion_topics/{content_id}";
    static allContentUrlTemplate = "/api/v1/courses/{course_id}/discussion_topics"


    async offsetPublishDelay(days: number, config?: ICanvasCallConfig) {
        const data = this.rawData
        if (!this.rawData.delayed_post_at) return;
        let delayedPostAt = Temporal.Instant.from(this.rawData.delayed_post_at).toZonedDateTimeISO('UTC');
        delayedPostAt = delayedPostAt.add({days})

        const payload = {
            delayed_post_at: new Date(delayedPostAt.epochMilliseconds).toISOString()
        }
        await this.saveData(payload, config);
    }

    get rawData() {
        return this.canvasData as IDiscussionData;
    }
}