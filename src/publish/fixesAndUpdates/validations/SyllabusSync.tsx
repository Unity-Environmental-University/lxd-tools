import { Course, getCourseById, NotImplementedException } from "@ueu/ueu-canvas";
import { useSyllabusStore } from "../syllabusStore";

// TODO; Implement extractCourseSpecificInfo
// TODO; Implement restoreCourseSpecificInfo
// TODO; Pass/fail feedback for simple swap step
// // Evolve when the feedback comes on
// TODO; console.logs for debugging
// TODO; Test simple swap and get it working
// TODO; Implment removeCourseSpecificInfo
// TODO; Introduce diffing between parsedTempSyllabus and genericizedCourseSyllabus
// TODO; Introduce UI for assessing changes
// TODO; Replace courseSpecificInfo implementation for one that is friendly for the accepted changes
// TODO; Update feedback for pass/fail
// TODO; add more console.logs for debugging next steps
// TODO; Test and get working
// TODO; Remove excessive console.logs
// TODO; Test coverage

export function SyllabusSync({ course }: { course: Course }) {
  async function syncSyllabus(course: Course) {
    // WARN; Right now, this is in a state where it's both aiming to do a simple boilerplate swap while also setting up some things for when it eventually has a UI that will allow users to confirm changes don't disrupt anything. Because of that, there are some unused things in place, and when it becomes time to take that step, it'll be vital to read through it to make sure we're correctly removing the simple swap things and implementing the diffing properly

    // Get template syllabus
    const templateCourse = await getCourseById(8061526);
    const templateSyllabus = await templateCourse.getSyllabus();

    // Get course syllabus
    await useSyllabusStore.getState().fetchSyllabus(course);
    const syllabus = useSyllabusStore.getState().originalHtml;

    // Pull course specific info
    const parser = new DOMParser();
    const parsedTempSyllabus = parser.parseFromString(templateSyllabus, "text/html");
    const parsedSyllabus = parser.parseFromString(syllabus, "text/html");
    const courseSpecificInfo = extractCourseSpecificInfo(parsedTempSyllabus, parsedSyllabus);
    // This will be more useful when we start diffing, right now, we're simply bypassing it, replacing the syllabus with template syllabus and then putting course specific info it
    const genericizedCourseSyllabus = removeCourseSpecificInfo(parsedSyllabus, courseSpecificInfo);

    // Put the course specific info into the boilerplate syllabus
    const updatedHtml = restoreCourseSpecificInfo(parsedTempSyllabus, courseSpecificInfo);
    useSyllabusStore.getState().setDraftHtml(updatedHtml);

    const updatedSyllabus = useSyllabusStore.getState().draftHtml;
    await useSyllabusStore.getState().updateSyllabus(course, updatedSyllabus);
  }

  function extractCourseSpecificInfo(parsedTempSyllabus: Document, parsedSyllabus: Document) {
    // TODO; Find the css data attributes in the parsedTempSyllabus
    // TODO; Find the correlating course specific information from parsedSyllabus
    // TODO; Add them to as a pair of strings to the output
    return NotImplementedException as unknown as [string, string];
  }

  function removeCourseSpecificInfo(parsedSyllabus: Document, courseSpecificInfo: [string, string]) {
    // TODO; Pull just the courseSpecificInfo out of the array pairs, save to an array
    // TODO; Find and delete each course specific info strings
    return NotImplementedException as unknown as Document;
  }

  function restoreCourseSpecificInfo(parsedTempSyllabus: Document, courseSpecificInfo: [string, string]) {
    // TODO; Find the css data attribute from courseSpecificInfo in parsedTempSyllabus
    // TODO; Put the matching info string into the syllabus with the parsed info
    // TODO; Turn the Document back into a string
    return NotImplementedException as unknown as string;
  }

  return <button onClick={() => syncSyllabus(course)}>Sync syllabus</button>;
}
