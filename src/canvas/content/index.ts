import {Temporal} from "temporal-polyfill";
import {CanvasData, IAssignmentData, IDiscussionData, IPageData} from "../canvasDataDefs";
import {
    fetchJson,
    fetchOneKnownApiJson,
    getApiPagedData,
    getCourseIdFromUrl,
    getPagedData,
    ICanvasCallConfig
} from "../canvasUtils";
import {BaseCanvasObject} from "../baseCanvasObject";
import assert from "assert";
import {NotImplementedException} from "../index";

export class BaseContentItem extends BaseCanvasObject<CanvasData> {
    static bodyProperty: string;
    static nameProperty: string = 'name';

    _courseId: number;

    constructor(canvasData: CanvasData, courseId: number) {
        super(canvasData);
        this._courseId = courseId;
    }

    static get contentUrlPart() {
        assert(this.allContentUrlTemplate, "Not a content url template");
        const urlTermMatch = /\/([\w_]+)$/.exec(this.allContentUrlTemplate);
        if (!urlTermMatch) return null;
        const urlTerm = urlTermMatch[1];
        return urlTerm;

    }

    static async getAllInCourse<T extends BaseContentItem>(courseId: number, config: ICanvasCallConfig | null = null) {
        let url = this.getAllUrl(courseId);
        let data = await getApiPagedData(url, config);
        return data.map(item => new this(item, courseId)) as T[];
    }

    static clearAddedContentTags(text: string) {
        let out = text.replace(/<\/?link[^>]*>/g, '');
        out = out.replace(/<\/?script[^>]*>/g, '');
        return out;
    }

    static async getFromUrl(url: string | null = null, courseId: number | null = null) {
        if (url === null) {
            url = document.documentURI;
        }

        url = url.replace(/\.com/, '.com/api/v1')
        let data = await fetchJson(url);
        if (!courseId) {
            courseId = getCourseIdFromUrl(url)
            if (!courseId) return null;
        }
        //If this is a collection of data, we can't process it as a Canvas Object
        if (Array.isArray(data)) return null;
        assert(!Array.isArray(data));
        if (data) {
            return new this(data, courseId);
        }
        return null;
    }

    static async getById<T extends BaseContentItem>(contentId: number, courseId: number) {
        return new this(await this.getDataById<T>(contentId, courseId), courseId)
    }


    get bodyKey() {
        return this.myClass.bodyProperty;
    }

    get body() {
        if (!this.bodyKey) return null;
        return this.myClass.clearAddedContentTags(this.canvasData[this.bodyKey]);
    }

    get dueAt() {
        if (!this.canvasData.hasOwnProperty('due_at')) {
            return null;
        }
        return new Date(this.canvasData.due_at);
    }

    async setDueAt(date: Date): Promise<Record<string, any>> {
        throw new NotImplementedException();
    }

    async dueAtTimeDelta(timeDelta: number) {
        if (!this.dueAt) return null;
        let result = new Date(this.dueAt);
        result.setDate(result.getDate() + timeDelta)


        return await this.setDueAt(result);
    }

    get contentUrlPath() {
        let url = (<typeof BaseContentItem>this.constructor).contentUrlTemplate;
        assert(url);
        url = url.replace('{course_id}', this.courseId.toString());
        url = url.replace('{content_id}', this.id.toString());

        return url;
    }

    get courseId() {
        return this._courseId;
    }

    async updateContent(text: string | null = null, name: string | null = null) {
        const data: Record<string, any> = {};
        const constructor = <typeof BaseContentItem>this.constructor;
        assert(constructor.bodyProperty);
        assert(constructor.nameProperty);
        const nameProp = constructor.nameProperty;
        const bodyProp = constructor.bodyProperty;
        if (text && bodyProp) {
            this.canvasData[bodyProp] = text;
            data[bodyProp] = text;
        }

        if (name && nameProp) {
            this.canvasData[nameProp] = name;
            data[nameProp] = name;
        }

        return this.saveData(data);
    }

    async getMeInAnotherCourse(targetCourseId:number) {
        let ContentClass = this.constructor as typeof BaseContentItem
        let targets = await ContentClass.getAllInCourse(
            targetCourseId,
            {queryParams: {search_term: this.name}}
        )
        return targets.find((target: BaseContentItem) => target.name == this.name);
    }

