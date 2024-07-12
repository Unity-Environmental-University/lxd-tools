import {
    getCriteriaInfo,
    getInstructorName,
    getCritIdsAndAssessments,
    getSubmissionBaseRow,
    CriteriaInfo, parseSubmissions, submissionHeader
} from '../getRows';
import { IUserData, CanvasData, IEnrollmentData, IModuleData } from '@/canvas/canvasDataDefs';
import { AssignmentsCollection } from '@/ui/speedGrader/AssignmentsCollection';


import {mockAssignmentData} from "@/canvas/content/__mocks__/mockContentData";
import {mockUserData} from "@/canvas/__mocks__/mockUserData";
import {IAssignmentData} from "@/canvas/content/types";
import {getModuleInfo} from "@/ui/speedGrader/modules";


jest.mock('@/ui/speedGrader/modules')
describe('getCriteriaInfo', () => {
    it('should return null if assignment does not have a rubric', () => {
        const assignment: IAssignmentData = {...mockAssignmentData, rubric: undefined};
        expect(getCriteriaInfo(assignment)).toBeNull();
    });

    it('should correctly process the rubric and return criteria info', () => {
        const assignment: IAssignmentData = {
            ...mockAssignmentData,
            rubric: [
                {
                    id: 'crit1',
                    ratings: [{id: 'rating1', description: 'Rating 1', points: 5}],
                    points: 0,
                    criterion_use_range: false
                },
                {
                    id: 'crit2',
                    ratings: [{id: 'rating2', description: 'Rating 2', points: 5}],
                    points: 0,
                    criterion_use_range: false
                }
            ]
        };
        const [crit1, crit2] = assignment.rubric!;
        const expected = {
            order: { crit1: 0, crit2: 1 },
            ratingDescriptions: {
                crit1: { rating1: 'Rating 1' },
                crit2: { rating2: 'Rating 2' }
            },
            critsById: {
                crit1,
                crit2
            }
        };
        expect(getCriteriaInfo(assignment)).toEqual(expected);
    });
});

describe('getInstructorName', () => {
    it('should return "No Instructor Found" if no instructors are provided', () => {
        expect(getInstructorName([])).toBe('No Instructor Found');
    });

    it('should return the name of a single instructor', () => {
        const instructors: IUserData[] = [{...mockUserData, name: 'John Doe' }];
        expect(getInstructorName(instructors)).toBe('John Doe');
    });

    it('should return a comma-separated list of instructor names', () => {
        const instructors: IUserData[] = ['John Doe', 'Jane Smith'].map(a => ({...mockUserData, name: a}));
        expect(getInstructorName(instructors)).toBe('John Doe,Jane Smith');
    });
});

describe('getCritIdsAndAssessments', () => {
    it('should correctly process rubric assessments and return crit ids and assessments', () => {
        const rubricAssessment = {
            crit1: { points: 5, rating_id: 'rating1' },
            crit2: { points: 3 }
        };
        const criteriaInfo:CriteriaInfo = {
            critsById: {}, order: {},
            ratingDescriptions: { crit1: { rating1: 'Rating 1' } }
        };
        const [critIds, critAssessments] = getCritIdsAndAssessments(rubricAssessment, criteriaInfo);

        expect(critIds).toEqual(['crit1', 'crit2']);
        expect(critAssessments).toEqual([
            { id: 'crit1', points: 5, rating: 'Rating 1' },
            { id: 'crit2', points: 3, rating: null }
        ]);
    });

    it('should handle cases where rubric assessment is null', () => {
        const [critIds, critAssessments] = getCritIdsAndAssessments(null);
        expect(critIds).toEqual([]);
        expect(critAssessments).toEqual([]);
    });
});

describe('getSubmissionBaseRow', () => {

    it('should return correct base row for a submission', () => {
        const baseRow = ['term', 'instructor', 'baseCode', 'section'];
        const enrollment:IEnrollmentData = { user: { ...mockUserData, name: 'John Doe', sis_user_id: '123' }, enrollment_state: 'active' };
        const modules:IModuleData[] = [];
        const assignmentsCollection = new AssignmentsCollection([mockAssignmentData]);
        const submission = {
            assignment: { id: '1', name: 'Assignment 1' },
            workflow_state: 'submitted'

        };
        const moduleInfo = {
            weekNumber: 1,
            moduleName: 'Module 1',
            numberInModule: 1,
            type: 'Assignment'
        };
        (getModuleInfo as jest.Mock).mockReturnValue(moduleInfo);

        const result = getSubmissionBaseRow({ baseRow, enrollment, modules, assignmentsCollection, submission });
        expect(result).toEqual([
            'term',
            'instructor',
            'baseCode',
            'section',
            'John Doe',
            '123',
            'active',
            1,
            'Module 1',
            'Assignment',
            1,
            '1',
            'Assignment 1',
            'submitted'
        ]);
    });
});

describe('submissionHeader', () => {
    it('should return correct submission header', () => {
        const submissionBaseRow = ['base', 'row'];
        const submission = { grade: 'A' };
        const assignment = { ...mockAssignmentData, id: 1, name: 'Assignment 1', points_possible: 10 };
        const rubricId = 'rubric1';

        const result = submissionHeader(submissionBaseRow, submission, assignment, rubricId);
        expect(result).toEqual([
            'base',
            'row',
            'rubric1',
            'Total',
            'Total',
            'A',
            10
        ]);
    });
});

describe('parseSubmissions', () => {
        const user = { ...mockUserData, id: 1 };
    it('should return an empty array if user submissions do not match user ID', () => {
        const userSubmissions = [{ user_id: 2, submissions: [] }];

        expect(parseSubmissions(user, userSubmissions)).toEqual([]);
    });

    it('should return submissions array if user submissions match user ID', () => {
        const userSubmissions = [{ user_id: 1, submissions: [{ id: 'submission1' }] }];

        expect(parseSubmissions(user, userSubmissions)).toEqual([{ id: 'submission1' }]);
    });

    it('should return array with single entry if submissions are not nested', () => {
        const userSubmissions = [{ user_id: 1, id: 'submission1' }];

        expect(parseSubmissions(user, userSubmissions)).toEqual([{ user_id: 1, id: 'submission1' }]);
    });
});