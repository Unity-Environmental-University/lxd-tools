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

export interface IPageData extends CanvasData {
    page_id: number,
    url: string,
    title: string,
    body?: string,
}

export interface IAssignmentData extends CanvasData {
    id: number,
    name: string,
    rubric: IRubricCriterion[]
}


export interface IGradingRules {
    drop_lowest?: number,
    drop_highest?: number,
    never_drop?: number[],
}

export interface IAssignmentGroup extends CanvasData {
    id: number,
    name: string,
    position: number,
    group_weight: number,
    assignments?: IAssignmentData[],
    rules?: IGradingRules[]
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




export interface IQuizData {
 // the ID of the quiz
  "id": number
  // the title of the quiz
  "title": string,
  // the HTTP/HTTPS URL to the quiz
  "html_url": string,
  // a url suitable for loading the quiz in a mobile webview.  it will persiste
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
  "quiz_extensions_url":  string,
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