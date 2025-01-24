import {Course} from "@canvas/course/Course";
import {CourseValidation} from "@publish/fixesAndUpdates/validations/types";
import AssignmentKind from "@canvas/content/assignments/AssignmentKind";
import {testResult} from "@publish/fixesAndUpdates/validations/utils";
import {IAssignmentData} from "@canvas/content/types";


function hasEmptyMetadata(assignment: IAssignmentData) {
    if (assignment.submission_types.includes('online_text_entry')) return null; //falsy but not false -- we dont care about it because we can't tell right now because we know it just wont
    if (assignment.submission_types.includes('discussion_topic') && !assignment.discussion_topic) return true;
    if (assignment.submission_types.includes('online_quiz') && !assignment.quiz_id) return true;
    return false;
}

export const textSubEnabledBug: CourseValidation<Course, {
    affectedAssignments: IAssignmentData[],
    potentiallyAffectedDiscussions: IAssignmentData[],
    potentiallyAffectedQuizzes: IAssignmentData[],
}> = {
    name: "Check Discussions and Quizzes",
    description: "Ensure that discussions and quizzes are not adversely affected but the bug in 2.7.7 (added text_entry to discussions and quizzes).",
    async run(course) {
        try {
            const assignmentGen = AssignmentKind.dataGenerator(course.id);
            const affectedAssignments = [] as IAssignmentData[];
            const potentiallyAffectedDiscussions = [] as IAssignmentData[];
            const potentiallyAffectedQuizzes = [] as IAssignmentData[];
            for await (const assignment of assignmentGen) {
                //If there's no text entry then there's no problem
                if (!assignment.submission_types.includes('online_text_entry')) {
                    if (assignment.submission_types.includes('discussion_topic') && !assignment.discussion_topic) {
                        potentiallyAffectedDiscussions.push(assignment);
                    }
                    if (assignment.submission_types.includes('online_quiz') && !assignment.quiz_id) potentiallyAffectedQuizzes.push(assignment);
                    continue;
                }

                if(assignment.submission_types.includes('online_text_entry') && assignment.submission_types.includes('none')) {
                    affectedAssignments.push(assignment);
                }

                if (assignment.submission_types.includes('discussion_topic') ||
                    assignment.submission_types.includes('online_quiz') ||
                    assignment.submission_types.includes('external_tool')) {
                    affectedAssignments.push(assignment);
                }
            }

            const success = (affectedAssignments.length
                + potentiallyAffectedDiscussions.length
                + potentiallyAffectedQuizzes.length
                === 0);

            const failureMessage = [
                ...affectedAssignments.map(a => ({
                    bodyLines: [`${a.name} has conflicting types.`],
                    links: [a.html_url],
                })),
                ...potentiallyAffectedDiscussions.map(a => ({
                    bodyLines: [`${a.name} has no discussion object.`],
                    links: [a.html_url],
                })),
                ...potentiallyAffectedDiscussions.map(a => ({
                    bodyLines: [`${a.name} has no linked quiz id.`],
                    links: [a.html_url],
                })),
            ];

            const links = [...affectedAssignments, ...potentiallyAffectedDiscussions, ...potentiallyAffectedQuizzes].map(l => l.html_url);


            return testResult(success, {
                failureMessage,
                links,
                userData: {affectedAssignments, potentiallyAffectedQuizzes, potentiallyAffectedDiscussions},
            });
        } catch (e) {
            return testResult(false, {failureMessage: String(e)});
        }
    },

    async fix(course, result) {
        result ??= await this.run(course);
        const {affectedAssignments} = result.userData ?? {};
        const {potentiallyAffectedQuizzes, potentiallyAffectedDiscussions} = result.userData ?? {};

        if (!affectedAssignments) return testResult(false, {failureMessage: "Failed to fetch affected assignments"});

        if (affectedAssignments.length === 0) {
            return testResult(false, {failureMessage: "No issues found with discussions or quizzes"});
        }

        const results = await Promise.all(affectedAssignments.map((assignment) => {
            const submissionTypes = assignment.submission_types.filter(st => st !== 'online_text_entry')
            return AssignmentKind.put(assignment.course_id, assignment.id, {
                assignment: {
                    ...assignment,
                    submission_types: submissionTypes
                }
            });
        }));


        const quizzes = results.filter(a => a.submission_types.includes('online_quiz'));
        const discussions = results.filter(a => a.submission_types.includes('discussion_topic'));
        const affectedQuizAssignments = [...potentiallyAffectedQuizzes ?? [], ...quizzes];
        const affectedDiscussionAssignments = [...potentiallyAffectedDiscussions ?? [], ...discussions];

        const notFailureMessage = results.map(r => `${r.name} metadata restored`);
        const failureMessage = [
            ...affectedQuizAssignments,
            ...affectedDiscussionAssignments,
        ].map(a => ({
            links: [a.html_url],
            bodyLines: [`${a.name} has lost data.`],
        }))


        const links = results.map(r => r.html_url);
        return testResult(failureMessage.length > 0, {links, failureMessage, notFailureMessage});
    }
};

export default textSubEnabledBug;
