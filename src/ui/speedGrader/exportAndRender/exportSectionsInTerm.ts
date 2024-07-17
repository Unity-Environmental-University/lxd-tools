import {Course} from "@/canvas/course/Course";
import {Term} from "@/canvas/Term";
import assert from "assert";
import {getRowsForSections} from "@/ui/speedGrader/getData/getRowsForSections";
import {saveDataGenFunc} from "@/ui/speedGrader/saveDataGenFunc";
import {getSections, sectionDataGenerator} from "@/canvas/course/blueprint";
import {ICourseData} from "@/canvas/courseTypes";
import getCourseIdFromUrl from "@/canvas/course/getCourseIdFromUrl";
import {getCourseById, getCourseData} from "@/canvas/course";
import {renderAsyncGen} from "@/canvas/fetch";

export async function exportSectionsInTerm(course: ICourseData | null = null, term: Term | number | null = null) {

    const courseId = getCourseIdFromUrl(document.documentURI);
    if(!course) {
        if(!courseId) return;
        course = await getCourseData(courseId);
    }
    assert(course)
    if (typeof term === "number") {
        term = await Term.getTermById(term);
    } else if (course.term) {
        term ??= new Term(course.term);
    }

    assert(term);
    assert(course);
    assert(courseId !== null);

    let sections = sectionDataGenerator(courseId);
    const allSectionRows: string[] = sections ? await getRowsForSections(await renderAsyncGen(sections)) : [];
    saveDataGenFunc()(allSectionRows, `${term.name} ${course.baseCode} All Sections.csv`);
    return allSectionRows;
}