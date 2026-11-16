import {
	fetchJson,
	formDataify,
	getCourseById,
	IContentHaver,
	Page,
	PageKind,
} from "@ueu/ueu-canvas";
import { CourseFixValidation } from "../types";
import { testResult, ValidationResult } from "../utils";

type UserData = {
	evalPage: Page[];
};

const evalPageName = "Course Evaluation";
const evalPageHtml = `<div class="scaffold-media-box cbt-banner cbt-home-banner cbt-image-banner"data-context-menu="insert delete"><div class="cbt-banner-inner flexbox v"><div class=cbt-banner-header id=cbt-banner-header><div><h1>Course Evaluation</h1></div></div></div></div><div class="scaffold-media-box cbt-content"data-context-menu="insert delete"data-canhavechild=true data-caninsertinto=true data-editable=true><div class=cbt-callout-box><div class=content><p data-prosemirror-content-type=node data-prosemirror-node-block=true data-prosemirror-node-name=paragraph data-pm-slice="1 3 []"><strong data-prosemirror-content-type=mark data-prosemirror-mark-name=strong>Course Evaluations</strong> should have opened this week. Be sure to log into your Student Portal (accessible via the link in the sidebar), select the "My Education" tab in the top banner, and then "Course Evaluations." Select the course you'd like to evaluate and submit your feedback.<ul class=ak-ul data-prosemirror-content-type=node data-prosemirror-node-block=true data-prosemirror-node-name=bulletList><li data-prosemirror-content-type=node data-prosemirror-node-block=true data-prosemirror-node-name=listItem><p data-prosemirror-content-type=node data-prosemirror-node-block=true data-prosemirror-node-name=paragraph>Please do this if you have time! It gives us real, actionable data for improving our courses. Professional, honest, constructive feedback is always welcome.</ul></div></div></div>`;

export const courseEvalTest: CourseFixValidation<IContentHaver, UserData> = {
	name: "Course Evaluation Page Validation",
	description: "Looks for a course evaluation reminder page in the course.",
	run,
	fix,
};

function errorMessage(e: unknown): string {
	return e instanceof Error ? e.message : String(e);
}

async function run(course: IContentHaver): Promise<ValidationResult<UserData>> {
	const pages = await course.getPages();
	const evalPage = pages.filter(
		(p) => p.name.toLowerCase() === evalPageName.toLowerCase(),
	);

	return testResult(evalPage.length === 1, {
		notFailureMessage: "Course Evaluation page exists.",
		failureMessage:
			evalPage.length < 1
				? "No course evaluation page."
				: "More than one Course Evaluation page found. Attention needed.",
		userData: { evalPage },
	});
}

async function fix(
	course: IContentHaver,
	result: ValidationResult<UserData> | undefined,
): Promise<ValidationResult<UserData>> {
	if (!result)
		return testResult("not run", {
			notFailureMessage: "Fix not run because no test result found.",
		});

	if (!result.userData)
		return testResult("not run", {
			notFailureMessage: "Fix not run because result didn't have user data.",
		});

	const evalPageArray = result.userData.evalPage.length;

	if (evalPageArray === 1)
		return testResult("not run", {
			notFailureMessage: "Fix not run because course has an eval page.",
		});

	if (evalPageArray > 1)
		return testResult("not run", {
			notFailureMessage:
				"Fix not run because course has more than one evaluation page. Attention needed.",
		});

	//Get modules
	const courseObj = await getCourseById(course.id);
	const modules = await courseObj.getModules();
	let moduleName: string;

	// For UG, find the module with module 5, for grad, find the module with module 8
	if (courseObj.isUndergrad() || courseObj.isCareerInstitute()) {
		moduleName = "module 5";
	} else if (courseObj.isGrad()) {
		moduleName = "module 8";
	} else {
		return testResult("not run", {
			notFailureMessage: "Couldn't determine if course is UG, Grad, of CE.",
		});
	}

	const filteredModules = modules.filter((m) =>
		m.name.toLowerCase().includes(moduleName),
	);
	if (filteredModules.length > 1) {
		return testResult("not run", {
			notFailureMessage: "More than 1 final module found",
		});
	}
	const finalModule = filteredModules[0];

	if (!finalModule)
		return testResult("not run", {
			notFailureMessage: "No finalModule found.",
		});

	// Create page
	let createPage;
	try {
		createPage = await PageKind.post(course.id, {
			wiki_page: {
				title: evalPageName,
				body: evalPageHtml,
				published: true,
			},
		});
	} catch (e) {
		return testResult(false, {
			failureMessage: `Failed to create Course Evaluation page: ${errorMessage(e)}`,
		});
	}

	// Place the page in the module of the course(5 for UG/CE, 8 for Grad)
	let updateModule;
	try {
		updateModule = await fetchJson(
			`/api/v1/courses/${course.id}/modules/${finalModule.id}/items`,
			{
				fetchInit: {
					method: "POST",
					body: formDataify({
						module_item: {
							title: createPage.title,
							type: "Page",
							page_url: createPage.url,
							position: 3,
							indent: 1,
						},
					}),
				},
			},
		);
	} catch (e) {
		// The page exists at this point, so a rerun would think everything is fine.
		return testResult(false, {
			failureMessage: `Course Evaluation page was created but could not be added to ${finalModule.name}. Add it manually. (${errorMessage(e)})`,
		});
	}

	const success = !!updateModule.id;

	return testResult(success, {
		notFailureMessage: "Course Evaluation page created successfully.",
		failureMessage:
			"Course Evaluation page was created but may not have been added to the module. Check the course.",
	});
}
