import {ITermData, Term} from "@ueu/ueu-canvas/term/Term";
import assert from "assert";
import {getRowsForSections} from "@/ui/speedGrader/getData/getRowsForSections";
import {saveDataGenFunc} from "@/ui/speedGrader/saveDataGenFunc";
import {sectionDataGenerator} from "@ueu/ueu-canvas/course/blueprint";
import {ICourseData} from "@ueu/ueu-canvas/courseTypes";
import getCourseIdFromUrl from "@ueu/ueu-canvas/course/getCourseIdFromUrl";
import {getCourseData} from "@ueu/ueu-canvas/course";
import {renderAsyncGen} from "@ueu/ueu-canvas/canvasUtils";


export async function exportSectionsInTerm(course: ICourseData & { term: ITermData } | null = null, term: Term | number | null = null) {
    const courseId = course ? course.id : getCourseIdFromUrl(document.documentURI);
    if(!course) {
        if(!courseId) return;
        course = await getCourseData(courseId,{ queryParams: {include: ['term']}}) as ICourseData & { term: ITermData };
    }
    assert(course)
    if (typeof term === "number") {
        term = await Term.getTermById(term);
    } else if (!term) {
        term = new Term(course.term);
    }

    assert(term);
    assert(courseId !== null);

    const sections = sectionDataGenerator(courseId);
    const allSectionRows: string[] = sections ? await getRowsForSections(await renderAsyncGen(sections)) : [];
    saveDataGenFunc()(allSectionRows, `${term.name} ${course.baseCode} All Sections.csv`);
    return allSectionRows;
}