import {CourseValidation} from "@publish/fixesAndUpdates/validations/types";
import {renderAsyncGen} from "@canvas/canvasUtils";
import {moduleGenerator} from "@canvas/course/modules";
import {assignmentDataGen} from "@canvas/content/assignments";
import {IAssignmentData, SubmissionType} from "@canvas/content/types";
import {testResult} from "@publish/fixesAndUpdates/validations/utils";

export type UnusedAssignmentsCourse = {
    rootAccountId: number;
    id: number;
    courseCode?: string | null;
}

const run = async (course: UnusedAssignmentsCourse) => {
    const modules = await renderAsyncGen(moduleGenerator(course.id, {
        queryParams: {
            include:["items", "content_details"]
        }}
    ));
    const moduleItems = modules.flatMap(mod => mod.items).filter(item => item !== null);

    // Collect content IDs by type
    const discussionIds = new Set(moduleItems.filter(d => d.type === 'Discussion').map(a => a.content_id));
    const quizIds = new Set(moduleItems.filter(q => q.type === 'Quiz').map(q => q.content_id));
    const assignmentIds = new Set(moduleItems.filter(a => a.type === 'Assignment').map(a => a.content_id));

    const assignments = assignmentDataGen(course.id);

    // Find unlisted assignments
    const unlistedAssignments: IAssignmentData[] = [];
    const skipTypes:SubmissionType[] = ['external_tool', 'on_paper', 'none']
    for await (const assignment of assignments) {
        if(assignment.submission_types.filter(a => skipTypes.includes(a)).length > 0) continue; //Skip this assignment if its not a discussion assignment or quiz
        let checkFunc = (assignment:IAssignmentData) => (assignmentIds.has(assignment.id));

        if (assignment.submission_types.includes('online_quiz')) checkFunc = (a) => quizIds.has(a.quiz_id);
        else if (assignment.submission_types.includes('discussion_topic')) checkFunc = (a) => discussionIds.has(a.discussion_topic!.id);

        if (!checkFunc(assignment)) {
            unlistedAssignments.push(assignment);
        }
    }

    return testResult(unlistedAssignments.length === 0, {
        failureMessage: [
            {bodyLines: [`The following assignments were not found in modules for ${course.courseCode}:`]},
            ...unlistedAssignments.map(a => ({
                bodyLines: [a.name],
                links: [a.html_url]
            })),
        ],
        userData: {unlistedAssignments, course},
    });
};
export const courseHasUnusedAssignments: CourseValidation<UnusedAssignmentsCourse, {
    unlistedAssignments: IAssignmentData[],
    course: UnusedAssignmentsCourse,
}> = {
    name: "Assignments not in modules",
    description: "Course has assignments/quizzes/discussions that are not in modules",
    run,
};