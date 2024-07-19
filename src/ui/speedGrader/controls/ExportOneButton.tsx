import {UiHandlerProps} from "@/ui/speedGrader/controls/UiHandlerProps";
import {Course} from "@/canvas/course/Course";
import {exportData} from "@/ui/speedGrader/exportAndRender/exportData";
import React from "react";
import {ICourseData} from "@/canvas/courseTypes";
import {Assignment} from "@/canvas/content/assignments/Assignment";
import {IAssignmentData} from "@/canvas/content/assignments/types";

export type ExportOneButtonProps = UiHandlerProps & { course: ICourseData, assignment?: IAssignmentData | null };

export default function ExportOneButton({course, assignment, ...handlers}: ExportOneButtonProps) {

    return <button id="export_one_btn" onClick={async (event) => {
        event.preventDefault();
        if (!course) return;
        console.log(`Export ${assignment?.name}`)
        handlers.popUp("Exporting scores, please wait...", "Exporting");

        await exportData(course, handlers, assignment);
        handlers.popClose();
        return false;
    }}>Rubrics:Assignment
    </button>
}