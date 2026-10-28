import { Course, Page, PageKind } from "@ueu/ueu-canvas";
import { CourseFixValidation } from "../types";
import { testResult, ValidationResult } from "../utils";

type UserData = {
	homepage: Page;
	homepageBody: string;
};

const beginButtonTest = "Begin Course</a></div>";
const instructorButtonTest = "Contact Your Instructor</a></div>";

export const homepageButtonsTest: CourseFixValidation<Course> = {
	name: "Buttons on Home page",
	description:
		"Look for being course and contact instructor buttons on home page",
	run,
	fix,
};

async function run(course: Course): Promise<ValidationResult<UserData>> {
	if (!course.isUndergrad()) {
		return testResult("not run", {
			notFailureMessage: "Test didn't run because course is not undergrad.",
		});
	}

	// Get homepage
	const pages = await course.getPages({ queryParams: { include: ["body"] } });
	// This may be too cute by half, and run into issues if the home page is ever not Home, which I don't think is likely in UG courses,
	// so I'm more worried about the first concern than the second.
	const homepage = pages.filter((page) => /^Home$/gm.test(page.title))[0];
	const homepageBody = homepage.body;

	// Look for both buttons
	const success =
		homepageBody.includes(beginButtonTest) &&
		homepageBody.includes(instructorButtonTest);

	//Return a result
	return testResult(success, {
		failureMessage: "Buttons don't exist on homepage.",
		notFailureMessage: "Buttons found on homepage.",
		userData: {
			homepage: homepage,
			homepageBody: homepageBody,
		},
	})
}

async function fix(
	course: Course,
	result?: ValidationResult<UserData>,
): Promise<ValidationResult> {
	if (!course.isUndergrad()) {
		return testResult("not run", {
			notFailureMessage: "Fix didn't run because course is not undergrad.",
		});
	}

	if (result?.success != false || !result.userData) {
		return testResult("not run", {
			notFailureMessage:
				"Fix didn't run because the test result wasn't explicitly failure.",
		});
	}

	const buttonDiv = `<div>
	    <div class="scaffold-media-box cbt-button" data-context-menu="insert delete" data-editable="true" data-caninsertinto="true" data-canhavechild="false"><a title="Course Overview" href="https://unity.instructure.com/courses/${course.id}/pages/course-overview" data-course-type="wikiPages" data-published="true" data-api-endpoint="https://unity.instructure.com/api/v1/courses/${course.id}/pages/course-overview" data-api-returntype="Page">Begin Course</a></div>
	    <div class="scaffold-media-box cbt-button" data-context-menu="insert delete" data-editable="true" data-caninsertinto="true" data-canhavechild="false"><a class="inline_disabled" href="https://unity.instructure.com/conversations#filter=type=inbox" target="_blank" rel="noopener">Contact Your Instructor</a></div>
	  </div>`;

	const { homepage, homepageBody } = result.userData;

	// Find the anchor point for the buttons: directly after the home banner
	const parser = new DOMParser();
	const parsedPage = parser.parseFromString(homepageBody, "text/html");
	const banner = parsedPage.querySelector(".cbt-home-banner");

	if (!banner) {
		return testResult(false, {
			failureMessage: "Couldn't find the home banner to place buttons after.",
		});
	}

	// Place the buttons
	banner.insertAdjacentHTML("afterend", buttonDiv);
	const updatedHomepageBody = parsedPage.body.innerHTML;

	// Send the page back to the course
	const updatePage = await PageKind.put(course.id, homepage.id, {
		wiki_page: { body: updatedHomepageBody },
	});

	const success = !!(updatePage && updatePage.page_id);

	return testResult(success, {
		failureMessage: "Couldn't place buttons on homepage",
		notFailureMessage: "Buttons placed on homepage successfully!",
	});
}
