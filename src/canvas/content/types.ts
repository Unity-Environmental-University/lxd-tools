import {CanvasData} from "@/canvas/canvasDataDefs";
import {IQueryParams} from "@/canvas/canvasUtils";
import {IQuizData} from "@/canvas/content/quizzes/types";
import {IPageData} from "@/canvas/content/pages/types";
import {ICourseData} from "@canvas/courseTypes";
import {FileAttachment, TopicPermissions} from "@canvas/type";

import {IRubricCriterionData, RubricAssessment} from "@/canvas";

export type DateString = string;

export interface AssignmentDate extends CanvasData {
    id: number,
    base?: boolean,
    title: string,
    due_at?: DateString | null,
    lock_at?: DateString | null,
    unlock_at?: DateString | null,
}

export type SubmissionType = 'discussion_topic' | 'online_quiz' | 'on_paper' | 'none' |
    'external_tool' | 'online_text_entry' | 'online_url'

export interface IGradingRules {
    drop_lowest?: number,
    drop_highest?: number,
    never_drop?: number[],
}

type DiscussionType = 'side_comment' | 'threaded' | 'not_threaded';

export interface IDiscussionData extends CanvasData {
    id: number,
    title: string,
    message: string,
    html_url: string,
    posted_at?: DateString | null | undefined,
    last_reply_at?: DateString | null | undefined,
    require_initial_post: boolean,
    discussion_subentry_count: number,
    read_state: "read" | "unread",
    unread_count: number,
    subscribed: boolean,
    subscription_hold?: 'initial_post_required' | 'not_in_group_set' | 'not_in_group' | 'topic_is_announcement',
    assignment_id: number | null,
    delayed_post_at?: string | null,
    published: boolean,
    lock_at?: DateString | null | undefined,
    locked: boolean,
    pinned: boolean,
    locked_for_user: boolean,
    lock_info?: LockInfo | null,
    user_can_see_posts: boolean,
    lock_explanation?: string | null,
    user_name: string,
    topic_children: number[],
    group_topic_children?: { id: number, group_id: number }[],
    root_topic_id?: number | null,
    podcast_url?: string,
    discussion_type: DiscussionType,
    group_category_id?: number | null,
    attachments?: FileAttachment[] | null,
    permissions: TopicPermissions,
    allow_rating: boolean,
    only_graders_can_rate: boolean,
    sort_by_grading: boolean,

}

export interface SaveDiscussionData {
    title?: string;
    message?: string;
    discussion_type?: DiscussionType;
    published?: boolean;
    delayed_post_at?: Date;
    lock_at?: Date;
    podcast_enabled?: boolean;
    podcast_has_student_posts?: boolean;
    require_initial_post?: boolean;
    assignment?: IAssignmentData;
    is_announcement?: boolean;
    pinned?: boolean;
    position_after?: string;
    group_category_id?: number;
    allow_rating?: boolean;
    only_graders_can_rate?: boolean;
    sort_by_rating?: boolean;
    specific_sections?: string;
}

export interface IAssignmentData extends CanvasData {
    id: number,
    name: string,
    description: string,
    created_at: DateString, //ISO string
    updated_at: DateString | null,
    due_at: DateString | null,
    lock_at: DateString | null,
    unlock_at: DateString | null,
    has_overrides: boolean,
    all_dates?: AssignmentDate[],
    course_id: number,
    html_url: string,
    discussion_topic?: IDiscussionData,
    submissions_download_url: string,
    assignment_group_id: number,
    due_date_required: boolean,
    allowed_extensions: string[],
    max_name_length: number,
    turnitin_enabled?: boolean,
    vericite_enabled?: boolean,
    turnitin_settings?: Record<string, any>,
    grade_group_students_individually: boolean,
    external_tool_tag_attributes?: {
        url: string,
        new_tab: boolean
    },
    peer_reviews: boolean,
    automatic_peer_reviews: boolean,
    peer_review_count?: number,
    peer_reviews_assign_at?: DateString,
    intra_group_peer_reviews: boolean,
    group_category_id?: number,
    needs_grading_count?: number,
    needs_grading_count_by_section?: { section_id: number, needs_grading_count: number }[],
    position: number,
    post_to_sis?: boolean,
    integration_id?: string,
    integration_data?: Record<string, unknown>,
    points_possible: number,
    submission_types: SubmissionType[]
    omit_from_final_grade: boolean,
    hide_in_gradebook: boolean,
    moderated_grading: boolean,
    grader_count: number,
    final_grader_id: number,
    grader_comments_visible_to_graders: boolean,
    graders_anonymous_to_graders: boolean,
    grader_names_visible_to_final_grader: boolean,
    anonymous_grading: boolean,

    rubric?: IRubricCriterionData[],
}

export type ContentData = IPageData | IAssignmentData | IQuizData | IDiscussionData

export type ContentFuncsOptions<
    GetOptionsType extends IQueryParams,
    GetAllOptionsType extends IQueryParams = GetOptionsType,
    PutDataType extends Record<string, any> = Record<string, any>,
    PostDataType extends Record<string, any> = PutDataType
> = {

    defaultGetQuery?: GetOptionsType,
    defaultGetAllQuery?: GetAllOptionsType,
    defaultPutQuery?: PutDataType,
    defaultPostQuery?: PostDataType,

}

