import {Course} from "@/canvas/course/Course";
import {UiHandlerProps} from "@/ui/speedGrader/controls/UiHandlerProps";
import {Assignment} from "@/canvas/content/Assignment";
import {csvRowsForCourse} from "@/ui/speedGrader/exportAndRender/csvRowsForCourse";
import {saveDataGenFunc} from "@/ui/speedGrader/saveDataGenFunc";
import {IAssignmentData} from "@/canvas/content/types";
import {ICourseData} from "@/canvas/courseTypes";

export async function exportData(course: ICourseData, {
    popUp,
    popClose,
    showError
}: UiHandlerProps, assignment: IAssignmentData | null = null) {
    try {
        window.addEventListener("error", showError);
        let csvRows = await csvRowsForCourse(course, assignment)
        let filename = assignment ? assignment.name : course.courseCode;
        filename ??= "COURSE CODE NOT FOUND"
        saveDataGenFunc()(csvRows, `Rubric Scores ${filename.replace(/[^a-zA-Z 0-9]+/g, '')}.csv`);
        window.removeEventListener("error", showError);

    } catch (e) {
        popClose();
        popUp(`ERROR ${e} while retrieving assignment data from Canvas. Please refresh and try again.`, "OK");
        window.removeEventListener("error", showError);
        throw (e);
    }
}