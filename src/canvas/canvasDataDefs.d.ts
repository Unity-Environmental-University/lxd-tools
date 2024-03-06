export interface ITermsData extends ICanvasData {
    enrollment_terms: ITermData[];
}
export interface ITermData extends ICanvasData {
}
export interface ICanvasData extends Dict {
    id: number;
    name?: string;
}
export interface IEnrollmentData extends ICanvasData {
    user: IUserData;
}
export interface IUserData extends ICanvasData {
    name: string;
}
export interface ICourseData extends ICanvasData {
    name: string;
}
export interface IPageData extends ICanvasData {
    page_id: number;
    url: string;
    title: string;
}
export interface IAssignmentData extends ICanvasData {
    name: string;
    rubric: IRubricCriterion[];
}
export interface IDiscussionData extends ICanvasData {
}
export interface IQuizData extends ICanvasData {
}
export interface IModuleData extends ICanvasData {
    name: string;
    position: number;
    unlock_at: string;
    require_sequential_progress: boolean;
    prerequisite_module_ids: number[];
    items_count: number;
    items_url: string;
    items: IModuleItemData[];
    state: string;
    completed_at?: string | null;
    publish_final_grade?: boolean;
    published: boolean;
}
export type ModuleItemType = "Assignment" | "Discussion" | "Quiz" | "ExternalTool" | "ExternalUrl" | "Page";
export interface IModuleItemData extends ICanvasData {
    module_id: number;
    position: number;
    title: string;
    indent: number;
    type: ModuleItemType;
    content_id: number;
    html_url: string;
    url?: string;
    page_url?: string;
    external_url?: string;
    new_tab: boolean;
    completion_requirement: {
        type: "min_score" | "must_view" | "must_contribute" | "must_submit" | "must_mark_done";
        min_score?: number;
    };
    content_details?: {
        points_possible: number;
        due_at?: string;
        unlock_at?: string;
        lock_at?: string;
    };
}
export interface IRubricCriterion {
    id: string;
    description: string | null;
    long_description: string | null;
    points: number;
    criterion_use_range: boolean;
    ratings: IRubricRating[];
}
export interface IRubricRating {
    id: string;
    description: string | null;
    long_description: string | null;
    points: number;
}
export interface Dict {
    [key: string]: any;
}
export interface LookUpTable<T> {
    [key: string | number]: T;
}
