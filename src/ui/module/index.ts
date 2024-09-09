import assert from "assert";


import {lockBlueprint} from "../../canvas/course/blueprint";
import {Course} from "../../canvas/course/Course";
import {assignmentDataGen, updateAssignmentDueDates} from "@/canvas/content/assignments";
import {renderAsyncGen} from "@canvas/canvasUtils";



(async () => {
    const course = await Course.getFromUrl(document.documentURI);

    let moduleHeader = document.querySelector('.header-bar-right__buttons');

    if (moduleHeader) {
        if (course?.isBlueprint) {
            let btn = document.createElement('btn');
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

        let btn = document.createElement('btn');
        btn.classList.add('btn');
        btn.innerHTML = "Adjust Due Dates";

        moduleHeader.insertBefore(btn, moduleHeader.firstChild);
        btn.addEventListener('click', async () => {
            let offset = prompt("Days to offset by?")
            assert(course);
            assert(offset);
            const assignments = await renderAsyncGen(assignmentDataGen(course.id));
            await updateAssignmentDueDates(parseInt(offset), assignments);
            location.reload();
        })
    }

})();