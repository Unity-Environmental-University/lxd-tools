import { removeGradeTable } from "@publish/fixesAndUpdates/validations/courseContent/removeGradeTable";
import { testResult } from "@publish/fixesAndUpdates/validations/utils";
import { IPageData } from "@canvas/content/pages/types";
import { mockAsyncGen } from "@/__mocks__/utils";
import PageKind from "@canvas/content/pages/PageKind";
import {mockCourseData} from "@canvas/course/__mocks__/mockCourseData";
import {Course} from "@canvas/course/Course";

// Mock data
const mockCourse = new Course({ ... mockCourseData, id: 1 });
const mockPageWithSection = {
  id: 1,
  body: '<div></div><div class="scaffold-media-box"><h2>Graded Activities</h2></div>',
  updateContent: jest.fn(),
  htmlContentUrl: "url1",
} as unknown as IPageData;

const mockPageWithoutSection = {
  id: 2,
  body: "<div></div><div class='scaffold-media-box'><h2>Other Activities</h2></div>",
  updateContent: jest.fn(),
  htmlContentUrl: "url2",
} as unknown as IPageData;


jest.mock("@canvas/content/pages/PageKind", () => ({
  dataGenerator: jest.fn(),
}));

describe("removeGradeTable", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should identify pages with graded activities sections", async () => {
    (PageKind.dataGenerator as jest.Mock).mockReturnValueOnce(
      mockAsyncGen([mockPageWithSection, mockPageWithoutSection])
    );

    const result = await removeGradeTable.run(mockCourse);

    expect(result.success).toBe(false);
    expect(result.userData).toEqual([mockPageWithSection]);
    expect(result.links).toEqual([mockPageWithSection.htmlContentUrl]);
  });

  it("should return a success result when no pages contain graded activities sections", async () => {
    (PageKind.dataGenerator as jest.Mock).mockReturnValueOnce(
      mockAsyncGen([mockPageWithoutSection])
    );

    const result = await removeGradeTable.run(mockCourse);

    expect(result.success).toBe(true);
    expect(result.userData).toEqual([]);
  });

  it("should remove graded activities sections and update page content", async () => {
    (PageKind.dataGenerator as jest.Mock).mockReturnValueOnce(
      mockAsyncGen([mockPageWithSection])
    );

    const result = await removeGradeTable.fix(mockCourse);

    expect(mockPageWithSection.updateContent).toHaveBeenCalledWith("<div></div>");
    expect(result.success).toBe(true);
  });

  it("should handle errors when removing graded activities sections", async () => {
    (PageKind.dataGenerator as jest.Mock).mockReturnValueOnce(
      mockAsyncGen([mockPageWithSection])
    );

    mockPageWithSection.updateContent.mockImplementationOnce(() => {
      throw new Error("Failed to update content");
    });

    await expect(async () =>  await removeGradeTable.fix(mockCourse) ).rejects.toThrow();

  });
});
