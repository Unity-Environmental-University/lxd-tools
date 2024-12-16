import {Course} from "@/canvas/course/Course";
import {ITermData, Term} from "@/canvas/term/Term";
import assert from "assert";
import {getRowsForSections} from "@/ui/speedGrader/getData/getRowsForSections";
import {saveDataGenFunc} from "@/ui/speedGrader/saveDataGenFunc";
import {sectionDataGenerator} from "@/canvas/course/blueprint";
import {ICourseData} from "@/canvas/courseTypes";
import getCourseIdFromUrl from "@/canvas/course/getCourseIdFromUrl";
import {getCourseById, getCourseData} from "@/canvas/course";
import {renderAsyncGen} from "@canvas/canvasUtils";
import {getSections} from "@canvas/course/getSections";



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