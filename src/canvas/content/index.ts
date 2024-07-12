import {Temporal} from "temporal-polyfill";
import {CanvasData} from "../canvasDataDefs";
import {deepObjectMerge, formDataify, getCourseIdFromUrl, ICanvasCallConfig} from "../canvasUtils";
import {BaseCanvasObject} from "../baseCanvasObject";
import assert from "assert";
import {NotImplementedException} from "../index";
import {getResizedBlob} from "../image";
import {IFile, uploadFile} from "../files";
import {getPagedData} from "@/canvas/fetch/getPagedDataGenerator";

import {fetchJson} from "@/canvas/fetch/fetchJson";

const SAFE_MAX_BANNER_WIDTH = 1400;


export type DateString = string;

export interface IPageData extends CanvasData {
    page_id: number,
    url: string,
    title: string,
    body?: string,
}

export interface IDiscussionData extends CanvasData {
    id: number,
    title: string,
    message: string,
    html_url: string,
    posted_at: string,
    last_reply_at: string,
    require_initial_post: boolean,
    delayed_post_at?: string

}

export interface IQuizData {
    // the ID of the quiz
    "id": number
    // the title of the quiz
    "title": string,
    // the HTTP/HTTPS URL to the quiz
    "html_url": string,
    // a url suitable for loading the quiz in a mobile webview.  it will persist
    // the headless session and, for quizzes in public courses, will force the user
    // to login
    "mobile_url": string,
    // A url that can be visited in the browser with a POST request to preview a
    // quiz as the teacher. Only present when the user may grade
    "preview_url": string,
    // the description of the quiz
    "description": string,
    // type of quiz possible values: 'practice_quiz', 'assignment', 'graded_survey',
    // 'survey'
    "quiz_type": "assignment" | 'practice_quiz' | 'graded_survey' | 'survey',
    // the ID of the quiz's assignment group:
    "assignment_group_id": number,
    // quiz time limit in minutes
    "time_limit"?: number,
    // shuffle answers for students?
    "shuffle_answers": boolean,
    // let students see their quiz responses? possible values: null, 'always',
    // 'until_after_last_attempt'
    "hide_results": null | "always" | "until_after_last_attempt",
    // show which answers were correct when results are shown? only valid if
    // hide_results=null
    "show_correct_answers"?: boolean,
    // restrict the show_correct_answers option above to apply only to the last
    // submitted attempt of a quiz that allows multiple attempts. only valid if
    // show_correct_answers=true and allowed_attempts > 1
    "show_correct_answers_last_attempt"?: boolean,
    // when should the correct answers be visible by students? only valid if
    // show_correct_answers=true
    "show_correct_answers_at"?: string,
    // prevent the students from seeing correct answers after the specified date has
    // passed. only valid if show_correct_answers=true
    "hide_correct_answers_at"?: string,
    // prevent the students from seeing their results more than once (right after
    // they submit the quiz)
    "one_time_results": boolean,
    // which quiz score to keep (only if allowed_attempts != 1) possible values:
    // 'keep_highest', 'keep_latest'
    "scoring_policy"?: "keep_highest" | "keep_latest",
    // how many times a student can take the quiz -1 = unlimited attempts
    "allowed_attempts": number,
    // show one question at a time?
    "one_question_at_a_time": boolean,
    // the number of questions in the quiz
    "question_count": number,
    // The total point value given to the quiz
    "points_possible": number,
    // lock questions after answering? only valid if one_question_at_a_time=true
    "cant_go_back"?: boolean,
    // access code to restrict quiz access
    "access_code"?: string,
    // IP address or range that quiz access is limited to
    "ip_filter"?: string,
    // when the quiz is due
    "due_at"?: string,
    // when to lock the quiz
    "lock_at"?: string | null,
    // when to unlock the quiz
    "unlock_at"?: string | null,
    // whether the quiz has a published or unpublished draft state.
    "published": boolean,
    // Whether the assignment's 'published' state can be changed to false. Will be
    // false if there are student submissions for the quiz.
    "unpublishable": boolean,
    // Whether or not this is locked for the user.
    "locked_for_user": boolean,
    // (Optional) Information for the user about the lock. Present when
    // locked_for_user is true.
    "lock_info"?: LockInfo | null,
    // (Optional) An explanation of why this is locked for the user. Present when
    // locked_for_user is true.
    "lock_explanation"?: string,
    // Link to Speed Grader for this quiz. Will not be present if quiz is
    // unpublished
    "speedgrader_url": string,
    // Link to endpoint to send extensions for this quiz.
    "quiz_extensions_url": string,
    // Permissions the user has for the quiz
    "permissions"?: QuizPermissions | null,
    // list of due dates for the quiz
    "all_dates": null | string[],
    // Current version number of the quiz
    "version_number": number,
    // List of question types in the quiz
    "question_types": string[],
    // Whether survey submissions will be kept anonymous (only applicable to
    // 'graded_survey', 'survey' quiz types)
    "anonymous_submissions"?: boolean
}

