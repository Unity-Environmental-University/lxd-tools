import {assignmentDataGen} from "@ueu/ueu-canvas/content/assignments";
import {ICourseData, SectionData} from "@ueu/ueu-canvas/courseTypes";
import {IUserData} from "@ueu/ueu-canvas/canvasDataDefs";
// TODO: This is currently in the canvas folder and needs to either be found in ueu-canvas, imported into ueu-canvas, or kept local.
import {IEnrollmentData} from "@ueu/ueu-canvas/canvasDataDefs";
import {AssignmentsCollection} from "@/ui/speedGrader/AssignmentsCollection";
import {getRows} from "@/ui/speedGrader/getData/getRows";
import { fetchJson } from "@ueu/ueu-canvas/fetch/fetchJson";
import {ITermData} from "@ueu/ueu-canvas/term/Term";
import {getPagedData, getPagedDataGenerator} from "@ueu/ueu-canvas/fetch/getPagedDataGenerator";
import {moduleGenerator} from "@ueu/ueu-canvas/course/modules";
import {renderAsyncGen} from "@ueu/ueu-canvas/canvasUtils";
import {IAssignmentData, IAssignmentSubmission} from "@ueu/ueu-canvas/content/types";

export async function csvRowsForCourse(course: SectionData | ICourseData, assignment: IAssignmentData | null = null) {
    let csvRows: string[] = [];
    const courseId = course.id;
    const rootAccountId = course.root_account_id;

    const baseSubmissionsUrl = assignment ? `/api/v1/courses/${courseId}/assignments/${assignment.id}/submissions` : `/api/v1/courses/${courseId}/students/submissions`;
    const userSubmissions = await getPagedData<IAssignmentSubmission>(
        baseSubmissionsUrl, {
            queryParams: {
                student_ids: 'all',
                per_page: 5,
                grouped: true,
                include: [
                    'rubric_assessment',
                    'assignment',
                    'user',
                ]
            }
        });
    const assignments = await renderAsyncGen(assignmentDataGen(courseId, {queryParams: {include: ['due_at']}}));
    const instructors = await getPagedData<IUserData>(`/api/v1/courses/${courseId}/users?enrollment_type=teacher`) as IUserData[];
    const modules = await renderAsyncGen(moduleGenerator(courseId, {queryParams: {include: ['items', 'content_details']}}));
    const enrollments = getPagedDataGenerator<IEnrollmentData>(`/api/v1/courses/${courseId}/enrollments?per_page=5`);
    const term = await  fetchJson<ITermData>(`/api/v1/accounts/${rootAccountId}/terms/${course.enrollment_term_id}`);

    const assignmentsCollection = new AssignmentsCollection(assignments);


    for await (const enrollment of enrollments) {
        const out_rows = await getRows({
            enrollment,
            modules,
            userSubmissions,
            term,
            course,
            instructors,
            assignmentsCollection,
        });

        csvRows = csvRows.concat(out_rows);
    }
    return csvRows;
}

// Spreadsheet apps (Excel, Sheets, LibreOffice) evaluate a cell as a formula when it
// starts with one of these characters, even if the value is quoted in the CSV.
// Leading whitespace is allowed for because some apps trim it before evaluating.
const FORMULA_PREFIX = /^(?:[\t\r]|\s*[=+\-@])/;
// Plain numbers such as "-5" or "+1.5e3" cannot be formulas and must stay numeric.
const PLAIN_NUMBER = /^[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?$/;

/**
 * Neutralise a cell value that a spreadsheet would treat as a formula by
 * prefixing it with a single quote (OWASP CSV injection guidance).
 */
export function neutraliseCsvFormula(value: string): string {
    if (FORMULA_PREFIX.test(value) && !PLAIN_NUMBER.test(value)) {
        return `'${value}`;
    }
    return value;
}

export function csvEncode(string: | number | null | undefined | string) {

    if (typeof (string) === 'undefined' || string === null || string === 'null') {
        return '';
    }
    string = String(string);

    if (string) {
        string = neutraliseCsvFormula(string);
        string = string.replace(/(")/g, '"$1');
        string = string.replace(/\s*\n\s*/g, ' ');
    }
    return `"${string}"`;
}