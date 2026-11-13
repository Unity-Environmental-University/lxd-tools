import { readFileSync } from "fs";
import { join } from "path";
import { getCourseById } from "@ueu/ueu-canvas";
import { syncSyllabus, syncSyllabusWithResult } from "../syncSyllabus";
import { fingerprint, loadSnapshot } from "../syllabusUndo";

jest.mock("@ueu/ueu-canvas", () => ({ getCourseById: jest.fn() }));

// Anonymized syllabi: one with a course meta table, one without
const FIXTURES = join(__dirname, "fixtures", "syncSyllabus");
const withMeta = readFileSync(join(FIXTURES, "course-with-meta.html"), "utf8");
const withoutMeta = readFileSync(join(FIXTURES, "course-without-meta.html"), "utf8");

function makeCourse(syllabus: string) {
	return {
		id: 1000001,
		name: "DEV_EXAMPLE101",
		getSyllabus: jest.fn(async () => syllabus),
		changeSyllabus: jest.fn(),
		isUndergrad: () => true,
		isGrad: () => false,
		isCareerInstitute: () => false,
	};
}

function useTemplate(syllabus: string) {
	(getCourseById as jest.Mock).mockResolvedValue({
		getSyllabus: jest.fn(async () => syllabus),
	});
}

beforeEach(() => {
	localStorage.clear();
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

it("keeps the course's own Instructor Name homepage link, not the template's", async () => {
	useTemplate(withoutMeta);
	const course = makeCourse(withMeta);

	expect(await syncSyllabus(course as any)).toBe(true);

	const out = course.changeSyllabus.mock.calls[0][0] as string;
	const doc = new DOMParser().parseFromString(out, "text/html");

	const instructorParas = Array.from(doc.querySelectorAll("p")).filter((p) =>
		/^\s*instructor name/i.test(p.textContent ?? ""),
	);
	expect(instructorParas).toHaveLength(1);
	const href = instructorParas[0].querySelector("a")?.getAttribute("href");
	expect(href).toBe("/courses/1000001/pages/home");
	expect(out).not.toContain("/courses/2000001/pages/home");
});

it("keeps the template's Instructor Name line when the course has none", async () => {
	useTemplate(withoutMeta);
	const noInstructor = withMeta.replace(
		/<p>\s*<strong>Instructor Name:(?:&nbsp;|\s)*<\/strong>[\s\S]*?<\/p>/i,
		"",
	);
	expect(noInstructor).not.toBe(withMeta);
	const course = makeCourse(noInstructor);

	expect(await syncSyllabus(course as any)).toBe(true);

	const out = course.changeSyllabus.mock.calls[0][0] as string;
	expect(out).toContain("/courses/2000001/pages/home");
});

it("fails and saves nothing for a syllabus without a meta table", async () => {
	useTemplate(withMeta);
	const course = makeCourse(withoutMeta);

	expect(await syncSyllabus(course as any)).toBe(false);
	expect(course.changeSyllabus).not.toHaveBeenCalled();
});

describe("backup for undo", () => {
	it("saves the previous syllabus before writing, and notes what Canvas stored afterward", async () => {
		const course = makeCourse(withMeta);
		const stored = "<p>what Canvas stored</p>";
		(getCourseById as jest.Mock)
			.mockResolvedValueOnce({ getSyllabus: jest.fn(async () => withoutMeta) }) // the template
			.mockResolvedValueOnce({ getSyllabus: jest.fn(async () => stored) }); // read back after saving

		const result = await syncSyllabusWithResult(course as any);

		expect(result.success).toBe(true);
		expect(result.undoAvailable).toBe(true);
		const snapshot = loadSnapshot(1000001);
		expect(snapshot?.originalHtml).toBe(withMeta);
		expect(snapshot?.courseName).toBe("DEV_EXAMPLE101");
		expect(snapshot?.syncedFingerprint).toBe(fingerprint(stored));
	});

	it("keeps no backup when the save fails", async () => {
		useTemplate(withoutMeta);
		const course = makeCourse(withMeta);
		course.changeSyllabus.mockRejectedValue(new Error("403"));

		const result = await syncSyllabusWithResult(course as any);

		expect(result.success).toBe(false);
		expect(loadSnapshot(1000001)).toBeNull();
	});

	it("keeps no backup when the sync stops before saving", async () => {
		useTemplate(withMeta);
		const course = makeCourse(withoutMeta); // no meta table, so sync refuses
		expect(await syncSyllabus(course as any)).toBe(false);
		expect(loadSnapshot(1000001)).toBeNull();
	});
});
