/* Very Initial refactor to JS using ChatGPT4
NOTE: Almost all of this code has had to be rewritten since then.
And starting to convert to ts
 */
/* THis has since been almost entirely rewritten. It did not do a great job at first pass.
 It kept inventing code that should work but didn't */

import assert from 'assert';

import {
    CanvasData,
    IAssignmentData,
    IAssignmentGroup,
    ICourseData,
    ICourseSettings,
    IDiscussionData,
    ILatePolicyData,
    IModuleData,
    IModuleItemData, IPageData,
    ITabData,
    ITermData,
    IUpdateCallback,
    IUserData,
    ModuleItemType
} from "./canvasDataDefs";
import {
    fetchApiJson,
    fetchJson,
    fetchOneKnownApiJson,
    fetchOneUnknownApiJson,
    formDataify,
    getApiPagedData,
    getItemTypeAndId,
    getModuleWeekNumber,
    getPagedData,
    ICanvasCallConfig
} from "./canvasUtils";
import {getCurioPageFrontPageProfile, getPotentialFacultyProfiles, IProfile} from "./profile";
import {uploadFile} from "./files";
import {getCurrentStartDate} from "./fixes/changeStartDate";
import {BaseCanvasObject} from "./baseCanvasObject";
import {Temporal} from "temporal-polyfill";
import {getResizedBlob} from "./image";

const HOMETILE_WIDTH = 500;

//const HOMETILE_WIDTH = 500;
export interface ISyllabusHaver {
    id: number,
    getSyllabus: (config?:ICanvasCallConfig) => Promise<string>,
    changeSyllabus: (newHtml:string, config?:ICanvasCallConfig) => any
}

export interface ICourseSettingsHaver {
    id: number,
    getSettings: (config?:ICanvasCallConfig) => Promise<ICourseSettings>
}

export interface ILatePolicyHaver {
    id: number,
    getLatePolicy: (config?:ICanvasCallConfig) => Promise<ILatePolicyData>
}

export interface IAssignmentsHaver {
    id: number,
    getAssignments(config?:ICanvasCallConfig):Promise<Assignment[]>
}

export interface IPagesHaver {
    id: number,
    getPages(config?:ICanvasCallConfig):Promise<Page[]>
}

