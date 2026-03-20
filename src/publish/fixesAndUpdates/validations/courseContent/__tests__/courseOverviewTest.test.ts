import { courseOverviewLanguageTest } from "../courseOverviewTest";
import { getCourseById } from "@ueu/ueu-canvas/course/index";
import { testResult } from "@publish/fixesAndUpdates/validations/utils";
import { Course, mockCourseData } from "@ueu/ueu-canvas";
import { mockPageData } from "@ueu/ueu-canvas/content/__mocks__/mockContentData";
import { expect } from "@jest/globals";
import { IPageData } from "@ueu/ueu-canvas/content/pages/types";

// Mock the external dependencies
jest.mock("@ueu/ueu-canvas/course/index");
jest.mock("@ueu/ueu-canvas/content/pages/PageKind");

import PageKind from "@ueu/ueu-canvas/content/pages/PageKind";

const ugValidBody = `
  <div>By participating in this course, you agree:
    unity de student handbook
    what happens if this occurs more than once
    in all terms:
    first term:
    second term:
    third term:
    why we do this
    resubmission (if permitted) is limited to 50%
    learning module
    academic honor code supersedes the grading rubric
  </div>
  <div>Please confirm your agreement to the three numbered items above</div>
`;

const gradValidBody = `
  <div>By participating in this course, you agree:
    graduate academic honor code
    expects graduate students
    how violations are addressed
    first low-level issue
    level 1
    level 2
    level 3
    level 4
    cumulative across terms
    capstone course
  </div>
  <div>you acknowledge that you have read and agree to comply. confirm your agreement</div>
`;

