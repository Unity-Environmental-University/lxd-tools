import {Course} from "@ueu/ueu-canvas/course/Course";

export async function getTermNameFromSections(sections: Course[]) {
    const [section] = sections;
    if (!section) throw new Error("Cannot determine term name by sections; there are no sections.")
    const sectionTerm = await section.getTerm();
    if (!sectionTerm) throw new Error("Section does not have associated term: " + section.name);
    return sectionTerm.name;
}