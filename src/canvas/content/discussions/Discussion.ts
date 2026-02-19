import {BaseContentItem} from "@ueu/ueu-canvas/content/BaseContentItem";
import {ICanvasCallConfig} from "@ueu/ueu-canvas/canvasUtils";
import {Temporal} from "temporal-polyfill";
import DiscussionKind from "@ueu/ueu-canvas/content/discussions/DiscussionKind";


import {IDiscussionData} from "@ueu/ueu-canvas/content/types";

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