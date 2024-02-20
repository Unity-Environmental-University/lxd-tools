/**
 * noinspection FunctionNamingConventionJS,JSUnusedGlobalSymbols
 */

/* Very Initial refactor to JS using ChatGPT4
NOTE: Almost all of this code has had to be rewritten since then.
And starting to convert to ts
 */

import assert from "node:assert";
import {CanvasData, Dict} from "./canvasDataDefs";


interface CanvasApiCallConfig extends Dict {
    fetchConfig?: Dict
    queryParams?: Dict
}

const type_lut: Dict = {
    'Assignment': 'assignment',
    'Discussion': 'discussion_topic',
    'Quiz': 'quiz',
    'Attachment': 'attachment',
    'External Tool': 'external_tool',
    'File': 'file',
    'Page': 'wiki_page'
}

function formDataify(data: Dict) {
    console.log('form', data);
    let formData = new FormData();
    for (let key in data) {
        formData.append(key, data[key]);
    }

    if (document) {
        const el: HTMLInputElement | null = document.querySelector("input[name='authenticity_token']");
        const authenticityToken = el ? el.value : null;
        if (authenticityToken) formData.append('authenticity_token', authenticityToken);
    }

    return formData;
}


async function getItemTypeAndId(
    item: {
        type: string,
        url: string,
        content_id: number | string
    }
) {

    let id = null;
    let type = null;
    if (type_lut.hasOwnProperty(item.type)) {
        type = type_lut[item.type];
        if (type === "wiki_page") {
            const response = await fetch(item.url);
            if (response.ok) {
                const data = await response.json();
                id = data.page_id;
            }
        } else {
            id = item.content_id;
        }
    }
    return {type, id}
}

/**
 * @param queryParams
 * @returns {URLSearchParams} The correctly formatted parameters
 */
function searchParamsFromObject(queryParams: string[][] | Record<string, string>): URLSearchParams {
    return new URLSearchParams(queryParams);
}


/**
 * Gets paged data from the url beginning /api/v1/
 @param url The url of the query to put after /api/v1/
 @param apiFetchParams
 @returns {Promise<object[]>}
 */
async function getApiPagedData(url: string, apiFetchParams : CanvasApiCallConfig | undefined = undefined): Promise<CanvasData[]> {
    return await getPagedData(`/api/v1/${url}`, apiFetchParams)
}


/**
 * @param url The entire path of the url
 * @param queryParams parameters to append to the url as query params
 * @param fetchParams params to pass to the fetch call
 * @returns {Promise<object[]>}
 */

async function getPagedData(
    url: string, {queryParams, fetchConfig} : CanvasApiCallConfig = {queryParams : undefined, fetchConfig : undefined}): Promise<CanvasData[]> {

    if (queryParams) {
        url += '?' + searchParamsFromObject(queryParams);
    }
    /* Returns a list of data from a GET request, going through multiple pages of data requests as necessary */
    let response = await fetch(url, fetchConfig);
    let data = await response.json();
    if (typeof data === 'object' && !Array.isArray(data)) {
        let values = Array.from(Object.values(data));
        if (values) {
            data = values.find((a) => Array.isArray(a));
        }
    }
    let next_page_link = "!";
    while (next_page_link.length !== 0 &&
    response &&
    response.headers.has("Link") && response.ok) {
        const link = response.headers.get("Link");
        assert(link);
        const paginationLinks = link.split(",");

        const nextLink = paginationLinks.find((link) => link.includes('next'));
        if (nextLink) {
            next_page_link = nextLink.split(";")[0].split("<")[1].split(">")[0];
            response = await fetch(next_page_link, fetchConfig);
            let responseData = await response.json();
            if (Array.isArray(responseData.values())) {
                const values = responseData.values();
                responseData = values ? values.find((a: any) => Array.isArray(a)) : [];
            }
            data = data.concat(responseData);
        } else {
            next_page_link = "";
        }
    }

    return data;
}

