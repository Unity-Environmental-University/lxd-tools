import assert from "assert";


import {Course} from "../../canvas/course";
import {lockBlueprint} from "../../canvas/course/blueprint";

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
            await course.updateDueDates(parseInt(offset));
            location.reload();
        })
    }

})();