import AssignmentKind from "@/canvas/content/assignments/AssignmentKind";
import {Assignment} from "@/canvas/content/assignments/Assignment";
import {IAssignmentData} from "@canvas/content/types";


export const assignmentDataGen = AssignmentKind.dataGenerator;
export const updateAssignmentData = AssignmentKind.put!;



type UpdateAssignmentDueDatesOptions = {
    courseId?: number,
}
export async function updateAssignmentDueDates(offset: number, assignments:IAssignmentData[], options?: UpdateAssignmentDueDatesOptions) {

        const returnAssignments: IAssignmentData[] = [];
        let { courseId } = options ?? {};
        if (!courseId && courseId !== 0) {
            courseId = assignments[0].course_id;
        }
        if (offset === 0 || offset) {
            for await (const data of assignments) {
                const assignment = new Assignment(data, courseId);
                const returnData = await assignment.dueAtTimeDelta(Number(offset)) as IAssignmentData | null;
                if(returnData) {
                    returnAssignments.push(returnData);

                }
            }
        }
        return returnAssignments;
    }
