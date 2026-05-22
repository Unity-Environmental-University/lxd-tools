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

    // Update course syllabus
    const updatedSyllabus = useSyllabusStore.getState().draftHtml;
    await useSyllabusStore.getState().updateSyllabus(course, updatedSyllabus);
  }

  return <button onClick={() => syncSyllabus(course)}>Sync syllabus</button>;
}
