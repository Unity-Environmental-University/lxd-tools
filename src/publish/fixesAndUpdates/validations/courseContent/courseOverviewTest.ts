import { IContentHaver } from "@ueu/ueu-canvas/course/courseTypes";
import { getCourseById } from "@ueu/ueu-canvas/course/index";
import { CourseFixValidation } from "@publish/fixesAndUpdates/validations/types";
import {
	testResult,
	ValidationResult,
} from "@publish/fixesAndUpdates/validations/utils";
import PageKind from "@ueu/ueu-canvas/content/pages/PageKind";
import { Course } from "@ueu/ueu-canvas/course/index";

// Declaring types
type MinPageData = {
	title: string;
	body: string;
	url: string;
	page_id: number;
};

type UserData = {
	overviewPage: MinPageData;
	courseObj: Course;
};

// Declaring variables here so they don't make the code messier

export const ugHonorCodeHtml = `<div class="cbt-content scaffold-media-box" data-canhavechild="true" data-caninsertinto="true" data-context-menu="delete moveup movedown duplicate insertbefore insertafter insert">
<h3><strong>By participating in this course, you agree:</strong></h3>
<ol start="1">
<li><span data-teams="true">To confirm your intent to remain enrolled in this course.</span></li>
<li>To adhere to the Code of Conduct, found in the&nbsp;<a href="https://unity.edu/distance-education/student-resources/#catalog-and-handbook">Unity DE Student Handbook</a> at all times.</li>
</ol>
<ul>
<li style="list-style-type: none;">
<ul>
<li><em>Violations are subject to formal academic review and may result in administrative course withdrawal, or dismissal from Unity Environmental University.</em></li>
</ul>
</li>
</ul>
<ol start="3">
<li>To adhere to the Unity DE Academic Honor Code You can read the full <a href="https://unitycollege.policytech.com/dotNet/documents/?docid=3360&amp;app=pt&amp;source=unspecified&amp;public=true">policy here.</a></li>
</ol>
<h4 style="padding-left: 40px;"><strong>Overview: Academic Honor Code</strong></h4>
<p style="padding-left: 40px;">At Unity Environmental University, you&rsquo;re expected to approach every assignment and course activity with honesty and responsibility. This relies on accurate, verifiable information and fair work. The Academic Honor Code helps create a culture of trust and ensures that your grades truly reflect your own learning. By committing to these principles, you help protect the value of your education&mdash;for yourself and for others.</p>
<p style="padding-left: 40px;">Unity Environmental University expects all students to demonstrate academic integrity. This includes completing original work, attributing source information accurately, verifying the accuracy of all citations, and using AI tools responsibly. Students are responsible for everything they submit&mdash;content, sources, and claims&mdash;and must be able to demonstrate their learning and skills through their coursework.</p>
<p style="padding-left: 40px;">Failure to meet the standards of the Academic Honor Code (which is also referred to as academic dishonesty in some cases) may be intentional or unintentional and includes plagiarism, misattribution, patchwriting, submitting unverifiable citations, falsified or manipulated data or images, unauthorized collaboration, misrepresentation of work, or submitting AI-generated content without review or verification. You can review the full Academic Honor Code for more information and definitions.</p>
<p style="padding-left: 40px;">The Academic Honor Code supersedes the grading rubric. Repeated issues may have increasingly serious consequences, which may include a zero on the assignment(s), failing the course, or dismissal from the university.</p>
<p style="padding-left: 40px;">If your instructor flags a concern:</p>
<ul>
<li style="list-style-type: none;">
<ul>
<li>You will receive feedback about the issue</li>
<li>There may be a grading penalty up to a zero on that assignment</li>
<li>You may be offered a learning opportunity such as a skill-building module or a meeting with your instructor, and you may be able to redo your work for the first instance in that course.&nbsp;</li>
</ul>
</li>
</ul>
<p style="padding-left: 40px;">What are the implications if this occurs repeatedly?</p>
<p style="padding-left: 40px;"><span style="text-decoration: underline;">Within a course:</span>&nbsp;Repeated instances may result in a zero on affected assignments and/or failing the course.</p>
<p style="padding-left: 40px;"><span style="text-decoration: underline;">Across terms:</span> You may be asked to meet with an academic dean if there are repeated or egregious instances. The dean may recommend dismissal from the university.&nbsp;</p>
<p style="padding-left: 40px;">The Purpose Behind This Process:</p>
<p style="padding-left: 40px;">The process is designed to help you learn proper academic practices, ensure fairness and academic rigor, and support your development as a scholar and professional.</p>
<ol start="4">
<li>That you have access to the equipment, skills and time necessary for completing Unity DE courses, as stated on the <a href="https://unity.edu/distance-education/get-started/technology-commitment/">Technology for Success</a>&nbsp;webpage. &nbsp;<br /><br /><em>It is your responsibility to ensure that you have the minimum requirements necessary to fully access and receive support from our staff and faculty. Without the Required Technology Skills for Coursework, you may not be able to access all course materials and/or complete certain assignments, and you will still be financially responsible for the course.</em></li>
</ol>
</div>`;

