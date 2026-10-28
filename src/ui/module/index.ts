import assert from "assert";


import {getNeverLockedPageIds, lockBlueprintChunked, unlockNeverLockedPages} from "@/publish/publishInterface/lockBlueprintChunked";
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
                if (btn.getAttribute("aria-disabled") === "true") return;
                btn.innerHTML = "Locking...";
                btn.setAttribute("aria-disabled", "true");
                try {
                    const neverLock = await getNeverLockedPageIds(course);
                    const failures = await lockBlueprintChunked(
                        course.id,
                        await course.getModules(),
                        (status, completion) => {
                            btn.innerHTML = `${status} ${completion}%`;
                        },
                        undefined,
                        undefined,
                        neverLock
                    );
                    await unlockNeverLockedPages(course);
                    btn.innerHTML = failures.length > 0 ? "Locked with errors" : "Locked!";
                    if (failures.length > 0) {
                        const failedItems = failures
                            .map(({item, error}) => {
                                const label = item.title || `${item.type} ${item.content_id ?? item.id}`;
                                const reason = error instanceof Error ? error.message : String(error);
                                return `• ${label}: ${reason}`;
                            })
                            .join("\n");
                        alert(`${failures.length} item(s) could not be locked:\n${failedItems}`);
                    }
                    location.reload();
                } catch (error) {
                    btn.innerHTML = "Locking failed";
                    btn.removeAttribute("aria-disabled");
                    alert(`Could not complete blueprint locking: ${error instanceof Error ? error.message : String(error)}`);
                }
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
