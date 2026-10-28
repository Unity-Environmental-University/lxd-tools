import { readFileSync } from "fs";
import { join } from "path";
import { getCourseById } from "@ueu/ueu-canvas";
import { syncSyllabus } from "../syncSyllabus";

jest.mock("@ueu/ueu-canvas", () => ({ getCourseById: jest.fn() }));

// Anonymized syllabi: one with a course meta table, one without
const FIXTURES = join(__dirname, "fixtures", "syncSyllabus");
const withMeta = readFileSync(join(FIXTURES, "course-with-meta.html"), "utf8");
const withoutMeta = readFileSync(join(FIXTURES, "course-without-meta.html"), "utf8");

function makeCourse(syllabus: string) {
	return {
		getSyllabus: jest.fn(async () => syllabus),
		changeSyllabus: jest.fn(),
	};
}

function useTemplate(syllabus: string) {
	(getCourseById as jest.Mock).mockResolvedValue({
		getSyllabus: jest.fn(async () => syllabus),
	});
}

beforeEach(() => {
	jest.spyOn(console, "log").mockImplementation(() => {});
	jest.spyOn(console, "error").mockImplementation(() => {});
	window.alert = jest.fn();
});

it("syncs a syllabus with a meta table onto a template without one", async () => {
	useTemplate(withoutMeta);
	const course = makeCourse(withMeta);

	expect(await syncSyllabus(course as any)).toBe(true);

	const out = course.changeSyllabus.mock.calls[0][0] as string;
	const doc = new DOMParser().parseFromString(out, "text/html");

	// One meta table, carrying the course's values
	const metas = doc.querySelectorAll("table[data-course-meta]");
	expect(metas).toHaveLength(1);
	expect(metas[0].textContent).toContain("EXAMPLE 101");

	// Course banner replaces the template's
	const banners = doc.querySelectorAll(".cbt-banner-image img");
	expect(banners).toHaveLength(1);
	expect(banners[0].getAttribute("src")).toContain("/courses/1000001/");

	// Week 1 box carries the course's resources, not the template's
	const lmBox = Array.from(doc.querySelectorAll(".cbt-callout-box")).find((b) =>
		b.textContent?.toLowerCase().includes("week 1 learning materials preview"),
	);
	expect(lmBox?.textContent).toContain("Placeholder Resource Group");
	expect(lmBox?.textContent).not.toContain("Placeholder resource four");

	// Template boilerplate is kept
	expect(out).toContain("Statement on Fair Practices");
});

it("fails and saves nothing for a syllabus without a meta table", async () => {
	useTemplate(withMeta);
	const course = makeCourse(withoutMeta);

	expect(await syncSyllabus(course as any)).toBe(false);
	expect(course.changeSyllabus).not.toHaveBeenCalled();
});
