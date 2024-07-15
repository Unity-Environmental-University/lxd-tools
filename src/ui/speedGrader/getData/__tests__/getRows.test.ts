import { ICourseData  } from '@/canvas/courseTypes';
import { AssignmentsCollection } from '@/ui/speedGrader/AssignmentsCollection';
import { IAssignmentData } from '@/canvas/content/types';
import { IAssignmentSubmission } from '@/canvas/content/assignments';

import { RubricAssessment } from '@/canvas/rubrics';

import { mockCourseData } from "@/canvas/course/__mocks__/mockCourseData";
import {ITermData} from "@/canvas/Term";
import {IEnrollmentData, IModuleData, IUserData} from "@/canvas/canvasDataDefs";
import {mockTermData} from "@/canvas/__mocks__/mockTermData";
import mockModuleData, {mockModuleItemData} from "@/canvas/course/__mocks__/mockModuleData";
import {mockUserData} from "@/canvas/__mocks__/mockUserData";
import {mockAssignmentData} from "@/canvas/content/__mocks__/mockContentData";
import {getRows, IGetRowsConfig} from "@/ui/speedGrader/getData/getRows";
// Mock data
const mockCourse: ICourseData = {
    ...mockCourseData,
    id: 1,
    course_code: 'TEST000',
    name: 'Test Course',
    term: { ...mockTermData, id: 1, name: 'Spring 2024' } as ITermData,
    // Add other necessary properties
};

const mockEnrollment: IEnrollmentData = {
    id: 1,
    user_id: 1,
    type: 'StudentEnrollment',
    enrollment_state: 'active',
    course_id: 1,
    user: { ...mockUserData, id: 1, name: 'Student Name', sis_user_id: '12345' } as IUserData,
    // Add other necessary properties
};

const mockModules: IModuleData[] = [
    { ...mockModuleData, id: 1, name: 'Module 1' },
    // Add other necessary properties
];

const mockUserSubmissions: IAssignmentSubmission[] = [
    {
        assignment_id: 1,
        assignment: {
            ...mockAssignmentData,
            id: 1, name: 'Assignment 1', points_possible: 100, rubric: [], rubric_settings: {id: 'rubric1'}
        } as IAssignmentData,
        body: 'Submission Body',
        grade: 'A-',
        html_url: 'http://example.com',
        preview_url: 'http://example.com/preview',
        score: 95,
        submission_type: 'online_text_entry',
        submitted_at: '2024-01-01T00:00:00Z',
        user_id: 1,
        grader_id: 2,
        graded_at: '2024-01-02T00:00:00Z',
        late: false,
        assignment_visible: true,
        excused: false,
        missing: false,
        late_policy_status: 'none',
        points_deducted: 0,
        seconds_late: 0,
        workflow_state: 'submitted',
        extra_attempts: 0,
        anonymous_id: 'anon1',
        posted_at: '2024-01-03T00:00:00Z',
        read_status: 'read',
        redo_request: false,
        rubric_assessment: {
            'crit1': {points: 10, rating_id: 'rat1'},
            'crit2': {points: 20, rating_id: 'rat2'}
        } as RubricAssessment,
        attempt: 0,
        grade_matches_current_submission: false
    }
];

const mockAssignmentsCollection = new AssignmentsCollection([
    {
        ...mockAssignmentData,
        id: 1, name: 'Assignment 1', points_possible: 100, rubric: [], rubric_settings: { id: 'rubric1' } } as IAssignmentData,
    // Add other necessary assignments
]);

const mockInstructors: IUserData[] = [
    {  ...mockUserData,  id: 2, name: 'Instructor Name' },
    // Add other necessary properties
];

const mockTerm: ITermData = { ...mockTermData,  id: 1, name: 'Spring 2024' };

// Mock implementations
jest.mock('@/ui/speedGrader/modules', () => ({
    getModuleInfo: jest.fn().mockReturnValue({
        weekNumber: 1,
        moduleName: 'Module 1',
        numberInModule: 1,
        type: 'assignment'
    })
}));

jest.mock('@/ui/speedGrader/exportAndRender/csvRowsForCourse', () => ({
    csvEncode: jest.fn(value => value)
}));

describe('getRows', () => {
    it('should generate rows correctly', async () => {
        const args: IGetRowsConfig = {
            course: mockCourse,
            enrollment: mockEnrollment,
            modules: mockModules,
            userSubmissions: mockUserSubmissions,
            assignmentsCollection: mockAssignmentsCollection,
            instructors: mockInstructors,
            term: mockTerm
        };

        const result = await getRows(args);

        expect(result).toEqual([
            'Spring 2024,Instructor Name,TEST000,1,Student Name,12345,active,1,Module 1,assignment,1,Assignment 1,submitted,rubric1,Total,Total,A-,100\n',
            'Spring 2024,Instructor Name,TEST000,1,Student Name,12345,active,1,Module 1,assignment,1,Assignment 1,submitted,crit1,1,Criteria 1,10,10\n',
            'Spring 2024,Instructor Name,TEST000,1,Student Name,12345,active,1,Module 1,assignment,1,Assignment 1,submitted,crit2,2,Criteria 2,20,20\n'
        ]);
    });

    it('should handle missing assignments', async () => {
        const args: IGetRowsConfig = {
            course: mockCourse,
            enrollment: mockEnrollment,
            modules: mockModules,
            userSubmissions: [{
                ...mockUserSubmissions[0],
                assignment: null
            }],
            assignmentsCollection: mockAssignmentsCollection,
            instructors: mockInstructors,
            term: mockTerm
        };

        const result = await getRows(args);

        expect(result).toEqual([]);
    });

    it('should handle missing rubric settings', async () => {
        const args: IGetRowsConfig = {
            course: mockCourse,
            enrollment: mockEnrollment,
            modules: mockModules,
            userSubmissions: [{
                ...mockUserSubmissions[0],
                assignment: {
                    ...mockAssignmentData,
                    ...mockUserSubmissions[0].assignment,
                    rubric_settings: undefined
                }
            }],
            assignmentsCollection: mockAssignmentsCollection,
            instructors: mockInstructors,
            term: mockTerm
        };

        const result = await getRows(args);

        expect(result).toEqual([
            'Spring 2024,Instructor Name,TEST000,1,Student Name,12345,active,1,Module 1,assignment,1,Assignment 1,submitted,No Rubric Settings,Total,Total,A-,100\n',
            'Spring 2024,Instructor Name,TEST000,1,Student Name,12345,active,1,Module 1,assignment,1,Assignment 1,submitted,crit1,1,Criteria 1,10,10\n',
            'Spring 2024,Instructor Name,TEST000,1,Student Name,12345,active,1,Module 1,assignment,1,Assignment 1,submitted,crit2,2,Criteria 2,20,20\n'
        ]);
    });

});
