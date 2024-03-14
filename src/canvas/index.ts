/* Very Initial refactor to JS using ChatGPT4
NOTE: Almost all of this code has had to be rewritten since then.
And starting to convert to ts
 */

import assert from 'assert';
import {Downloads, runtime} from 'webextension-polyfill'
import {
    Dict,
    ICanvasData, ICourseData,
    IModuleData,
    IModuleItemData,
    IPageData,
    ITermData,
    LookUpTable,
    ModuleItemType
} from "./canvasDataDefs";
import DownloadOptionsType = Downloads.DownloadOptionsType;

//const HOMETILE_WIDTH = 500;


interface ICanvasCallConfig extends Dict {
    fetchInit?: RequestInit,
    queryParams?: Dict
}

interface IUpdateCallback {
    (current: number, total: number): Promise<number>
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

async function downloadFile(options: DownloadOptionsType) {
    await runtime.sendMessage('downloadFile', options);
}

export function resizedImage(imgSrc: string, targetWidth: number, targetHeight: null | number = null): Promise<ImageData> {
    assert(document);
    const image = new Image();
    image.loading = 'eager';
    return new Promise((resolve, reject) => {
        let callback = () => {
            console.log("Loaded");
            console.log(image.src, image.height, image.width);
            const targetCanvas = document.createElement('canvas');
            const tCtx = targetCanvas.getContext('2d');
            if (!tCtx) {
                reject();
                return;
            }
            tCtx.imageSmoothingEnabled = true;
            tCtx.imageSmoothingQuality = "high";

            const aspectRatio = image.width / image.height;
            targetHeight = targetHeight ? targetHeight : targetWidth / aspectRatio;
            targetCanvas.width = targetWidth;
            targetCanvas.height = targetHeight;
            tCtx.drawImage(image, 0, 0, targetWidth, targetHeight);
            resolve(tCtx.getImageData(0, 0, targetWidth, targetHeight));
        }
        console.log("loading", imgSrc);
        image.src = imgSrc;
        if (image.complete) {
            callback();
        } else {
            image.addEventListener('load', callback);
            image.addEventListener('error', (e) => {
                console.log(e);
                console.log(image);
            })
        }

    });
}

export function formDataify(data: Dict) {
    console.log('form', data);
    let formData = new FormData();
    for (let key in data) {
        addToFormData(formData, key, data[key]);
    }

    if (document) {
        const el: HTMLInputElement | null = document.querySelector("input[name='authenticity_token']");
        const authenticityToken = el ? el.value : null;
        if (authenticityToken) formData.append('authenticity_token', authenticityToken);
    }
    for (let entry of formData.entries()) {
        console.log(entry[0], entry[1]);
    }
    return formData;
}

function addToFormData(formData: FormData, key: string, value: any | Dict | []) {
    if (Array.isArray(value)) {
        for (let item of value) {
            addToFormData(formData, `${key}[]`, item);
        }
    } else if (typeof value === 'object') {
        for (let itemKey in value) {
            const itemValue = value[itemKey];
            addToFormData(formData, key.length > 0 ? `${key}[${itemKey}]` : itemKey, itemValue);
        }
    } else {
        formData.append(key, value.toString());
    }
}

export function getModuleWeekNumber(module: Dict) {
    const regex = /(week|module) (\d+)/i;
    let match = module.name.match(regex);
    let weekNumber = !match ? null : Number(match[1]);
    if (!weekNumber) {
        for (let moduleItem of module.items) {
            if (!moduleItem.hasOwnProperty('title')) {
                continue;
            }
            let match = moduleItem.title.match(regex);
            if (match) {
                weekNumber = match[2];
            }
        }
    }
    return weekNumber;
}

/**
 * Takes in a module item and returns an object specifying its type and content id
 * @param item
 */
export async function getItemTypeAndId(
    item: IModuleItemData
): Promise<{ type: ModuleItemType, id: number }> {
    let id;
    let type;
    assert(type_lut.hasOwnProperty(item.type), "Unexpected type " + item.type);

    type = type_lut[item.type];
    if (type === "wiki_page") {
        assert(item.url); //wiki_page items always have a url param
        const pageData = await fetchJson(item.url) as IPageData;
        id = pageData.page_id;
    } else {
        id = item.content_id;
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

async function getApiPagedData(url: string, config: ICanvasCallConfig | null = null): Promise<ICanvasData[]> {
    return await getPagedData(`/api/v1/${url}`, config)
}


/**
 * @param url The entire path of the url
 * @param config a configuration object of type ICanvasCallConfig
 * @returns {Promise<Dict[]>}
 */
async function getPagedData(
    url: string, config: ICanvasCallConfig | null = null): Promise<ICanvasData[]> {

    if (config?.queryParams) {
        url += '?' + searchParamsFromObject(config.queryParams);
    }

    if (url.includes('undefined')) {
        console.log(url);
    }
    /* Returns a list of data from a GET request, going through multiple pages of data requests as necessary */
    let response = await fetch(url, config?.fetchInit);
    let data = await response.json();
    if (typeof data === 'object' && !Array.isArray(data)) {
        let values = Array.from(Object.values(data));
        if (values) {
            data = values.find((a) => Array.isArray(a));
        }
    }
    assert(Array.isArray(data));

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
            response = await fetch(next_page_link, config?.fetchInit);
            let responseData = await response.json();
            if (typeof responseData === 'object' && !Array.isArray(data)) {
                let values = Array.from(Object.values(data));
                if (values) {
                    responseData = values?.find((a) => Array.isArray(a));
                }
            }

            data = data.concat(responseData);
        } else {
            next_page_link = "";
        }
    }

    return data;
}

async function fetchJson(
    url: string, config: ICanvasCallConfig | null = null): Promise<ICanvasData | ICanvasData[]> {
    if (config?.queryParams) {
        url += '?' + new URLSearchParams(config.queryParams);
    }
    config ??= {};
    if (!document) {
        config.fetchInit ??= {};
        config.fetchInit.headers = [];
    }

    const response = await fetch(url, config.fetchInit);
    return await response.json();
}

/**
 * Fetches a json object from /api/v1/${url}
 * @param url
 * @param config query and fetch params
 */
async function fetchApiJson(url: string, config: ICanvasCallConfig | null = null) {
    url = `/api/v1/${url}`;
    return await fetchJson(url, config);
}

async function fetchOneApiJson(url: string, config: ICanvasCallConfig | null = null) {
    let result = await fetchApiJson(url, config);
    if (Array.isArray(result)) return result[0];
    return <ICanvasData>result;
}

/**
 *  A base class for objects that interact with the Canvas API
 */

export class BaseCanvasObject {
    static idProperty = 'id'; // The field name of the id of the canvas object type
    static nameProperty: string | null = null; // The field name of the primary name of the canvas object type
    static contentUrlTemplate: string | null = null; // A templated url to get a single item
    static allContentUrlTemplate: string | null = null; // A templated url to get all items
    protected canvasData: ICanvasData;
    protected accountId: null | number = null;

