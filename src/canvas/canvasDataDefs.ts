export interface ITermsData extends ICanvasData {
    enrollment_terms: ITermData[],
}

export type TermWorkflowState = 'all' | 'active' | 'deleted'

export interface ITermData extends ICanvasData {
    start_at: string,
    end_at: string,
    workflow_state: TermWorkflowState,
    overrides?: Record<string, any>,
    course_count: number
}

export interface ICanvasData extends Record<string, any> {

}

export interface IEnrollmentData extends ICanvasData {
    user: IUserData
}

export interface IUserData extends ICanvasData {
    id: number,
    name: string,
    sortable_name: string,
    last_name: string,
    first_name: string,
    short_name: string,
    email: string,
    bio?: string
}


export interface ICourseData extends ICanvasData {
    id: number,
    sis_course_id?: string,
    uuid: string,
    name: string,
    course_code: string,
    original_name: string,
    workflow_state: 'available' | 'unpublished' | 'completed' | 'deleted',
    account_id: number,
    root_account_id: number,
    enrollment_term_id: number[] | number,
    grading_periods?: ICanvasData[] | null,
    grading_standard_id: number,
    grade_passback_setting?: "nightly_sync" | "disabled" | '',
    created_at: string,
    start_at: string,
    end_at: string,
    locale: string,
    enrollments: number | null,
    total_students?: number,
    calendar: ICanvasData,
    default_view: 'feed' | 'wiki' | 'modules' | 'assignments' | 'syllabus',
    syllabus_body?: string,
    needs_grading_count?: number,
    term?: ITermData,
    course_progress: ICanvasData,
    apply_assignment_group_weights: boolean,
    permissions: Record<string, boolean>,
    public_description: string,
    storage_quota_mb: number,
    storage_quota_used_mb: number,
    hide_final_grades: boolean,
    license: string,
    allow_student_assignment_edits: boolean,
    allow_wiki_comments: boolean,
    allow_student_forum_attachments: boolean,
    open_enrollment: boolean,
    self_enrollment: boolean,
    restrict_enrollments_to_course_dates: boolean,
    course_format: string,
    access_restricted_by_date?: boolean
    time_zone: string,
    blueprint: boolean,
    blueprint_restrictions: IBlueprintContentRestrictions,
    blueprint_restrictions_by_object_type: {
        assignment?: IBlueprintContentRestrictions,
        attachment?: IBlueprintContentRestrictions,
        discussion_topic?: IBlueprintContentRestrictions,
        quiz?: IBlueprintContentRestrictions,
        wiki_page?: IBlueprintContentRestrictions
    }
    template: boolean

}
export interface IBlueprintContentRestrictions {
    content: boolean,
    points: boolean,
    due_dates: boolean,
    availability_dates: boolean
}


export interface IPageData extends ICanvasData {
    page_id: number,
    url: string,
    title: string,
}

export interface IAssignmentData extends ICanvasData {
    id: number,
    name: string,
    rubric: IRubricCriterion[]
}

export interface IGradingRules {
    drop_lowest?: number,
    drop_highest?: number,
    never_drop?: number[],
}

export interface IAssignmentGroup extends ICanvasData{
    id: number,
    name: string,
    position: number,
    group_weight: number,
    assignments?: IAssignmentData[],
    rules?: IGradingRules[]
}


export interface IDiscussionData extends ICanvasData {
    id: number,

}

export interface IQuizData extends ICanvasData {
    id: number,

}



export interface IModuleData extends ICanvasData {
    id: number,
    name: string,
    position: number,
    unlock_at: string,
    require_sequential_progress: boolean,
    prerequisite_module_ids: number[],
    items_count: number,
    items_url: string,
    items: IModuleItemData[],
    state: string,
    completed_at?: string | null,
    publish_final_grade?: boolean,
    published: boolean
}

export type ModuleItemType = "File" | "Assignment" | "Discussion" | "Quiz" | "ExternalTool" | "ExternalUrl" | "Page" | "Subheader"
export type RestrictModuleItemType = 'assignment'|'attachment'|'discussion_topic'|'external_tool'|'lti-quiz'|'quiz'|'wiki_page'


export interface IModuleItemData extends ICanvasData {
    module_id: number,
    position: number,
    title: string,
    indent: number,
    type: ModuleItemType,
    content_id: number,
    html_url: string,
    url?: string,
    page_url?: string,
    external_url?: string,
    new_tab: boolean,
    completion_requirement: {
        type: "min_score" | "must_view" | "must_contribute" | "must_submit" | "must_mark_done",
        min_score?: number
    },
    content_details?: {
        points_possible: number,
        due_at?: string,
        unlock_at?: string,
        lock_at?: string,
    }
}


export interface IRubricCriterion {
    id: string,
    description: string | null,
    long_description: string | null,
    points: number,
    criterion_use_range: boolean,
    ratings: IRubricRating[]
}

export interface IRubricRating {
    id: string,
    description: string | null,
    long_description: string | null,
    points: number,
}

export type LookUpTable<T> = Record<string|number, any>

