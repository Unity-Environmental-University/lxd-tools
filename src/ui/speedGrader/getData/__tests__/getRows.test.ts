import {ICourseData} from '@/canvas/courseTypes';
import {AssignmentsCollection} from '@/ui/speedGrader/AssignmentsCollection';
import {IAssignmentData} from '@/canvas/content/types';
import {IAssignmentSubmission} from '@/canvas/content/assignments';

import {IRubricCriterionData, RubricAssessment} from '@/canvas/rubrics';

import {mockCourseData} from "@/canvas/course/__mocks__/mockCourseData";
import {ITermData} from "@/canvas/Term";
import {IModuleData, IUserData} from "@/canvas/canvasDataDefs";
import {mockTermData} from "@/canvas/__mocks__/mockTermData";
import mockModuleData, {mockModuleItemData} from "@/canvas/course/__mocks__/mockModuleData";
import {mockUserData} from "@/canvas/__mocks__/mockUserData";
import {mockAssignmentData} from "@/canvas/content/__mocks__/mockContentData";
import {getRows, IGetRowsConfig} from "@/ui/speedGrader/getData/getRows";
import {mockEnrollment} from "@/canvas/__mocks__/mockEnrollment";
import mockAssignmentSubmission from "@/canvas/content/__mocks__/mockAssignmentSubmission";
import mock = jest.mock;
// Mock data
const mockCourse: ICourseData = {
    ...mockCourseData,
    id: 1,
    course_code: 'TEST000-01',
    name: 'Test Course',
    term: {...mockTermData, id: 1, name: 'Spring 2024'} as ITermData,
};

const mockModules: IModuleData[] = [
    {
        ...mockModuleData, id: 1, name: 'Module 1', items: [
            {...mockModuleItemData, title: "Assignment 1", content_id: 1}
        ]
    },
];

const mockRubricRating: IRubricCriterionData['ratings'][number] = {
    id: '_a',
    points: 5,
}

const mockRubCriterion: IRubricCriterionData = {
    id: 'crit1', points: 10, ratings: [mockRubricRating]
}


const mockSubmission: IAssignmentSubmission = {
    assignment_id: 1,
    assignment: {
        ...mockAssignmentData,
        id: 1, name: 'Assignment 1', points_possible: 100, rubric: [
            {
                ...mockRubCriterion, description: 'Criteria 1',
                id: 'crit1', points: 50, ratings: [
                    {...mockRubCriterion, id: '_a', points: 25},
                    {...mockRubCriterion, id: '_b', points: 50}
                ]
            },
            {
                ...mockRubCriterion, description: 'Criteria 2',
                id: 'crit2', points: 50, ratings: [
                    {...mockRubCriterion, id: '_c', points: 25},
                    {...mockRubCriterion, id: '_d', points: 50}
                ]
            },
        ], rubric_settings: {id: 'rubric1'}
    } as IAssignmentData,
    body: 'Submission Body',
    grade: 'A-',
    html_url: 'http://example.com',
    preview_url: 'http://example.com/preview',
    score: 75,
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
        'crit1': {points: 50, rating_id: 'rat1'},
        'crit2': {points: 25, rating_id: 'rat2'}
    } as RubricAssessment,
    attempt: 0,
    grade_matches_current_submission: false
};

const mockAssignments = [
    {
        ...mockAssignmentData,
        id: 1, name: 'Assignment 1', points_possible: 100, rubric: [], rubric_settings: {id: 'rubric1'}
    } as IAssignmentData,

];

const mockInstructors: IUserData[] = [
    {...mockUserData, id: 2, name: 'Instructor Name'},
];

const mockTerm: ITermData = {...mockTermData, id: 1, name: 'Spring 2024'};

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
    const mockUserSubmissions = [mockSubmission];
    const mockAssignmentsCollection = new AssignmentsCollection(mockAssignments);

    const row = ([
        assignmentName,
        crit,
        critId,
        fullCrit,
        current,
        total
    ]:string[]) => [
        'Spring 2024',
        'Instructor Name',
        'TEST000',
        '1',
        'Student Name',
        '12345',
        'active',
        1,
        'Module 1',
        'assignment',
        1,
        1,
        assignmentName,
        'submitted',
        crit,
        critId,
        fullCrit,
        current,
        total
    ].join(',') + '\n';

    const expectedRows = [
        row(['Assignment 1','rubric1','Total','Total','A-','100']),
        row(['Assignment 1','crit1','1','Criteria 1','50','50']),
        row(['Assignment 1','crit2','2','Criteria 2','25','50']),
    ]
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

        expect(result).toEqual(expectedRows);
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
    const expectedRows = [
        row(['Assignment 1','No Rubric Settings','Total','Total','A-','100']),
        row(['Assignment 1','crit1','1','Criteria 1','50','50']),
        row(['Assignment 1','crit2','2','Criteria 2','25','50']),
    ]

        const result = await getRows(args);


    });

});
