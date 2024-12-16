import AssignmentKind from "@/canvas/content/assignments/AssignmentKind";
import {ICanvasCallConfig} from "@/canvas/canvasUtils";
import {Assignment} from "@/canvas/content/assignments/Assignment";
import {IAssignmentData} from "@canvas/content/types";


export const assignmentDataGen = AssignmentKind.dataGenerator;
export const updateAssignmentData = AssignmentKind.put!;



type UpdateAssignmentDueDatesOptions = {
    courseId?: number,
}
export async function updateAssignmentDueDates(offset: number, assignments:IAssignmentData[], options?: UpdateAssignmentDueDatesOptions) {

        const promises: Promise<any>[] = [];
        const returnAssignments: Assignment[] = [];
        let { courseId } = options ?? {};
        if (!courseId && courseId !== 0) {
            courseId = assignments[0].course_id;
        }
        if (offset === 0 || offset) {
            for await (const data of assignments) {
                const assignment = new Assignment(data, courseId);
                returnAssignments.push(assignment);
                promises.push(assignment.dueAtTimeDelta(Number(offset)));
            }
        }
        return returnAssignments;
    }
