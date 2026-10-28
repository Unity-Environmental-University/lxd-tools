import { Course, getCourseById } from "@ueu/ueu-canvas";

function uiAlert(message: string) {
	if (typeof window !== "undefined" && (window as any).alert) {
		(window as any).alert(message);
	} else {
		console.log(message);
	}
}

// Synchronize a course syllabus by merging template and course-specific sections
export async function syncSyllabus(course: Course): Promise<boolean> {
	console.log("Inside syncSyllabus");
	try {
		// Get template syllabus
		const templateCourse = await getCourseById(8217232);
		const templateSyllabus = await templateCourse.getSyllabus();

		if (!templateSyllabus) {
			uiAlert("Couldn't find template syllabus.");
			return false;
		}

		// Get course syllabus
		const courseSyllabus = await course.getSyllabus();

		if (!courseSyllabus) {
			uiAlert("Couldn't find course syllabus.");
			return false;
		}

		// Parse syllabi
		const parser = new DOMParser();
		const parsedCourseSyllabus = parser.parseFromString(
			courseSyllabus,
			"text/html",
		);
		// Pull course-specific information table and Week 1 LMs out of syllabus
		const metaTable = parsedCourseSyllabus.querySelector(
			"table[data-course-meta]",
		);
		const calloutBoxes = Array.from(
			parsedCourseSyllabus.querySelectorAll(".cbt-callout-box"),
		);

		const learningMaterialsBox = calloutBoxes.find((box) =>
			box.textContent
				?.toLowerCase()
				.includes("week 1 learning materials preview"),
		);

		console.log("meta table: ", metaTable);
		console.log("learning materials box: ", learningMaterialsBox);

		if (!metaTable || !learningMaterialsBox) {
			console.log("Unable to find metaTable or learning material box.");
			return false;
		}

		// Preserve inner content of Week 1 Learning Materials box from the course syllabus
		const courseLmInnerHTML = learningMaterialsBox.innerHTML;
		const courseLmOuterHTML = learningMaterialsBox.outerHTML;
		const metaTableHtml = metaTable.outerHTML;

		// Remove from original syllabi
		metaTable.remove();
		learningMaterialsBox.remove();

		// Build final HTML by combining template syllabus, meta table, banner image and Wk 1 LM
		const finalTemplateDom = parser.parseFromString(
			templateSyllabus,
			"text/html",
		);

		// Drop the template's meta table so only the course's is kept
		finalTemplateDom.querySelector("table[data-course-meta]")?.remove();

		// Inject the course LM inner HTML into the corresponding template LM box (if it exists)
		const templateLmContainer = Array.from(
			finalTemplateDom.querySelectorAll(".cbt-callout-box"),
		).find((box) =>
			box.textContent
				?.toLowerCase()
				.includes("week 1 learning materials preview"),
		);
		if (templateLmContainer) {
			templateLmContainer.innerHTML = courseLmInnerHTML;
		} else {
			// Template has no Week 1 box, so keep the course's at the end of the body
			finalTemplateDom.body.insertAdjacentHTML("beforeend", courseLmOuterHTML);
		}

		// Pull the banner image out of the course syllabus, and replace the template's banner with the course banner.
		const courseBannerBox =
			parsedCourseSyllabus.querySelector(".cbt-banner-image");
		const courseBannerHtml = courseBannerBox?.outerHTML ?? "";

		courseBannerBox?.remove();

		const templateBannerBox =
			finalTemplateDom.querySelector(".cbt-banner-image");
		if (templateBannerBox && courseBannerHtml) {
			templateBannerBox.outerHTML = courseBannerHtml;
		} else if (courseBannerHtml) {
			// Template has no banner, so keep the course's at the top of the body
			finalTemplateDom.body.insertAdjacentHTML("afterbegin", courseBannerHtml);
		}

		// Serialize the modified template to HTML string
		const finalHtmlFromTemplate = finalTemplateDom.documentElement.outerHTML;

		// Prepend the meta table at the very top
		const finalDoc = parser.parseFromString(finalHtmlFromTemplate, "text/html");
		finalDoc.body.insertAdjacentHTML("afterbegin", metaTableHtml);
		const finalSyllabus = finalDoc.documentElement.outerHTML;

		try {
			course.changeSyllabus(finalSyllabus);
		} catch (e: any) {
			throw new Error(`Error changing syllabus in course: ${e}`);
		}

		uiAlert("Syllabus synced successfully.");
		return true;
	} catch (err) {
		console.error("Error syncing syllabus:", err);
		uiAlert(`Syllabus sync failed: ${err}`);
		return false;
	}
}
