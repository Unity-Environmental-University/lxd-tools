import * as fc from "fast-check";
import { getCourseById } from "@ueu/ueu-canvas";
import { syncSyllabus } from "../syncSyllabus";

jest.mock("@ueu/ueu-canvas", () => ({ getCourseById: jest.fn() }));

const LM_PHRASE = "week 1 learning materials preview";

// Escape the characters that would change how the HTML parses
function esc(s: string) {
	return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

type Body = { html: string; text: string };
type Box = {
	title: string;
	titleSplit: boolean;
	attrs: string;
	body: Body;
};
type Page = {
	sep: string;
	intro: boolean;
	banner: boolean;
	bannerSrc: string;
	bannerAttrs: string;
	metaTexts: string[];
	metaAttrs: string[];
	boxes: Box[];
};

// Plain text that can contain characters which need escaping
const htmlText = fc.stringMatching(/^[a-zA-Z0-9 &<>.,'"-]{1,40}$/);
const word = fc.stringMatching(/^[a-z0-9]{1,12}$/);

// Week 1 titles: casing and padding vary, but each syllabus has at most one
const WEEK_1_TITLES = [
	"Week 1 Learning Materials Preview",
	"WEEK 1 LEARNING MATERIALS PREVIEW",
	"  week 1 learning materials preview  ",
];
// Other callouts, which the sync must leave alone
const OTHER_TITLES = ["Week 2 Learning Materials", "Other callout"];

// Extra attributes, in random order and count
const attrs = fc
	.array(
		fc.record({
			name: fc.constantFrom("id", "style", "data-x", "title", "lang"),
			value: word,
		}),
		{ maxLength: 2 },
	)
	.map((as) => as.map((a) => ` ${a.name}="${a.value}"`).join(""));

// Body pieces: plain text, and text wrapped in nested markup
const piece = fc.oneof(
	htmlText.map((t) => ({ html: esc(t), text: t })),
	htmlText.map((t) => ({ html: `<span>${esc(t)}</span>`, text: t })),
	htmlText.map((t) => ({ html: `<ul><li>${esc(t)}</li></ul>`, text: t })),
	htmlText.map((t) => ({
		html: `<div class="inner"><strong>${esc(t)}</strong><img src="pic.png" alt=""></div>`,
		text: t,
	})),
	fc.constant({ html: `<img src="pic.png" alt="">`, text: "" }),
);

const bodyArb: fc.Arbitrary<Body> = fc
	.array(piece, { maxLength: 3 })
	.map((ps) => ({
		html: ps.map((p) => p.html).join(""),
		text: ps.map((p) => p.text).join(""),
	}));

function boxArb(titles: string[]): fc.Arbitrary<Box> {
	return fc.record({
		title: fc.constantFrom(...titles),
		titleSplit: fc.boolean(),
		attrs,
		body: bodyArb,
	});
}

// A course has at most one Week 1 box, placed among the other callouts
const courseBoxesArb = fc
	.tuple(
		fc.array(boxArb(OTHER_TITLES), { maxLength: 2 }),
		fc.option(boxArb(WEEK_1_TITLES), { nil: null }),
		fc.nat(2),
	)
	.map(([others, week1, at]) => {
		const boxes = [...others];
		if (week1) boxes.splice(at % (boxes.length + 1), 0, week1);
		return boxes;
	});

const courseArb: fc.Arbitrary<Page> = fc.record({
	sep: fc.constantFrom("", "\n", "\n    \t  "),
	intro: fc.boolean(),
	banner: fc.boolean(),
	bannerSrc: word,
	bannerAttrs: attrs,
	metaTexts: fc.array(htmlText, { maxLength: 1 }),
	metaAttrs: fc.array(attrs, { maxLength: 1 }),
	boxes: courseBoxesArb,
});

// The template varies in shape, with its own markers so leaks are visible
const templateArb = fc
	.record({
		sep: fc.constantFrom("", "\n"),
		intro: fc.boolean(),
		banner: fc.boolean(),
		metaCount: fc.integer({ min: 0, max: 1 }),
		week1: fc.boolean(),
		otherCount: fc.integer({ min: 0, max: 2 }),
	})
	.map(
		(t): Page => ({
			sep: t.sep,
			intro: t.intro,
			banner: t.banner,
			bannerSrc: "template-banner",
			bannerAttrs: "",
			metaTexts: Array.from({ length: t.metaCount }, () => "TEMPLATE_META"),
			metaAttrs: [],
			boxes: [
				...(t.week1
					? [
							{
								title: WEEK_1_TITLES[0],
								titleSplit: false,
								attrs: "",
								body: { html: "TEMPLATE_LM_WEEK_1", text: "TEMPLATE_LM_WEEK_1" },
							},
						]
					: []),
				...Array.from({ length: t.otherCount }, (_, i) => ({
					title: OTHER_TITLES[0],
					titleSplit: false,
					attrs: "",
					body: { html: `TEMPLATE_OTHER_${i}`, text: `TEMPLATE_OTHER_${i}` },
				})),
			],
		}),
	);

function phraseBoxes(page: Page) {
	return page.boxes.filter((b) => b.title.toLowerCase().includes(LM_PHRASE));
}

function renderTitle(b: Box) {
	const i = b.title.indexOf(" ");
	return b.titleSplit && i > 0
		? `<strong>${esc(b.title.slice(0, i))}</strong>${esc(b.title.slice(i))}`
		: esc(b.title);
}

function renderPage(page: Page) {
	const parts: string[] = [];
	if (page.intro) {
		// Outside any callout box, so it must not be treated as the Week 1 box
		parts.push(`<p>Week 1 Learning Materials Preview</p>`);
	}
	if (page.banner) {
		parts.push(
			`<div class="cbt-banner-image"${page.bannerAttrs}><img src="${page.bannerSrc}.jpg"></div>`,
		);
	}
	page.metaTexts.forEach((t, i) => {
		parts.push(
			`<table data-course-meta${page.metaAttrs[i] ?? ""}><tbody><tr><td>${esc(t)}</td></tr></tbody></table>`,
		);
	});
	page.boxes.forEach((b) => {
		parts.push(
			`<div class="cbt-callout-box"${b.attrs}><p>${renderTitle(b)}</p><div>${b.body.html}</div></div>`,
		);
	});
	return `<html><body>${page.sep}${parts.join(page.sep)}${page.sep}</body></html>`;
}

function makeCourse(syllabus: string) {
	return {
		getSyllabus: jest.fn(async () => syllabus),
		changeSyllabus: jest.fn(),
	};
}

// Set the template for one run; the course is built per run as well
function useTemplate(page: Page) {
	(getCourseById as jest.Mock).mockResolvedValue({
		getSyllabus: jest.fn(async () => renderPage(page)),
	});
}

const templateDefaults: Page = {
	sep: "",
	intro: false,
	banner: true,
	bannerSrc: "template-banner",
	bannerAttrs: "",
	metaTexts: ["TEMPLATE_META"],
	metaAttrs: [],
	boxes: [
		{
			title: WEEK_1_TITLES[0],
			titleSplit: false,
			attrs: "",
			body: { html: "TEMPLATE_LM_WEEK_1", text: "TEMPLATE_LM_WEEK_1" },
		},
	],
};

beforeEach(() => {
	jest.spyOn(console, "log").mockImplementation(() => {});
	jest.spyOn(console, "error").mockImplementation(() => {});
	window.alert = jest.fn(); // jsdom doesn't implement alert
});

it("keeps the course meta table, Week 1 box and banner, and drops the template's", async () => {
	await fc.assert(
		fc.asyncProperty(courseArb, templateArb, async (page, template) => {
			// Only the cases where the sync is expected to succeed
			fc.pre(
				page.banner && page.metaTexts.length > 0 && phraseBoxes(page).length > 0,
			);

			useTemplate(template);
			const course = makeCourse(renderPage(page));
			expect(await syncSyllabus(course as any)).toBe(true);

			const out = course.changeSyllabus.mock.calls[0][0] as string;
			const doc = new DOMParser().parseFromString(out, "text/html");

			// Exactly one meta table, and it is the course's
			const metas = doc.querySelectorAll("table[data-course-meta]");
			expect(metas).toHaveLength(1);
			expect(metas[0].textContent).toBe(page.metaTexts[0]);

			// Exactly one banner, and it is the course's
			const banners = doc.querySelectorAll(".cbt-banner-image img");
			expect(banners).toHaveLength(1);
			expect(banners[0].getAttribute("src")).toBe(`${page.bannerSrc}.jpg`);

			// The Week 1 box carries the course's Week 1 content
			const lmBoxes = Array.from(doc.querySelectorAll(".cbt-callout-box")).filter(
				(b) => b.textContent?.toLowerCase().includes(LM_PHRASE),
			);
			expect(lmBoxes).toHaveLength(1);
			expect(lmBoxes[0].textContent).toContain(phraseBoxes(page)[0].body.text);

			// Nothing from the template's meta, banner or Week 1 box survives. The
			// template's other callouts are template content and are expected to stay.
			expect(out).not.toContain("TEMPLATE_META");
			expect(out).not.toContain("template-banner");
			expect(lmBoxes[0].textContent).not.toContain("TEMPLATE_LM_WEEK_1");
		}),
		{ numRuns: 300 },
	);
});

// Regression tests for the template gaps fixed in syncSyllabus.ts
it("keeps the course banner when the template has none", async () => {
	await fc.assert(
		fc.asyncProperty(courseArb, templateArb, async (page, template) => {
			fc.pre(
				page.banner &&
					!template.banner &&
					page.metaTexts.length > 0 &&
					phraseBoxes(page).length > 0,
			);

			useTemplate(template);
			const course = makeCourse(renderPage(page));
			await syncSyllabus(course as any);

			const out = course.changeSyllabus.mock.calls[0][0] as string;
			const doc = new DOMParser().parseFromString(out, "text/html");
			expect(doc.querySelectorAll(".cbt-banner-image img")).toHaveLength(1);
		}),
		{ numRuns: 300 },
	);
});

it("keeps the course Week 1 content when the template has no Week 1 box", async () => {
	await fc.assert(
		fc.asyncProperty(courseArb, templateArb, async (page, template) => {
			fc.pre(
				page.banner &&
					page.metaTexts.length > 0 &&
					phraseBoxes(page).length > 0 &&
					phraseBoxes(template).length === 0,
			);

			useTemplate(template);
			const course = makeCourse(renderPage(page));
			await syncSyllabus(course as any);

			const out = course.changeSyllabus.mock.calls[0][0] as string;
			const doc = new DOMParser().parseFromString(out, "text/html");
			const lmBoxes = Array.from(doc.querySelectorAll(".cbt-callout-box")).filter(
				(b) => b.textContent?.toLowerCase().includes(LM_PHRASE),
			);
			expect(lmBoxes).toHaveLength(1);
			expect(lmBoxes[0].textContent).toContain(phraseBoxes(page)[0].body.text);
		}),
		{ numRuns: 300 },
	);
});

it("returns true only when a meta table and a Week 1 box both exist", async () => {
	await fc.assert(
		fc.asyncProperty(courseArb, templateArb, async (page, template) => {
			useTemplate(template);
			const course = makeCourse(renderPage(page));
			const expected = page.metaTexts.length > 0 && phraseBoxes(page).length > 0;

			expect(await syncSyllabus(course as any)).toBe(expected);
			expect(course.changeSyllabus).toHaveBeenCalledTimes(expected ? 1 : 0);
		}),
		{ numRuns: 300 },
	);
});

it("never rejects on arbitrary syllabus HTML", async () => {
	await fc.assert(
		fc.asyncProperty(fc.string(), async (html) => {
			useTemplate(templateDefaults);
			const result = await syncSyllabus(makeCourse(html) as any);
			expect(typeof result).toBe("boolean");
		}),
	);
});
