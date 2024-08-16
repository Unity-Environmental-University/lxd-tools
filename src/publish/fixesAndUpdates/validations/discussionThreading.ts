import {
    badContentFixFunc,
    badContentRunFunc,
    CourseFixValidation,
    testResult
} from "@/publish/fixesAndUpdates/validations/index";
import {projectRegex} from "@/publish/fixesAndUpdates/validations/courseSpecific/capstoneProjectValidations";
import {Course} from "@/canvas/course/Course";
import {IDiscussionData} from "@/canvas/content/discussions/types";
import {DiscussionKind} from "@/canvas/content/discussions/DiscussionKind";

export const discussionThreadingValidation: CourseFixValidation<Course, IDiscussionData[], IDiscussionData[]> = {
    name: "Discussion Threading Turned on",
    description: `Discussion Threading is turned on for all discussions in this course'`,
    async run(course) {
        const discussionGen = DiscussionKind.dataGenerator(course.id);
        const affectedDiscussions = [] as IDiscussionData[];
        for await (let discussionData of discussionGen) {
            if (['not_threaded', 'side_comment'].includes(discussionData.discussion_type)) {
                affectedDiscussions.push(discussionData);
            }
        }
        return testResult(affectedDiscussions.length === 0, {
            userData: affectedDiscussions,
            failureMessage: {
                bodyLines: ["Non Threaded Discussions Found: ", ...affectedDiscussions.map(a => a.title)]
            },
            links: affectedDiscussions.map(a => DiscussionKind.getHtmlUrl(course.id, a.id))
        })
    },
    async fix(course, result) {
        if (!result) result = await (this.run(course));
        if (result.success) return testResult("not run", {notFailureMessage: "No need for fix"});
        const discussionDatas = result.userData;
        if (!discussionDatas) return testResult(false, {failureMessage: "Fix "});

        const results = await Promise.all(discussionDatas.map(async data => {
            return await DiscussionKind.put(course.id, data.id, {
                discussion_type: 'threaded'
            })
        }));
        return testResult(!results.find(a => a.discussion_type != 'threaded'), {
            failureMessage: {
                bodyLines: [
                    "Failed to fix",
                    ...results
                        .filter(a => a.discussion_type !== 'threaded')
                        .map(a => a.title)
                ]
            }
        })


    },


}


export default [discussionThreadingValidation];