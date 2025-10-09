import {Course} from "@canvas/course/Course";
import {getRubric, IRubricData, NotImplementedException, rubricAssociationUrl, updateRubricAssociation} from "@/canvas";
import {getContentKindFromUrl} from "@/canvas";
import AssignmentKind from "@canvas/content/assignments/AssignmentKind";
import DiscussionKind from "@canvas/content/discussions/DiscussionKind";


interface RubricButtonProps {
    course: Course,
}

//genBlueprintDataForCode is a function that takes a course code and an array of account ids and returns a generator that yields course data.
    //Would be useful here.
//openMainBp is a function that takes a course and opens the main blueprint version of that course.
//Only put this on assignment/discussion pages, don't need to have it on rubric pages.
//This needs to be a two-way mirror for BP/DEV.

export function RubricButton({course}: RubricButtonProps) {
    async function rubricPull(course: Course) {
        try {
            const devCourse = await course.getParentCourse();
            if(!devCourse) throw new Error("Dev course not found");

            const rubricIdRegex = new RegExp('/\/rubrics\/(\d*)/gm');
            const rubricIdString = rubricIdRegex.exec(document.documentURI)?.[1] ?? "0";
            const rubricId = parseInt(rubricIdString);
            const rubric = await getRubric(course.id, rubricId);
            if(!rubric) throw new Error("Rubric not found");

            //TODO: Match the BP rubric to a DEV rubric(by title? by content?)
            const matchingRubric: IRubricData =  findRubricByDevTitle();
            if (!matchingRubric) throw new Error("Matching rubric not found");

            //TODO: Pull matchedRubric into BP/replace current rubric with matchedRubric
            devRubricToBp();
            
            const contentKind = getContentKindFromUrl(document.documentURI);
            //TODO: Correctly handle kinds
            if (contentKind === AssignmentKind || contentKind === DiscussionKind) {
                //Get the rubric association
                const rubricAssociation = rubricAssociationUrl(course.id, /*TODO: assignmentID*/);
                //turn rubricAssociation into a number(id)
                const rubricAssociationId = parseInt(rubricAssociation.split('/').pop() ?? "0");
                //Associate the rubric with the assignment
                //TODO: Handoff proper args
                await updateRubricAssociation(course.id, rubricAssociationId);
            }
        } catch (e) {
            console.error(e);
        }
    }

    const findRubricByDevTitle = () => {
        throw new NotImplementedException();
    }

    const devRubricToBp = () => {
        throw new NotImplementedException();
    }

    //Not super well thought through, here as a placeholder for now
    return <button onClick={e => rubricPull(course)}>Rubric</button>
}