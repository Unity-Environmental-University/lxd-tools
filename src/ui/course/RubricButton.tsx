import {Course} from "@canvas/course/Course";
import {
    getContentDataFromUrl, IAssignmentData, IDiscussionData,
    putContentConfig, putContentFunc
} from "@/canvas";
import { getSingleCourse } from "@canvas/course";
import { IQuizData } from "@canvas/content/quizzes/types";
import { IPageData } from "@canvas/content/pages/types";
import {getAssignmentData} from "@canvas/content/assignments/legacy";



interface RubricButtonProps {
    course: Course,
}

//State management is going to probably come back to bite me
    //The only things passing between functions are course and header

export function RubricButton({course}: RubricButtonProps) {
    async function insertRubric(course: Course) {
        let relatedCourse: Course | undefined;
        if (course.isDev) {
           relatedCourse = await getSingleCourse('BP_' + course.baseCode, course.getAccountIds())
        } else if (course.isBlueprint()) {
            relatedCourse = await course.getParentCourse();
        } else {
            throw new Error("Course is not a blueprint or dev course");
        }

        if(!relatedCourse) throw new Error("Related course not found");

        const page = document.documentURI;
        const contentData = await getContentDataFromUrl(page, { });

        let assignment: IAssignmentData | undefined;
        let relatedAssignment: IAssignmentData | undefined;

        if(isAssignment(contentData)) {
            assignment = contentData as IAssignmentData;
            relatedAssignment = await getAssignmentByName(relatedCourse, assignment.name);
            if(!relatedAssignment) throw new Error("Related assignment not found");
        } else if(isDiscussion(contentData)) {
            const discussion = contentData as IDiscussionData;
            if(!discussion.assignment_id) throw new Error(
                "Discussion does not have an assignment id. This is likely because it's an ungraded discussion."
            );
            assignment = await getAssignmentData(course.id, discussion.assignment_id);
            relatedAssignment = await getDiscussionByName(course, discussion.title);
            if(!relatedAssignment) throw new Error("Related discussion not found");
            if(!relatedAssignment.assignment_id) throw new Error(
                "Related discussion does not have an assignment id. This is likely because it's an ungraded discussion."
            );
        } else {
            throw new Error("Content is not an assignment or discussion");
        }

        if(!assignment) throw new Error("Assignment data not found");
        if(!relatedAssignment) throw new Error("Related assignment data not found");

        if(!relatedAssignment.rubric) throw new Error("Related assignment does not have a rubric");
            try {
                if(assignment.rubric) {
                    assignment.rubric = assignment.rubric.map( (criterion, i) => ({
                        ...relatedAssignment.rubric![i],
                        id: criterion.id
                    }));
                    const putAssignment = putContentFunc(
                        (courseId, assignmentId) => `/api/v1/courses/${courseId}/assignments/${assignmentId}`
                    );
                    await putAssignment(course.id, assignment.id, putContentConfig)
                } else {
                    //TODO; Do we need to generate a unique id number
                    assignment.rubric = relatedAssignment.rubric;
                    //TODO; Does the process of putting need to be different for discussion?
                    const putAssignment = putContentFunc(
                        (courseId, assignmentId) => `/api/v1/courses/${courseId}/assignments/${assignmentId}`
                    );
                    await putAssignment(course.id, assignment.id, putContentConfig)
                }
            } catch (e) {
                console.error(e);
                throw new Error("Failed to update assignment rubric");
            }
    }

    function isAssignment(contentData: IDiscussionData | IAssignmentData | IPageData | IQuizData | undefined ) {
        return (typeof contentData === "object" &&
            contentData !== null &&
                "submission_types" in contentData &&
                "points_possible" in contentData
        );
    }

    function isDiscussion(contentData: IDiscussionData | IAssignmentData | IPageData | IQuizData | undefined ) {
        return ( typeof contentData === "object" &&
            contentData !== null &&
                "discussion_type" in contentData &&
                "title" in contentData
        );
    }

    async function getAssignmentByName(course: Course, name: string) {
        const assignments = await course.getAssignments();

        for(const assignment of assignments) {
            if(assignment.name === name) {
               return assignment.data as IAssignmentData;
            }
        }
    }

    async function getDiscussionByName(course: Course, name: string) {
        const discussions = await course.getDiscussions();

        for(const discussion of discussions) {
            if(discussion.name === name) {
                const discussionData = discussion.data as IDiscussionData;
                if(!discussionData.assignment_id) throw new Error("Discussion does not have an assignment id. This is likely because it's an ungraded discussion.")
                return await getAssignmentData(course.id, discussionData.assignment_id)
            }
        }
    }

    //Not super well thought through, here as a placeholder for now
    return <button onClick={e => insertRubric(course)}>Rubric</button>
}

//TODO; This may need to be adjusted to post a rubric and update the association instead of overwriting the rubric
    // Basically, can I just update the rubric information and post that with the assignment, update the rubric with the
    // rubric information and post that, or do I need to create a new rubric and associate that with the assignment.

// What this currently does is finds the assignment/discussion's assignment object and replaces it's rubric element with
// the relatedAssignment rubric and then puts the updated information