const ugConfirmHtml = `<div class="scaffold-media-box cbt-content cbt-page-as-agreement"data-canhavechild=true data-caninsertinto=true data-context-menu="delete moveup movedown duplicate insertbefore insertafter insert"><p class=c4><span style=font-weight:400>Please confirm your agreement to the </span><strong>numbered items above</strong><span style=font-weight:400> (code of conduct, honor code, and tech requirements) by selecting the 'Confirm your agreement' button below. It is mandatory to agree to the honor code before proceeding with this unit.</span><div class="scaffold-media-box cbt-button"data-canhavechild=false data-caninsertinto=true data-context-menu="insert delete"data-editable=true><a href=#>Confirm your agreement</a></div></div>`;

// Lowercases, swaps curly quotes/dashes and nbsp for plain characters, and collapses whitespace
function normalizeText(text: string | null | undefined): string {
	return (text ?? "")
		.replace(/[‘’]/g, "'")
		.replace(/[“”]/g, '"')
		.replace(/[–—]/g, "-")
		.replace(/ /g, " ")
		.replace(/\s+/g, " ")
		.trim()
		.toLowerCase();
}

// One line per block-level element (and link) in document order. Each line holds
// the tag, list depth, list start number, link target, and text, so anything that
// changes the layout or wording shows up. Attributes and styling don't.
function formatSignature(root: Element): string[] {
	return Array.from(root.querySelectorAll("h1, h2, h3, h4, h5, h6, p, ol, ul, li, a")).map(
		(el) => {
			const hasNestedList = !!el.querySelector("ol, ul, li");
			// Text inside nested lists gets its own line, so only use direct text here
			const text = hasNestedList
				? Array.from(el.childNodes)
						.filter((node) => node.nodeType === Node.TEXT_NODE)
						.map((node) => node.textContent)
						.join("")
				: el.textContent;
			return [
				el.tagName.toLowerCase(),
				listDepth(el, root),
				el.tagName === "OL" ? (el.getAttribute("start") ?? "1") : "",
				el.tagName === "A" ? (el.getAttribute("href") ?? "") : "",
				normalizeText(text),
			].join("|");
		},
	);
}

function listDepth(el: Element, root: Element): number {
	let depth = 0;
	for (let node = el.parentElement; node && node !== root; node = node.parentElement) {
		if (node.matches("ol, ul")) depth++;
	}
	return depth;
}

// Compares the honor code section to the template. Returns the first difference,
// or an empty list when the section matches.
export function checkUgHonorCodeFormat(honorCodeDiv: HTMLElement): string[] {
	const templateDoc = new DOMParser().parseFromString(ugHonorCodeHtml, "text/html");
	const template = formatSignature(templateDoc.body.firstElementChild as Element);
	const actual = formatSignature(honorCodeDiv);

	const index = Array.from({ length: Math.max(template.length, actual.length) }).findIndex(
		(_, i) => template[i] !== actual[i],
	);
	if (index === -1) return [];

	return [
		`Honor code section doesn't match the template at line ${index + 1}. Expected "${template[index] ?? "(nothing)"}" but found "${actual[index] ?? "(nothing)"}"`,
	];
}

// Finds the honor code and confirm divs. The deepest div containing each phrase wins.
function findHonorCodeDivs(doc: Document): {
	honorCodeDiv?: HTMLDivElement;
	confirmDiv?: HTMLDivElement;
} {
	let honorCodeDiv: HTMLDivElement | undefined;
	let confirmDiv: HTMLDivElement | undefined;
	for (const div of Array.from(doc.querySelectorAll("div"))) {
		const divText = normalizeText(div.textContent);
		if (divText.includes("by participating in this course, you agree:")) {
			honorCodeDiv = div;
		} else if (divText.includes("confirm your agreement")) {
			confirmDiv = div;
		}
		if (honorCodeDiv && confirmDiv) break;
	}
	return { honorCodeDiv, confirmDiv };
}