type QuizPermissions = Record<string, any>


export class BaseContentItem extends BaseCanvasObject<CanvasData> {
    static bodyProperty: string;
    static nameProperty: string = 'name';

    _courseId: number;

    constructor(canvasData: CanvasData, courseId: number) {
        super(canvasData);
        this._courseId = courseId;
    }

    get htmlContentUrl() {
        return `${this.contentUrlPath}`.replace('/api/v1/', '/');
    }


    static get contentUrlPart() {
        assert(this.allContentUrlTemplate, "Not a content url template");
        const urlTermMatch = /\/([\w_]+)$/.exec(this.allContentUrlTemplate);
        if (!urlTermMatch) return null;
        return urlTermMatch[1];

    }

    static async getAllInCourse<T extends BaseContentItem>(courseId: number, config: ICanvasCallConfig | null = null) {
        let url = this.getAllUrl(courseId);
        let data = await getPagedData(url, config);
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
        if (!this.canvasData.due_at) return null;
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

    async updateContent(text?: string | null, name?: string | null, config?: ICanvasCallConfig) {
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

        return this.saveData(data, config);
    }

    async getMeInAnotherCourse(targetCourseId: number) {
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

    async resizeBanner(maxWidth = SAFE_MAX_BANNER_WIDTH) {
        const bannerImg = getBannerImage(this);
        if (!bannerImg) throw new Error("No banner");
        let fileData = await getFileDataFromUrl(bannerImg.src, this.courseId)
        if (!fileData) throw new Error("File not found");
        if (bannerImg.naturalWidth < maxWidth) return; //Dont resize image unless we're shrinking it
        let resizedImageBlob = await getResizedBlob(bannerImg.src, maxWidth);
        let fileName = fileData.filename;
        let fileUploadUrl = `/api/v1/courses/${this.courseId}/files`
        assert(resizedImageBlob);
        let file = new File([resizedImageBlob], fileName)
        return await uploadFile(file, fileData.folder_id, fileUploadUrl);
    }
}

async function getFileDataFromUrl(url: string, courseId: number) {
    const match = /.*\/files\/(\d+)/.exec(url);
    if (!match) return null;
    if (match) {
        const fileId = parseInt(match[1]);
        return await getFileData(fileId, courseId);
    }
}


export class Quiz extends BaseContentItem {
    static nameProperty = 'title';
    static bodyProperty = 'description';
    static contentUrlTemplate = "/api/v1/courses/{course_id}/quizzes/{content_id}";
    static allContentUrlTemplate = "/api/v1/courses/{course_id}/quizzes";

    async setDueAt(date: Date): Promise<Record<string, any>> {
        const url = `/api/v1/courses/${this.courseId}/quizzes/${this.id}`;
        return fetchJson(url, {
            fetchInit: {
                method: 'PUT',
                body: formDataify({
                    quiz: {
                        due_at: date
                    }
                })
            }
        })
    }
}

export class Page extends BaseContentItem {
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


export function getBannerImage(overviewPage: BaseContentItem) {
    const pageBody = document.createElement('html');
    if (!overviewPage.body) throw new Error(`Content item ${overviewPage.name} has no html body`)
    pageBody.innerHTML = overviewPage.body;
    return pageBody.querySelector<HTMLImageElement>('.cbt-banner-image img');
}


async function getFileData(fileId: number, courseId: number) {
    const url = `/api/v1/courses/${courseId}/files/${fileId}`
    return await fetchJson(url) as IFile;
}

export function putContentConfig<T extends Record<string, any>>(data:T, config?:ICanvasCallConfig) {
    return deepObjectMerge(config, {
        fetchInit: {
            method: 'PUT',
            body: formDataify(data)
        }
    }, true);
}


