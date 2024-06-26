export type TermWorkflowState = 'all' | 'active' | 'deleted'
export type CanvasData = Record<string, any>


export interface ITermData extends CanvasData {
    start_at: string,
    end_at: string,
    name: string,
    workflow_state: TermWorkflowState,
    overrides?: Record<string, any>,
    course_count: number
}

export interface IEnrollmentData extends CanvasData {
    user: IUserData
}

export interface IUserData extends CanvasData {
    id: number,
    name: string,
    sortable_name: string,
    last_name: string,
    first_name: string,
    short_name: string,
    email: string,
    bio?: string
}


export interface ICourseData extends CanvasData {
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
    grading_periods?: CanvasData[] | null,
    grading_standard_id: number,
    grade_passback_setting?: "nightly_sync" | "disabled" | '',
    created_at: string,
    start_at: string,
    end_at: string,
    locale: string,
    enrollments: number | null,
    total_students?: number,
    calendar: CanvasData,
    default_view: 'feed' | 'wiki' | 'modules' | 'assignments' | 'syllabus',
    syllabus_body?: string,
    needs_grading_count?: number,
    term?: ITermData,
    course_progress: CanvasData,
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

export interface ICourseSettings {
    "allow_student_discussion_topics": boolean,
    "allow_student_forum_attachments": boolean,
    "allow_student_discussion_editing": boolean,
    "grading_standard_enabled": boolean,
    "grading_standard_id": number,
    "allow_student_organized_groups": boolean,
    "hide_final_grades": boolean,
    "hide_distribution_graphs": boolean,
    "hide_sections_on_course_users_page": boolean,
    "lock_all_announcements": boolean,
    "usage_rights_required": boolean,
    "homeroom_course": boolean,
    "default_due_time": string,
    "conditional_release": boolean,
    show_announcements_on_home_page?: boolean
}

export interface ITabData {
    id: string,
    html_url: string,
    full_url: string,
    position: number,
    hidden?: boolean,
    visibility: string,
    label: string,
    type: string
}

export interface IBlueprintContentRestrictions {
    content: boolean,
    points: boolean,
    due_dates: boolean,
    availability_dates: boolean
}


export interface IGradingRules {
    drop_lowest?: number,
    drop_highest?: number,
    never_drop?: number[],
}


// export interface IQuizData extends ICanvasData {
//     id: number,
//
// }


export interface IModuleData extends CanvasData {
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

export type ModuleItemType =
    "File"
    | "Assignment"
    | "Discussion"
    | "Quiz"
    | "ExternalTool"
    | "ExternalUrl"
    | "Page"
    | "Subheader"
export type RestrictModuleItemType =
    'assignment'
    | 'attachment'
    | 'discussion_topic'
    | 'external_tool'
    | 'lti-quiz'
    | 'quiz'
    | 'wiki_page'


export interface IModuleItemData extends CanvasData {
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


export interface IUpdateCallback {
    (current: number, total: number, message: string | undefined): void
}


export type LookUpTable<T> = Record<string | number, T>


export interface ILatePolicyUpdate {
    "id"?: number,
    "missing_submission_deduction_enabled"?: boolean,
    "missing_submission_deduction"?: number,
    "late_submission_deduction_enabled"?: boolean,
    "late_submission_deduction"?: number,
    "late_submission_interval"?: string,
    "late_submission_minimum_percent_enabled"?: boolean,
    "late_submission_minimum_percent"?: number
}

export interface ILatePolicyData extends ILatePolicyUpdate{
    "id": number,
    "missing_submission_deduction_enabled": boolean,
    "missing_submission_deduction": number,
    "late_submission_deduction_enabled": boolean,
    "late_submission_deduction": number,
    "late_submission_interval": string,
    "late_submission_minimum_percent_enabled": boolean,
    "late_submission_minimum_percent": number
}




type LockInfo = Record<string, any>

export interface IFile {
  "id": number,
  "uuid": string,
  "folder_id": number,
  "display_name": string,
  "filename": string,
  "content-type": string,
  "url": string,
  "size": number,
  "created_at": string,
  "updated_at": string,
  "unlock_at"?: string,
  "locked": boolean,
  "hidden": boolean,
  "lock_at"?: string,
  "hidden_for_user": boolean,
  "visibility_level"?: "course" | "institution" | "public" | "inherit",
  "thumbnail_url"?: string | null,
  "modified_at": string,
  // simplified content-type mapping
  "mime_class": string,
  // identifier for file in third-party transcoding service
  "media_entry_id"?: string,
  "locked_for_user": boolean,
  "lock_info"?: any,
  "lock_explanation"?: string,
  "preview_url"?: string
}

export interface IAccountData {
    root_account_id: number|null;
    integration_id?: string;
    default_time_zone: string;
    default_group_storage_quota_mb: number;
    sis_account_id?: string;
    default_user_storage_quota_mb: number;
    uuid: string;
    lti_guid: string;
    parent_account_id: number|null;
    name: string;
    default_storage_quota_mb: number;
    workflow_state: 'active' | 'deleted';
    id: number;
    sis_import_id: number
}