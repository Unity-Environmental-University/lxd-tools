import {Course} from "@/canvas/course/Course";
import {Term} from "@/canvas/Term";
import assert from "assert";
import {getRowsForSections} from "@/ui/speedGrader/getData/getRowsForSections";
import {saveDataGenFunc} from "@/ui/speedGrader/saveDataGenFunc";
import {getSections} from "@/canvas/course/blueprint";

export async function exportSectionsInTerm(course: Course | null = null, term: Term | number | null = null) {

    course ??= await Course.getFromUrl();
    assert(course)
    if (typeof term === "number") {
        term = await Term.getTermById(term);
    } else {
        term ??= await course?.getTerm();
    }

    assert(term);
    assert(course);

    let sections = await getSections(course);
    const allSectionRows: string[] = sections ? await getRowsForSections(sections) : [];
    saveDataGenFunc()(allSectionRows, `${term.name} ${course.baseCode} All Sections.csv`);
    return allSectionRows;
}