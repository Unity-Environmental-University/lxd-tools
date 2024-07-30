import {IAssignmentData} from "@/canvas/content/assignments/types";
import {Assignment} from "@/canvas/content/assignments/Assignment";

export type UpdateAssignmentDueDatesOptions = {
    courseId?: number,
}

export async function updateAssignmentDueDates(offset: number, assignments: IAssignmentData[], options?: UpdateAssignmentDueDatesOptions) {

    const promises: Promise<any>[] = [];
    const returnAssignments: Assignment[] = [];
    let {courseId} = options ?? {};
    if (!courseId && courseId !== 0) {
        courseId = assignments[0].course_id;
    }
    if (offset === 0 || offset) {
        for await (let data of assignments) {
            const assignment = new Assignment(data, courseId);
            returnAssignments.push(assignment);
            promises.push(assignment.dueAtTimeDelta(Number(offset)));
        }
    }
    await Promise.all(promises);
    return returnAssignments;
}