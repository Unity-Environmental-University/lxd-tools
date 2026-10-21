import { Course, Page, PageKind } from "@ueu/ueu-canvas";
import { CourseFixValidation } from "../types";
import { testResult, ValidationResult } from "../utils";

type UserData = {
	homepage: Page;
	homepageBody: string;
};

// TODO: Make the buttons in my test course so I have what shape they will take
// TODO: Fill my button variables here, and then run should be done
// TODO: Test my regex in homepage
// TODO: In fix, get/build the two urls for the buttons to go to when clicked(course overview page, contact instructor)
// TODO: Find anchor point for buttons
// TODO: Place buttons
// TODO: Write tests

// Checking for strings of the button isn't going to be the most viable because the link information would be different. Could parse and look for an element, but that raises complexity.
// Other options include dynamically determining what the links should be before the validation runs(getting the id for the course overview page and building the links
// with those as variables.) Looking for a unique part of the buttons is probably most viable(I'm thinking like div up to the url with a unique attribute), but that only delays the work
// of needing to figure out what the urls should look like. It may be fine to punt that until the fix and do the minimum viable option in run because it's safer for not getting
// false failures where it says the buttons don't exist just because the url isn't what it expects.
const beginButton = "";
const instructorButton = "";

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
	const pages = await course.getPages();
	// This may be too cute by half, and run into issues in narrow circumstances where another page has Home in the title and is in the array before Home, or if the home page is
	// ever not Home, which I don't think is likely in UG courses, so I'm more worried about the first concern than the second.
	const homepage = pages.filter((page) => /Home/i.test(page.title))[0];
	const homepageBody = homepage.body;

	// Look for both buttons
	const success =
		homepageBody.includes(beginButton) &&
		homepageBody.includes(instructorButton);

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

	const { homepage, homepageBody } = result.userData;

	// Find the anchor point for the buttons
	// Place the buttons
	const updatedHomepageBody = "";

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
