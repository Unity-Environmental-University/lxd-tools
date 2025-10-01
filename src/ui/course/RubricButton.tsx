import {Course} from "@canvas/course/Course";
import { getRubric, rubricAssociationUrl, updateRubricAssociation } from "@/canvas";
import {getContentKindFromUrl} from "@canvas/content/__mocks__/determineContent";

interface RubricButtonProps {
    course: Course,
}

export function RubricButton({course}: RubricButtonProps) {
    function rubricPull(course: Course) {
        try {
            const devCourse = await course.getParentCourse();
            if (devCourse) {
                //TODO: Match the BP rubric to a DEV rubric(by title? by content?)
                const rubricMatchId: number = /*Match rubric in DEV to rubric in BP*/;
                if (rubricMatchId) {
                    const matchedRubric = await getRubric(devCourse.id, rubricMatchId);
                    //TODO: Pull matchedRubric into BP/replace current rubric with matchedRubric
                    const contentKind = getContentKindFromUrl(document.documentURI);
                    //TODO: Correctly handle kinds
                    if (contentKind === "AssignmentKind" || contentKind === "DiscussionKind") {
                        //Get the rubric association
                        const rubricAssociation = rubricAssociationUrl(course.id, /*TODO: assignmentID*/);
                        //turn rubricAssociation into a number(id)
                        const rubricAssociationId = parseInt(rubricAssociation.split('/').pop() ?? "0");
                        //Associate the rubric with the assignment
                        //TODO: Handoff proper args
                        await updateRubricAssociation(course.id, rubricAssociationId);
                    }
                }
            }
        } catch (e) {
            console.error(e);
        }
    }

    //Not super well thought through, here as a placeholder for now
    return <button onClick={e => rubricPull(course)}>Rubric</button>
}