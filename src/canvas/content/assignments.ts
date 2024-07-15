import {ICanvasCallConfig} from "@/canvas/canvasUtils";
import {Temporal} from "temporal-polyfill";
import assert from "assert";
import {fetchJson} from "@/canvas/fetch/fetchJson";
import {apiAndHtmlContentUrlFuncs, putContentFunc} from "@/canvas/content/contentGenFuncs";
import {canvasDataFetchGenFunc} from "@/canvas/fetch/canvasDataFetchGenFunc";
import {IAssignmentData, UpdateAssignmentDataOptions} from "@/canvas/content/types";
import {IRubricAssessmentData, RubricAssessment} from "@/canvas/rubrics";
import {ICourseData} from "@/canvas/courseTypes";
import {BaseContentItem} from "@/canvas/content/baseContentItem";


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

