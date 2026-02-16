import { UiHandlerProps } from "@/ui/speedGrader/controls/UiHandlerProps";
import { exportData } from "@/ui/speedGrader/exportAndRender/exportData";
import React from "react";
import { ICourseData } from "@ueu/ueu-canvas";

import { IAssignmentData } from "@ueu/ueu-canvas";

export type ExportOneButtonProps = UiHandlerProps & { course: ICourseData; assignment?: IAssignmentData | null };

export default function ExportOneButton({ course, assignment, ...handlers }: ExportOneButtonProps) {
  return (
    <button
      id="export_one_btn"
      onClick={async (event) => {
        event.preventDefault();
        if (!course) return;
        console.log(`Export ${assignment?.name}`);
        handlers.popUp("Exporting scores, please wait...", "Exporting");

        await exportData(course, handlers, assignment);
        handlers.popClose();
        return false;
      }}
    >
      Rubrics:Assignment
    </button>
  );
}
