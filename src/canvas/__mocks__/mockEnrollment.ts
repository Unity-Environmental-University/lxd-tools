import {IUserData} from "@ueu/ueu-canvas/canvasDataDefs";
// TODO: This is currently in the canvas folder and needs to either be found in ueu-canvas, imported into ueu-canvas, or kept local.
import {IEnrollmentData} from "@/canvas/canvasDataDefs";
import {mockUserData} from "@ueu/ueu-canvas/__mocks__/mockUserData";

export const mockEnrollment: IEnrollmentData = {
    id: 1,
    user_id: 1,
    type: 'StudentEnrollment',
    enrollment_state: 'active',
    course_id: 1,
    user: {...mockUserData, id: 1, name: 'Student Name', sis_user_id: '12345'} as IUserData,
    // Add other necessary properties
};