async function fetchJson(
    url: string, {queryParams, fetchParams}: CanvasApiCallConfig | undefined = { queryParams : undefined, fetchConfig : undefined}): Promise<CanvasData|CanvasData[]> {
    if (queryParams) {
        url += '?' + new URLSearchParams(queryParams);
    }
    const response = await fetch(url, fetchParams);
    return await response.json();
}

/**
 * Fetches a json object from /api/v1/${url}
 * @param url
 * @param config query and fetch params
 */
async function fetchApiJson(url: string, config: CanvasApiCallConfig| undefined = undefined) {
    url = `/api/v1/${url}`;
    return await fetchJson(url, config);
}

async function fetchOneApiJson(url: string, config: CanvasApiCallConfig | undefined = undefined) {
    let result = await fetchApiJson(url, config);
    if (Array.isArray(result)) return result[0];
    return <CanvasData> result;
}
/**
 *  A base class for objects that interact with the Canvas API
 */

export class BaseCanvasObject {

    static _idProperty = 'id'; // The field name of the id of the canvas object type
    static _nameProperty: string | null = null; // The field name of the primary name of the canvas object type
    static _contentUrlTemplate:string | null = null; // A templated url to get a single item
    static _allContentUrlTemplate: string | null = null; // A templated url to get all items
    protected _canvasData: CanvasData;
    protected accountId: null | number = null;

    constructor(data: CanvasData) {
        this._canvasData = data || {}; // A dict holding the decoded json representation of the object in Canvas
    }

    toString() {
        return JSON.stringify(this._canvasData);
    }

    getItem(item: string) {
        return this._canvasData[item] || null;
    }

    get myClass() { return (<typeof BaseContentItem> this.constructor)}
    get nameKey() {
        assert(this.myClass._nameProperty);
        return this.myClass._nameProperty;
    }


    get contentUrlPath(): null | string {
        const constructor = <typeof BaseCanvasObject>this.constructor;

        assert(typeof this.accountId === 'number');
        assert(typeof constructor._contentUrlTemplate === 'string');
        return constructor._contentUrlTemplate
            .replace('{content_id}', this.canvasId.toString())
            .replace('{account_id}', this.accountId.toString());
    }

    get htmlContentUrl() {
        return `/${this.contentUrlPath}`;
    }

    get rawData(): CanvasData {
        const out: CanvasData = {
            id: NaN,
        };
        for (let key in this._canvasData) {
            out[key] = this._canvasData[key];
        }
        return out;
    }

    static async getDataById(contentId: number, course: Course | null = null, config : CanvasApiCallConfig | undefined): Promise<CanvasData> {
        let url = this.getUrlPathFromIds(contentId, course ? course.canvasId : null);
        const response =  await fetchApiJson(url, config);
        assert(!Array.isArray(response));
        return response;
    }

    static getUrlPathFromIds(
        contentId: number,
        courseId: number | null) {
        assert(typeof this._contentUrlTemplate === 'string');
        let url = this._contentUrlTemplate
            .replace('{content_id}', contentId.toString());

        if (courseId) url = url.replace('{course_id}', courseId.toString());

        return url;
    }

    /**
     *
     * @param courseId - The course ID to get elements within, if applicable
     * @param accountId - The account ID to get elements within, if applicable
     */
    static getAllUrl(courseId: number | null = null, accountId: number | null = null) {
        assert(typeof this._allContentUrlTemplate === 'string');
        let replaced = this._allContentUrlTemplate;

        if(courseId) replaced = replaced.replace('{course_id}', courseId.toString());
        if(accountId) replaced = replaced.replace('{account_id}', accountId.toString());
        return replaced;
    }

    static async getAll(queryParams = {}, fetchParams = {}) {
        let url = this.getAllUrl();
        let data = await getApiPagedData(url, {queryParams, fetchConfig: fetchParams});
        return data.map(item => new this(item));
    }


    get canvasId() : number {
        const id = this._canvasData[(<typeof BaseCanvasObject> this.constructor)._idProperty];
        return parseInt(id);
    }

    get name() {
        let nameProperty = (<typeof BaseCanvasObject> this.constructor)._nameProperty;
        assert(nameProperty)
        return this.getItem(nameProperty);
    }

