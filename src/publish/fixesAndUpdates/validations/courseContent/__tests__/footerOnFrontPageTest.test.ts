import footerOnFrontPageTest from "@publish/fixesAndUpdates/validations/courseContent/footerOnFrontPageTest";

import { IPageData } from "@canvas/content/pages/types";
import { jest } from "@jest/globals";
import {Course} from "@canvas/course/Course";
import {mockPageData} from "@canvas/content/__mocks__/mockContentData";

describe("removeGradeTable Fix", () => {
  let mockCourse: Course;
  let currentMockPageData: IPageData;
  let mockFrontPage: any; // Mock structure for front page

  beforeEach(() => {
    mockCourse = {
      getFrontPage: jest.fn(),
    } as unknown as Course;

    currentMockPageData = {
        ...mockPageData,
      body: "<div><div class='cbt-footer-container'>Footer Content</div></div>",
      htmlContentUrl: "/some-url",
    } as IPageData;

    mockFrontPage = {
      body: currentMockPageData.body,
      data: currentMockPageData,
      htmlContentUrl: currentMockPageData.htmlContentUrl,
      updateContent: jest.fn(async (body) => mockFrontPage.body = body),
    };

    (mockCourse.getFrontPage as jest.Mock<typeof mockCourse.getFrontPage>).mockResolvedValue(mockFrontPage);
  });

  test("should detect and remove footer from the front page", async () => {
    const result = await footerOnFrontPageTest.run(mockCourse);

    // Ensure that the footer was found and removed
    expect(result.success).toBe(false);
    expect(result.userData).toEqual(currentMockPageData);
    expect(result.links).toContain(currentMockPageData.htmlContentUrl);
  });

  test("should fail if footer is not found", async () => {
    // Simulate page with no footer
    mockFrontPage.body = "<div>No footer here</div>";

    const result = await footerOnFrontPageTest.run(mockCourse);

    // Ensure the footer was not found, so it should be a success
    expect(result.success).toBe(true); // Footer already gone
  });

  test("should update the front page after footer removal", async () => {
    const result = await footerOnFrontPageTest.fix(mockCourse);

    // Ensure the front page content was updated
    expect(mockFrontPage.updateContent).toHaveBeenCalled();
    expect(result.success).toBe(true);
  });

  test("should not run the fix if no footer found during the test", async () => {
    mockFrontPage.body = "<div>No footer here</div>";

    const result = await footerOnFrontPageTest.fix(mockCourse);

    expect(result.success).toBe('not run');
    const messageLines = [...result.messages.flatMap(a => a.bodyLines)];
    expect(messageLines).toContain("Test not run; no broken pages");
  });
});
