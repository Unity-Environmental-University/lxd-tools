/**
 * noinspection FunctionNamingConventionJS,JSUnusedGlobalSymbols
 */
import { Dict, ICanvasData, IModuleData, IModuleItemData, LookUpTable, ModuleItemType } from "./canvasDataDefs";
interface ICanvasCallConfig extends Dict {
    fetchInit?: RequestInit;
    queryParams?: Dict;
}
interface IUpdateCallback {
    (current: number, total: number): Promise<number>;
}
export declare function resizedImage(imgSrc: string, targetWidth: number, targetHeight?: null | number): Promise<ImageData>;
export declare function formDataify(data: Dict): FormData;
export declare function getModuleWeekNumber(module: Dict): number | null;
/**
 * Takes in a module item and returns an object specifying its type and content id
 * @param item
 */
export declare function getItemTypeAndId(item: IModuleItemData): Promise<{
    type: ModuleItemType;
    id: number;
}>;
/**
 *  A base class for objects that interact with the Canvas API
 */
export declare class BaseCanvasObject {
    static idProperty: string;
    static nameProperty: string | null;
    static contentUrlTemplate: string | null;
    static allContentUrlTemplate: string | null;
    protected canvasData: ICanvasData;
    protected accountId: null | number;
    constructor(data: ICanvasData);
    getClass(): typeof BaseContentItem;
    toString(): string;
    getItem(item: string): any;
    get myClass(): typeof BaseContentItem;
    get nameKey(): string;
    get contentUrlPath(): null | string;
    get htmlContentUrl(): string;
    get rawData(): ICanvasData;
    static getDataById(contentId: number, course?: Course | null, config?: ICanvasCallConfig | null): Promise<ICanvasData>;
    static getById(contentId: number, course: Course): Promise<BaseCanvasObject>;
    static getUrlPathFromIds(contentId: number, courseId: number | null): string;
    /**
     *
     * @param courseId - The course ID to get elements within, if applicable
     * @param accountId - The account ID to get elements within, if applicable
     */
    static getAllUrl(courseId?: number | null, accountId?: number | null): string;
    static getAll(config?: ICanvasCallConfig | null): Promise<BaseCanvasObject[]>;
    get id(): number;
    get name(): any;
    saveData(data: Dict): Promise<ICanvasData | ICanvasData[]>;
    delete(): Promise<ICanvasData | ICanvasData[]>;
}
export declare class Account extends BaseCanvasObject {
    static nameProperty: string;
    static contentUrlTemplate: string;
    static allContentUrlTemplate: string;
    private static account;
    static getFromUrl(url?: string | null): Promise<Account | null>;
    static getById(accountId: number, config?: ICanvasCallConfig | undefined): Promise<Account>;
    static getRootAccount(resetCache?: boolean): Promise<Account>;
    get rootAccountId(): any;
}
export declare class Course extends BaseCanvasObject {
    static CODE_REGEX: RegExp;
    private _modules;
    private modulesByWeekNumber;
    private static contentClasses;
    static getFromUrl(url?: string | null): Promise<Course | null>;
    static getIdFromUrl(url: string): number | null;
    /**
     * Returns this library's class corresponding to the current url, drawing from Course.contentClasses.
     * Classes can be included in Course.contentClasses using the decorator @contentClass
     *
     * @param url
     */
    static getContentClassFromUrl(url?: string | null): typeof BaseContentItem | null;
    static getById(courseId: number, config?: ICanvasCallConfig | undefined): Promise<Course>;
    private static getCoursesByString;
    static getAllByCode(code: string, term?: Term | null, config?: ICanvasCallConfig | undefined): Promise<Course[] | null>;
    static getByCode(code: string, term?: Term | null, config?: ICanvasCallConfig | undefined): Promise<Course | null>;
    static getAccountIdsByName(): Promise<Dict>;
    get contentUrlPath(): string;
    get courseUrl(): string;
    get courseCode(): null | string;
    get codeMatch(): RegExpExecArray | null;
    get baseCode(): string;
    get codePrefix(): string;
    get isBlueprint(): any;
    get isPublished(): boolean;
    getModules(): Promise<IModuleData[]>;
    getContentItemFromUrl(url?: string | null): Promise<BaseContentItem | null>;
    getModulesByWeekNumber(): Promise<LookUpTable<IModuleData>>;
    getModuleItemLink(moduleOrWeekNumber: number | Dict, target: IModuleItemData | {
        type: ModuleItemType;
        search?: string;
        index?: number;
    }): Promise<string | null>;
    getSyllabus(): Promise<string>;
    /**
     * gets all assignments in a course
     * @returns {Promise<Assignment[]>}
     * @param config
     */
    getAssignments(config?: ICanvasCallConfig): Promise<Assignment[]>;
    /**
     *Gets all quizzes in a course
     * @param queryParams a json object representing the query param string. Defaults to including due dates     *
     * @returns {Promise<Quiz[]>}
     */
    getQuizzes(queryParams?: {
        include: string[];
    }): Promise<Quiz[]>;
    getAssociatedCourses(): Promise<Course[] | null>;
    getSubsections(): Promise<ICanvasData | ICanvasData[]>;
    getTabs(): Promise<ICanvasData | ICanvasData[]>;
    getFrontPage(): Promise<Page | null>;
    getTab(label: string): any;
    setNavigationTabHidden(label: string, value: boolean): Promise<ICanvasData | ICanvasData[] | null>;
    changeSyllabus(newHtml: string): Promise<ICanvasData | ICanvasData[]>;
    getPotentialSections(term: Term): Promise<Course[] | null>;
    lockBlueprint(): Promise<void>;
    setAsBlueprint(): Promise<void>;
    unsetAsBlueprint(): Promise<void>;
    resetCache(): void;
    publish(): Promise<void>;
    unpublish(): Promise<void>;
    contentUpdatesAndFixes(_fixesToRun?: null): Promise<void>;
    reset(prompt?: boolean): Promise<boolean>;
    /**
     * NOT IMPLEMENTED
     * @param prompt Either a boolean or an async function that takes in a source and destination course and returns a boolean
     * @param updateCallback
     */
    importDevCourse(prompt: false | ((source: Course, destination: Course) => Promise<boolean>) | undefined, updateCallback: IUpdateCallback | undefined): Promise<void>;
    importCourse(course: Course, updateCallback: IUpdateCallback | undefined): Promise<void>;
    getParentCourse(return_dev_search?: boolean): Promise<Course | null | undefined>;
    generateHomeTiles(): Promise<void>;
    generateHomeTile(module: IModuleData): Promise<void>;
    uploadFile(file: File, path: string): Promise<void>;
    static registerContentClass(contentClass: typeof BaseContentItem): void;
}
export declare class BaseContentItem extends BaseCanvasObject {
    static bodyProperty: string;
    _course: Course;
    constructor(canvasData: ICanvasData, course: Course);
    static get contentUrlPart(): string | null;
    static getIdFromUrl(url: string): number | null;
    static getAllInCourse(course: Course, config: ICanvasCallConfig): Promise<BaseContentItem[]>;
    static clearAddedContentTags(text: string): string;
    static getFromUrl(url?: string | null, course?: null | Course): Promise<BaseContentItem | null>;
    get bodyKey(): string;
    get body(): string | null;
    get dueAt(): Date | null;
    setDueAt(date: Date): Promise<Dict>;
    dueAtTimeDelta(timeDelta: number): Promise<Dict | null>;
    get contentUrlPath(): string;
    get course(): Course;
    updateContent(text?: null, name?: null): Promise<ICanvasData | ICanvasData[]>;
    getMeInAnotherCourse(targetCourse: Course): Promise<BaseContentItem | undefined>;
}
export declare class Discussion extends BaseContentItem {
    static nameProperty: string;
    static bodyProperty: string;
    static contentUrlTemplate: string;
    static allContentUrlTemplate: string;
}
export declare class Assignment extends BaseContentItem {
    static nameProperty: string;
    static bodyProperty: string;
    static contentUrlTemplate: string;
    static allContentUrlTemplate: string;
    setDueAt(dueAt: Date): Promise<ICanvasData | ICanvasData[]>;
}
export declare class Quiz extends BaseContentItem {
    static nameProperty: string;
    static bodyProperty: string;
    static contentUrlTemplate: string;
    static allContentUrlTemplate: string;
    setDueAt(dueAt: Date): Promise<ICanvasData | ICanvasData[]>;
}
export declare class Page extends BaseContentItem {
    static idProperty: string;
    static nameProperty: string;
    static bodyProperty: string;
    static contentUrlTemplate: string;
    static allContentUrlTemplate: string;
    getRevisions(): Promise<ICanvasData[]>;
    revertLastChangeSet(stepsBack?: number): Promise<null | undefined>;
    resetContent(revisionId?: number): Promise<void>;
    applyRevision(revision: Dict): Promise<void>;
    get body(): string;
    updateContent(text?: null, name?: null): Promise<ICanvasData | ICanvasData[]>;
}
export declare class Rubric extends BaseContentItem {
    static nameProperty: string;
    static contentUrlTemplate: string;
    static allContentUrlTemplate: string;
    associations(reload?: boolean): Promise<any>;
}
export declare class RubricAssociation extends BaseContentItem {
    static contentUrlTemplate: string;
    static allContentUrlTemplate: string;
    get useForGrading(): any;
    setUseForGrading(value: boolean): Promise<ICanvasData | ICanvasData[]>;
}
export declare class Term extends BaseCanvasObject {
    get code(): string | undefined;
    static getTerm(code: string, workflowState?: string, config?: ICanvasCallConfig | undefined): Promise<Term | null>;
    static getAllActiveTerms(config?: ICanvasCallConfig | null): Promise<Term[] | null>;
    static searchTerms(code?: string | null, workflowState?: string, config?: ICanvasCallConfig | null): Promise<Term[] | null>;
}
export declare class NotImplementedException extends Error {
}
export declare class CourseNotFoundException extends Error {
}
export {};
