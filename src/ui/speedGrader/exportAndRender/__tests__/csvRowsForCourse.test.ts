import {csvRowsForCourse, csvEncode, neutraliseCsvFormula} from "../csvRowsForCourse";
import {assignmentDataGen} from "@ueu/ueu-canvas/content/assignments";
import fetchMock from 'jest-fetch-mock';
import {getRows} from "@/ui/speedGrader/getData/getRows";
import {mockCourseData} from "@ueu/ueu-canvas/course/__mocks__/mockCourseData";
import {mockAssignmentData} from "@ueu/ueu-canvas/content/__mocks__/mockContentData";
import {Account} from "@ueu/ueu-canvas/Account";

import * as assignmentsApi from "@ueu/ueu-canvas/content/assignments";

jest.mock('@ueu/ueu-canvas/fetch/utils');
jest.mock('@/ui/speedGrader/getData/getRows');
jest.mock('@ueu/ueu-canvas/fetch/getPagedDataGenerator')

import * as moduleApi from '@ueu/ueu-canvas/course/modules';

import {mockAsyncGen} from "@/__mocks__/utils";
import {getPagedData, getPagedDataGenerator} from "@ueu/ueu-canvas/fetch/getPagedDataGenerator";

import mockModuleData from "@ueu/ueu-canvas/course/__mocks__/mockModuleData";
import {mockUserData} from "@ueu/ueu-canvas/__mocks__/mockUserData";
import {Assignment} from "@ueu/ueu-canvas/content/assignments/Assignment";
import {SectionData} from "@ueu/ueu-canvas/courseTypes";

const generateModulesSpy = jest.spyOn(moduleApi, 'moduleGenerator')
const getAccountByIdSpy = jest.spyOn(Account, 'getDataById');
const _mockAssignmentDataGen = jest.spyOn(assignmentsApi, 'assignmentDataGen');
fetchMock.enableMocks();



describe('csvRowsForCourse', () => {
    const mockCourse = {...mockCourseData, id: 1, account_id: 1, enrollment_term_id: 1};
    const _mockSection = {...mockCourseData, term_name: 'XXXXXXX', id: 1, account_id: 1, enrollment_term_id: 1};
    const mockAssignment = {...mockAssignmentData, id: 1};
    const mockAccount = {root_account_id: 1};
    const mockUserSubmissions = [{id: 1}];
    const _mockAssignments = [ new Assignment({...mockAssignmentData, id: 1, due_at: '2021-01-01'}, mockCourse.id)];
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

    it.each([
        ['=HYPERLINK("http://example.invalid","x")', '"\'=HYPERLINK(""http://example.invalid"",""x"")"'],
        ['+1+2', '"\'+1+2"'],
        ['-1+2', '"\'-1+2"'],
        ['@SUM(A1:A2)', '"\'@SUM(A1:A2)"'],
        ['\t=1+1', '"\'\t=1+1"'],
        ['\r=1+1', '"\'\r=1+1"'],
        ['  =1+1', '"\'  =1+1"'],
        ['\n=1+1', '"\' =1+1"'],
    ])('should neutralise formula-like value %j', (input, expected) => {
        expect(csvEncode(input)).toBe(expected);
    });

    it('should leave plain numbers and ordinary text unprefixed', () => {
        expect(csvEncode(-5)).toBe('"-5"');
        expect(csvEncode('-5')).toBe('"-5"');
        expect(csvEncode('+1.5')).toBe('"+1.5"');
        expect(csvEncode('-.5e3')).toBe('"-.5e3"');
        expect(csvEncode(12)).toBe('"12"');
        expect(csvEncode('Smith, Jane')).toBe('"Smith, Jane"');
        expect(csvEncode('a=b')).toBe('"a=b"');
        expect(csvEncode('')).toBe('""');
    });
});

describe('neutraliseCsvFormula', () => {
    it('prefixes formula-like values with a single quote', () => {
        expect(neutraliseCsvFormula('=1+1')).toBe("'=1+1");
        expect(neutraliseCsvFormula('Module 1')).toBe('Module 1');
    });
});
