import assert from "assert";


import {lockBlueprint} from "../../canvas/course/blueprint";
import {Course} from "../../canvas/course/Course";
import {assignmentDataGen, updateAssignmentDueDates} from "@ueu/ueu-canvas/content/assignments";
import {renderAsyncGen} from "@ueu/ueu-canvas/canvasUtils";



(async () => {
    const course = await Course.getFromUrl(document.documentURI);

    const moduleHeader = document.querySelector('.header-bar-right__buttons');

    if (moduleHeader) {
        if (course?.isBlueprint) {
            const btn = document.createElement('btn');
            btn.innerHTML = "Lock All";
            moduleHeader.insertBefore(btn, moduleHeader.firstChild);
            btn.classList.add('btn');
            btn.addEventListener('click', async () => {
                btn.innerHTML = "Locking...";
                await lockBlueprint(course.id, await course.getModules());
                btn.innerHTML = "Locked!";
                location.reload();

            })
        }

        const btn = document.createElement('btn');
        btn.classList.add('btn');
        btn.innerHTML = "Adjust Due Dates";

        moduleHeader.insertBefore(btn, moduleHeader.firstChild);
        btn.addEventListener('click', async () => {
            const offset = prompt("Days to offset by?")
            assert(course);
            assert(offset);
            const assignments = await renderAsyncGen(assignmentDataGen(course.id));
            await updateAssignmentDueDates(parseInt(offset), assignments);
            location.reload();
        })
    }

})();