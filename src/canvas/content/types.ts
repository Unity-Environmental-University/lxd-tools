import {DateString} from "@/canvas/content/index";
import {CanvasData} from "@/canvas/canvasDataDefs";
import {IRubricCriterionData} from "@/canvas/rubrics";

export interface AssignmentDate extends CanvasData {
    id: number,
    base?: boolean,
    title: string,
    due_at?: DateString | null,
    lock_at?: DateString | null,
    unlock_at?: DateString | null,
}

export interface IAssignmentData<IntegrationDataType = Record<string, any>> extends CanvasData {
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
    integration_data?: IntegrationDataType,
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

export type SubmissionType = 'discussion_topic' | 'online_quiz' | 'on_paper' | 'none' |
    'external_tool' | 'online_text_entry' | 'online_url'

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