    async saveData(data: Dict) {
        assert(this.contentUrlPath);
        return await fetchApiJson(this.contentUrlPath, {fetchConfig : {
            method: 'PUT',
            body: formDataify(data)
        }});

    }

    async delete() {
        assert(this.contentUrlPath);
        return await fetchApiJson(this.contentUrlPath, { fetchConfig: {method: 'DELETE'}})
    }

}

export class Account extends BaseCanvasObject {
    static _nameProperty = 'name'; // The field name of the primary name of the canvas object type
    static _contentUrlTemplate = 'accounts/{content_id}'; // A templated url to get a single item
    static _allContentUrlTemplate = 'accounts'; // A templated url to get all items
    private static _rootAccount: Account;
    static async getFromUrl(url: string | null = null) {
        if (url === null) {
            url = document.documentURI;
        }
        let match = /accounts\/(\d+)/.exec(url);
        if (match) {
            console.log(match);
            return await this.getById(parseInt(match[1]));
        }
        return null;
    }

    static async getById(accountId: number, config: CanvasApiCallConfig | undefined = undefined) {
        const data = await this.getDataById(accountId, null, config)
        console.assert()
        return new Account(data);
    }

    static async getRootAccount(resetCache = false) {
        let accounts: Account[] = <Account[]> await this.getAll();
        if (!resetCache && this.hasOwnProperty('_rootAccount') && this._rootAccount) {
            return this._rootAccount;
        }
        let root = accounts.find((a) => a.rootAccountId === null);
        assert(root);
        this._rootAccount = root;
        return root;
    }


    get rootAccountId() {
        return this._canvasData['root_account_id']
    }

}

export class Course extends BaseCanvasObject {
    static CODE_REGEX = /^(.+[^_])?_?(\w{4}\d{3})/i; // Adapted to JavaScript's regex syntax.

    static async getFromUrl(url: string | null = null) {
        if (url === null) {
            url = document.documentURI;
        }
        let match = /courses\/(\d+)/.exec(url);
        if (match) {
            console.log(match);
            return await this.getById(parseInt(match[1]));
        }
    }

    static async getById(courseId: number, config: CanvasApiCallConfig | undefined = undefined) {
        const data = await fetchOneApiJson(`courses/${courseId}`, config);
        return new Course(data);
    }

    private static async getCoursesByString(code:string, term: Term | null = null, config: CanvasApiCallConfig = {}) {
        let courseDataList: CanvasData[] | null = null;
        const accountIdsByName = await Course.getAccountIdsByName();
        for (let accountKey in accountIdsByName) {
            let accountId = accountIdsByName[accountKey];
            let url = `accounts/${accountId}/courses`;
            config.queryParams = config.queryParams || {};
            config.queryParams['search_term'] = code;
            if (term !== null) {
                config.queryParams['enrollment_term_id'] = term.canvasId;
            }
            courseDataList = await getApiPagedData(url, config);
            if (courseDataList && courseDataList.length > 0) {
                break;
            }
        }

        if (!courseDataList || courseDataList.length === 0) {
            return null;
        }

        if (courseDataList.length > 1) {
            courseDataList.sort((a, b) => b.id - a.id); // Sort courses by ID in descending order
        }

        return courseDataList.map(courseData => new Course(courseData));
    }
    static async getAllByCode(code: string, term: Term | null = null, config: CanvasApiCallConfig | undefined = undefined) {
        return this.getCoursesByString(code, term, config);
    }

    static async getByCode(code: string, term : Term | null = null, config: CanvasApiCallConfig | undefined = undefined)
    {
        const courses = await this.getCoursesByString(code, term, config);
        if (Array.isArray(courses)) return courses[0];
        return null;
    }

    static async getAccountIdsByName(): Promise<Dict> {
        let course = await Course.getFromUrl();
        if (!course) {
            console.warn("You must be on a canvas page to get accounts");
            return {};
        }
        return {
            'root': course._canvasData['root_account_id'],
            'current': course._canvasData['accountId']
        }
    }


