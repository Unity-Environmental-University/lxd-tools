import {BaseCanvasObject} from "../baseCanvasObject";
import {
    CanvasData,
    ILatePolicyData,
    IModuleData,
    IModuleItemData,
    IUserData,
    ModuleItemType
} from "../canvasDataDefs";
import {
    IContentHaver,
    ICourseCodeHaver,
    ICourseDataHaver,
    ICourseSettingsHaver,
    IGradingStandardData,
    IGradingStandardsHaver,
    ILatePolicyHaver,
    IModulesHaver
} from "./courseTypes";
import {cachedGetAssociatedCoursesFunc, IBlueprintCourse, isBlueprint} from "./blueprint";
import {BaseContentItem, Discussion, getBannerImage, IPageData, Page, Quiz} from "../content";
import {filterUniqueFunc, formDataify, ICanvasCallConfig} from "../canvasUtils";
import {overrideConfig} from "../index";
import assert from "assert";
import {getCurrentStartDate} from "./changeStartDate";
import {getModuleOverview, getModulesByWeekNumber, getModuleWeekNumber} from "./modules";
import {getResizedBlob} from "../image";
import {uploadFile} from "../files";
import {getCurioPageFrontPageProfile, getPotentialFacultyProfiles, IProfileWithUser} from "../profile";
import {getCourseData, getCourseIdFromUrl, getGradingStandards} from "./index";
import {Assignment, assignmentDataGen, IAssignmentGroup} from "@/canvas/content/assignments";
import {baseCourseCode, parseCourseCode} from "@/canvas/course/code";
import {Term} from "@/canvas/Term";

import {ICourseData, ICourseSettings, ITabData} from "@/canvas/courseTypes";
import {getPagedData} from "@/canvas/fetch/getPagedDataGenerator";
import {renderAsyncGen} from "@/canvas/fetch";
import {fetchJson} from "@/canvas/fetch/fetchJson";

const HOMETILE_WIDTH = 500;

export const COURSE_CODE_REGEX = /^(.+[^_])?_?(\w{4}\d{3})/i;


