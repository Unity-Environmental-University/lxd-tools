import { Course, getCourseById } from "@ueu/ueu-canvas";
import {
	clearSnapshot,
	recordSyncedFingerprint,
	saveSnapshot,
} from "@publish/fixesAndUpdates/validations/syllabusUndo";

// The "Instructor Name: See Homepage" line of the syllabus's top callout box. Its link goes to this course's own home
// page, so it has to come from the course, not the template (a template's link points at the template course).
function findInstructorNameParagraph(doc: Document) {
	return (
		Array.from(doc.querySelectorAll(".cbt-callout-box p")).find((p) =>
			/^\s*instructor name\b/i.test(p.textContent ?? ""),
		) ?? null
	);
}

// After the save, read the syllabus back the same way Undo will, and note what Canvas actually stored, so Undo can tell
// whether the syllabus was edited since. (Not taken from the save's response, which may be serialized differently.)
// If the read fails the check is skipped rather than failing the sync.
async function rememberSyncedSyllabus(course: Course) {
	try {
		const stored = await (await getCourseById(course.id)).getSyllabus();
		recordSyncedFingerprint(Number(course.id), stored);
	} catch (e) {
		console.warn("Could not read the syllabus back after syncing:", e);
	}
}

export type SyncSyllabusResult = {
	success: boolean;
	/** Human-readable outcome. On failure, this is what the user should report. */
	message: string;
	/** True when the previous syllabus was saved in this browser, so the sync can be undone. */
	undoAvailable?: boolean;
};

// Boolean wrapper kept for callers that only care about success
export async function syncSyllabus(course: Course): Promise<boolean> {
	return (await syncSyllabusWithResult(course)).success;
}

// Synchronize a course syllabus by merging template and course-specific sections
export async function syncSyllabusWithResult(
	course: Course,
): Promise<SyncSyllabusResult> {
	const fail = (message: string): SyncSyllabusResult => {
		console.error("Syllabus sync failed:", message);
		return { success: false, message };
	};

	console.log("Inside syncSyllabus");
	try {
		// Get template syllabus
		let templateCourse: Course | undefined;

		if (course.isUndergrad()) {
			templateCourse = await getCourseById(7775658);
		} else if (course.isGrad()) {
			templateCourse = await getCourseById(7773747);
		} else if (course.isCareerInstitute()) {
			templateCourse = await getCourseById(225);
		}

		if (!templateCourse) throw new Error("No template course found.");

		const templateSyllabus = await templateCourse.getSyllabus();

		if (!templateSyllabus) {
			return fail(
				`Couldn't find the template syllabus (template course ${templateCourse.id}).`,
			);
		}

		// Get course syllabus
		const courseSyllabus = await course.getSyllabus();

		if (!courseSyllabus) {
			return fail("Couldn't find this course's syllabus.");
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

		// Kept from the course, like the banner image, so its Homepage link doesn't turn into the template's
		const courseInstructorNameHtml = findInstructorNameParagraph(parsedCourseSyllabus)?.outerHTML;

		console.log("meta table: ", metaTable);
		console.log("learning materials box: ", learningMaterialsBox);

		if (!metaTable || !learningMaterialsBox) {
			const missing = [
				!metaTable && "course meta table (table[data-course-meta])",
				!learningMaterialsBox && '"Week 1 Learning Materials Preview" box',
			].filter(Boolean);
			return fail(
				`This course's syllabus is missing its ${missing.join(" and ")}. Nothing was changed.`,
			);
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

		// Keep the course's own "Instructor Name: See Homepage" line in place of the template's.
		// If either side doesn't have one, the template's line is left as it is.
		const templateInstructorName = findInstructorNameParagraph(finalTemplateDom);
		if (templateInstructorName && courseInstructorNameHtml) {
			templateInstructorName.outerHTML = courseInstructorNameHtml;
		} else if (!courseInstructorNameHtml) {
			console.log("No 'Instructor Name' line in the course syllabus; keeping the template's.");
		}

		// Serialize the modified template to HTML string
		const finalHtmlFromTemplate = finalTemplateDom.documentElement.outerHTML;

		// Prepend the meta table at the very top
		const finalDoc = parser.parseFromString(finalHtmlFromTemplate, "text/html");
		finalDoc.body.insertAdjacentHTML("afterbegin", metaTableHtml);
		const finalSyllabus = finalDoc.documentElement.outerHTML;

		// Keep the syllabus as it is now, so the sync can be undone if the result looks wrong
		const undoAvailable = saveSnapshot({
			courseId: Number(course.id),
			courseName: course.name ?? "",
			savedAt: Date.now(),
			originalHtml: courseSyllabus,
			syncedFingerprint: null,
		});

		try {
			// Awaited so async failures (e.g. a rejected Canvas request) are caught instead of lost
			await course.changeSyllabus(finalSyllabus);
		} catch (e: any) {
			clearSnapshot(); // nothing was changed, so there is nothing to undo
			throw new Error(`Error changing syllabus in course: ${e}`);
		}

		if (undoAvailable) await rememberSyncedSyllabus(course);

		return { success: true, message: "Syllabus synced successfully.", undoAvailable };
	} catch (err) {
		return fail(err instanceof Error ? err.message : String(err));
	}
}
