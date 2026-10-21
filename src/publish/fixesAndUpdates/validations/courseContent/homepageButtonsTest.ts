import { Course, Page } from "@ueu/ueu-canvas";
import { CourseFixValidation } from "../types";
import { testResult, ValidationResult } from "../utils";

type UserData = {
	homepage: Page;
	// May benefit from also sending just html itself so we don't have to parse it in fix
};

export const homepageButtonsTest: CourseFixValidation<Course> = {
	name: "Buttons on Home page",
	description:
		"Look for being course and contact instructor buttons on home page",
	run,
	fix,
};

async function run(course: Course): Promise<ValidationResult> {
	if (!course.isUndergrad()) {
		return testResult("not run", {
			notFailureMessage: "Test didn't run because course is not undergrad.",
		});
	}

	// Get homepage
	// Look for both buttons
	// if buttons exists, pass
	// iff buttons don't exist, fail

	return " " as unknown as ValidationResult;
}

async function fix(
	course: Course,
	result: ValidationResult | undefined,
): Promise<ValidationResult> {
	if (!course.isUndergrad()) {
		return testResult("not run", {
			notFailureMessage: "Fix didn't run because course is not undergrad.",
		});
	}

	if (result?.success != false) {
		return testResult("not run", {
			notFailureMessage:
				"Fix didn't run because the test result wasn't explicitly failure.",
		});
	}

	// Get homepage from user data
	// Place the buttons
	// Send the page back to the course

	return " " as unknown as ValidationResult;
}
