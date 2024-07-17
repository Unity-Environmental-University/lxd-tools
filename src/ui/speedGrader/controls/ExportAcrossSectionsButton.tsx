import {UiHandlerProps} from "@/ui/speedGrader/controls/UiHandlerProps";
import {Course} from "@/canvas/course/Course";
import {exportSectionsInTerm} from "@/ui/speedGrader/exportAndRender/exportSectionsInTerm";
import React from "react";
import {ICourseData} from "@/canvas/courseTypes";
import {ITermData} from "@/canvas/Term";

export type ExportSectionsButtonProps = UiHandlerProps & {
    course: ICourseData &{ term: ITermData},
}

export default function ExportAcrossSectionsButton({course, ...handlers}: ExportSectionsButtonProps) {
    return <button id="all_sections" onClick={async (event) => {
        event.preventDefault();
        handlers.popUp("Exporting scores, please wait...", "Exporting");
        await exportSectionsInTerm(course);
        handlers.popClose();

    }}>Rubrics:Term
    </button>

}