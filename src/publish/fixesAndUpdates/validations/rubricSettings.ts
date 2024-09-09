import {CourseValidation, errorMessageResult, MessageResult, testResult} from "./validations";
import {
    IRubricAssociationData,
    IRubricData,
    rubricsForCourseGen,
    updateRubricAssociation
} from "@/canvas/rubrics";
import {IIdHaver} from "@/canvas/course/courseTypes";
import {updateAssignmentData} from "@/canvas/content/assignments";
import {callAll} from "@/canvas/canvasUtils";
import AssignmentKind from "@/canvas/content/assignments/AssignmentKind";

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

type RubricsTiedToGradeUserDataType = {badAssociations: Awaited<ReturnType<typeof getBadRubricAssociations>>}
export const rubricsTiedToGradesTest: CourseValidation<IIdHaver, RubricsTiedToGradeUserDataType | undefined, undefined> = {
    name: "Rubrics update grades",
    description: "All assignment rubrics are tied to the assignment grade",
    run: async (course, config) => {
        try {
            const badAssociations = await getBadRubricAssociations(course.id)
            const failureMessage = await Promise.all(callAll(
                    badAssociations.map(([rubric, assoc]) => async () => {
                        const id = assoc.association_id;
                        const assignment = await AssignmentKind.get(course.id, id, config);
                        return <MessageResult>{
                            bodyLines: [rubric.title, assignment.name],
                            links: [assignment.html_url]
                        }
                    })
                )
            )
            const result =testResult(badAssociations.length <= 0, {failureMessage,
                userData: {
                badAssociations
            }})
            return result;
        } catch (e) {
            return errorMessageResult(e)
        }
    },
    async fix(course, result) {
        try {
            if(!result) result = await this.run(course);
            const fixedAssociations: IRubricAssociationData[] = [];
            let success = false;
            let { badAssociations } = result?.userData ?? {};
            if(result.success) return testResult('not run', { notFailureMessage: "Validation passed, no need to run."});
            if(!badAssociations) return testResult(false, {failureMessage: "Can't find rubric associations."})
            for (let [ rubric, association ] of badAssociations) {
                if(!association.use_for_grading) {
                    await updateRubricAssociation(course.id, association.id, {
                        id: association.id,
                        rubric_association: { use_for_grading: true }
                    })
                    fixedAssociations.push(association);
                    await updateAssignmentData(course.id, association.id, {
                        assignment: {
                            points_possible: rubric.points_possible
                        }
                    })
                }
            }
            success = fixedAssociations.length === badAssociations.length;

            return testResult(success, {
                links: fixedAssociations.map(a => AssignmentKind.getHtmlUrl(course.id, a.association_id) as string)
            });
        } catch (e) {
            return errorMessageResult(e);
        }
    }
}