    // static async courseEvent(courses: Course[], event: string, accountId: number) {
    //     const url = `accounts/${accountId}/courses`; // Assuming API_URL and ACCOUNT_ID are defined elsewhere
    //     const data = {
    //         'event': event,
    //         'course_ids[]': courses.map(course => course.id)
    //     };
    //     const response = await fetch(url, {
    //         method: 'PUT',
    //         body: JSON.stringify(data)
    //     });
    //     if (!response.ok) {
    //         console.error(await response.text());
    //     }
    // }

    get contentUrlPath() {
        return `courses/${this.canvasId}`;
    }

    get courseUrl() {
        return this.htmlContentUrl;
    }

    get courseCode(): null | string {
        let match = this.codeMatch;
        if (!match) return null;
        let prefix = match[1] || "";
        let courseCode = match[2] || "";
        return `${prefix}_${courseCode}`;
    }

    set courseCode(value: string | null) {
        assert(this._canvasData.name);
        if (value) {
            let match = value.match(Course.CODE_REGEX);
            if (!match) {
                console.warn("Code does not match PREFIX_DEPT1234");
            }
            this._canvasData['name'] = value.replace(Course.CODE_REGEX, this._canvasData['name']);
            this._canvasData['name'] = value.replace('[NO CODE]', this._canvasData['name']);

        } else {
            this._canvasData['name'] = this._canvasData['name'].replace(Course.CODE_REGEX, '[NO CODE]');
        }
        this._canvasData['course_code'] = value;
    }

    get codeMatch() {
        return Course.CODE_REGEX.exec(this._canvasData.course_code);
    }

    get baseCode() {
        let match = this.codeMatch;
        return match ? match[2] : '';
    }

    get codePrefix() {
        let match = this.codeMatch;
        return match ? match[1] : '';
    }

    get isBlueprint() {
        return 'blueprint' in this._canvasData && this._canvasData['blueprint'];
    }

    get isPublished() {
        return this._canvasData['workflow_state'] === 'available';
    }

    async getModules() {
        return await getApiPagedData(`${this.contentUrlPath}/modules?include[]=items&include[]=content_details`);


    }

    async getSyllabus(): Promise<string> {
        if (!('syllabus_body' in this._canvasData)) {
            const data = await Course.getById(this.canvasId, {'include[]': 'syllabus_body'});
            this._canvasData['syllabus_body'] = data._canvasData['syllabus_body'];
        }
        return this._canvasData['syllabus_body'];
    }

    /**
     * gets all assignments in a course
     * @returns {Promise<Assignment[]>}
     * @param config
     */
    async getAssignments(config : CanvasApiCallConfig = {
        fetchConfig: {'include': ['due_at']}
    }): Promise<Assignment[]> {
        return <Assignment[]> await Assignment.getAllInCourse(this, config);
    }

    /**
     *Gets all quizzes in a course
     * @param queryParams a json object representing the query param string. Defaults to including due dates     *
     * @returns {Promise<Quiz[]>}
     */
    async getQuizzes(queryParams = {'include': ['due_at']}): Promise<Quiz[]> {
        return <Quiz[]> await Quiz.getAllInCourse(this, {queryParams});
    }

    async getAssociatedCourses() {
        if (!this.isBlueprint) return null;

        const url = `courses/${this.canvasId}/blueprint_templates/default/associated_courses`;
        const courses = await getApiPagedData(url, {queryParams: {per_page: 50}});
        return courses.map(courseData => new Course(courseData));
    }

    async getSubsections() {
        const url = `/api/v1/courses/${this.canvasId}/sections`;
        return await fetchApiJson(url);

    }

    async getTabs() {
        return await fetchApiJson(`courses/${this.canvasId}/tabs`);
    }

    async getFrontPage() {
        try {
            const data = await fetchOneApiJson(`${this.contentUrlPath}/front_page`);
            return new Page(data, this);
        } catch (error) {
            return null;
        }
    }

    getTab(label: string) {
        return this._canvasData.tabs.find((tab: Dict) => tab.label === label) || null;
    }

    async setNavigationTabHidden(label: string, value: boolean) {
        const tab = this.getTab(label);
        if (!tab) return null;

        return await fetchApiJson(`courses/${this.canvasId}/tabs/${tab.id}`, {
            queryParams : {'hidden': value}
        });
    }

