import {Course} from "@/canvas/course/Course";
import {Assignment, assignmentDataGen} from "@/canvas/content/Assignment";
import {ICourseData} from "@/canvas/courseTypes";
import {IEnrollmentData, IUserData} from "@/canvas/canvasDataDefs";
import {renderAsyncGen} from "@/canvas/fetch";
import {AssignmentsCollection} from "@/ui/speedGrader/AssignmentsCollection";
import {getRows} from "@/ui/speedGrader/getData/getRows";
import {IAssignmentData, IAssignmentSubmission} from "@/canvas/content/types";
import {Account} from "@/canvas/Account";
import {render} from "@testing-library/react";
import { fetchJson } from "@/canvas/fetch/fetchJson";
import {ITermData} from "@/canvas/Term";
import {getPagedData, getPagedDataGenerator} from "@/canvas/fetch/getPagedDataGenerator";
import {moduleGenerator} from "@/canvas/course/modules";

export async function csvRowsForCourse(course: ICourseData, assignment: IAssignmentData | null = null) {
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
            course: course,
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