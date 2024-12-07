import {testResult} from "@publish/fixesAndUpdates/validations/utils";

import {IAssignmentData} from "@canvas/content/assignments/types";
import {Course} from "@canvas/course/Course";
import AssignmentKind from "@canvas/content/assignments/AssignmentKind";
import {CourseFixValidation} from "@publish/fixesAndUpdates/validations/types";
import assignmentKind from "@canvas/content/assignments/AssignmentKind";

export const textSubmissionEnabled: CourseFixValidation<Course, IAssignmentData[]> = {
    name: "Text submission enabled for all assignments",
    description: "All non external-tool assignments allow for online text entry",
    async run(course) {

        try {
            const assignmentGen = AssignmentKind.dataGenerator(course.id);

            const badAssignments = [] as IAssignmentData[];

            for await(const assignment of assignmentGen) {
                if (assignment.submission_types.includes('external_tool')) continue; //Skip external tools as these are a separate case.
                if (!assignment.submission_types.includes('online_text_entry')) badAssignments.push(assignment);
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

        // Sanity check to filter out external_tool assignments
        const validAssignments = badAssignments.filter(ba => !ba.submission_types.includes('external_tool'));

        if (validAssignments.length === 0) {
            return testResult(false, {failureMessage: "No valid assignments to update"});
        }

        const results = await Promise.all(validAssignments.map((ba) => assignmentKind.put(
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