    constructor(data: ICanvasData) {
        this.canvasData = data || {}; // A dict holding the decoded json representation of the object in Canvas
    }

    getClass(): typeof BaseContentItem {
        return this.constructor as typeof BaseContentItem;
    }

    toString() {
        return JSON.stringify(this.canvasData);
    }

    getItem(item: string) {
        return this.canvasData[item] || null;
    }

    get myClass() {
        return (<typeof BaseContentItem>this.constructor)
    }

    get nameKey() {
        assert(this.myClass.nameProperty);
        return this.myClass.nameProperty;
    }


    get contentUrlPath(): null | string {
        const constructor = <typeof BaseCanvasObject>this.constructor;

        assert(typeof this.accountId === 'number');
        assert(typeof constructor.contentUrlTemplate === 'string');
        return constructor.contentUrlTemplate
            .replace('{content_id}', this.id.toString())
            .replace('{account_id}', this.accountId.toString());
    }

    get htmlContentUrl() {
        return `/${this.contentUrlPath}`;
    }

    get rawData() {
        const out: ICanvasData = {
            id: NaN,
        };
        for (let key in this.canvasData) {
            out[key] = this.canvasData[key];
        }
        return out;
    }

    get data() {
        return this.canvasData;
    }

    static async getDataById(contentId: number, course: Course | null = null, config: ICanvasCallConfig | null = null): Promise<ICanvasData> {
        let url = this.getUrlPathFromIds(contentId, course ? course.id : null);
        const response = await fetchApiJson(url, config);
        assert(!Array.isArray(response));
        return response;
    }

