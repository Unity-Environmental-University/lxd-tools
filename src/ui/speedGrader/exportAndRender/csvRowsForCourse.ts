import {Course} from "@/canvas/course/Course";
import {Assignment, assignmentDataGen} from "@/canvas/content/assignments";
import {ICourseData} from "@/canvas/courseTypes";
import {getAllPagesAsync} from "@/ui/speedGrader/getAllPagesAsync";
import {IEnrollmentData, IUserData} from "@/canvas/canvasDataDefs";
import {renderAsyncGen} from "@/canvas/fetch";
import {AssignmentsCollection} from "@/ui/speedGrader/AssignmentsCollection";
import {getRows} from "@/ui/speedGrader/getData/getRows";
import {IAssignmentData} from "@/canvas/content/types";

export async function csvRowsForCourse(course: Course, assignment: Assignment | null = null) {
    let csvRows: string[] = [];
    const courseId = course.id;
    const courseData = course.rawData as ICourseData;

    const accounts = await getAllPagesAsync(`/api/v1/accounts/${courseData.account_id}`);
    const account = accounts[0];
    const rootAccountId = account.root_account_id;

    const baseSubmissionsUrl = assignment ? `/api/v1/courses/${courseId}/assignments/${assignment.id}/submissions` : `/api/v1/courses/${courseId}/students/submissions`;
    const userSubmissions = await getAllPagesAsync(`${baseSubmissionsUrl}?student_ids=all&per_page=5&include[]=rubric_assessment&include[]=assignment&include[]=user&grouped=true`) as IUserData[];
    const assignments = await renderAsyncGen(assignmentDataGen({courseId}, {queryParams: {include: ['due_at']}}));
    const instructors = await getAllPagesAsync(`/api/v1/courses/${courseId}/users?enrollment_type=teacher`) as IUserData[];
    const modules = await course.getModules({
        queryParams: {
            include: ['items', 'content_details']
        }
    })
    const enrollments = await getAllPagesAsync(`/api/v1/courses/${courseId}/enrollments?per_page=5`) as IEnrollmentData[];

    const termsResponse = await fetch(`/api/v1/accounts/${rootAccountId}/terms/${courseData.enrollment_term_id}`);
    const term = await termsResponse.json();
    const assignmentsCollection = new AssignmentsCollection(
        assignments.map(assignment => assignment.rawData as IAssignmentData));


    for (let enrollment of enrollments) {
        let out_rows = await getRows({
            enrollment,
            modules,
            userSubmissions,
            term,
            course: courseData,
            instructors,
            assignmentsCollection,
        });

        csvRows = csvRows.concat(out_rows);
    }
    return csvRows;
}

export function csvEncode(string: | null | undefined | string) {

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