export const courseOverviewLanguageTest: CourseFixValidation<
	IContentHaver,
	UserData
> = {
	name: "Course Overview Language",
	description: "Boilerplate text for the overview page matches expected",
	run,
	fix,
};

async function run(course: IContentHaver): Promise<ValidationResult<UserData>> {
	const courseObj = await getCourseById(course.id);

	if (!courseObj.isUndergrad()) {
		return testResult("not run", {
			notFailureMessage: "Not run because course isn't undergrad.",
		});
	}

	const pages = await course.getPages({
		queryParams: { include: ["body"] },
	});

	if (!pages.length) {
		return testResult(false, {
			failureMessage: "Unable to find pages in the course.",
		});
	}

	let overviewPage: MinPageData | undefined = undefined;
	for (const page of pages) {
		if (page.title.toLowerCase().includes("course overview")) {
			overviewPage = {
				title: page.title,
				body: page.body,
				url: page.rawData.url,
				page_id: page.rawData.page_id,
			};
		}
	}

	if (!overviewPage) {
		return testResult("not run", {
			notFailureMessage: "Can't find the course overview page.",
		});
	}

	const parser = new DOMParser();
	const parsedPage = parser.parseFromString(overviewPage.body, "text/html");
	const { honorCodeDiv, confirmDiv } = findHonorCodeDivs(parsedPage);

	if (!honorCodeDiv || !confirmDiv)
		return testResult(false, { failureMessage: "Can't find text to check." });

	const problems = checkUgHonorCodeFormat(honorCodeDiv);

	return testResult(problems.length === 0, {
		failureMessage: [
			{
				bodyLines: [
					"Honor code section does not match expected format:",
					...problems,
				],
				links: [`/courses/${course.id}/pages/${overviewPage.url}`],
			},
		],
		links: [`/courses/${course.id}/pages/${overviewPage.url}`],
		notFailureMessage: "Honor code section matches expected format.",
		userData: {
			overviewPage,
			courseObj,
		},
	});
}

async function fix(
	course: IContentHaver,
	result: ValidationResult<UserData> | undefined,
): Promise<ValidationResult<UserData>> {
	if (!result || !result.userData)
		return testResult("not run", {
			notFailureMessage:
				"Fix didn't run because of an error passing test results to fix.",
		});

	if (result.success) {
		return testResult("not run", {
			notFailureMessage: "Fix not run because test was a success",
		});
	}

	const { overviewPage, courseObj } = result.userData;

	if (!courseObj.isUndergrad()) {
		return testResult("not run", {
			notFailureMessage: "Fix not run because course isn't undergrad.",
		});
	}

	// Re-fetch and re-parse the page. Stored DOM elements don't survive
	// serialization through the UI state layer, so the page is read again here.
	const pages = await course.getPages({ queryParams: { include: ["body"] } });
	const freshPage = pages.find(
		(p) => p.rawData.page_id === overviewPage.page_id,
	);
	if (!freshPage)
		return testResult("not run", {
			notFailureMessage: "Couldn't re-fetch overview page for fix.",
		});

	const parser = new DOMParser();
	const parsedPage = parser.parseFromString(freshPage.body, "text/html");
	const { honorCodeDiv, confirmDiv } = findHonorCodeDivs(parsedPage);

	if (!honorCodeDiv || !confirmDiv)
		return testResult("not run", {
			notFailureMessage: "Couldn't find honor code divs in overview page.",
		});

	// Swap the elements in the parsed DOM rather than matching serialized HTML
	// strings, since the serialized form may not match the stored body text.
	honorCodeDiv.outerHTML = ugHonorCodeHtml;
	confirmDiv.outerHTML = ugConfirmHtml;

	const updatePageBody = parsedPage.body.innerHTML;

	const updatePage = await PageKind.put(course.id, overviewPage.page_id, {
		wiki_page: { body: updatePageBody },
	});

	const success = !!(updatePage && updatePage.page_id);

	return testResult(success, {
		notFailureMessage: "Course overview updated successfully.",
		failureMessage: [{ bodyLines: ["Failed to update course overview page."] }],
	});
}
