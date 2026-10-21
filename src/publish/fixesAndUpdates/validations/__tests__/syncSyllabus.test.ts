import { syncSyllabus } from "../syncSyllabus";

// Mock for the external canvas module
type AnyObj = any;
let mockTemplateCourse: AnyObj;
let mockCourseInstance: AnyObj;
let templateCourseForId: (id: number) => AnyObj;

jest.mock("@ueu/ueu-canvas", () => {
	// A minimal Course class placeholder to satisfy TS types if needed
	class Course {}
	return {
		Course,
		getCourseById: jest.fn((id: number) => templateCourseForId(id)),
	};
});

describe("syncSyllabus", () => {
	beforeEach(() => {
		// Reset mocks before each test
		mockTemplateCourse = {
			getSyllabus: jest.fn(),
		};
		mockCourseInstance = {
			getSyllabus: jest.fn(),
			changeSyllabus: jest.fn(),
		};

		// Default behavior: template returns templateHtml, course returns courseHtml
		// These will be overridden per test as needed
		templateCourseForId = (id: number) => {
			if (id === 8217232) {
				return mockTemplateCourse;
			}
			return mockCourseInstance;
		};
	});

	test("success path: merges course and template syllabi and calls changeSyllabus", async () => {
		// Build HTMLs that resemble realistic syllabi
		const templateHtml = `
      <html><body>
        <div class="cbt-banner-image"><img src="template-banner.jpg"/></div>
        <table data-course-meta><tr><td>Template meta</td></tr></table>
        <div class="cbt-callout-box">Week 1 Learning Materials Preview</div>
      </body></html>
    `;

		const courseHtml = `
      <html><body>
        <div class="cbt-banner-image"><img src="course-banner.jpg"/></div>
        <table data-course-meta><tr><td>Course meta</td></tr></table>
        <div class="cbt-callout-box">Week 1 Learning Materials Preview<div>LM_CONTENT</div></div>
      </body></html>
    `;

		// Attach mock implementations for this test
		mockTemplateCourse.getSyllabus = jest.fn(async () => templateHtml);
		mockCourseInstance.getSyllabus = jest.fn(async () => courseHtml);
		mockCourseInstance.changeSyllabus = jest.fn();

		// Re-exported factory must return template when 8217232 is requested
		templateCourseForId = (id: number) => {
			if (id === 8217232) return mockTemplateCourse;
			return mockCourseInstance;
		};

		const result = await syncSyllabus(mockCourseInstance);

		expect(result).toBe(true);
		expect(mockCourseInstance.changeSyllabus).toHaveBeenCalled();

		const args = (mockCourseInstance.changeSyllabus as jest.Mock).mock
			.calls[0][0];

		// Ensure the final syllabus contains the meta table from the course (outerHTML)
		const parser = new DOMParser();
		const courseDoc = parser.parseFromString(courseHtml, "text/html");
		const courseMetaTable = courseDoc.querySelector("table[data-course-meta]");
		const metaTableOuter = courseMetaTable ? courseMetaTable.outerHTML : "";
		expect(args).toContain(metaTableOuter);

		// Ensure LM content from course is injected into the template LM container
		expect(args).toContain("LM_CONTENT");
	});

	test("failure path: missing meta table or learning materials box returns false and does not call changeSyllabus", async () => {
		// Missing meta table triggers early return
		const courseHtmlMissingMeta = `
      <html><body>
        <div class="cbt-banner-image"><img src="course-banner.jpg"/></div>
        <div class="cbt-callout-box">Week 1 Learning Materials Preview</div>
      </body></html>
    `;

		mockCourseInstance.getSyllabus = jest.fn(async () => courseHtmlMissingMeta);
		mockCourseInstance.changeSyllabus = jest.fn();

		const result = await syncSyllabus(mockCourseInstance);

		expect(result).toBe(false);
		expect(mockCourseInstance.changeSyllabus).not.toHaveBeenCalled();
	});
});
