import { courseOverviewLanguageTest } from "../courseOverviewTest";
import { getCourseById } from "@ueu/ueu-canvas";
import { testResult } from "@publish/fixesAndUpdates/validations/utils";
import { Course, mockCourseData } from "ueu_canvas";
import { mockPageData } from "@ueu/ueu-canvas";
import { expect } from "@jest/globals";
import { IPageData } from "@ueu/ueu-canvas";

// Mock the external dependencies
jest.mock("@canvas/course/index");
jest.mock("@canvas/content/pages/PageKind");

import PageKind from "@ueu/ueu-canvas";

describe("courseOverviewLanguageTest - Full Suite", () => {
  let mockCourse: Course;

  beforeEach(() => {
    jest.clearAllMocks();

    mockCourse = mockCourseData;
    PageKind.get = jest.fn().mockResolvedValue({
      ...mockPageData,
      title: "Course Overview",
      url: "course-overview",
      body: `<div>By participating in this course, you agree: code of conduct unity de student handbook honor code academic integrity plagiarism what happens if this occurs more than once first term: second term: third term:</div>
        <div>Please confirm your agreement to the three numbered items above</div>`,
    });

    (getCourseById as jest.Mock).mockResolvedValue({
      isUndergrad: () => true,
    });
  });

  describe("run() logic", () => {
    it("should succeed when all key phrases and confirmation text are present", async () => {
      const validBody = `
        <div>By participating in this course, you agree: code of conduct unity de student handbook honor code academic integrity plagiarism what happens if this occurs more than once first term: second term: third term:</div>
        <div>Please confirm your agreement to the three numbered items above</div>
      `;

      mockCourse.getPages = jest.fn().mockResolvedValue([
        {
          title: "Course Overview",
          body: validBody,
          rawData: { ...mockPageData, url: "course-overview", page_id: "course-overview" },
        },
      ]);

      const result = await courseOverviewLanguageTest.run(mockCourse);

      expect(result.success).toBe(true);
      expect(result.userData).toBeDefined();
      expect(result.userData?.overviewPage.title).toBe("Course Overview");
    });

    it("should return 'not run' if no course overview page is found", async () => {
      (mockCourse.getPages as jest.Mock).mockResolvedValue([]);
      const result = await courseOverviewLanguageTest.run(mockCourse);
      expect(result.success).toBe(false);
      expect(result.messages).toEqual([{ bodyLines: ["Course Overview page not found"] }]);
    });
  });

  describe("fix() logic", () => {
    const mockCourseOverviewPage: IPageData = {
      ...mockPageData,
      title: "Course Overview",
      url: "course-overview",
      body: `<div>Wrong text.</div>
      <div>By participating in this course, you agree:</div>`,
    };

    const mockUserData = {
      overviewPage: mockCourseOverviewPage,
      honorCodeDiv: { innerHTML: "OLD_HONOR_CODE" } as HTMLDivElement,
      confirmDiv: { innerHTML: "OLD_CONFIRM" } as HTMLDivElement,
    };

    it("should skip the fix if the test was already a success", async () => {
      const successfulResult = testResult(true, {
        notFailureMessage: "test was a success",
        userData: mockUserData,
      });

      const result = await courseOverviewLanguageTest.fix(mockCourse, successfulResult);

      expect(result.success).toBe("not run");
      expect(result.messages).toEqual([{ bodyLines: ["Fix not run because test was a success"] }]);
      expect(PageKind.put).not.toHaveBeenCalled();
    });

    it("should attempt to update the page if the test failed and userData is present", async () => {
      const failedResult = testResult(false, { userData: mockUserData });

      const putMock = PageKind.put as jest.Mock;
      putMock.mockResolvedValue({
        ...mockPageData,
        page_id: "course-overview",
        body: "Some body text",
      });

      const result = await courseOverviewLanguageTest.fix(mockCourse, failedResult);

      expect(result.success).toBe(true);
      expect(result.messages).toEqual([{ bodyLines: ["Course overview updated successfully."] }]);
    });

    it("should return failure if PageKind.put fails to return a page_id", async () => {
      const failedResult = testResult(false, { userData: mockUserData });
      (PageKind.put as jest.Mock).mockResolvedValue(null);

      const result = await courseOverviewLanguageTest.fix(mockCourse, failedResult);

      expect(result.success).toBe(false);
      expect(result.messages).toEqual([{ bodyLines: ["Failed to update course overview page."] }]);
    });

    it("should return 'not run' if result or userData is missing", async () => {
      const result = await courseOverviewLanguageTest.fix(mockCourse, undefined);
      expect(result.success).toBe("not run");
      expect(result.messages).toEqual([
        { bodyLines: ["Fix didn't run because of an error passing test results to fix."] },
      ]);
    });
  });
});
