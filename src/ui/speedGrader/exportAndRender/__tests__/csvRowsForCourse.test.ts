import { csvRowsForCourse, csvEncode } from "../csvRowsForCourse";
import { Course } from "@/canvas/course/Course";
import { Assignment } from "@/canvas/content/assignments";
import fetchMock from 'jest-fetch-mock';
import { getAllPagesAsync } from "@/ui/speedGrader/getAllPagesAsync";
import { renderAsyncGen } from "@/canvas/fetch";
import { getRows } from "@/ui/speedGrader/getData/getRows";
import {mockCourseData} from "@/canvas/course/__mocks__/mockCourseData";
import {mockAssignmentData} from "@/canvas/content/__mocks__/mockContentData";

jest.mock('@/ui/speedGrader/getAllPagesAsync');
jest.mock('@/canvas/fetch');
jest.mock('@/ui/speedGrader/getData/getRows');

fetchMock.enableMocks();

describe('csvRowsForCourse', () => {
    const mockCourse = new Course({ ...mockCourseData, id: 1,  account_id: 1, enrollment_term_id: 1 });
    const mockAssignment = {... mockAssignmentData, id: 1 };
    const mockAccounts = [{ root_account_id: 1 }];
    const mockUserSubmissions = [{ id: 1 }];
    const mockAssignments = [{ rawData: { id: 1, due_at: '2021-01-01' } }];
    const mockInstructors = [{ id: 1 }];
    const mockModules = [{ id: 1 }];
    const mockEnrollments = [{ id: 1 }];
    const mockTerm = { id: 1 };
    const mockRows = ['row1', 'row2'];

  beforeEach(() => {
    fetchMock.resetMocks();
  });

  it('should fetch data and return csv rows', async () => {

    (getAllPagesAsync as jest.Mock).mockResolvedValueOnce(mockAccounts)
      .mockResolvedValueOnce(mockUserSubmissions)
      .mockResolvedValueOnce(mockInstructors)
      .mockResolvedValueOnce(mockEnrollments);
    (renderAsyncGen as jest.Mock).mockResolvedValue(mockAssignments);
    fetchMock.mockResponseOnce(JSON.stringify(mockTerm));
    mockCourse.getModules = jest.fn().mockResolvedValue(mockModules);
    (getRows as jest.Mock).mockResolvedValue(mockRows);

    const csvRows = await csvRowsForCourse(mockCourse, mockAssignment);
    expect(csvRows).toEqual(expect.arrayContaining(mockRows));
  });

  it('should handle null assignment', async () => {
    (getAllPagesAsync as jest.Mock).mockResolvedValueOnce(mockAccounts)
      .mockResolvedValueOnce(mockUserSubmissions)
      .mockResolvedValueOnce(mockInstructors)
      .mockResolvedValueOnce(mockEnrollments);
    (renderAsyncGen as jest.Mock).mockResolvedValue(mockAssignments);
    fetchMock.mockResponseOnce(JSON.stringify(mockTerm));
    mockCourse.getModules = jest.fn().mockResolvedValue(mockModules);
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
