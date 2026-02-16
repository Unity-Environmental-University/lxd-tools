import { removeGradeTable } from "@publish/fixesAndUpdates/validations/courseContent/removeGradeTable";
import { IPageData } from "@ueu/ueu-canvas";
import { mockAsyncGen } from "@/__mocks__/utils";
import PageKind from "@ueu/ueu-canvas";
import { mockCourseData } from "@ueu/ueu-canvas";
import { Course } from "@ueu/ueu-canvas";

// Mock data
const mockCourse = new Course({ ...mockCourseData, id: 1 });
const mockPageWithSection = {
  page_id: 1,
  body: '<div></div><div class="scaffold-media-box"><h2>Graded Activities</h2></div>',
  htmlContentUrl: "url1",
} as unknown as IPageData;

const mockPageWithoutSection = {
  page_id: 2,
  body: "<div></div><div class='scaffold-media-box'><h2>Other Activities</h2></div>",
  htmlContentUrl: "url2",
} as unknown as IPageData;

jest.mock("@canvas/content/pages/PageKind", () => ({
  dataGenerator: jest.fn(),
  put: jest.fn(),
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
    (PageKind.dataGenerator as jest.Mock).mockReturnValueOnce(mockAsyncGen([mockPageWithoutSection]));

    const result = await removeGradeTable.run(mockCourse);

    expect(result.success).toBe(true);
    expect(result.userData).toEqual([]);
  });

  it("should remove graded activities sections and update page content", async () => {
    (PageKind.dataGenerator as jest.Mock).mockReturnValueOnce(mockAsyncGen([mockPageWithSection]));

    const result = await removeGradeTable.fix(mockCourse);

    expect(PageKind.put as jest.Mock).toHaveBeenCalledWith(1, 1, {
      wiki_page: {
        body: "<div></div>",
      },
    });
    expect(result.success).toBe(true);
  });

  it("should handle errors when removing graded activities sections", async () => {
    (PageKind.dataGenerator as jest.Mock).mockReturnValueOnce(mockAsyncGen([mockPageWithSection]));

    (PageKind.put as jest.Mock).mockImplementationOnce(() => {
      throw new Error("Failed to update content");
    });

    await expect(async () => await removeGradeTable.fix(mockCourse)).rejects.toThrow();
  });
});
