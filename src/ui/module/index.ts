import assert from "assert";


import {getNeverLockedPageIds, lockBlueprintChunked, unlockNeverLockedPages} from '@publish/publishInterface/lockBlueprintChunked';
import {Course} from '@ueu/ueu-canvas/course/Course';
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
            const unlockBtn = document.createElement('btn');
            unlockBtn.innerHTML = "Unlock Profile & Home";
            moduleHeader.insertBefore(unlockBtn, moduleHeader.firstChild);
            unlockBtn.classList.add('btn');
            unlockBtn.addEventListener('click', async () => {
                unlockBtn.innerHTML = "Unlocking...";
                await unlockNeverLockedPages(course);
                unlockBtn.innerHTML = "Unlocked!";
            });
            btn.addEventListener('click', async () => {
                btn.innerHTML = "Locking...";
                await lockBlueprintChunked(course.id, await course.getModules(), undefined, undefined, undefined, await getNeverLockedPageIds(course));
                // Lock first, unlock last so profile/home end up unlocked.
                await unlockNeverLockedPages(course);
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