import {Course} from "@/canvas/course/Course";
import {csvRowsForCourse} from "@/ui/speedGrader/exportAndRender/csvRowsForCourse";
import {saveDataGenFunc} from "@/ui/speedGrader/saveDataGenFunc";
import {MAX_SECTION_SLICE_SIZE} from "@/ui/speedGrader/consts";
import {ICourseData, SectionData} from "@/canvas/courseTypes";

export async function getRowsForSections(sections: SectionData[] | ICourseData[], sectionsAtATime = MAX_SECTION_SLICE_SIZE) {
    const allSectionRows: string[] = [];
    let sectionsLeftToProcess = sections.slice(0);
    while (sectionsLeftToProcess.length > 0) {
        const sliceToProcessNow = sectionsLeftToProcess.slice(0, sectionsAtATime);
        sectionsLeftToProcess = sectionsLeftToProcess.slice(sectionsAtATime);
        const rowsOfRows = await Promise.all(sliceToProcessNow.map(async (section) => {
            const sectionRows = await csvRowsForCourse(section);
            saveDataGenFunc()(sectionRows, `Rubric Scores ${section.course_code}.csv`);
            return sectionRows;
        }))
        for (const rowSet of rowsOfRows) {
            for (const row of rowSet) {
                allSectionRows.push(row);
            }
        }
    }
    return allSectionRows;
}