export interface IAssignmentGroup extends CanvasData {
    id: number,
    name: string,
    position: number,
    group_weight: number,
    assignments?: IAssignmentData[],
    rules?: IGradingRules[]
}

export type AssignmentOverride = {
    id: number,
    assignment_id: number,
    quiz_id?: number,
    context_module_id?: number,
    discussion_topic_id?: number,
    wiki_page_id?: number,
    attachment_id?: number,
    student_ids?: number[],
    group_id?: number,
    course_section_id?: number,
    title: string,
    due_at: string,
    all_day: boolean,
    all_day_date?: DateString,
    unlock_at?: DateString,
    lock_at?: DateString,

};
export type UpdateAssignmentDataOptions = {
    assignment: Partial<Omit<IAssignmentData,
        'id' | 'created_at' | 'has_overrides' | 'all_dates' | 'html_url' |
        'max_name_length' | 'peer_review_count' | 'peer_reviews_assign_at'
    > & {
        sis_assignment_id: string,
        notify_of_update: boolean,
        grading_type: 'pass_fail' | 'percent' | 'letter_grade' | 'gpa_scale' | 'points' | 'not_graded',
        assignment_overrides: AssignmentOverride[],
        only_visible_to_overrides: boolean,
        published: boolean,
        grading_standard_id: number,
        allowed_attempts: number,
        annotatable_attachment_id: number,
        force_updated_at: boolean,
    }>
}

export interface IAssignmentSubmission {
    // The submission's assignment id
    assignment_id: number;
    // The submission's assignment (see the assignments API) (optional)
    assignment?: IAssignmentData | null;
    // The submission's course (see the course API) (optional)
    course?: ICourseData | null;
    // This is the submission attempt number.
    attempt: number;
    // The content of the submission, if it was submitted directly in a text field.
    body: string;
    // The grade for the submission, translated into the assignment grading scheme
    // (so a letter grade, for example).
    grade: string;
    // A boolean flag which is false if the student has re-submitted since the
    // submission was last graded.
    grade_matches_current_submission: boolean;
    // URL to the submission. This will require the user to log in.
    html_url: string;
    // URL to the submission preview. This will require the user to log in.
    preview_url: string;
    // The raw score
    score: number;
    // Associated comments for a submission (optional)
    submission_comments?: unknown | null;
    // The types of submission ex:
    // ('online_text_entry'|'online_url'|'online_upload'|'online_quiz'|'media_record
    // ing'|'student_annotation')
    submission_type: 'online_text_entry' | 'online_url' | 'online_upload' | 'online_quiz' | 'media_recording' | 'student_annotation';
    // The timestamp when the assignment was submitted
    submitted_at: string;
    // The URL of the submission (for 'online_url' submissions).
    url?: string | null;
    // The id of the user who created the submission
    user_id: number;
    // The id of the user who graded the submission. This will be null for
    // submissions that haven't been graded yet. It will be a positive number if a
    // real user has graded the submission and a negative number if the submission
    // was graded by a process (e.g. Quiz autograder and autograding LTI tools).
    // Specifically autograded quizzes set grader_id to the negative of the quiz id.
    // Submissions autograded by LTI tools set grader_id to the negative of the tool
    // id.
    grader_id: number;
    graded_at: string;
    // The submissions user (see user API) (optional)
    user?: unknown | null;
    // Whether the submission was made after the applicable due date
    late: boolean;
    // Whether the assignment is visible to the user who submitted the assignment.
    // Submissions where `assignment_visible` is false no longer count towards the
    // student's grade and the assignment can no longer be accessed by the student.
    // `assignment_visible` becomes false for submissions that do not have a grade
    // and whose assignment is no longer assigned to the student's section.
    assignment_visible: boolean;
    // Whether the assignment is excused.  Excused assignments have no impact on a
    // user's grade.
    excused: boolean;
    // Whether the assignment is missing.
    missing: boolean;
    // The status of the submission in relation to the late policy. Can be late,
    // missing, extended, none, or null.
    late_policy_status: 'late' | 'missing' | 'extended' | 'none' | null;
    // The amount of points automatically deducted from the score by the
    // missing/late policy for a late or missing assignment.
    points_deducted: number;
    // The amount of time, in seconds, that an submission is late by.
    seconds_late: number;
    // The current state of the submission
    workflow_state: 'submitted' | 'graded' | 'pending_review';
    // Extra submission attempts allowed for the given user and assignment.
    extra_attempts: number;
    // A unique short ID identifying this submission without reference to the owning
    // user. Only included if the caller has administrator access for the current
    // account.
    anonymous_id: string;
    // The date this submission was posted to the student, or nil if it has not been
    // posted.
    posted_at?: string | null;
    // The read status of this submission for the given user (optional). Including
    // read_status will mark submission(s) as read.
    read_status?: 'read' | 'unread' | null;
    // This indicates whether the submission has been reassigned by the instructor.
    redo_request: boolean;
    rubric_assessment?: RubricAssessment,
}

export type AssignmentGroup = {
    id: number,
    name: string,
    position: number,
    group_weight: number,
    sis_source_id?: string,
    integration_data?: Record<string, string>,
    assignments: IAssignmentData[],
    rules: unknown,
}