    async changeSyllabus(newHtml: string) {
        this._canvasData['syllabus_body'] = newHtml;
        return await fetchApiJson(`courses/${this.canvasId}`, {
            fetchConfig: {
                method: 'PUT',
                body: JSON.stringify({'course[syllabus_body]': newHtml})
            }
        });
    }

    async getPotentialSections(term: Term) {
        return await Course.getAllByCode(this.baseCode, term);
    }

    async lockBlueprint() {
        const modules = await this.getModules();
        const items = [].concat(...modules.map((a) => [].concat(...a.items)));
        const promises = items.map(async (item) => {
            const url = `${this.contentUrlPath}/blueprint_templates/default/restrict_item`;
            let {type, id} = await getItemTypeAndId(item);
            let body = {
                "content_type": type,
                "content_id": id,
                "restricted": true,
                "_method": 'PUT'
            }


            console.log(body);
            await fetchApiJson(url, {fetchConfig:{
                method: 'PUT',
                body: formDataify(body)
            }});

        });
        await Promise.all(promises);

    }

    async setAsBlueprint() {
        const url = `courses/${this.canvasId}`;
        const payload = {
            'course[blueprint]': true,
            'course[use_blueprint_restrictions_by_object_type]': 0,
            'course[blueprint_restrictions][content]': 1,
            'course[blueprint_restrictions][points]': 1,
            'course[blueprint_restrictions][due_dates]': 1,
            'course[blueprint_restrictions][availability_dates]': 1,
        };

        this._canvasData = await fetchOneApiJson(url,{fetchConfig:{
            method: 'PUT',
            body: JSON.stringify(payload)
        }});
        this.resetCache();
    }

    async unsetAsBlueprint() {
        const url = `courses/${this.canvasId}`;
        const payload = {
            'course[blueprint]': false,
        };
        this._canvasData = await fetchOneApiJson(url, {fetchConfig:{
            method: 'PUT',
            body: JSON.stringify(payload)
        }});
        this.resetCache();
    }

    resetCache() {
        //delete this.subsections;
        //delete this.associatedCourses;
    }

    async publish() {
        const url = `courses/${this.canvasId}`;
        const courseData = await fetchOneApiJson(url, {fetchConfig:{
            method: 'PUT',
            body: JSON.stringify({'offer': true})
        }});
        console.log(courseData);
        this._canvasData = courseData;
        this.resetCache();
    }

    async unpublish() {
        const url = `courses/${this.canvasId}`;
        await fetchApiJson(url, {fetchConfig:{
            method: 'PUT',
            body: JSON.stringify({'course[event]': 'claim'})
        }});
        this._canvasData = (await Course.getById(this.canvasId) ).rawData;
    }

    async contentUpdatesAndFixes(_fixesToRun = null) {
        throw new NotImplementedException();
        // await this.setNavigationTabHidden('Dropout Detective', false);
        // await this.setNavigationTabHidden('BigBlueButton', false);
        //
        // const appliedTo = [];
        // if (fixesToRun === null) {
        //     fixesToRun = this.fixesToRun;
        // }
        //
        // for (const page of EvalFix.findContent(this)) {
        //     page.delete();
        //     appliedTo.push(page);
        // }
        //
        // for (const fixSet of fixesToRun) {
        //     const pages = fixSet.findContent(this);
        //     for (const page of pages) {
        //         const text = fixSet.fix(page.body);
        //         page.updateContent(text);
        //         appliedTo.push(page);
        //     }
        // }
        //
        // const syllabus = SyllabusFix.fix(this.syllabus);
        // await fetchApiJson(`courses/${this.canvasId}`, {}, {
        //     method: 'PUT',
        //     body: JSON.stringify({'course[syllabus_body]': syllabus})
        // });
        // this.canvasData['syllabus_body'] = syllabus;
        // return appliedTo;
    }

    async reset(prompt = true) {
        if (prompt && !confirm(`Are you sure you want to reset ${this.courseCode}?`)) {
            return false;
        }

        const url = `/courses/${this.canvasId}/reset_content`;
        const data = await fetchOneApiJson(url, { fetchConfig: {method: 'POST'}});
        this._canvasData['id'] = data.id;

        return false;
    }

