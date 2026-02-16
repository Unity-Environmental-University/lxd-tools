import { csvRowsForCourse, csvEncode } from "../csvRowsForCourse";
import { assignmentDataGen } from "@ueu/ueu-canvas";
import fetchMock from "jest-fetch-mock";
import { getRows } from "@/ui/speedGrader/getData/getRows";
import { mockCourseData } from "@ueu/ueu-canvas";
import { mockAssignmentData } from "@ueu/ueu-canvas";
import { Account } from "@ueu/ueu-canvas";

import * as assignmentsApi from "@ueu/ueu-canvas";

jest.mock("@/canvas/fetch/utils");
jest.mock("@/ui/speedGrader/getData/getRows");
jest.mock("@/canvas/fetch/getPagedDataGenerator");

import * as moduleApi from "@ueu/ueu-canvas";

import { mockAsyncGen } from "@/__mocks__/utils";
import { getPagedData, getPagedDataGenerator } from "@ueu/ueu-canvas";

import mockModuleData from "@ueu/ueu-canvas";
import { mockUserData } from "@ueu/ueu-canvas";
import { Assignment } from "@ueu/ueu-canvas";
import { SectionData } from "@ueu/ueu-canvas";

const generateModulesSpy = jest.spyOn(moduleApi, "moduleGenerator");
const getAccountByIdSpy = jest.spyOn(Account, "getDataById");
const mockAssignmentDataGen = jest.spyOn(assignmentsApi, "assignmentDataGen");
fetchMock.enableMocks();

describe("csvRowsForCourse", () => {
  const mockCourse = { ...mockCourseData, id: 1, account_id: 1, enrollment_term_id: 1 };
  const mockSection = { ...mockCourseData, term_name: "XXXXXXX", id: 1, account_id: 1, enrollment_term_id: 1 };
  const mockAssignment = { ...mockAssignmentData, id: 1 };
  const mockAccount = { root_account_id: 1 };
  const mockUserSubmissions = [{ id: 1 }];
  const mockAssignments = [new Assignment({ ...mockAssignmentData, id: 1, due_at: "2021-01-01" }, mockCourse.id)];
  const mockInstructors = [{ ...mockUserData, id: 1 }];
  const mockModules = [{ ...mockModuleData, id: 1 }];
  const mockEnrollments = [{ id: 1 }];
  const mockTerm = { id: 1 };
  const mockRows = ["row1", "row2"];

  function mockResponses() {
    getAccountByIdSpy.mockResolvedValue(mockAccount);
    (getPagedData as jest.Mock).mockResolvedValueOnce(mockUserSubmissions).mockResolvedValueOnce(mockInstructors);
    (getPagedDataGenerator as jest.Mock).mockReturnValue(mockAsyncGen(mockEnrollments));
    (assignmentDataGen as jest.Mock).mockReturnValue(mockAsyncGen([{ mockAssignmentData }]));
    fetchMock.mockResponseOnce(JSON.stringify(mockTerm));
    generateModulesSpy.mockReturnValue(mockAsyncGen(mockModules));
  }

  beforeEach(() => {
    fetchMock.resetMocks();
  });

  it("should fetch data and return csv rows", async () => {
    mockResponses();
    (getRows as jest.Mock).mockResolvedValue(mockRows);

    const csvRows = await csvRowsForCourse(mockCourse as SectionData, mockAssignment);
    expect(csvRows).toEqual(expect.arrayContaining(mockRows));
  });

  it("should handle null assignment", async () => {
    mockResponses();
    (getRows as jest.Mock).mockResolvedValue(mockRows);

    const csvRows = await csvRowsForCourse(mockCourse, null);
    expect(csvRows).toEqual(expect.arrayContaining(mockRows));
  });
});

describe("csvEncode", () => {
  it("should return empty string for null or undefined", () => {
    expect(csvEncode(null)).toBe("");
    expect(csvEncode(undefined)).toBe("");
  });

  it("should escape double quotes and replace newlines with spaces", () => {
    const input = 'This is a "test"\nwith new lines';
    const expectedOutput = '"This is a ""test"" with new lines"';
    expect(csvEncode(input)).toBe(expectedOutput);
  });

  it("should handle regular strings correctly", () => {
    expect(csvEncode("test")).toBe('"test"');
  });
});
