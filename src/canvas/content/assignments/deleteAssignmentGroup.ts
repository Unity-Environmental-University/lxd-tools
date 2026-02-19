import {fetchJson} from "@ueu/ueu-canvas/fetch/fetchJson";
import {formDataify} from "@ueu/ueu-canvas/canvasUtils";

export default async function(courseId:number, groupId:number, moveAssignmentsTo?: number) {
    const data = moveAssignmentsTo? { move_assignments_to: moveAssignmentsTo} : {};

    const result = await fetchJson(`/api/v1/courses/${courseId}/assignment_groups/${groupId}`, {
        fetchInit: {
            method: 'DELETE',
            body: formDataify(data),
        }
    })


}