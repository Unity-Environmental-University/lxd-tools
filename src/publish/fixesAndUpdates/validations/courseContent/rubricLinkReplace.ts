import {CourseValidation} from "@publish/fixesAndUpdates/validations/types";
import {IDiscussionsHaver} from "@canvas/course/courseTypes";
import {IDiscussionData} from "@/canvas";
import DiscussionKind from "@canvas/content/discussions/DiscussionKind";
import {testResult} from "@publish/fixesAndUpdates/validations/utils";

export const rubricLinkReplace: CourseValidation<IDiscussionsHaver> = {
    name: "Rubric Link Replacer",
    description: "Finds 'View Rubric' buttons with a link to the rubric and replaces them with a #. Will still correctly link to rubric. NOTE: After running this validation, the View Rubric button may not work temporarily. This is a caching issue with your browser and will not effect the course in any way.",
    run: async (course) => {
        const rubricLinkHaver: IDiscussionData[] = [];

        const discussions = DiscussionKind.dataGenerator(course.id);

        for await(const discussion of discussions) {
            if(discussion.message && (
                /<a[^>]*href="(?!#")[^"#]+?"[^>]*>View rubric<\/a>/gi.test(discussion.message) ||
                /<a[^>]*data-api-endpoint="(?!#")[^"#]+?"[^>]*>View rubric<\/a>/gi.test(discussion.message))) {
                rubricLinkHaver.push(discussion);
            }
        }

        if(rubricLinkHaver.length === 0) {
            return testResult(
                true,
                {
                    notFailureMessage: 'All rubrics have already been replaced with #',
                })
        } else {
            return testResult(
                false,
                {
                    failureMessage: rubricLinkHaver.map(discussion => ({
                        bodyLines: [discussion.title],
                        links: [discussion.html_url],
                    })),
                    userData: rubricLinkHaver
                }
            )
        }
    },
    fix: async (course, result) => {
        if(!result) result = await rubricLinkReplace.run(course);
        if(result?.success) return testResult('not run', {notFailureMessage: "No rubrics to fix"});
        if(!result?.userData) return testResult(false, { failureMessage: "Unable to find bad rubrics. Failed to fix."})
        const fixedDiscussions = [] as IDiscussionData[];
        for (const discussion of result.userData) {
            if(discussion.message) {
                discussion.message = discussion.message.replace(
                    /(<a[^>]*)(href=")(?!#")[^"#]+?(".*?>View rubric<\/a>)/gi,
                    '$1$2#$3'
                );
                discussion.message = discussion.message.replace(
                    /(<a[^>]*)(data-api-endpoint=")(?!#")[^"#]+?(".*?>View rubric<\/a>)/gi,
                    '$1$2#$3'
                );
                await DiscussionKind.put(course.id, discussion.id, {
                    message: discussion.message,
                });
            }
            fixedDiscussions.push(discussion);
        }
        return testResult(true, {
            notFailureMessage: `Rubrics fixed: ${fixedDiscussions.map(d => d.title).join(', ')}`
        })
    }
}