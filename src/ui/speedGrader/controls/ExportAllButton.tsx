import React from "react";
import { exportData } from "@/ui/speedGrader/exportAndRender/exportData";
import { UiHandlerProps } from "@/ui/speedGrader/controls/UiHandlerProps";
import { ICourseData } from "@ueu/ueu-canvas";

export type ExportAllButtonProps = UiHandlerProps & { course: ICourseData };

export default function ExportAllButton({ course, ...handlers }: ExportAllButtonProps) {
  return (
    <button
      id="export_all_btn"
      disabled={!course}
      onClick={async (event) => {
        if (!course) return;
        handlers.popUp("Exporting scores, please wait...", "Exporting");
        event.preventDefault();
        await exportData(course, handlers);
        handlers.popClose();
      }}
    >
      Rubrics:Section
    </button>
  );
}