    static async getById(contentId: number, course: Course) {
        return new this(await this.getDataById(contentId, course))
    }

    static getUrlPathFromIds(
        contentId: number,
        courseId: number | null) {
        assert(typeof this.contentUrlTemplate === 'string');
        let url = this.contentUrlTemplate
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
        assert(typeof this.allContentUrlTemplate === 'string');
        let replaced = this.allContentUrlTemplate;

        if (courseId) replaced = replaced.replace('{course_id}', courseId.toString());
        if (accountId) replaced = replaced.replace('{account_id}', accountId.toString());
        return replaced;
    }

    static async getAll(config: ICanvasCallConfig | null = null) {
        let url = this.getAllUrl();
        let data = await getApiPagedData(url, config);
        return data.map(item => new this(item));
    }


    get id(): number {
        const id = this.canvasData[(<typeof BaseCanvasObject>this.constructor).idProperty];
        return parseInt(id);
    }

    get name() {
        let nameProperty = this.getClass().nameProperty;
        assert(nameProperty)
        return this.getItem(nameProperty);
    }

    async saveData(data: Dict) {
        assert(this.contentUrlPath);
        return await fetchApiJson(this.contentUrlPath, {
            fetchInit: {
                method: 'PUT',
                body: formDataify(data)
            }
        });

    }

    async delete() {
        assert(this.contentUrlPath);
        return await fetchApiJson(this.contentUrlPath, {fetchInit: {method: 'DELETE'}})
    }

}

export class Account extends BaseCanvasObject {
    static nameProperty = 'name'; // The field name of the primary name of the canvas object type
    static contentUrlTemplate = 'accounts/{content_id}'; // A templated url to get a single item
    static allContentUrlTemplate = 'accounts'; // A templated url to get all items
    private static account: Account;

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

    static async getById(accountId: number, config: ICanvasCallConfig | undefined = undefined) {
        const data = await this.getDataById(accountId, null, config)
        console.assert()
        return new Account(data);
    }

    static async getRootAccount(resetCache = false) {
        let accounts: Account[] = <Account[]>await this.getAll();
        if (!resetCache && this.hasOwnProperty('account') && this.account) {
            return this.account;
        }
        let root = accounts.find((a) => a.rootAccountId === null);
        assert(root);
        this.account = root;
        return root;
    }


    get rootAccountId() {
        return this.canvasData['root_account_id']
    }

}

export class Course extends BaseCanvasObject {
    static CODE_REGEX = /^(.+[^_])?_?(\w{4}\d{3})/i; // Adapted to JavaScript's regex syntax.
    private _modules: IModuleData[] | undefined = undefined;
    private modulesByWeekNumber: LookUpTable<IModuleData> | undefined = undefined;
    private static contentClasses: (typeof BaseContentItem)[] = [];

    static async getFromUrl(url: string | null = null) {
        if (url === null) {
            url = document.documentURI;
        }
        let match = /courses\/(\d+)/.exec(url);
        if (match) {
            console.log(match);
            const id = this.getIdFromUrl(url);
            if (!id) return null;
            return await this.getById(id);
        }
        return null;
    }

    static getIdFromUrl(url: string) {
        let match = /courses\/(\d+)/.exec(url);
        if (match) {
            return parseInt(match[1]);
        }
        return null;

    }

    /**
     * Checks if a string looks like a course code
     * @param code
     */
    static stringIsCourseCode(code: string) {
        return this.CODE_REGEX.exec(code);
    }

    /**
     * Returns this library's class corresponding to the current url, drawing from Course.contentClasses.
     * Classes can be included in Course.contentClasses using the decorator @contentClass
     *
     * @param url
     */
    static getContentClassFromUrl(url: string | null = null) {
        if (!url) url = document.documentURI;

        for (let class_ of this.contentClasses) {
            console.log(class_, class_.contentUrlPart);
            if (class_.contentUrlPart && url.includes(class_.contentUrlPart)) return class_;
        }
        return null;
    }


