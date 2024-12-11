import {testResult} from "@publish/fixesAndUpdates/validations/utils";

import {IAssignmentData} from "@canvas/content/assignments/types";
import {Course} from "@canvas/course/Course";
import AssignmentKind from "@canvas/content/assignments/AssignmentKind";
import assignmentKind from "@canvas/content/assignments/AssignmentKind";
import {CourseFixValidation} from "@publish/fixesAndUpdates/validations/types";
import {validateTestFuncGen} from "@publish/fixesAndUpdates/validations/validateTestFuncGen";


const shouldSkipAssignment = validateTestFuncGen<IAssignmentData>(
    ba => ba.submission_types.includes('external_tool'),
    ba => ba.submission_types.includes('discussion_topic'),
    ba => ba.submission_types.includes('online_text_entry'),
    ba => ba.submission_types.includes('online_quiz'),
);

export const textSubmissionEnabled: CourseFixValidation<Course, IAssignmentData[]> = {
    name: "Text submission enabled for all assignments",
    description: "All non external-tool assignments allow for online text entry",
    async run(course) {

        try {
            const assignmentGen = AssignmentKind.dataGenerator(course.id);

            const badAssignments = [] as IAssignmentData[];

            for await(const assignment of assignmentGen) {
                if(shouldSkipAssignment(assignment)) badAssignments.push(assignment);
            }


            return testResult(badAssignments.length == 0, {
                failureMessage: badAssignments.map(a => `${a.name} does not allow text entry submission.`),
                links: badAssignments.map(l => l.html_url),
                userData: badAssignments,
            });
        } catch (e) {
            return testResult(false, {failureMessage: String(e)})
        }

    },
    async fix(course, result) {
        result ??= await this.run(course);
        const badAssignments = result.userData;

        if (!badAssignments) return testResult(false, {failureMessage: "Failed to fetch bad assignments"});

        if (badAssignments.length === 0) {
            return testResult(false, {failureMessage: "No valid assignments to update"});
        }
        const results = await Promise.all(badAssignments.map((ba) => assignmentKind.put(
            course.id, ba.id, {
                assignment: {
                    submission_types: [...ba.submission_types, "online_text_entry"]
                }
            }))
        );

        const links = results.map(r => r.html_url);
        const notFailureMessage = results.map(r => `${r.name} submission types updated to ${r.submission_types.join(', ')}`);

        return testResult(true, {links, notFailureMessage});
    }
}

export default textSubmissionEnabled;