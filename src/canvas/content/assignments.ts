import {canvasDataFetchGenFunc, fetchJson} from "@/canvas/fetch";
import {ICanvasCallConfig} from "@/canvas/canvasUtils";
import {Temporal} from "temporal-polyfill";
import assert from "assert";
import {CanvasData, IGradingRules} from "@/canvas/canvasDataDefs";
import {IRubricCriterionData} from "@/canvas/rubrics";
import {apiAndHtmlContentUrlFuncs, BaseContentItem, DateString, putContentFunc} from "@/canvas/content/index";

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

    rubric: IRubricCriterionData[]
}

export type SubmissionType = 'discussion_topic' | 'online_quiz' | 'on_paper' | 'none' |
    'external_tool' | 'online_text_entry' | 'online_url'

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


export class Assignment extends BaseContentItem {
    static nameProperty = 'name';
    static bodyProperty = 'description';
    static contentUrlTemplate = "/api/v1/courses/{course_id}/assignments/{content_id}";
    static allContentUrlTemplate = "/api/v1/courses/{course_id}/assignments";


    constructor(assignmentData: IAssignmentData, courseId: number) {
        super(assignmentData, courseId);
    }

    async setDueAt(dueAt: Date, config?: ICanvasCallConfig) {
        const sourceDueAt = this.rawData.due_at ? Temporal.Instant.from(this.rawData.due_at) : null;
        const targetDueAt = Temporal.Instant.from(dueAt.toISOString());

        const payload: Record<string, { due_at: string, peer_reviews_assign_at?: string }> = {
            assignment: {
                due_at: dueAt.toISOString(),
            }
        }

        if (this.rawData.peer_reviews && 'automatic_peer_reviews' in this.rawData) {
            const peerReviewTime = this.rawData.peer_reviews_assign_at ? Temporal.Instant.from(this.rawData.peer_reviews_assign_at) : null;
            assert(sourceDueAt, "Trying to set peer review date without a due date for the assignment.")
            if (peerReviewTime) {
                const peerReviewOffset = sourceDueAt.until(peerReviewTime);
                const newPeerReviewTime = targetDueAt.add(peerReviewOffset);
                payload.assignment.peer_reviews_assign_at =
                    new Date(newPeerReviewTime.epochMilliseconds).toISOString();
            }

        }

        let data = await this.saveData(payload, config);


        this.canvasData['due_at'] = dueAt.toISOString();
        return data;

    }

    get rawData() {
        return this.canvasData as IAssignmentData;
    }


    async updateContent(text?: string | null, name?: string | null, config?: ICanvasCallConfig) {
        const assignmentData: Record<string, any> = {};
        if (text) {
            assignmentData.description = text
            this.rawData.description = text
        }
        if (name) {
            assignmentData.name = name;
            this.rawData.name = name;
        }

        return await this.saveData({
            assignment: assignmentData
        }, config)
    }
}

export const assignmentDataGen = canvasDataFetchGenFunc<
    IAssignmentData,
    { courseId: number }
>(({courseId}) => `/api/v1/courses/${courseId}/assignments`)

export async function getAssignmentData(courseId: number, assignmentId: number, config?: ICanvasCallConfig) {
    let url = getAssignmentDataUrl(courseId, assignmentId);
    return await fetchJson<IAssignmentData>(url, config);
}

export const updateAssignmentData = putContentFunc<UpdateAssignmentDataOptions, IAssignmentData>('assignments')
const [getAssignmentDataUrl, getAssignmentHtmlUrl] = apiAndHtmlContentUrlFuncs('assignments');

export  {
    getAssignmentDataUrl,
    getAssignmentHtmlUrl
}