export class Course extends BaseCanvasObject<ICourseData> implements IContentHaver,
    ICourseDataHaver,
    ICourseSettingsHaver,
    IGradingStandardsHaver,
    ILatePolicyHaver,
    IBlueprintCourse,
    ICourseCodeHaver,
    IModulesHaver {
    static nameProperty = 'name';
    private _modules: IModuleData[] | undefined = undefined;
    private modulesByWeekNumber: Record<string | number, IModuleData> | undefined = undefined;
    private static contentClasses: (typeof BaseContentItem)[] = [Assignment, Discussion, Quiz, Page];

    isBlueprint: () => boolean;
    getAssociatedCourses: (redownload?: boolean) => Promise<Course[]>;

    constructor(data: ICourseData) {
        super(data);
        this.isBlueprint = (() => isBlueprint(data));
        this.getAssociatedCourses = cachedGetAssociatedCoursesFunc(this)
    }

    static async getFromUrl(url: string | null = null) {
        if (url === null) {
            url = document.documentURI;
        }
        let match = /courses\/(\d+)/.exec(url);
        if (match) {

            const id = getCourseIdFromUrl(url);
            if (!id) return null;
            return await this.getCourseById(id);
        }
        return null;
    }


    static async getCourseById(courseId: number, config: ICanvasCallConfig | undefined = undefined) {
        const data = await getCourseData(courseId, config);
        return new Course(data);
    }

    /**
     * @param code
     * @param term
     * @param config
     * @private
     */
    private static async getCoursesByString(code: string | null, term: Term | null = null, config: ICanvasCallConfig = {}) {
        console.warn("Replace this with getCourseGenerator")
        if(typeof code === 'undefined') {
            return null;
            console.warn("Course code empty");
        }
        let courseDataList: ICourseData[] | null = null;
        const accountIdsByName = await Course.getAccountIdsByName();
        for (let accountKey in accountIdsByName) {
            if (!accountKey) continue;
            let accountId = accountIdsByName[accountKey];
            let url = `/api/v1/accounts/${accountId}/courses`;
            config.queryParams = config.queryParams || {};
            config.queryParams['search_term'] = code;
            if (term !== null) {
                config.queryParams['enrollment_term_id'] = term.id;
            }
            courseDataList = await getPagedData<ICourseData>(url, config);
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

    static async getAllByCode(code: string | null, term: Term | null = null, config: ICanvasCallConfig | undefined = undefined) {
        return this.getCoursesByString(code, term, config);
    }

    static async getByCode(code: string, term: Term | null = null, config: ICanvasCallConfig | undefined = undefined) {
        const courses = await this.getCoursesByString(code, term, config);
        if (Array.isArray(courses)) return courses[0];
    }

    static async getAccountIdsByName(): Promise<Record<string, any>> {
        let course = await Course.getFromUrl();
        if (!course) {
            console.warn("You must be on a canvas page to get accounts");
            return {};
        }
        return {
            'root': course.canvasData.root_account_id,
            'current': course.canvasData.account_id
        }
    }


    static async courseEvent(courses: Course[], event: string, accountId: number) {
        const url = `/api/v1/accounts/${accountId}/courses`;
        const data = {
            'event': event,
            'course_ids[]': courses.map(course => course.id)
        };
        return await fetchJson<CanvasData>(url, {
            fetchInit: {
                method: 'PUT',
                body: JSON.stringify(data)

            }
        });

    }
    get contentUrlPath() {
        return `/api/v1/courses/${this.id}`;
    }

    get courseUrl() {
        return this.htmlContentUrl;
    }

    get htmlContentUrl() {
        return `/courses/${this.id}`
    }

    get parsedCourseCode(): null | string {
        return parseCourseCode(this.canvasData.course_code);
    }

    get courseCode(): null | string {
        return this.canvasData.course_code
    }

    get baseCode() {
        return baseCourseCode(this.canvasData.course_code);
    }

    get termId(): number | null {
        const id = (this.canvasData as ICourseData).enrollment_term_id;
        if (typeof id === 'number') return id;
        else return id[0];
    }

    //comment for no reason for publish
    async getTerm(): Promise<Term | null> {
        assert(typeof this.termId === 'number')

        if (this.termId) return Term.getTermById(this.termId)
        else return null;
    }

    get fileUploadUrl() {

        return `/api/v1/courses/${this.id}/files`;
    }

    get codePrefix() {
        let match = COURSE_CODE_REGEX.exec(this.rawData.course_code);
        return match ? match[1] : '';
    }

    get workflowState() {
        return this.canvasData.workflow_state
    }


    get start() {
        return new Date(this.getItem<string>('start_at'));
    }

    get isDev() {
        return !!this.name.match(/^DEV/);

    }


    get rootAccountId() {
        return this.canvasData.root_account_id;
    }

    get accountId() {
        return this.canvasData.account_id;
    }

    async getModules(config?: ICanvasCallConfig): Promise<IModuleData[]> {
        if (this._modules) {
            return this._modules;
        }
        config = overrideConfig(config, {
            queryParams: {
                include: ['items', 'content_details']
            }
        })
        let modules = <IModuleData[]>await getPagedData(`${this.contentUrlPath}/modules`, config);
        this._modules = modules;
        return modules;
    }

    async getStartDateFromModules() {
        return getCurrentStartDate(await this.getModules());
    }

    async getInstructors(): Promise<IUserData[] | null> {
        return await fetchJson(`/api/v1/courses/${this.id}/users?enrollment_type=teacher`) as IUserData[];
    }

    async getLatePolicy(this: { id: number }, config?: ICanvasCallConfig) {
        const latePolicyResult = await fetchJson(`/api/v1/courses/${this.id}/late_policy`, config);
        if ('late_policy' in latePolicyResult) return latePolicyResult.late_policy as ILatePolicyData;
        return undefined;

    }

    async getAvailableGradingStandards(config?: ICanvasCallConfig | undefined): Promise<IGradingStandardData[]> {
        let out: IGradingStandardData[] = [];
        console.log(this.name)
        const {id, account_id, root_account_id} = this.canvasData;

        try {
            if (id) {
                const courseGradingStandards = await getGradingStandards(id, "course", config);
                out = [...out, ...courseGradingStandards];

            }
            if (account_id) {
                const accountGradingStandards = await getGradingStandards(account_id, 'account', config);
                out = [...out, ...accountGradingStandards];
            }

            if (root_account_id) {
                const rootAccountGradingStandards = await getGradingStandards(root_account_id, 'account', config);
                out = [...out, ...rootAccountGradingStandards];

            }
        } catch (e) {
            console.warn(e);
        }
        return out.filter(filterUniqueFunc);
    }

    async getCurrentGradingStandard(config?: ICanvasCallConfig | undefined): Promise<IGradingStandardData | null> {
        const {grading_standard_id, account_id, root_account_id} = this.canvasData;

        const urls = [];

        if (grading_standard_id) {
            urls.push(`/api/v1/courses/${this.id}/grading_standards/${grading_standard_id}`)
            if (root_account_id) urls.push(`/api/v1/accounts/${root_account_id}/grading_standards/${grading_standard_id}`);
            if (account_id) urls.push(`/api/v1/accounts/${account_id}/grading_standards/${grading_standard_id}`);
        }

        const standards = (await this.getAvailableGradingStandards(config)).filter(standard => standard.id === grading_standard_id)
        if(standards.length  == 0) return null;
        return standards[0];
    }

    async getModulesByWeekNumber(config?: ICanvasCallConfig) {
        if (this.modulesByWeekNumber) return this.modulesByWeekNumber;
        let modules = await this.getModules(config);
        this.modulesByWeekNumber = await getModulesByWeekNumber(modules);
        return (this.modulesByWeekNumber);
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

    async getSyllabus(config: ICanvasCallConfig = {queryParams: {}}): Promise<string> {
        if (!this.canvasData.syllabus_body) {

            config.queryParams = {...config.queryParams, include: ['syllabus_body']};
            const data = await Course.getCourseById(this.id, config);
            assert(data.canvasData.syllabus_body)
            this.canvasData.syllabus_body = data.canvasData.syllabus_body;
        }
        return this.canvasData.syllabus_body;
    }

    // /**
    //  * gets all assignments in a course
    //  * @returns {Promise<Assignment[]>}
    //  * @param config
    //  */
    async getAssignments(config?: ICanvasCallConfig): Promise<Assignment[]> {
        console.warn('deprecated, use assignmentDataGen instead');
        config = overrideConfig(config, {queryParams: {include: ['due_at']}})
        const assignmentDatas = await renderAsyncGen(assignmentDataGen({courseId: this.id}, config));
        return (assignmentDatas.map(data => new Assignment(data, this.id)));
    }


    cachedContent: BaseContentItem[] = []

    async getContent(config?: ICanvasCallConfig, refresh = false) {
        if (refresh || this.cachedContent.length == 0) {
            let discussions = await this.getDiscussions(config);
            let assignments = await renderAsyncGen(assignmentDataGen({courseId: this.id}, config))
            let quizzes = await this.getQuizzes(config);
            let pages = await this.getPages(config);
            this.cachedContent = [
                ...discussions,
                ...assignments.map(a => new Assignment(a, this.id)),
                ...quizzes,
                ...pages

            ]

        }
        return this.cachedContent;
    }

    async getDiscussions(config?: ICanvasCallConfig): Promise<Discussion[]> {
        return await Discussion.getAllInCourse(this.id, config) as Discussion[];
    }

    async getAssignmentGroups(config?: ICanvasCallConfig) {
        return await getPagedData<IAssignmentGroup>(`/api/v1/courses/${this.id}/assignment_groups`, config)
    }

    async getQuizzes(config?: ICanvasCallConfig) {
        return await Quiz.getAllInCourse(this.id, config) as Quiz[];
    }

    async getSubsections() {
        const url = `/api/v1/courses/${this.id}/sections`;
        return await fetchJson(url);

    }

    async getTabs(config?: ICanvasCallConfig) {
        return await fetchJson(`/api/v1/courses/${this.id}/tabs`, config) as ITabData[];
    }

    async getFrontPage() {
        try {
            const data = await fetchJson(`${this.contentUrlPath}/front_page`) as IPageData;
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

        return await fetchJson(`/api/v1/courses/${this.id}/tabs/${tab.id}`, {
            queryParams: {'hidden': value}
        });
    }

    async changeSyllabus(newHtml: string) {
        this.canvasData['syllabus_body'] = newHtml;
        return await fetchJson(`/api/v1/courses/${this.id}`, {
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

    static async publishAll(courses: number[] | Course[], accountId: number) {

        if (courses.length == 0) return false;
        const courseIds = courses.map((course) => {
            if (course instanceof Course) {
                return course.id;
            }
            return course;
        })

        const url = `/api/v1/accounts/${accountId}/courses`;
        const data = {
            'event': 'offer',
            'course_ids': courseIds,
        }
        return await fetchJson(url, {
            fetchInit: {
                method: 'PUT',
                body: formDataify(data),
            }
        })
    }

    async updateDueDates(offset: number, config?: ICanvasCallConfig) {
        const promises: Promise<any>[] = [];
        const returnAssignments:Assignment[] = [];

        const assignments = assignmentDataGen({courseId: this.id}, config)
        if (offset === 0 || offset) {
            for await (let assignmentData of assignments) {
                const assignment = new Assignment(assignmentData, this.id);
                returnAssignments.push(assignment);
                promises.push(assignment.dueAtTimeDelta(Number(offset)));
            }
        }
        return returnAssignments;
    }

    async publish() {
        const url = `/api/v1/courses/${this.id}`;
        const courseData = await fetchJson<ICourseData>(url, {
            fetchInit: {
                method: 'PUT',
                body: formDataify({'offer': true})
            }
        });
        console.log(courseData);
        this.canvasData = courseData;
    }

    async unpublish() {
        const url = `/api/v1/courses/${this.id}`;
        await fetchJson(url, {
            fetchInit: {
                method: 'PUT',
                body: JSON.stringify({'course[event]': 'claim'})
            }
        });
        this.canvasData = {...(await Course.getCourseById(this.id)).canvasData};
    }

    async reset(prompt = true) {
        if (prompt && !confirm(`Are you sure you want to reset ${this.parsedCourseCode}?`)) {
            return false;
        }

        const url = `/api/v1/courses/${this.id}/reset_content`;
        const data = await fetchJson(url, {fetchInit: {method: 'POST'}});
        this.canvasData['id'] = data.id;

        return false;
    }


    async getParentCourse(return_dev_search = false) {
        let migrations = await getPagedData(`/api/v1/courses/${this.id}/content_migrations`);

        if (migrations.length < 1) {
            console.log('no migrations found');
            if (return_dev_search) {
                return Course.getByCode('DEV_' + this.baseCode);
            } else return;
        }
        migrations.sort((a, b) => b.id - a.id);

        try {
            for (let migration of migrations) {
                let course = await Course.getCourseById(migration['settings']['source_course_id'])
                if (course && course.codePrefix.includes("DEV")) return course;
            }
        } catch (e) {
            return await Course.getByCode('DEV_' + this.baseCode);
        }
        return await Course.getByCode('DEV_' + this.baseCode);
    }

    async regenerateHomeTiles() {
        const modules = await this.getModules();
        let urls = await Promise.all(modules.map(async (module) => {
            try {
                let dataUrl = await this.generateHomeTile(module)

            } catch (e) {
                console.log(e);
            }
        }));
        console.log('done');

    }

    async generateHomeTile(module: IModuleData) {
        const overviewPage = await getModuleOverview(module, this.id);
        if (!overviewPage) throw new Error("Module does not have an overview");
        const bannerImg = getBannerImage(overviewPage);
        if (!bannerImg) throw new Error("No banner image on page");
        let resizedImageBlob = await getResizedBlob(bannerImg.src, HOMETILE_WIDTH);
        let fileName = `hometile${module.position}.png`;
        assert(resizedImageBlob);
        let file = new File([resizedImageBlob], fileName)
        return await uploadFile(file, 'Images/hometile', this.fileUploadUrl);
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
        let profiles: IProfileWithUser[] = [];
        if (!instructors) return profiles;
        for (let instructor of instructors) {
            profiles = profiles.concat(await getPotentialFacultyProfiles(instructor))
        }
        return profiles;

    }

    public async getSettings(config?: ICanvasCallConfig) {
        return await fetchJson(`/api/v1/courses/${this.id}/settings`, config) as ICourseSettings;
    }

}