    static async getById(courseId: number, config: ICanvasCallConfig | undefined = undefined) {
        const data = await fetchOneApiJson(`courses/${courseId}`, config);
        return new Course(data);
    }

    private static async getCoursesByString(code: string, term: Term | null = null, config: ICanvasCallConfig = {}) {
        let courseDataList: ICanvasData[] | null = null;
        const accountIdsByName = await Course.getAccountIdsByName();
        for (let accountKey in accountIdsByName) {
            let accountId = accountIdsByName[accountKey];
            let url = `accounts/${accountId}/courses`;
            config.queryParams = config.queryParams || {};
            config.queryParams['search_term'] = code;
            if (term !== null) {
                config.queryParams['enrollment_term_id'] = term.id;
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

    static async getAllByCode(code: string, term: Term | null = null, config: ICanvasCallConfig | undefined = undefined) {
        return this.getCoursesByString(code, term, config);
    }

    static async getByCode(code: string, term: Term | null = null, config: ICanvasCallConfig | undefined = undefined) {
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
            'root': course.canvasData['root_account_id'],
            'current': course.canvasData['accountId']
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
        return `courses/${this.id}`;
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

    get fullCourseCode(): null | string {
        return this.canvasData.course_code
    }

    get codeMatch() {
        return Course.CODE_REGEX.exec(this.canvasData.course_code);
    }

    get baseCode() {
        let match = this.codeMatch;
        return match ? match[2] : '';
    }


    get termId(): number | null {
        return (this.canvasData as ICourseData).enrollment_term_id;
    }


    async getTerm(): Promise<Term | null> {
        if (this.termId) return Term.getTermById(this.termId)
        else return null;
    }

    get codePrefix() {
        let match = this.codeMatch;
        return match ? match[1] : '';
    }

    get isBlueprint() {
        return 'blueprint' in this.canvasData && this.canvasData['blueprint'];
    }

    get isPublished() {
        return this.canvasData['workflow_state'] === 'available';
    }

    async getModules(): Promise<IModuleData[]> {
        if (this._modules) {
            return this._modules;
        }
        let modules = <IModuleData[]>await getApiPagedData(`${this.contentUrlPath}/modules?include[]=items&include[]=content_details`);
        this._modules = modules;
        return modules;
    }

    async getContentItemFromUrl(url: string | null = null) {
        let ContentClass = Course.getContentClassFromUrl(url);
        if (!ContentClass) return null;
        return ContentClass.getFromUrl(url);
    }

    async getModulesByWeekNumber() {
        if (this.modulesByWeekNumber) return this.modulesByWeekNumber;
        let modules = await this.getModules();
        let modulesByWeekNumber: LookUpTable<IModuleData> = {};
        for (let module of modules) {
            let weekNumber = getModuleWeekNumber(module);
            if (weekNumber) {
                modulesByWeekNumber[weekNumber] = module;
            }
        }
        this.modulesByWeekNumber = modulesByWeekNumber;
        return modulesByWeekNumber;
    }

    /**
     * Returns a list of links to items in a given module
     *
     * @param moduleOrWeekNumber
     * @param target An object specifying an item or items to look for
     * type - specifies the type,
     * search - a string to search for in titles. optional.
     * index - return the indexth one of these in the week (minus the intro in week 1, which should be index 0)
     * if none is specified, return all matches
     */
    async getModuleItemLinks(moduleOrWeekNumber: number | Dict, target: IModuleItemData | {
        type: ModuleItemType,
        search?: string | null,
        index?: number | null,
    }): Promise<string[]> {
        assert(target.hasOwnProperty('type'));
        let targetType: ModuleItemType = target.type;
        let url: string | null = null;
        let contentSearchString = target.hasOwnProperty('search') ? target.search : null;
        let targetIndex = isNaN(target.index) ? null : target.index;
        let targetModuleWeekNumber;
        let targetModule;
        if (typeof moduleOrWeekNumber === 'number') {
            let modules = await this.getModulesByWeekNumber();
            assert(modules.hasOwnProperty(moduleOrWeekNumber));
            targetModuleWeekNumber = moduleOrWeekNumber;
            targetModule = modules[targetModuleWeekNumber];
        } else {
            targetModule = moduleOrWeekNumber;
            targetModuleWeekNumber = getModuleWeekNumber(targetModule);
        }

        const urls = [];
        if (targetModule && typeof targetType !== 'undefined') {
            //If it's a page, just search for the parameter string
            if (targetType === 'Page' && contentSearchString) {
                let pages = await this.getPages({
                    queryParams: {search_term: contentSearchString}
                })
                pages.forEach((page) => urls.push(page.htmlContentUrl));


                //If it's anything else, get only those items in the module and set url to the targetIndexth one.
            } else if (targetType) {
                //bump index for week 1 to account for intro discussion / checking for rubric would require pulling too much data
                //and too much performance overhead
                if (targetIndex && targetType === 'Discussion' && targetModuleWeekNumber === 1) targetIndex++;
                const matchingTypeItems = targetModule.items.filter((item: IModuleItemData) => item.type === targetType);
                if (targetIndex && matchingTypeItems.length >= targetIndex) {
                    //We refer to and number the assignments indexed at 1, but the array is indexed at 0
                    const targetItem = matchingTypeItems[targetIndex - 1];
                    urls.push(targetItem.html_url);
                } else if (!targetIndex) {
                    for (let item of matchingTypeItems) urls.push(item.html_url)
                }
            }
        }
        return urls;
    }

    async getSyllabus(): Promise<string> {
        if (!('syllabus_body' in this.canvasData)) {
            const data = await Course.getById(this.id, {'include[]': 'syllabus_body'});
            this.canvasData['syllabus_body'] = data.canvasData['syllabus_body'];
        }
        return this.canvasData['syllabus_body'];
    }

    /**
     * gets all assignments in a course
     * @returns {Promise<Assignment[]>}
     * @param config
     */
    async getAssignments(config: ICanvasCallConfig = {
        queryParams: {'include': ['due_at']}
    }): Promise<Assignment[]> {
        return await Assignment.getAllInCourse(this, config) as Assignment[];
    }

    /**
     *Gets all quizzes in a course
     * @param queryParams a json object representing the query param string. Defaults to including due dates     *
     * @returns {Promise<Quiz[]>}
     */
    async getQuizzes(queryParams = {'include': ['due_at']}): Promise<Quiz[]> {
        return <Quiz[]>await Quiz.getAllInCourse(this, {queryParams});
    }

    async getAssociatedCourses() {
        if (!this.isBlueprint) return null;

        const url = `courses/${this.id}/blueprint_templates/default/associated_courses`;
        const courses = await getApiPagedData(url, {queryParams: {per_page: 50}});
        return courses.map(courseData => new Course(courseData));
    }

    async getSubsections() {
        const url = `/api/v1/courses/${this.id}/sections`;
        return await fetchApiJson(url);

    }

    async getTabs() {
        return await fetchApiJson(`courses/${this.id}/tabs`);
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
        return this.canvasData.tabs.find((tab: Dict) => tab.label === label) || null;
    }

    async setNavigationTabHidden(label: string, value: boolean) {
        const tab = this.getTab(label);
        if (!tab) return null;

        return await fetchApiJson(`courses/${this.id}/tabs/${tab.id}`, {
            queryParams: {'hidden': value}
        });
    }

    async changeSyllabus(newHtml: string) {
        this.canvasData['syllabus_body'] = newHtml;
        return await fetchApiJson(`courses/${this.id}`, {
            fetchInit: {
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
        let items: IModuleItemData[] = [];
        items = items.concat(...modules.map((a) => (<IModuleItemData[]>[]).concat(...a.items)));
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
            await fetchApiJson(url, {
                fetchInit: {
                    method: 'PUT',
                    body: formDataify(body)
                }
            });

        });
        await Promise.all(promises);

    }

    async setAsBlueprint() {
        const url = `courses/${this.id}`;
        const payload = {
            'course[blueprint]': true,
            'course[use_blueprint_restrictions_by_object_type]': 0,
            'course[blueprint_restrictions][content]': 1,
            'course[blueprint_restrictions][points]': 1,
            'course[blueprint_restrictions][due_dates]': 1,
            'course[blueprint_restrictions][availability_dates]': 1,
        };

        this.canvasData = await fetchOneApiJson(url, {
            fetchInit: {
                method: 'PUT',
                body: JSON.stringify(payload)
            }
        });
        this.resetCache();
    }

    async unsetAsBlueprint() {
        const url = `courses/${this.id}`;
        const payload = {
            'course[blueprint]': false,
        };
        this.canvasData = await fetchOneApiJson(url, {
            fetchInit: {
                method: 'PUT',
                body: JSON.stringify(payload)
            }
        });
        this.resetCache();
    }

    resetCache() {
        //delete this.subsections;
        //delete this.associatedCourses;
    }

    async publish() {
        const url = `courses/${this.id}`;
        const courseData = await fetchOneApiJson(url, {
            fetchInit: {
                method: 'PUT',
                body: JSON.stringify({'offer': true})
            }
        });
        console.log(courseData);
        this.canvasData = courseData;
        this.resetCache();
    }

    async unpublish() {
        const url = `courses/${this.id}`;
        await fetchApiJson(url, {
            fetchInit: {
                method: 'PUT',
                body: JSON.stringify({'course[event]': 'claim'})
            }
        });
        this.canvasData = (await Course.getById(this.id)).rawData;
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
        // await fetchApiJson(`courses/${this.id}`, {}, {
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

        const url = `/courses/${this.id}/reset_content`;
        const data = await fetchOneApiJson(url, {fetchInit: {method: 'POST'}});
        this.canvasData['id'] = data.id;

        return false;
    }

    /**
     * NOT IMPLEMENTED
     * @param prompt Either a boolean or an async function that takes in a source and destination course and returns a boolean
     * @param updateCallback
     */
    async importDevCourse(
        prompt: ((source: Course, destination: Course) => Promise<boolean>) | false = false,
        updateCallback: IUpdateCallback | undefined
    ) {
        const devCourse = await this.getParentCourse();

        if (!devCourse) {
            throw new CourseNotFoundException(`DEV not found for ${this.name}.`)
        }

        if (prompt) {
            const canContinue = await prompt(devCourse, this);
            if (!canContinue) return;
        }

        await this.importCourse(devCourse, updateCallback);
    }

    async importCourse(course: Course, updateCallback: IUpdateCallback | undefined) {
        throw new NotImplementedException();
    }

    async getParentCourse(return_dev_search = false) {
        let migrations = await getApiPagedData(`courses/${this.id}/content_migrations`);

        if (migrations.length < 1) {
            console.log('no migrations found');
            if (return_dev_search) {
                return Course.getByCode('DEV_' + this.baseCode);
            } else return null;
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

    async generateHomeTiles() {
        const modules = await this.getModules();
        const promises: Promise<void>[] = [];
        for (let module of modules) {
            promises.push(this.generateHomeTile(module));
        }
        await Promise.all(promises);
    }

    async generateHomeTile(module: IModuleData) {

        let overview = module.items.find(item =>
            item.type === "Page" &&
            item.title.toLowerCase().includes('overview')
        );
        if (!overview?.url) return;

        assert(overview.url);
        const url = overview.url.replace(/https:\/\/.*api\/v1/, '/api/v1')
        const pageData = await fetchJson(url) as ICanvasData;
        const overviewPage = new Page(pageData, this);
        const pageBody = document.createElement('html');
        pageBody.innerHTML = overviewPage.body;
        let bannerImg: HTMLImageElement | null = pageBody.querySelector('.cbt-banner-image img')

        assert(bannerImg, "Page has no banner");
        let download = await downloadFile({
            method: 'GET',
            url: bannerImg.src,
        });
    }

    async uploadFile(file: File, path: string) {
        let url = `/api/v1/courses/${this.id}/files`;
        file.name;
        const initialParams = {
            name: file.name,
            no_redirect: true,
            parent_folder: path,
            on_duplicate: 'overwrite'
        }
        let response = await fetch(url, {
            body: formDataify(initialParams),
            method: 'POST'
        });
        assert(response.ok, await response.json());
        const data = await response.json();

        const uploadParams = data.upload_params;
        const uploadFormData = formDataify(uploadParams);
        uploadFormData.append('file', file);
        response = await fetch(uploadParams.url, {
            body: uploadFormData,
        })
        assert(response.ok, await response.text());
    }

    static registerContentClass(contentClass: typeof BaseContentItem) {
        this.contentClasses.push(contentClass);
    }

    public getPages(config: ICanvasCallConfig | null = null) {
        return Page.getAllInCourse(this, config) as Promise<Page[]>;
    }
}


export class BaseContentItem extends BaseCanvasObject {
    static bodyProperty: string;

    _course: Course;

    constructor(canvasData: ICanvasData, course: Course) {
        super(canvasData);
        this._course = course;
    }

    static get contentUrlPart() {
        assert(this.allContentUrlTemplate, "Not a content url template");
        const urlTermMatch = /\/([\w_]+)$/.exec(this.allContentUrlTemplate);
        console.log(this.allContentUrlTemplate, urlTermMatch);
        if (!urlTermMatch) return null;
        const urlTerm = urlTermMatch[1];
        return urlTerm;

    }

    static get contentUrlRegex(): RegExp {
        assert(this.contentUrlTemplate, `Class ${this.toString()} does not have a content url property`);
        let contentString = this.contentUrlTemplate.replace(/\{[^}]+\}/, '(\d+)');
        return new RegExp(contentString);
    }

    static getIdFromUrl(url: string) {
        //let _contentUrlTemplate = "courses/{course_id}/discussion_topics/{content_id}";
        assert(this.contentUrlTemplate);
        // use the content url template as a basis to generate
        let match = /courses\/(\d+)/.exec(url);
        if (match) {
            return parseInt(match[1]);
        }
        return null;

    }


    static async getAllInCourse(course: Course, config: ICanvasCallConfig | null = null) {
        let url = this.getAllUrl(course.id);
        let data = await getApiPagedData(url, config);
        return data.map(item => new this(item, course));
    }

    static clearAddedContentTags(text: string) {
        let out = text.replace(/<\/?link[^>]*>/g, '');
        out = out.replace(/<\/?script[^>]*>/g, '');
        return out;
    }

    static async getFromUrl(url: string | null = null, course: null | Course = null) {
        if (url === null) {
            url = document.documentURI;
        }

        url = url.replace(/\.com/, '.com/api/v1')
        let data = await fetchJson(url);
        if (!course) {
            course = await Course.getFromUrl();
            if (!course) return null;
        }
        //If this is a collection of data, we can't process it as a Canvas Object
        if (Array.isArray(data)) return null;
        assert(!Array.isArray(data));
        if (data) {
            return new this(data, course);
        }
        return null;
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
        let url = (<typeof BaseContentItem>this.constructor).contentUrlTemplate;
        assert(url);
        url = url.replace('{course_id}', this.course.id.toString());
        url = url.replace('{content_id}', this.id.toString());

        return url;
    }

    get course() {
        return this._course;
    }

    async updateContent(text = null, name = null) {
        const data: Dict = {};
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

    async getMeInAnotherCourse(targetCourse: Course) {
        let ContentClass = this.constructor as typeof BaseContentItem
        let targets = await ContentClass.getAllInCourse(targetCourse, {queryParams: {search_term: this.name}})
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

@contentClass
export class Discussion extends BaseContentItem {
    static nameProperty = 'title';
    static bodyProperty = 'message';
    static contentUrlTemplate = "courses/{course_id}/discussion_topics/{content_id}";
    static allContentUrlTemplate = "courses/{course_id}/discussion_topics"

}

@contentClass
export class Assignment extends BaseContentItem {
    static nameProperty = 'name';
    static bodyProperty = 'description';
    static contentUrlTemplate = "courses/{course_id}/assignments/{content_id}";
    static allContentUrlTemplate = "courses/{course_id}/assignments";

    async setDueAt(dueAt: Date) {
        let data = await this.saveData({'assignment[due_at]': dueAt.toISOString()});
        this.canvasData['due_at'] = dueAt.toISOString();
        return data;

    }
}

@contentClass
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

@contentClass
export class Page extends BaseContentItem {
    static idProperty = 'page_id';
    static nameProperty = 'title';
    static bodyProperty = 'body';
    static contentUrlTemplate = "courses/{course_id}/pages/{content_id}";
    static allContentUrlTemplate = "courses/{course_id}/pages";

    static async getFromUrl(url: string | null = null, course: null | Course = null) {
        if (url === null) {
            url = document.documentURI;
        }

        url = url.replace(/\.com/, '.com/api/v1')
        let data = await fetchJson(url);
        if (!course) {
            course = await Course.getFromUrl();
            if (!course) return null;
        }
        //If this is a collection of data, we can't process it as a Canvas Object
        if (Array.isArray(data)) return null;
        assert(!Array.isArray(data));
        if (data) {
            return new this(data, course);
        }
        return null;
    }

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
        this.canvasData[this.bodyKey] = result['body'];
        this.canvasData[this.nameKey] = result['title'];
    }

    get body(): string {
        return this.canvasData[this.bodyKey];
    }

    async updateContent(text = null, name = null) {
        let data: Dict = {};
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

export class Rubric extends BaseContentItem {
    static nameProperty = 'title';
    static contentUrlTemplate = "courses/{course_id}/rubrics/{content_id}";
    static allContentUrlTemplate = "courses/{course_id}/rubrics";

    async associations(reload = false) {
        if ('associations' in this.canvasData && !reload) {
            return this.canvasData['associations'];
        }

        let data = await this.myClass.getDataById(this.id, this.course, {params: {'include': ['associations']}});
        let associations = data['associations'].map((data: ICanvasData) => new RubricAssociation(data, this.course));
        this.canvasData['associations'] = associations;
        return associations;
    }
}


export class RubricAssociation extends BaseContentItem {
    static contentUrlTemplate = "courses/{course_id}/rubric_associations/{content_id}";
    static allContentUrlTemplate = "courses/{course_id}/rubric_associations";

    get useForGrading() {
        return this.canvasData['use_for_grading'];
    }

    async setUseForGrading(value: boolean) {
        this.canvasData['use_for_grading'] = value;
        return await this.saveData({'rubric_association[use_for_grading]': value});
    }
}

export class Term extends BaseCanvasObject {

    get code() {
        return this.canvasData['name'];
    }

    static async getTerm(code: string, workflowState: 'all' | 'active' | 'deleted' = 'all', config: ICanvasCallConfig | undefined = undefined) {
        const terms = await this.searchTerms(code, workflowState, config);
        if (!Array.isArray(terms) || terms.length <= 0) {
            return null;
        }
        return terms[0];
    }

    static async getTermById(termId: number, config: ICanvasCallConfig | null = null) {
        let account = await Account.getRootAccount();
        let url = `accounts/${account.id}/terms/${termId}`;
        let termData = await fetchApiJson(url) as ICanvasData | null;
        if (termData) return new Term(termData);
        return null;
    }

    static async getAllActiveTerms(config: ICanvasCallConfig | null = null) {
        return await this.searchTerms(null, 'active', config);
    }

    static async searchTerms(
        code: string | null = null,
        workflowState: 'all' | 'active' | 'deleted' = 'all',
        config: ICanvasCallConfig | null = null) {

        config = config || {};
        config.queryParams = config.queryParams || {};

        let queryParams = config.queryParams;
        if (workflowState) queryParams['workflow_state'] = workflowState;
        if (code) queryParams['term_name'] = code;
        let rootAccount = await Account.getRootAccount();
        assert(rootAccount);
        let url = `accounts/${rootAccount.id}/terms`;
        const data = await getApiPagedData(url, config);
        let terms: ICanvasData[] = [];
        for (let datum of data) {
            if (datum.hasOwnProperty('enrollment_terms')) {
                for (let termData of datum['enrollment_terms']) {
                    terms.push(termData);
                }
            } else {
                terms.push(datum);
            }
        }
        console.log(terms);

        if (!terms || terms.length === 0) {
            return null;
        }
        return terms.map(term => new Term(term));
    }

    get startDate(): Date {
        return new Date(this.data.start_at);
    }

    get endDate(): Date {
        return new Date(this.data.end_at);
    }
}


export class NotImplementedException extends Error {
}

export class CourseNotFoundException extends Error {
}


function contentClass(originalClass: typeof BaseContentItem, _context: ClassDecoratorContext) {
    //originalClass.contentUrlPart =
    Course.registerContentClass(originalClass);
}