import { Course, getCourseById, NotImplementedException } from "@ueu/ueu-canvas";
import { useSyllabusStore } from "../syllabusStore";

export function SyllabusSync({ course }: { course: Course }) {
  async function syncSyllabus(course: Course) {
    // Get template syllabus
    const templateCourse = await getCourseById(8061526);
    const templateSyllabus = await templateCourse.getSyllabus();

    // Get course syllabus
    await useSyllabusStore.getState().fetchSyllabus(course);
    const syllabus = useSyllabusStore.getState().originalHtml;

    // Match course syllabus to template syllabus
    // TODO Pull course-specific information table and Week 1 LMs out of syllabus
    // TODO Compare syllabus to templateSyllabus, store differences
    // TODO if there are differences
    	// overwrite them in syllabus
      // Put the course-specific information table and Week 1 LMs back into syllabus(rather, newSyllabus)
      // Send newSyllabus back to course

		// TODO PHASE TWO - Give the user a chance to review the changes and accept/decline them

    // Update course syllabus
    const updatedSyllabus = useSyllabusStore.getState().draftHtml;
    await useSyllabusStore.getState().updateSyllabus(course, updatedSyllabus);
  }

	return <button onClick={() => syncSyllabus(course)}>Sync syllabus</button>;
  // TODO Put surface this somewhere
}
