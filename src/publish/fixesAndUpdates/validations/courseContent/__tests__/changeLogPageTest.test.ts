import { changelogPageTest } from "../changeLogPageTest";
import { Course } from "@ueu/ueu-canvas";
import { IPageData } from "@ueu/ueu-canvas";
import { jest } from "@jest/globals";
import PageKind from "@ueu/ueu-canvas";
import { postContentFunc } from "@ueu/ueu-canvas";

// Mock dependencies
jest.mock("@canvas/content/pages/PageKind");
jest.mock("@/canvas");

describe("Changelog Page Validation", () => {
  let mockCourse: Course;
  let mockPages: IPageData[];

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Create a mock course
    mockCourse = {
      id: 12345,
      name: "DEV_TEST101: Introduction to Testing",
    } as Course;

    mockPages = [];
  });

  // You might include this helper function in your test file or in a separate file if that's preferred.
  function createMockPageGenerator(pages: IPageData[]): AsyncGenerator<IPageData> {
    return (async function* () {
      for (const page of pages) {
        yield page;
      }
    })();
  }

  describe("run function", () => {
    test("should skip non-DEV courses", async () => {
      const mockCourse1 = { ...mockCourse, name: "TEST101: Introduction to Testing" } as Course;

      const result = await changelogPageTest.run(mockCourse1);

      expect(result.success).toBe("not run");
      expect(result.messages.some((msg) => msg.bodyLines.includes("Not a DEV course"))).toBe(true);
    });

    test("should pass when changelog page exists", async () => {
      const changelogPage: IPageData = {
        page_id: 1,
        url: "course-change-log",
        title: "Course Change Log",
        body: "<p>Test content</p>",
        updated_at: "2025-01-01",
        created_at: "2025-01-01",
        front_page: false,
      } as IPageData;

      mockPages = [changelogPage];

      (PageKind.dataGenerator as jest.Mock).mockReturnValue(createMockPageGenerator(mockPages));

      const result = await changelogPageTest.run(mockCourse);

      expect(result.success).toBe(true);
      expect(result.messages.some((msg) => msg.bodyLines.includes("Changelog page found"))).toBe(true);
      expect(result.userData).toEqual(changelogPage);
    });

    test("should fail when changelog page does not exist", async () => {
      mockPages = [
        {
          page_id: 1,
          url: "some-other-page",
          title: "Some Other Page",
          body: "<p>Test content</p>",
          updated_at: "2025-01-01",
          created_at: "2025-01-01",
          front_page: false,
        } as IPageData,
      ];

      (PageKind.dataGenerator as jest.Mock).mockReturnValue(createMockPageGenerator(mockPages));

      const result = await changelogPageTest.run(mockCourse);

      expect(result.success).toBe(false);
      expect(result.messages.some((msg) => msg.bodyLines.includes("No changelog page found"))).toBe(true);
    });

    test("should find changelog page with partial title match", async () => {
      const changelogPage: IPageData = {
        page_id: 1,
        url: "change-log",
        title: "DEV Course Change Log - Updated",
        body: "<p>Test content</p>",
        updated_at: "2025-01-01",
        created_at: "2025-01-01",
        front_page: false,
      } as IPageData;

      mockPages = [changelogPage];

      const mockGenerator = async function* () {
        for (const page of mockPages) {
          yield page;
        }
      };

      (PageKind.dataGenerator as jest.Mock).mockReturnValue(mockGenerator());

      const result = await changelogPageTest.run(mockCourse);

      expect(result.success).toBe(true);
    });
  });

  describe("fix function", () => {
    test("should create changelog page successfully", async () => {
      const mockCourse2 = { ...mockCourse, name: "DEV_TEST101: Introduction to Testing" } as Course;

      const createdPage: IPageData = {
        page_id: 2,
        url: "course-change-log",
        title: "Course Change Log",
        body: "<h2>TEST101 Change Log</h2>",
        updated_at: "2025-01-01",
        created_at: "2025-01-01",
        front_page: false,
      } as IPageData;

      // Mock postContentFunc
      const mockPostChangePage = jest.fn<(page: IPageData) => Promise<IPageData>>();
      mockPostChangePage.mockResolvedValue(createdPage);
      (postContentFunc as jest.Mock).mockReturnValue(mockPostChangePage);

      // Mock the page generator for verification (should find the page after creation)
      const mockGeneratorAfterCreate = async function* () {
        yield createdPage;
      };

      (PageKind.dataGenerator as jest.Mock).mockReturnValue(mockGeneratorAfterCreate());

      if (changelogPageTest.fix) {
        const result = await changelogPageTest.fix(mockCourse);

        expect(mockPostChangePage).toHaveBeenCalledWith(
          mockCourse2.id,
          expect.objectContaining({
            wiki_page: expect.objectContaining({
              title: "Course Change Log",
              body: expect.stringContaining("TEST101 Change Log"),
            }),
          })
        );
        expect(result.success).toBe(true);
        expect(result.messages.some((msg) => msg.bodyLines.includes("Changelog page created successfully"))).toBe(true);
        expect(result.userData).toEqual(createdPage);
      }
    });

    test("should extract course code correctly from course name with colon", async () => {
      const mockCourse3 = { ...mockCourse, name: "DEV_BUS202:01: Business Management" } as Course;

      const createdPage: IPageData = {
        page_id: 2,
        url: "course-change-log",
        title: "Course Change Log",
        body: "<h2>BUS202 Change Log</h2>",
        updated_at: "2025-01-01",
        created_at: "2025-01-01",
        front_page: false,
      } as IPageData;

      const mockPostChangePage = jest.fn<(page: IPageData) => Promise<IPageData>>();
      mockPostChangePage.mockResolvedValue(createdPage);
      (postContentFunc as jest.Mock).mockReturnValue(mockPostChangePage);

      const mockGeneratorAfterCreate = async function* () {
        yield createdPage;
      };

      (PageKind.dataGenerator as jest.Mock).mockReturnValue(mockGeneratorAfterCreate());

      if (changelogPageTest.fix) {
        const result = await changelogPageTest.fix(mockCourse3);

        expect(mockPostChangePage).toHaveBeenCalledWith(
          mockCourse3.id,
          expect.objectContaining({
            wiki_page: expect.objectContaining({
              body: expect.stringContaining("BUS202 Change Log"),
            }),
          })
        );
        expect(result.success).toBe(true);
      }
    });

    test("should fail if page is not found after creation", async () => {
      const mockPostChangePage = jest.fn<(page: IPageData) => Promise<IPageData>>();
      mockPostChangePage.mockResolvedValue({} as IPageData);
      (postContentFunc as jest.Mock).mockReturnValue(mockPostChangePage);

      // Mock the page generator for verification (page NOT found after creation)
      const mockGeneratorAfterCreate = async function* () {
        // Empty generator - no pages found
      };

      (PageKind.dataGenerator as jest.Mock).mockReturnValue(mockGeneratorAfterCreate());

      if (changelogPageTest.fix) {
        const result = await changelogPageTest.fix(mockCourse);

        expect(result.success).toBe(false);
        expect(
          result.messages.some((msg) =>
            msg.bodyLines.includes("Page creation request sent, but page was not found afterward")
          )
        ).toBe(true);
      }
    });

    test("should handle errors during page creation", async () => {
      const mockError = new Error("API Error");
      const mockPostChangePage = jest.fn<(page: IPageData) => Promise<IPageData>>();
      mockPostChangePage.mockRejectedValue(mockError);
      (postContentFunc as jest.Mock).mockReturnValue(mockPostChangePage);

      if (changelogPageTest.fix) {
        const result = await changelogPageTest.fix(mockCourse);

        expect(result.success).toBe(false);
        expect(result.messages.some((msg) => msg.bodyLines.includes("Failed to create changelog page"))).toBe(true);
      }
    });

    test("should create table with correct structure", async () => {
      const createdPage: IPageData = {
        page_id: 2,
        url: "course-change-log",
        title: "Course Change Log",
        body: "<h2>CS101 Change Log</h2>",
        updated_at: "2025-01-01",
        created_at: "2025-01-01",
        front_page: false,
      } as IPageData;

      const mockPostChangePage = jest.fn<(page: IPageData, content: Record<string, any>) => Promise<IPageData>>();
      mockPostChangePage.mockResolvedValue(createdPage);
      (postContentFunc as jest.Mock).mockReturnValue(mockPostChangePage);

      const mockGeneratorAfterCreate = async function* () {
        yield createdPage;
      };

      (PageKind.dataGenerator as jest.Mock).mockReturnValue(mockGeneratorAfterCreate());

      if (changelogPageTest.fix) {
        await changelogPageTest.fix(mockCourse);

        const callArgs = mockPostChangePage.mock.calls[0][1];
        const bodyContent = callArgs.wiki_page.body;

        // Verify table structure
        expect(bodyContent).toContain("<table");
        expect(bodyContent).toContain("<thead");
        expect(bodyContent).toContain("<tbody");
        expect(bodyContent).toContain("<th");

        // Verify table headers
        expect(bodyContent).toContain("ID");
        expect(bodyContent).toContain("Date");
        expect(bodyContent).toContain("Name");
        expect(bodyContent).toContain("Change(s)");
        expect(bodyContent).toContain("Why?");
        expect(bodyContent).toContain("Source of Request");

        // Verify example row
        expect(bodyContent).toContain("e.x.");
        expect(bodyContent).toContain("Greg Siekman");
      }
    });
  });

  describe("integration", () => {
    test("should fix a failed test", async () => {
      // Initially no changelog page
      const mockGeneratorBefore = async function* () {
        // Empty - no pages
      };

      (PageKind.dataGenerator as jest.Mock).mockReturnValueOnce(mockGeneratorBefore());

      const runResult = await changelogPageTest.run(mockCourse);
      expect(runResult.success).toBe(false);

      // Now set up for the fix
      const createdPage: IPageData = {
        page_id: 2,
        url: "course-change-log",
        title: "Course Change Log",
        body: "<h2>TEST101 Change Log</h2>",
        updated_at: "2025-01-01",
        created_at: "2025-01-01",
        front_page: false,
      } as IPageData;

      const mockPostChangePage = jest.fn<(page: IPageData) => Promise<IPageData>>();
      mockPostChangePage.mockResolvedValue(createdPage);
      (postContentFunc as jest.Mock).mockReturnValue(mockPostChangePage);

      const mockGeneratorAfterCreate = async function* () {
        yield createdPage;
      };

      (PageKind.dataGenerator as jest.Mock).mockReturnValueOnce(mockGeneratorAfterCreate());

      if (changelogPageTest.fix) {
        const fixResult = await changelogPageTest.fix(mockCourse);
        expect(fixResult.success).toBe(true);

        // Verify after fix
        const mockGeneratorAfter = async function* () {
          yield createdPage;
        };

        (PageKind.dataGenerator as jest.Mock).mockReturnValueOnce(mockGeneratorAfter());

        const runResultAfter = await changelogPageTest.run(mockCourse);
        expect(runResultAfter.success).toBe(true);
      }
    });
  });

  describe("validation metadata", () => {
    test("should have correct name and description", () => {
      expect(changelogPageTest.name).toBe("Changelog exists on DEV course");
      expect(changelogPageTest.description).toBe("DEV courses have a changelog page where changes can be listed.");
    });

    test("should have run and fix functions", () => {
      expect(typeof changelogPageTest.run).toBe("function");
      expect(typeof changelogPageTest.fix).toBe("function");
    });
  });
});
