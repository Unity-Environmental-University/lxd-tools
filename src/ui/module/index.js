import {Course} from "../../canvas";

(async () => {
    const course = await Course.getFromUrl(document.documentURI);

    let moduleHeader = document.querySelector('.header-bar-right__buttons');

    if (moduleHeader) {
        if (course.isBlueprint) {
            let btn = document.createElement('btn');
            btn.innerHTML = "Lock All";
            moduleHeader.insertBefore(btn, moduleHeader.firstChild);
            btn.classList.add('btn');
            btn.addEventListener('click', async () => {
                await course.lockBlueprint();
                location.reload();
            })
        }

        let btn = document.createElement('btn');
        btn.classList.add('btn');
        btn.innerHTML = "Adjust Due Dates";

        moduleHeader.insertBefore(btn, moduleHeader.firstChild);
        btn.addEventListener('click', async () => {
            let offset = prompt("Days to offset by?")

            let promises = [];
            let assignments = await course.getAssignments();
            let quizzes = await course.getQuizzes();

            if (offset === '0' || offset) {
                for (let assignment of assignments) {
                    console.log(assignment);
                    promises.push(assignment.dueAtTimeDelta(Number(offset)));
                }

                for (let quiz of quizzes) {
                    promises.push(quiz.dueAtTimeDelta(Number(offset)));
                }
            }
            await Promise.all(promises);
            location.reload();
        })
    }

})();