import {UiHandlerProps} from "@/ui/speedGrader/controls/UiHandlerProps";
import {Course} from "@/canvas/course/Course";
import {Assignment} from "@/canvas/content/Assignment";
import {exportData} from "@/ui/speedGrader/exportAndRender/exportData";
import React from "react";
import {IAssignmentData} from "@/canvas/content/types";
import {ICourseData} from "@/canvas/courseTypes";

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