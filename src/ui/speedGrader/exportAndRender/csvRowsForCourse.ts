import {Course} from "@/canvas/course/Course";
import {assignmentDataGen} from "@/canvas/content/assignments";
import {ICourseData, SectionData} from "@/canvas/courseTypes";
import {IEnrollmentData, IUserData} from "@/canvas/canvasDataDefs";
import {AssignmentsCollection} from "@/ui/speedGrader/AssignmentsCollection";
import {getRows} from "@/ui/speedGrader/getData/getRows";
import {Account} from "@/canvas/Account";
import {render} from "@testing-library/react";
import { fetchJson } from "@/canvas/fetch/fetchJson";
import {ITermData} from "@/canvas/term/Term";
import {getPagedData, getPagedDataGenerator} from "@/canvas/fetch/getPagedDataGenerator";
import {moduleGenerator} from "@/canvas/course/modules";
import {Assignment} from "@/canvas/content/assignments/Assignment";
import {IAssignmentData, IAssignmentSubmission} from "@/canvas/content/assignments/types";
import {renderAsyncGen} from "@/canvas";

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


    for await (let enrollment of enrollments) {
        let out_rows = await getRows({
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

export function csvEncode(string: | number | null | undefined | string) {

    if (typeof (string) === 'undefined' || string === null || string === 'null') {
        return '';
    }
    string = String(string);

    if (string) {
        string = string.replace(/(")/g, '"$1');
        string = string.replace(/\s*\n\s*/g, ' ');
    }
    return `"${string}"`;
}