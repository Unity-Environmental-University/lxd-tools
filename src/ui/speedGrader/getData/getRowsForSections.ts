import {Course} from "@/canvas/course/Course";
import {csvRowsForCourse} from "@/ui/speedGrader/exportAndRender/csvRowsForCourse";
import {saveDataGenFunc} from "@/ui/speedGrader/saveDataGenFunc";
import {MAX_SECTION_SLICE_SIZE} from "@/ui/speedGrader/consts";
import {ICourseData} from "@/canvas/courseTypes";

export async function getRowsForSections(sections: ICourseData[], sectionsAtATime = MAX_SECTION_SLICE_SIZE) {
    const allSectionRows: string[] = [];
    let sectionsLeftToProcess = sections.slice(0);
    while (sectionsLeftToProcess.length > 0) {
        const sliceToProcessNow = sectionsLeftToProcess.slice(0, sectionsAtATime);
        sectionsLeftToProcess = sectionsLeftToProcess.slice(sectionsAtATime);
        const rowsOfRows = await Promise.all(sliceToProcessNow.map(async (section) => {
            const sectionRows = await csvRowsForCourse(section);
            saveDataGenFunc()(sectionRows, `Rubric Scores ${section.courseCode}.csv`);
            return sectionRows;
        }))
        for (let rowSet of rowsOfRows) {
            for (let row of rowSet) {
                allSectionRows.push(row);
            }
        }
    }
    return allSectionRows;
}