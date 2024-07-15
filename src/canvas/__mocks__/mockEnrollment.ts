import {IEnrollmentData, IUserData} from "@/canvas/canvasDataDefs";
import {mockUserData} from "@/canvas/__mocks__/mockUserData";

export const mockEnrollment: IEnrollmentData = {
    id: 1,
    user_id: 1,
    type: 'StudentEnrollment',
    enrollment_state: 'active',
    course_id: 1,
    user: {...mockUserData, id: 1, name: 'Student Name', sis_user_id: '12345'} as IUserData,
    // Add other necessary properties
};