    getAllLinks(): string[] {
        const el = this.bodyAsElement;
        const anchors = el.querySelectorAll('a');
        const urls: string[] = [];
        for (let link of anchors) urls.push(link.href);
        return urls;


    }

    get bodyAsElement() {
        assert(this.body, "This content item has no body property")
        let el = document.createElement('div');
        el.innerHTML = this.body;
        return el;
    }
}


export class Discussion extends BaseContentItem {
    static nameProperty = 'title';
    static bodyProperty = 'message';
    static contentUrlTemplate = "courses/{course_id}/discussion_topics/{content_id}";
    static allContentUrlTemplate = "courses/{course_id}/discussion_topics"


    async offsetPublishDelay(days: number) {
        const data = this.rawData
        if (!this.rawData.delayed_post_at) return;
        let delayedPostAt = Temporal.Instant.from(this.rawData.delayed_post_at).toZonedDateTimeISO('UTC');
        delayedPostAt = delayedPostAt.add({days})

        const payload = {
            delayed_post_at: new Date(delayedPostAt.epochMilliseconds).toISOString()
        }
        await this.saveData(payload);
    }

    get rawData() {
        return this.canvasData as IDiscussionData;
    }


}

export class Assignment extends BaseContentItem {
    static nameProperty = 'name';
    static bodyProperty = 'description';
    static contentUrlTemplate = "courses/{course_id}/assignments/{content_id}";
    static allContentUrlTemplate = "courses/{course_id}/assignments";

    async setDueAt(dueAt: Date) {
        const currentDueAt = this.dueAt ? Temporal.Instant.from(this.rawData.due_at) : null;
        const targetDueAt = Temporal.Instant.from(dueAt.toISOString());

        const payload: Record<string, { due_at: string, peer_review_due_at?: string }> = {
            assignment: {
                due_at: dueAt.toISOString(),
            }
        }

        if (this.rawData.peer_reviews && 'automatic_peer_reviews' in this.rawData) {
            const peerReviewTime = Temporal.Instant.from(this.rawData.peer_reviews_assign_at);
            assert(currentDueAt, "Trying to set peer review date without a due date for the assignment.")
            const peerReviewOffset = currentDueAt.until(peerReviewTime);
            const newPeerReviewTime = targetDueAt.add(peerReviewOffset);
            payload.assignment.peer_review_due_at = new Date(newPeerReviewTime.epochMilliseconds).toISOString();

        }

        let data = await this.saveData(payload);


        this.canvasData['due_at'] = dueAt.toISOString();
        return data;

    }

    get rawData() {
        return this.canvasData as IAssignmentData;
    }

}

export class Quiz extends BaseContentItem {
    static nameProperty = 'title';
    static bodyProperty = 'description';
    static contentUrlTemplate = "courses/{course_id}/quizzes/{content_id}";
    static allContentUrlTemplate = "courses/{course_id}/quizzes";

    async setDueAt(dueAt: Date) {
        let result = await this.saveData({'quiz[due_at]': dueAt.toISOString()})
        this.canvasData['due_at'] = dueAt.toISOString();
        return result;
    }

}

export class Page extends BaseContentItem {
    static idProperty = 'page_id';
    static nameProperty = 'title';
    static bodyProperty = 'body';
    static contentUrlTemplate = "courses/{course_id}/pages/{content_id}";
    static allContentUrlTemplate = "courses/{course_id}/pages";

    constructor(canvasData: IPageData, courseId: number) {
        super(canvasData, courseId);
    }

    async getRevisions() {
        return getPagedData(`${this.contentUrlPath}/revisions`);
    }

    async applyRevision(revision: Record<string, any>) {
        const revisionId = revision['revision_id'];
        let result = await fetchOneKnownApiJson(`${this.contentUrlPath}/revisions/${revisionId}?revision_id=${revisionId}`);
        this.canvasData[this.bodyKey] = result['body'];
        this.canvasData[this.nameKey] = result['title'];
    }

    get body(): string {
        return this.canvasData[this.bodyKey];
    }


    async updateContent(text: string | null = null, name: string | null = null) {
        let data: Record<string, any> = {};
        if (text) {
            this.canvasData[this.bodyKey] = text;
            data['wiki_page[body]'] = text;
        }
        if (name) {
            this.canvasData[this.nameKey] = name;
            data[this.nameKey] = name;
        }

        return this.saveData(data);
    }
}