export class Course extends BaseCanvasObject<ICourseData> implements
    ISyllabusHaver,
    ICourseSettingsHaver,
    ILatePolicyHaver,
    IAssignmentsHaver,
    IPagesHaver
{
    static CODE_REGEX = /^(.+[^_])?_?(\w{4}\d{3})/i; // Adapted to JavaScript's regex syntax.
    private _modules: IModuleData[] | undefined = undefined;
    private modulesByWeekNumber: Record<string | number, IModuleData> | undefined = undefined;
    private static contentClasses: (typeof BaseContentItem)[] = [];

    static async getFromUrl(url: string | null = null) {
        if (url === null) {
            url = document.documentURI;
        }
        let match = /courses\/(\d+)/.exec(url);
        if (match) {

            const id = this.getIdFromUrl(url);
            if (!id) return null;
            return await this.getCourseById(id);
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
            if (class_.contentUrlPart && url.includes(class_.contentUrlPart)) return class_;
        }
        return null;
    }


    static async getCourseById(courseId: number, config: ICanvasCallConfig | undefined = undefined) {
        const data = await fetchOneKnownApiJson(`courses/${courseId}`, config) as ICourseData;
        return new Course(data);
    }

    private static async getCoursesByString(code: string, term: Term | null = null, config: ICanvasCallConfig = {}) {
        let courseDataList: ICourseData[] | null = null;
        const accountIdsByName = await Course.getAccountIdsByName();
        for (let accountKey in accountIdsByName) {
            if (!accountKey) continue;
            let accountId = accountIdsByName[accountKey];
            let url = `accounts/${accountId}/courses`;
            config.queryParams = config.queryParams || {};
            config.queryParams['search_term'] = code;
            if (term !== null) {
                config.queryParams['enrollment_term_id'] = term.id;
            }
            courseDataList = await getApiPagedData<ICourseData>(url, config);
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

    static async getAccountIdsByName(): Promise<Record<string, any>> {
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


    static async courseEvent(courses: Course[], event: string, accountId: number) {
        const url = `accounts/${accountId}/courses`;
        const data = {
            'event': event,
            'course_ids[]': courses.map(course => course.id)
        };
        return await fetchApiJson<CanvasData>(url, {
            fetchInit: {
                method: 'PUT',
                body: JSON.stringify(data)

            }
        });

    }

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


    get termIds(): number | number[] | null {

        return (this.canvasData as ICourseData).enrollment_term_id;
    }

    get termId(): number | null {
        const id = (this.canvasData as ICourseData).enrollment_term_id;
        assert(typeof id === "number")
        return id;
    }

    async getTerm(): Promise<Term | null> {
        assert(typeof this.termId === 'number')

        if (this.termId) return Term.getTermById(this.termId)
        else return null;
    }

    get fileUploadUrl() {

        return `/api/v1/courses/${this.id}/files`;
    }

    get codePrefix() {
        let match = this.codeMatch;
        return match ? match[1] : '';
    }

    get isBlueprint() {
        return 'blueprint' in this.canvasData && this.canvasData['blueprint'];
    }

    get workflowState() {
        return this.canvasData.workflow_state
    }


    get start() {
        return new Date(this.getItem<string>('start_at'));
    }

    get end() {
        return new Date(this.getItem<string>('end_at'));
    }

    get isDev() {
        if (this.name.match(/^DEV/)) return true;
    }

    async getModules(): Promise<IModuleData[]> {
        if (this._modules) {
            return this._modules;
        }
        let modules = <IModuleData[]>await getApiPagedData(`${this.contentUrlPath}/modules?include[]=items&include[]=content_details`);
        this._modules = modules;
        return modules;
    }

    async getStartDateFromModules() {
        return getCurrentStartDate(await this.getModules());
    }

    async getInstructors(): Promise<IUserData[] | null> {
        return await fetchApiJson(`courses/${this.id}/users?enrollment_type=teacher`) as IUserData[];
    }
    async getLatePolicy(this: { id: number }, config?:ICanvasCallConfig) {
        const latePolicyResult = await fetchJson(`/api/v1/courses/${this.id}/late_policy`, config);
        assert('late_policy' in latePolicyResult);
        return latePolicyResult.late_policy as ILatePolicyData;

    }


    async getTerms(): Promise<Term[] | null> {
        if (this.termIds) {
            if (Array.isArray(this.termIds)) {
                let terms = await Promise.all(this.termIds.map(async (termId) => {
                    return Term.getTermById(termId)
                }))
                terms = terms.filter((term) => {
                    return term
                })
                return terms as Term[]
            }
        }
        return null;
    }

    async getContentItemFromUrl(url: string | null = null) {
        let ContentClass = Course.getContentClassFromUrl(url);
        if (!ContentClass) return null;
        return ContentClass.getFromUrl(url);
    }


    async getModulesByWeekNumber() {
        if (this.modulesByWeekNumber) return this.modulesByWeekNumber;
        let modules = await this.getModules();
        let modulesByWeekNumber: Record<string | number, IModuleData> = {};
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
    async getModuleItemLinks(moduleOrWeekNumber: number | Record<string, any>, target: IModuleItemData | {
        type: ModuleItemType,
        search?: string | null,
        index?: number | null,
    }): Promise<string[]> {
        assert(target.hasOwnProperty('type'));
        let targetType: ModuleItemType = target.type;
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

    async getSyllabus(config:ICanvasCallConfig = {queryParams:{}}): Promise<string> {
        if (!this.canvasData.syllabus_body) {

            config.queryParams = {...config.queryParams, include: 'syllabus_body'};
            const data = await Course.getCourseById(this.id, config);
            assert(data.canvasData.syllabus_body)
            this.canvasData.syllabus_body = data.canvasData.syllabus_body;
        }
        return this.canvasData.syllabus_body;
    }

    /**
     * gets all assignments in a course
     * @returns {Promise<Assignment[]>}
     * @param config
     */
    async getAssignments(config: ICanvasCallConfig = {queryParams: {}}): Promise<Assignment[]> {
        config.queryParams = {...config.queryParams, include: ['due_at']}
        return await Assignment.getAllInCourse(this.id, config) as Assignment[];
    }

    async getAssignmentGroups(config?: ICanvasCallConfig) {
        return await getApiPagedData<IAssignmentGroup>(`courses/${this.id}/assignment_groups`, config)
    }

    /**
     *Gets all quizzes in a course
     * @param queryParams a json object representing the query param string. Defaults to including due dates     *
     * @returns {Promise<Quiz[]>}
     */
    async getQuizzes(queryParams = {'include': ['due_at']}): Promise<Quiz[]> {
        return <Quiz[]>await Quiz.getAllInCourse(this.id, {queryParams});
    }

    async getAssociatedCourses() {
        if (!this.isBlueprint) return null;

        const url = `courses/${this.id}/blueprint_templates/default/associated_courses`;
        const courses = await getApiPagedData<ICourseData>(url, {queryParams: {per_page: 50}});
        return courses.map(courseData => new Course(courseData));
    }

    async getSubsections() {
        const url = `/api/v1/courses/${this.id}/sections`;
        return await fetchApiJson(url);

    }

    async getTabs(config?:ICanvasCallConfig) {
        return await fetchApiJson(`courses/${this.id}/tabs`, config) as ITabData[];
    }

    async getFrontPage() {
        try {
            const data = await fetchOneKnownApiJson(`${this.contentUrlPath}/front_page`) as IPageData;
            return new Page(data, this.id);
        } catch (error) {
            return null;
        }
    }

    getTab(label: string) {
        return this.canvasData.tabs.find((tab: Record<string, any>) => tab.label === label) || null;
    }


    async reload() {
        const id = this.id;
        const reloaded = await Course.getCourseById(id);
        this.canvasData = reloaded.rawData;
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
                body: formDataify({
                    course: {
                        syllabus_body: newHtml
                    }
                })
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

        this.canvasData = await fetchOneKnownApiJson<ICourseData>(url, {
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
        this.canvasData = await fetchOneKnownApiJson(url, {
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

    static async publishAll(courses: number[] | Course[], accountId: number) {

        if (courses.length == 0) return false;
        const courseIds = courses.map((course) => {
            if (course instanceof Course) {
                return course.id;
            }
            return course;
        })

        const url = `accounts/${accountId}/courses`;
        const data = {
            'event': 'offer',
            'course_ids': courseIds,
        }
        return await fetchOneUnknownApiJson(url, {
            fetchInit: {
                method: 'PUT',
                body: formDataify(data),
            }
        })
    }

    async updateDueDates(offset: number) {
        const promises: Promise<any>[] = [];
        let assignments = await this.getAssignments();
        let quizzes = await this.getQuizzes();

        if (offset === 0 || offset) {
            for (let assignment of assignments) {
                console.log(assignment);
                promises.push(assignment.dueAtTimeDelta(Number(offset)));
            }

            for (let quiz of quizzes) {
                promises.push(quiz.dueAtTimeDelta(Number(offset)));
            }
        }
        await Promise.all(promises);
        return [...assignments, ...quizzes];
    }

    async publish() {
        const url = `courses/${this.id}`;
        const courseData = await fetchOneKnownApiJson<ICourseData>(url, {
            fetchInit: {
                method: 'PUT',
                body: formDataify({'offer': true})
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
        this.canvasData = {...(await Course.getCourseById(this.id)).canvasData};
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
        const data = await fetchOneKnownApiJson(url, {fetchInit: {method: 'POST'}});
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
                let course = await Course.getCourseById(migration['settings']['source_course_id'])
                if (course.codePrefix === "DEV") return course;
            }
        } catch (e) {
            return await Course.getByCode('DEV_' + this.baseCode);
        }
        return null;
    }

    /* Not working due to CORS; we need to set up the proxy server to be able to resize images.

     */
    async regenerateHomeTiles() {
        const modules = await this.getModules();
        let urls = await Promise.all(modules.map(async (module) => {
            let dataUrl = await this.generateHomeTile(module)
        }));
        console.log('done');

    }

    async generateHomeTile(module: IModuleData) {

        let overview = module.items.find(item =>
            item.type === "Page" &&
            item.title.toLowerCase().includes('overview')
        );
        if (!overview?.url) return; //skip this if it's not an overview

        const url = overview.url.replace(/.*\/api\/v1/, '/api/v1')
        const pageData = await fetchJson(url) as IPageData;
        const overviewPage = new Page(pageData, this.id);
        const pageBody = document.createElement('html');
        pageBody.innerHTML = overviewPage.body;
        let bannerImg: HTMLImageElement | null = pageBody.querySelector('.cbt-banner-image img')
        assert(bannerImg, "Page has no banner");
        let resizedImageBlob = await getResizedBlob(bannerImg.src, HOMETILE_WIDTH);
        let fileName = `hometile${module.position}.png`;
        assert(resizedImageBlob);
        let file = new File([resizedImageBlob], fileName)
        return await uploadFile(file, 'Images/hometile', this.fileUploadUrl);

    }

    static registerContentClass(contentClass: typeof BaseContentItem) {
        this.contentClasses.push(contentClass);
    }

    public getPages(config: ICanvasCallConfig | null = null) {
        return Page.getAllInCourse(this.id, config) as Promise<Page[]>;
    }

    public async getFrontPageProfile() {
        const frontPage = await this.getFrontPage();
        assert(frontPage && frontPage.body, "Course front page not found");
        const frontPageProfile = getCurioPageFrontPageProfile(frontPage?.body);
        frontPageProfile.sourcePage = frontPage;
        return frontPageProfile;
    }

    public async getPotentialInstructorProfiles() {
        const instructors = await this.getInstructors();
        let profiles: IProfile[] = [];
        if (!instructors) return profiles;
        for (let instructor of instructors) {
            profiles = profiles.concat(await getPotentialFacultyProfiles(instructor))
        }
        return profiles;

    }

    public async getSettings(config?:ICanvasCallConfig) {
        return await fetchJson(`/api/v1/courses/${this.id}/settings`, config) as ICourseSettings;
    }

}


/**
 *  A base class for objects that interact with the Canvas API
 */


export class Account extends BaseCanvasObject<CanvasData> {
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
            return await this.getAccountById(parseInt(match[1]));
        }
        return null;
    }

    static async getAccountById(accountId: number, config: ICanvasCallConfig | undefined = undefined): Promise<Account> {
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


export class BaseContentItem extends BaseCanvasObject<CanvasData> {
    static bodyProperty: string;
    static nameProperty: string = 'name';

    _courseId: number;

    constructor(canvasData: CanvasData, course: Course | number) {
        super(canvasData);
        this._courseId = typeof course === 'number'? course : course.id;
    }

    static get contentUrlPart() {
        assert(this.allContentUrlTemplate, "Not a content url template");
        const urlTermMatch = /\/([\w_]+)$/.exec(this.allContentUrlTemplate);
        if (!urlTermMatch) return null;
        const urlTerm = urlTermMatch[1];
        return urlTerm;

    }

    static async getAllInCourse(courseId: number, config: ICanvasCallConfig | null = null) {
        let url = this.getAllUrl(courseId);
        let data = await getApiPagedData(url, config);
        return data.map(item => new this(item, courseId));
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

    async getMeInAnotherCourse(targetCourse: Course | number) {
        let ContentClass = this.constructor as typeof BaseContentItem
        let targets = await ContentClass.getAllInCourse(
            typeof targetCourse === 'number'? targetCourse : targetCourse.id,
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

function contentClass(originalClass: typeof BaseContentItem, _context: ClassDecoratorContext) {
    Course.registerContentClass(originalClass);
}

@contentClass
export class Discussion extends BaseContentItem {
    static nameProperty = 'title';
    static bodyProperty = 'message';
    static contentUrlTemplate = "courses/{course_id}/discussion_topics/{content_id}";
    static allContentUrlTemplate = "courses/{course_id}/discussion_topics"



    async offsetPublishDelay(days:number) {
        const data = this.rawData
        if(!this.rawData.delayed_post_at) return;
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

@contentClass
export class Assignment extends BaseContentItem {
    static nameProperty = 'name';
    static bodyProperty = 'description';
    static contentUrlTemplate = "courses/{course_id}/assignments/{content_id}";
    static allContentUrlTemplate = "courses/{course_id}/assignments";

    async setDueAt(dueAt: Date) {
        const currentDueAt = this.dueAt ? Temporal.Instant.from(this.rawData.due_at) : null;
        const targetDueAt = Temporal.Instant.from(dueAt.toISOString());

        const payload: Record<string, { due_at: string, peer_review_due_at?: string}> = {
            assignment: {
                due_at: dueAt.toISOString(),
            }
        }

        if(this.rawData.peer_reviews && 'automatic_peer_reviews' in this.rawData) {
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

    constructor(canvasData:IPageData, courseId:number) {
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

export class Rubric extends BaseContentItem {
    static nameProperty = 'title';
    static contentUrlTemplate = "courses/{course_id}/rubrics/{content_id}";
    static allContentUrlTemplate = "courses/{course_id}/rubrics";

    async associations(reload = false) {
        if ('associations' in this.canvasData && !reload) {
            return this.canvasData['associations'];
        }

        let data = await this.myClass.getDataById(this.id, this.courseId, {queryParams: {'include': ['associations']}});
        let associations = data['associations'].map((data: CanvasData) => new RubricAssociation(data, this.courseId));
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

export class Term extends BaseCanvasObject<ITermData> {
    static nameProperty = "name";

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
        let termData = await fetchApiJson(url, config) as ITermData | null;
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
        const data = await getApiPagedData<ITermData>(url, config);
        let terms: ITermData[] = [];
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

}

export class NotImplementedException extends Error {
}

export class CourseNotFoundException extends Error {
}

