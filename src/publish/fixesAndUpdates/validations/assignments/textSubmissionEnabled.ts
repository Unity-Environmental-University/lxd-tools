import {testResult} from "@publish/fixesAndUpdates/validations/utils";
import {Course} from "@ueu/ueu-canvas/course/Course";
import AssignmentKind from "@ueu/ueu-canvas/content/assignments/AssignmentKind";
import assignmentKind from "@ueu/ueu-canvas/content/assignments/AssignmentKind";
import {CourseFixValidation, RunTestFunction} from "@publish/fixesAndUpdates/validations/types";
import {validateTestFuncGen} from "@publish/fixesAndUpdates/validations/validateTestFuncGen";
import {IAssignmentData} from "@ueu/ueu-canvas/content/types";

// Updated skip function to include checks for problematic combinations
const shouldSkipAssignment = validateTestFuncGen<IAssignmentData>(
    (ba) => ba.submission_types.includes('external_tool'),
    (ba) => ba.submission_types.includes('discussion_topic') || ba.submission_types.includes('online_quiz'),
    (ba) => ba.submission_types.includes('online_text_entry'),
    (ba) => ba.submission_types.includes('none'),
    (ba) => ba.submission_types.includes('on_paper'),
);


const run: RunTestFunction<Course, IAssignmentData[]> = async (course) => {
    try {
        const assignmentGen = AssignmentKind.dataGenerator(course.id);

        const badAssignments = [] as IAssignmentData[];

        for await (const assignment of assignmentGen) {
            if (shouldSkipAssignment(assignment)) badAssignments.push(assignment);
        }

        return testResult(badAssignments.length === 0, {
            failureMessage: badAssignments.map(a => `${a.name} does not allow text entry submission.`),
            links: badAssignments.map(l => l.html_url),
            userData: badAssignments,
        });
    } catch (e) {
        return testResult(false, {failureMessage: String(e)});
    }
}
export const textSubmissionEnabled: CourseFixValidation<Course, IAssignmentData[]> = {
    name: "Text submission enabled for all assignments",
    description: "All non external-tool assignments allow for online text entry",
    run,
    async fix(course, result) {
        result ??= await run(course);
        const badAssignments = result.userData;

        if (!badAssignments) return testResult(false, {failureMessage: "Failed to fetch bad assignments"});

        if (badAssignments.length === 0) {
            return testResult(false, {failureMessage: "No valid assignments to update"});
        }

        // Only update those assignments that require the 'online_text_entry' submission type
        const results = await Promise.all(
            badAssignments.map(async (ba) => {
                // Here we're checking to add the online_text_entry submission type if it's missing
                if (!ba.submission_types.includes("online_text_entry")) {
                    return assignmentKind.put(
                        course.id, ba.id, {
                            assignment: {
                                submission_types: [...ba.submission_types, "online_text_entry"]
                            }
                        });
                }
                return null;
            })
        );

        const successfulResults = results.filter(r => r !== null);
        const links = successfulResults.map(r => r.html_url);
        const notFailureMessage = successfulResults.map(r => `${r.name} submission types updated to ${r.submission_types.join(', ')}`);

        return testResult(true, {links, notFailureMessage});
    }
}

export default textSubmissionEnabled;
