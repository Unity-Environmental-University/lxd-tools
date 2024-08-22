import {csvRowsForCourse, csvEncode} from "../csvRowsForCourse";
import {Course} from "@/canvas/course/Course";
import {assignmentDataGen} from "@/canvas/content/assignments";
import fetchMock from 'jest-fetch-mock';
import {getRows} from "@/ui/speedGrader/getData/getRows";
import {mockCourseData} from "@/canvas/course/__mocks__/mockCourseData";
import {mockAssignmentData} from "@/canvas/content/__mocks__/mockContentData";
import {Account} from "@/canvas/Account";

import * as assignmentsApi from "@/canvas/content/assignments";

jest.mock('@/canvas/fetch/utils');
jest.mock('@/ui/speedGrader/getData/getRows');
jest.mock('@/canvas/fetch/getPagedDataGenerator')

import * as moduleApi from '@/canvas/course/modules';

import {mockAsyncGen} from "@/__mocks__/utils";
import {getPagedData, getPagedDataGenerator} from "@/canvas/fetch/getPagedDataGenerator";

import mockModuleData from "@/canvas/course/__mocks__/mockModuleData";
import {mockUserData} from "@/canvas/__mocks__/mockUserData";
import {Assignment} from "@/canvas/content/assignments/Assignment";
import {SectionData} from "@/canvas/courseTypes";

const generateModulesSpy = jest.spyOn(moduleApi, 'moduleGenerator')
const getAccountByIdSpy = jest.spyOn(Account, 'getDataById');
const mockAssignmentDataGen = jest.spyOn(assignmentsApi, 'assignmentDataGen');
fetchMock.enableMocks();



describe('csvRowsForCourse', () => {
    const mockCourse = {...mockCourseData, id: 1, account_id: 1, enrollment_term_id: 1};
    const mockSection = {...mockCourseData, term_name: 'XXXXXXX', id: 1, account_id: 1, enrollment_term_id: 1};
    const mockAssignment = {...mockAssignmentData, id: 1};
    const mockAccount = {root_account_id: 1};
    const mockUserSubmissions = [{id: 1}];
    const mockAssignments = [ new Assignment({...mockAssignmentData, id: 1, due_at: '2021-01-01'}, mockCourse.id)];
    const mockInstructors = [{...mockUserData, id: 1}];
    const mockModules = [{...mockModuleData, id: 1}];
    const mockEnrollments = [{id: 1}];
    const mockTerm = {id: 1};
    const mockRows = ['row1', 'row2'];


    function mockResponses() {
        getAccountByIdSpy.mockResolvedValue(mockAccount);
        (getPagedData as jest.Mock)
            .mockResolvedValueOnce(mockUserSubmissions)
            .mockResolvedValueOnce(mockInstructors);
        (getPagedDataGenerator as jest.Mock).mockReturnValue(mockAsyncGen(mockEnrollments));
        (assignmentDataGen as jest.Mock).mockReturnValue(mockAsyncGen([{mockAssignmentData}]));
        fetchMock.mockResponseOnce(JSON.stringify(mockTerm));
        generateModulesSpy.mockReturnValue(mockAsyncGen(mockModules));

    }

    beforeEach(() => {
        fetchMock.resetMocks();
    });

    it('should fetch data and return csv rows', async () => {
        mockResponses();
        (getRows as jest.Mock).mockResolvedValue(mockRows);

        const csvRows = await csvRowsForCourse(mockCourse as SectionData, mockAssignment);
        expect(csvRows).toEqual(expect.arrayContaining(mockRows));
    });

    it('should handle null assignment', async () => {
        mockResponses();
        (getRows as jest.Mock).mockResolvedValue(mockRows);

        const csvRows = await csvRowsForCourse(mockCourse, null);
        expect(csvRows).toEqual(expect.arrayContaining(mockRows));
    });
});

describe('csvEncode', () => {
    it('should return empty string for null or undefined', () => {
        expect(csvEncode(null)).toBe('');
        expect(csvEncode(undefined)).toBe('');
    });

    it('should escape double quotes and replace newlines with spaces', () => {
        const input = 'This is a "test"\nwith new lines';
        const expectedOutput = '"This is a ""test"" with new lines"';
        expect(csvEncode(input)).toBe(expectedOutput);
    });

    it('should handle regular strings correctly', () => {
        expect(csvEncode('test')).toBe('"test"');
    });
});
