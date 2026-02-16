import AssignmentKind from "@ueu/ueu-canvas";
import {rubricsForCourseGen, IRubricData, IRubricAssociationData, IAssignmentData} from "@ueu/ueu-canvas";
import {MessageResult, testResult} from "@publish/fixesAndUpdates/validations/utils";
import {CourseValidation, RunTestFunction} from "@publish/fixesAndUpdates/validations/types";

type RunParams = { id: number };
type ValidationUserData = {
    pairs: [assignment: IAssignmentData, rubric: IRubricData | null][],
    rubrics: IRubricData[],
    assignments: IAssignmentData[],
}
type ResultUserData = undefined

const run: RunTestFunction<RunParams, ValidationUserData> = async ({id: courseId}: RunParams) => {


    const rubricGen = rubricsForCourseGen(courseId, {
        include: ['assignment_associations']
    });
    const badRubricNamePairs: [IAssignmentData, IRubricData][] = [];
    const rubricToAssignmentLut: Record<number, IRubricData> = {};
    const assignments:IAssignmentData[] = [];
    const rubrics:IRubricData[] = [];
    for await (const rubric of rubricGen) {
        rubric.associations?.forEach((association: IRubricAssociationData) => {
            if (association.association_type != "Assignment") return;
            rubricToAssignmentLut[association.association_id] = rubric;
        })
        rubrics.push(rubric);
    }


    const assignmentGen = AssignmentKind.dataGenerator(courseId);
    for await (const assignment of assignmentGen) {
        const rubric = rubricToAssignmentLut[assignment.id];
        const rubricName = rubric.title.toLocaleLowerCase().trim();
        const assignmentName = assignment.name.toLocaleLowerCase().trim();

        if (rubricName.includes(assignmentName) || assignmentName.includes(assignmentName))
            continue;

        badRubricNamePairs.push([assignment, rubric]);
        assignments.push(assignment);
    }

    const userData: ValidationUserData = {
        pairs: badRubricNamePairs,
        assignments,
        rubrics,
    }
    return testResult(badRubricNamePairs.length == 0, {
        failureMessage: badRubricNamePairs.map<MessageResult>(([assignment, rubric]) => ({
            bodyLines: [`Rubric: ${rubric.title} \n Assignment: ${assignment.name}`],
            links: [AssignmentKind.getHtmlUrl(courseId, assignment.id)]
        }))
    });
}


export const rubricsConsistentWithAssignment: CourseValidation<RunParams,  ValidationUserData, undefined> = {
    name: "Rubrics Consistent With Assignments",
    description: "Rubric Names Match Assignments",
    run,

}


