import {BaseContentItem} from "@/canvas/content/BaseContentItem";
import {ICanvasCallConfig} from "@/canvas/canvasUtils";
import {Temporal} from "temporal-polyfill";
import {IAssignmentData, IDiscussionData, UpdateAssignmentDataOptions} from "@/canvas/content/types";
import {contentUrlFuncs, putContentFunc} from "@/canvas/content/contentGenFuncs";
import {ContentKindInfo} from "@/canvas/content/ContentKindInfo";
import {CanvasData} from "@/canvas/canvasDataDefs";
import {fetchJson} from "@/canvas/fetch/fetchJson";
import {getPagedDataGenerator} from "@/canvas/fetch/getPagedDataGenerator";


const DiscussionUrlFuncs = contentUrlFuncs('assignments');

export const DiscussionKindInfo:ContentKindInfo<
    IAssignmentData,
    CanvasData,
    UpdateAssignmentDataOptions
> = {
    getName: (data) => data.title,
    getBody: (data) => data.message,
    async get(courseId:number, contentId: number, config?:ICanvasCallConfig<Record<string, any>>) {
        const data = await fetchJson(this.getApiUrl(courseId, contentId), config) as IAssignmentData;
        return data;
    },
    ...DiscussionUrlFuncs,
    dataGenerator: (courseId, config) => getPagedDataGenerator<IAssignmentData>(DiscussionUrlFuncs.getAllApiUrl(courseId), config),
    put: putContentFunc<UpdateAssignmentDataOptions, IAssignmentData>(DiscussionUrlFuncs.getApiUrl),
}

export class Discussion extends BaseContentItem {
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