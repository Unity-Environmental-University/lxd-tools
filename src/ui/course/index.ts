import {Course, formDataify} from "../../canvas";
import assert from "assert";

(async () => {
    const course = await Course.getFromUrl(document.documentURI);
    if (!course) return;
    let header: HTMLElement | null = document.querySelector('.right-of-crumbs');
    if (!header) return;
    let bp: Course | null;

    if (course.isBlueprint) {
        await addDevButton(header, course);
        addSectionsButton(header, course);
    } else {
        bp = await Course.getByCode(`BP_${course.baseCode}`);
        if (bp) {
            await addBpButton(header, bp);
            addSectionsButton(header, bp);
        }
    }

    let moduleCardsEl: HTMLElement | null = document.querySelector('.cbt-home-cards');
    console.log(moduleCardsEl);
    //Not working due to CORS issue;  likely need server to proxy images.
    //if (moduleCardsEl) await addHomeTilesButton(moduleCardsEl, course);


})();

function addSectionsButton(header: HTMLElement, course: Course) {

    let sectionBtn = document.createElement('btn');
    sectionBtn.classList.add('btn');
    sectionBtn.innerHTML = "Open Sections";
    header.append(sectionBtn);
    sectionBtn.addEventListener('click', async () => {
        let sections = await course.getAssociatedCourses();
        if (sections) sections.forEach(section => window.open(section.courseUrl));
    })
}

async function addDevButton(header: HTMLElement, course: Course) {
    let parentCourse = await course.getParentCourse();
    if (parentCourse) {
        let parentBtn = document.createElement('btn');

        parentBtn.classList.add('btn');
        parentBtn.innerHTML = "DEV";
        header?.append(parentBtn);

        parentBtn.addEventListener('click', async () => {
            if (parentCourse) {
                window.open(parentCourse.courseUrl);
            }
        })
    }
}

async function addBpButton(header: HTMLElement, bp: Course) {
    let bpBtn = document.createElement('btn');
    bpBtn.classList.add('btn');
    bpBtn.innerHTML = "BP";
    header.append(bpBtn);
    bpBtn.addEventListener('click', async () => {
        if (window && bp) {
            window.open(bp.courseUrl);
        }
    })
}

async function addHomeTilesButton(container: HTMLElement, course: Course) {
    console.log("Adding home tile buttons");
    let homeTileBtn = document.createElement('btn');
    homeTileBtn.classList.add('btn');
    homeTileBtn.innerHTML = "Update Home Tiles";
    homeTileBtn.addEventListener('click', async () => {
      await course.generateHomeTiles();
    })
    const parent = container.parentNode;
    if (!parent) return;
    parent.insertBefore(homeTileBtn, container);
}
