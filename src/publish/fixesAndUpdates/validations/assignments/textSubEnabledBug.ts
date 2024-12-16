import {Course} from "@canvas/course/Course";
import {CourseValidation} from "@publish/fixesAndUpdates/validations/types";
import AssignmentKind from "@canvas/content/assignments/AssignmentKind";
import {testResult} from "@publish/fixesAndUpdates/validations/utils";
import {IAssignmentData} from "@canvas/content/types";


export const textSubEnabledBug: CourseValidation<Course, IAssignmentData[]> = {
    name: "Check Discussions and Quizzes",
    description: "Ensure that discussions and quizzes are not adversely affected but the bug in 2.7.7 (added text_entry to discussions and quizzes).",
    async run(course) {
        try {
            const assignmentGen = AssignmentKind.dataGenerator(course.id);
            const affectedAssignments = [] as IAssignmentData[];

            for await (const assignment of assignmentGen) {
                //If there's no text entry then there's no problem
                if(!assignment.submission_types.includes('online_text_entry')) continue;
                // Add logic to check if metadata is intact or needs fixing.
                if (assignment.submission_types.includes('discussion_topic') ||
                    assignment.submission_types.includes('online_quiz') ||
                    assignment.submission_types.includes('external_tool')) {
                    affectedAssignments.push(assignment);
                }
            }

            return testResult(affectedAssignments.length === 0, {
                failureMessage: affectedAssignments.map(a => `${a.name} has metadata issues.`),
                links: affectedAssignments.map(l => l.html_url),
                userData: [...affectedAssignments],
            });
        } catch (e) {
            return testResult(false, { failureMessage: String(e) });
        }
    },

    // async fix(course, result) {
    //     result ??= await this.run(course);
    //     const affectedAssignments = result.userData;
    //
    //     if (!affectedAssignments) return testResult(false, { failureMessage: "Failed to fetch affected assignments" });
    //
    //     if (affectedAssignments.length === 0) {
    //         return testResult(false, { failureMessage: "No issues found with discussions or quizzes" });
    //     }
    //
    //     const firstWaveResults = await Promise.all(affectedAssignments.map((assignment) => {
    //
    //         assignment.submission_types
    //         AssignmentKind.put(course.id, assignment.id, {
    //
    //         })
    //     }));
    //
    //
    //     const results = firstWaveResults;
    //
    //     const links = results.map(r => r.html_url);
    //     return testResult(true, { links, notFailureMessage: results.map(r => `${r.name} metadata restored`) });
    // }
};

export default textSubEnabledBug;