describe("courseOverviewLanguageTest - Full Suite", () => {
  let mockCourse: Course;

  beforeEach(() => {
    jest.clearAllMocks();

    mockCourse = new Course(mockCourseData);

    (getCourseById as jest.Mock).mockResolvedValue({
      isUndergrad: () => true,
      isGrad: () => false,
    });
  });

  describe("run() logic", () => {
    it("should succeed for UG when all key phrases and confirmation text are present", async () => {
      mockCourse.getPages = jest.fn().mockResolvedValue([
        {
          title: "Course Overview",
          body: ugValidBody,
          rawData: { ...mockPageData, url: "course-overview", page_id: "course-overview"},
        },
      ]);

      const result = await courseOverviewLanguageTest.run(mockCourse);

      expect(result.success).toBe(true);
      expect(result.userData).toBeDefined();
      expect(result.userData?.overviewPage.title).toBe("Course Overview");
    });

    it("should fail for UG when key phrases are missing", async () => {
      mockCourse.getPages = jest.fn().mockResolvedValue([
        {
          title: "Course Overview",
          body: `<div>By participating in this course, you agree: some wrong text</div><div>confirm your agreement</div>`,
          rawData: { ...mockPageData, url: "course-overview", page_id: "course-overview"},
        },
      ]);

      const result = await courseOverviewLanguageTest.run(mockCourse);
      expect(result.success).toBe(false);
    });

    it("should succeed for grad when all key phrases and confirmation text are present", async () => {
      (getCourseById as jest.Mock).mockResolvedValue({
        isUndergrad: () => false,
        isGrad: () => true,
      });

      mockCourse.getPages = jest.fn().mockResolvedValue([
        {
          title: "Course Overview",
          body: gradValidBody,
          rawData: { ...mockPageData, url: "course-overview", page_id: "course-overview"},
        },
      ]);

      const result = await courseOverviewLanguageTest.run(mockCourse);
      expect(result.success).toBe(true);
    });

    it("should fail for grad when key phrases are missing", async () => {
      (getCourseById as jest.Mock).mockResolvedValue({
        isUndergrad: () => false,
        isGrad: () => true,
      });

      mockCourse.getPages = jest.fn().mockResolvedValue([
        {
          title: "Course Overview",
          body: `<div>By participating in this course, you agree: some wrong text</div><div>confirm your agreement</div>`,
          rawData: { ...mockPageData, url: "course-overview", page_id: "course-overview"},
        },
      ]);

      const result = await courseOverviewLanguageTest.run(mockCourse);
      expect(result.success).toBe(false);
    });

    it("should return 'not run' if the course is neither undergrad nor grad", async () => {
      (getCourseById as jest.Mock).mockResolvedValue({
        isUndergrad: () => false,
        isGrad: () => false,
      });

      mockCourse.getPages = jest.fn().mockResolvedValue([]);

      const result = await courseOverviewLanguageTest.run(mockCourse);
      expect(result.success).toBe("not run");
    });

    it("should return false if no pages are found", async () => {
      (mockCourse.getPages as jest.Mock).mockResolvedValue([]);
      const result = await courseOverviewLanguageTest.run(mockCourse);
      expect(result.success).toBe(false);
      expect(result.messages).toEqual([{ bodyLines: ["Unable to find pages in the course."] }]);
    });
  });

  describe("fix() logic", () => {
    const mockCourseOverviewPage: IPageData = {...mockPageData, title: "Course Overview", url: "course-overview", body: `<div>Wrong text.</div>
      <div>By participating in this course, you agree:</div>`};

    const ugMockUserData = {
      overviewPage: mockCourseOverviewPage,
      honorCodeDiv: { innerHTML: "OLD_HONOR_CODE" } as HTMLDivElement,
      confirmDiv: { innerHTML: "OLD_CONFIRM" } as HTMLDivElement,
      courseObj: { isUndergrad: () => true, isGrad: () => false } as unknown as Course,
    };

    const gradMockUserData = {
      overviewPage: mockCourseOverviewPage,
      honorCodeDiv: { innerHTML: "OLD_HONOR_CODE" } as HTMLDivElement,
      confirmDiv: { innerHTML: "OLD_CONFIRM" } as HTMLDivElement,
      courseObj: { isUndergrad: () => false, isGrad: () => true } as unknown as Course,
    };

    const mockUserData = ugMockUserData;

    it("should skip the fix if the test was already a success", async () => {
      const successfulResult = testResult(true, {
        notFailureMessage: "test was a success",
        userData: mockUserData,
      });

      const result = await courseOverviewLanguageTest.fix(
        mockCourse,
        successfulResult
      );

      expect(result.success).toBe("not run");
      expect(result.messages).toEqual(
        [{"bodyLines": ["Fix not run because test was a success"]}]
      );
      expect(PageKind.put).not.toHaveBeenCalled();
    });

    it("should attempt to update the page if the test failed and userData is present", async () => {
      const failedResult = testResult(false, { userData: mockUserData });

      const putMock = PageKind.put as jest.Mock;
  putMock.mockResolvedValue({
      ...mockPageData,
      page_id: "course-overview",
      body: "Some body text"
  });

  const result = await courseOverviewLanguageTest.fix(mockCourse, failedResult);

      expect(result.success).toBe(true);
      expect(result.messages).toEqual([{"bodyLines": ["Course overview updated successfully."]}]);
    });

    it("should return failure if PageKind.put fails to return a page_id", async () => {
      const failedResult = testResult(false, { userData: mockUserData });
      (PageKind.put as jest.Mock).mockResolvedValue(null);

      const result = await courseOverviewLanguageTest.fix(mockCourse, failedResult);

      expect(result.success).toBe(false);
      expect(result.messages).toEqual([
        { bodyLines: ["Failed to update course overview page."] },
      ]);
    });

    it("should attempt to update the page for a grad course", async () => {
      const failedResult = testResult(false, { userData: gradMockUserData });

      const putMock = PageKind.put as jest.Mock;
      putMock.mockResolvedValue({
        ...mockPageData,
        page_id: "course-overview",
        body: "Some body text",
      });

      const result = await courseOverviewLanguageTest.fix(mockCourse, failedResult);

      expect(result.success).toBe(true);
      expect(result.messages).toEqual([{"bodyLines": ["Course overview updated successfully."]}]);
    });

    it("should return 'not run' if result or userData is missing", async () => {
      const result = await courseOverviewLanguageTest.fix(mockCourse, undefined);
      expect(result.success).toBe("not run");
      expect(result.messages).toEqual(
        [{"bodyLines": ["Fix didn't run because of an error passing test results to fix."]}]
      );
    });
  });
});