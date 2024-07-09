import {CourseValidation, errorMessageResult, MessageResult, testResult} from "./index";
import {Course} from "../../../canvas/course/Course";
import {getRubric, IRubricAssociationData, IRubricData, rubricsForCourseGen} from "../../../canvas/rubrics";
import {IIdHaver} from "../../../canvas/course/courseTypes";
import {assignmentDataGen, getAssignmentData} from "../../../canvas/content";
import {callAll} from "../../../canvas/canvasUtils";

async function getBadRubricAssociations(courseId: number) {
    const rubricGen = rubricsForCourseGen(courseId, {include: ['assignment_associations']});
    const returnPairs: [IRubricData, IRubricAssociationData][] = [];
    for await (let rubric of rubricGen) {
        const associations = rubric.associations;
        const badAssociations = associations && associations
            .filter(assoc => !assoc.use_for_grading)
            .map<[IRubricData, IRubricAssociationData]>(assoc => [rubric, assoc]);
        if (badAssociations && badAssociations.length > 0) returnPairs.push(...badAssociations);
    }
    return returnPairs;
}

export const rubricsTiedToGradesTest: CourseValidation<IIdHaver> = {
    name: "Rubrics update grades",
    description: "All assignment rubrics are tied to the assignment grade",
    run: async (course, config) => {
        try {
            const badAssociations = await getBadRubricAssociations(course.id)
            const failureMessage = await Promise.all(callAll(
                    badAssociations.map(([rubric, assoc]) => async () => {
                        const id = assoc.association_id;
                        const assignment = await getAssignmentData(course.id, id, config);
                        return <MessageResult>{
                            bodyLines: [rubric.title, assignment.name],
                            links: [assignment.html_url]
                        }
                    })
                )
            )
            const result =testResult(badAssociations.length <= 0, {failureMessage})
            console.log(result);
            return result;
        } catch (e) {
            return errorMessageResult(e)
        }
    },
}