import {UiHandlerProps} from "@/ui/speedGrader/controls/UiHandlerProps";
import {exportSectionsInTerm} from "@/ui/speedGrader/exportAndRender/exportSectionsInTerm";
import React from "react";
import {ICourseData} from "@ueu/ueu-canvas/courseTypes";
import {ITermData} from "@ueu/ueu-canvas/term/Term";

export type ExportSectionsButtonProps = UiHandlerProps & {
    course: ICourseData &{ term: ITermData},
}

export default function ExportAcrossSectionsButton({course, ...handlers}: ExportSectionsButtonProps) {
    return <button id="all_sections" onClick={async (event) => {
        event.preventDefault();
        handlers.popUp("Exporting scores, please wait...", "Exporting");
        try {
            await exportSectionsInTerm(course);
            handlers.popClose();
        } catch (e) {
            handlers.popClose();
            handlers.popUp(`ERROR ${e} while retrieving assignment data from Canvas. Please refresh and try again.`, "OK");
            console.error(e);
        }

    }}>Rubrics:Term
    </button>

}