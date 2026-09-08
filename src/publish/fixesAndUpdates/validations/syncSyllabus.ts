import { Course, getCourseById } from "@ueu/ueu-canvas";
import { useSyllabusStore } from "../syllabusStore";
import DiffMatchPatch from "diff-match-patch";

export async function syncSyllabus(course: Course) {
	console.log("Inside syncSyllabus");
	// Get template syllabus
	const templateCourse = await getCourseById(8217232);
	const templateSyllabus = await templateCourse.getSyllabus();

	console.log("template syllabus: ", templateSyllabus);

	// Get course syllabus
	await useSyllabusStore.getState().fetchSyllabus(course);
	const syllabus = useSyllabusStore.getState().originalHtml;

	console.log("syllabus: ", syllabus);

	// Parse syllabi
	const parser = new DOMParser();
	const parsedCourseSyllabus = parser.parseFromString(syllabus, "text/html");
	const parsedTemplateSyllabus = parser.parseFromString(templateSyllabus, "text/html");

	// Pull course-specific information table and Week 1 LMs out of syllabus
	const metaTable = parsedCourseSyllabus.querySelector('table[data-course-meta]');
	const calloutBoxes = Array.from(parsedCourseSyllabus.querySelectorAll(".cbt-callout-box"));


	const learningMaterialsBox = calloutBoxes.find(box =>
		box.textContent.toLowerCase().includes("week 1 learning materials preview")
	);

	console.log("meta table: ", metaTable);
	console.log("learning materials box: ", learningMaterialsBox);

	if (!metaTable || !learningMaterialsBox) {
		console.log("Unable to find metaTabl or learning material box.");
		return;
	}

	const metaTableHtml = metaTable.outerHTML;
	const learningMaterialsBoxHtml = learningMaterialsBox.outerHTML;

	console.log("meta table html: ", metaTableHtml);
	console.log("learning materials box html: ", learningMaterialsBoxHtml);

	metaTable.remove();
	learningMaterialsBox.remove();

	// Remove the same boxes from the template syllabus, if it exists
	const templateMetaTable = parsedTemplateSyllabus.querySelector('table[data-course-meta]');
  const templateLmBox = Array.from(parsedTemplateSyllabus.querySelectorAll(".cbt-callout-box")).find(box =>
    box.textContent?.toLowerCase().includes("week 1 learning materials preview")
  );

  templateMetaTable?.remove();
  templateLmBox?.remove();

	const cleanedCourseSyllabus = parsedCourseSyllabus.body.innerHTML;
	const cleanedTemplateSyllabus = parsedTemplateSyllabus.body.innerHTML;


  // TODO Compare syllabus to templateSyllabus, store differences

	const dmp = new DiffMatchPatch();

	const patches = dmp.patch_make(cleanedCourseSyllabus, cleanedTemplateSyllabus);

	console.log("patches: ", patches);

	const [patchedHtml] = dmp.patch_apply(patches, cleanedCourseSyllabus);

	console.log("pateched html: ", [patchedHtml]);

	const finalSyllabus = parser.parseFromString(patchedHtml, "text/html");
	finalSyllabus.body.insertAdjacentHTML("afterbegin", metaTableHtml);
	finalSyllabus.body.insertAdjacentHTML("beforeend", learningMaterialsBoxHtml)

	console.log("final syllabus: ", finalSyllabus);

	// TODO PHASE TWO - Give the user a chance to review the changes and accept/decline them

  // Update course syllabus
  const updatedSyllabus = finalSyllabus.body.innerHTML;
  await useSyllabusStore.getState().updateSyllabus(course, updatedSyllabus);
}