    async importDevCourse(_prompt = false, _updateFunc: undefined |((current: number, total: number) => void)) {
        throw new NotImplementedException();
        // const prefix = this.codePrefix;
        // if (prefix.toUpperCase() !== 'BP') {
        //     throw new Error('Course code is not a blueprint');
        // }
        // const code = `DEV_${this.baseCode}`;
        // const devCourse = await this.getParentCourse();
        // if (!devCourse) {
        //     throw new CourseNotFoundException(`${code} not found.`)
        // }
        // if (prompt) {
        //     if (!confirm(`Are you sure you want to import ${devCourse.name} into ${this.name}?`)) {
        //         return null;
        //     }
        // }
        //
        // return this.importCourse(devCourse, updateFunc);
    }


    async getParentCourse(return_dev_search = false) {
        let migrations = await getApiPagedData(`courses/${this.canvasId}/content_migrations`);

        if (migrations.length < 1) {
            console.log('no migrations found');
            if (return_dev_search) {
                return Course.getByCode('DEV_' + this.baseCode);
            } else return false;
        }
        migrations.sort((a, b) => b.id - a.id);

        try {
            for (let migration of migrations) {
                let course = await Course.getById(migration['settings']['source_course_id'])
                if (course.codePrefix === "DEV") return course;
            }
        } catch (e) {
            return await Course.getByCode('DEV_' + this.baseCode);
        }
    }
}


export class BaseContentItem extends BaseCanvasObject {
    static _bodyProperty: string;

    _course: Course;

    constructor(canvasData: CanvasData, course: Course) {
        super(canvasData);
        this._course = course;
    }

    static async getAllInCourse(course: Course, config: CanvasApiCallConfig) {
        let url = this.getAllUrl(course.canvasId);
        let data = await getApiPagedData(url, config);
        return data.map(item => new this(item, course));
    }

    static clearAddedContentTags(text: string) {
        let out = text.replace(/<\/?link[^>]*>/g, '');
        out = out.replace(/<\/?script[^>]*>/g, '');
        return out;
    }


    get bodyKey() {return this.myClass._bodyProperty;}

    get body() {
        if (!this.bodyKey) return null;
        return this.myClass.clearAddedContentTags(this._canvasData[this.bodyKey]);
    }

    get dueAt() {
        if (!this._canvasData.hasOwnProperty('due_at')) {
            return null;
        }
        return new Date(this._canvasData.due_at);
    }

    async setDueAt(date: Date): Promise<Dict> {
        throw new NotImplementedException();
    }
    async dueAtTimeDelta(timeDelta: number) {
        if (!this.dueAt) return null;
        let result = new Date(this.dueAt);
        result.setDate(result.getDate() + timeDelta)


        return await this.setDueAt(result);
    }

    get contentUrlPath() {
        let url = (<typeof BaseContentItem> this.constructor)._contentUrlTemplate;
        assert(url);
        url = url.replace('{course_id}', this.course.canvasId.toString());
        url = url.replace('{content_id}', this.canvasId.toString());

        return url;
    }

    get course() {
        return this._course;
    }

    async updateContent(text = null, name = null) {
        const data: Dict = {};
        const constructor = <typeof BaseContentItem> this.constructor;
        assert(constructor._bodyProperty);
        assert(constructor._nameProperty);
        const nameProp = constructor._nameProperty;
        const bodyProp = constructor._bodyProperty;
        if (text && bodyProp) {
            this._canvasData[bodyProp] = text;
            data[bodyProp] = text;
        }

        if (name && nameProp) {
            this._canvasData[nameProp] = name;
            data[nameProp] = name;
        }

        return this.saveData(data);
    }


    async delete() {
        return super.delete();
    }
}

export class Discussion extends BaseContentItem {
    static _nameProperty = 'title';
    static _bodyProperty = 'message';
    static _contentUrlTemplate = "courses/{course_id}/discussion_topics/{content_id}";
    static _allContentUrlTemplate = "courses/{course_id}/discussion_topics"

}

export class Assignment extends BaseContentItem {
    static _nameProperty = 'name';
    static _bodyProperty = 'description';
    static _contentUrlTemplate = "courses/{course_id}/assignments/{content_id}";
    static _allContentUrlTemplate = "courses/{course_id}/assignments";

    async setDueAt(dueAt: Date) {
        let data = await this.saveData({'assignment[due_at]': dueAt.toISOString()});
        this._canvasData['due_at'] = dueAt.toISOString();
        return data;

    }
}

export class Quiz extends BaseContentItem {
    static _nameProperty = 'title';
    static _bodyProperty = 'description';
    static _contentUrlTemplate = "courses/{course_id}/quizzes/{content_id}";
    static _allContentUrlTemplate = "courses/{course_id}/quizzes";

    async setDueAt(dueAt: Date ) {
        let result = await this.saveData({'quiz[due_at]': dueAt.toISOString()})
        this._canvasData['due_at'] = dueAt.toISOString();
        return result;
    }

}

export class Page extends BaseContentItem {
    static _idProperty = 'page_id';
    static _nameProperty = 'title';
    static _bodyProperty = 'body';
    static _contentUrlTemplate = "courses/{course_id}/pages/{content_id}";
    static _allContentUrlTemplate = "courses/{course_id}/pages/";

    async getRevisions() {
        return getPagedData(`${this.contentUrlPath}/revisions`);
    }

    async revertLastChangeSet(stepsBack = 1) {
        let revisions = await this.getRevisions();
        revisions.sort((a, b) => b['revision_id'] - a['revision_id']);
        if (revisions.length <= stepsBack) {
            console.warn(`Tried to revert ${this.name} but there isn't a previous revision`);
            return null;
        }
        let revision = revisions[stepsBack];
        await this.applyRevision(revision);
    }

    async resetContent(revisionId = 1) {
        let revisions = await this.getRevisions();
        let revision = revisions.find(r => r['revision_id'] === revisionId);
        if (!revision) throw new Error(`No revision found for ${revisionId}`);
        await this.applyRevision(revision);
    }

    async applyRevision(revision: Dict) {
        const revisionId = revision['revision_id'];
        let result = await fetchOneApiJson(`${this.contentUrlPath}/revisions/${revisionId}?revision_id=${revisionId}`);
        this._canvasData[this.bodyKey] = result['body'];
        this._canvasData[this.nameKey] = result['title'];
    }

    async updateContent(text = null, name = null) {
        let data: Dict = {};
        if (text) {
            this._canvasData[this.bodyKey] = text;
            data['wiki_page[body]'] = text;
        }
        if (name) {
            this._canvasData[this.nameKey] = name;
            data[this.nameKey] = name;
        }

        return this.saveData(data);
    }
}

export class Rubric extends BaseContentItem {
    static _nameProperty = 'title';
    static _contentUrlTemplate = "courses/{course_id}/rubrics/{content_id}";
    static _allContentUrlTemplate = "courses/{course_id}/rubrics";

    async associations(reload = false) {
        if ('associations' in this._canvasData && !reload) {
            return this._canvasData['associations'];
        }

        let data = await this.myClass.getDataById(this.canvasId, this.course, {params: {'include': ['associations']}});
        let associations = data['associations'].map((data: CanvasData) => new RubricAssociation(data, this.course));
        this._canvasData['associations'] = associations;
        return associations;
    }
}


export class RubricAssociation extends BaseContentItem {
    static _contentUrlTemplate = "courses/{course_id}/rubric_associations/{content_id}";
    static _allContentUrlTemplate = "courses/{course_id}/rubric_associations";

    get useForGrading() {
        return this._canvasData['use_for_grading'];
    }

    async setUseForGrading(value: boolean) {
        this._canvasData['use_for_grading'] = value;
        return await this.saveData({'rubric_association[use_for_grading]': value});
    }
}

export class Term extends BaseCanvasObject {

    get code() {
        return this._canvasData['name'];
    }

    static async getTerm (code: string, workflowState: string = 'any', config: CanvasApiCallConfig | undefined = undefined) {
        const terms = await this.getTerms(code, workflowState, config);
        if (!Array.isArray(terms) || terms.length <= 0) {
            return null;
        }
        return terms[0];
    }

    static async getTerms(code: string | undefined = undefined, workflowState = 'all', config: CanvasApiCallConfig | undefined = undefined) {
        config = config || {};
        config.queryParams = config.queryParams || {};
        let queryParams = config.queryParams;
        if (workflowState) queryParams['workflow_state'] = workflowState;
        if (code) queryParams['term_name'] = code;
        let rootAccount = await Account.getRootAccount();
        let url = `accounts/${rootAccount?.canvasId}/terms`;
        const data = await getApiPagedData(url, config);
        let terms: CanvasData[] = [];
        terms.concat(...data.map( (datum) => [...datum['enrollment_terms']]));

        if (!data || !data.hasOwnProperty('enrollment_terms')) {
            console.warn(`No enrollment terms found for ${code}`);
            return null;
        }

        if (!terms || terms.length === 0) {
            return null;
        }
        return terms.map(term => new Term(term));
    }
}


export class NotImplementedException extends Error {
}

export class ReplaceException extends Error {
}

export class CourseNotFoundException extends Error {
}

// export class Replacement {
//     constructor(find, replace, successTests) {
//         this.find = find;
//         this.replace = replace;
//         this.tests = successTests;
//     }
//
//     static inTest(toMatch) {
//         return function (text) {
//             return text.includes(toMatch);
//         };
//     }
//
//     static reSearch(expression, trueIfFalse = false) {
//         return function (text) {
//             const match = text.match(expression);
//             let out = false;
//             if (match !== null) {
//                 if (trueIfFalse) {
//                     out = false;
//                 } else {
//                     out = match;
//                 }
//             }
//             console.log(out);
//             return out;
//         };
//     }
//
//     static notInTest(toMatch) {
//         return function (text) {
//             return !text.includes(toMatch);
//         };
//     }
//
//     preCheck(text) {
//         return this._checkTests(text, 'pre');
//     }
//
//     postCheck(text) {
//         const callback = function (msg) {
//             throw new ReplaceException(msg);
//         };
//         return this._checkTests(text, 'post', callback);
//     }
//
//     _checkTests(text, phase = null, onFail = null) {
//         for (const [test, phase_, msg] of this.tests) {
//             if ((phase && phase === phase_) || !phase_ || !phase) {
//                 const result = test(text);
//                 const message = msg;
//                 if (!test(text)) {
//                     if (onFail) {
//                         onFail(message);
//                     }
//                     return [result, message];
//                 }
//             }
//         }
//         return true;
//     }
//
//     fix(sourceText) {
//         const [noNeedToRun] = this.preCheck(sourceText);
//
//         if (noNeedToRun) {
//             console.log(`all tests passed, no need to apply fix ${this.find}`);
//             return false;
//         }
//
//         const match = sourceText.match(this.find);
//         if (!match) {
//             return false;
//         }
//
//         if (typeof this.replace === 'function') {
//             this.replace(match, sourceText);
//         }
//
//         const outText = sourceText.replace(this.find, this.replace);
//         const [result, message] = this.postCheck(outText);
//         if (!result) {
//             throw new ReplaceException(message);
//         }
//
//         return outText;
//     }
// }
//
// export class FixSet {
//     static replacements = [];
//
//     static fix(sourceText) {
//         let outText = sourceText;
//         for (const replacement of FixSet.replacements) {
//             console.log(`Running ${replacement.find} --> ${replacement.replace}`);
//             const fixedText = replacement.fix(outText);
//             if (fixedText) {
//                 outText = fixedText;
//             }
//         }
//         return outText;
//     }
// }
//
// export class SyllabusFix extends FixSet {
// }
//
// // EvalFix
// export class EvalFix extends FixSet {
// }
//
// // IntroFixSet
// export class IntroFixSet extends FixSet {
// }
//
// export class ResourcesFixSet extends FixSet {
// }
//
// export class OverviewFixSet extends FixSet {
// }
//
// export class FrontPageFixSet extends FixSet {
// }
