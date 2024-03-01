import {BaseContentItem, Course, formDataify, Page} from "../../canvas";
import assert from "assert";

(async () => {
    const currentCourse = await Course.getFromUrl(document.documentURI);
    if (!currentCourse) return;
    let header: HTMLElement | null = document.querySelector('.right-of-crumbs');
    if (!header) return;
    let bp: Course | null;

    if (currentCourse.isBlueprint) {
        await addDevButton(header, currentCourse);
        addSectionsButton(header, currentCourse);
    } else {
        bp = await Course.getByCode(`BP_${currentCourse.baseCode}`);
        if (bp) {
            await addBpButton(header, bp, currentCourse);
            addSectionsButton(header, bp, currentCourse);
        }
    }

    let moduleCardsEl: HTMLElement | null = document.querySelector('.cbt-home-cards');
    console.log(moduleCardsEl);
    //Not working due to CORS issue;  likely need server to proxy images.
    if (moduleCardsEl) await addHomeTilesButton(moduleCardsEl, currentCourse);


})();

function addSectionsButton(header: HTMLElement, bp: Course, currentCourse: Course | null = null) {
    if (!currentCourse) currentCourse = bp;
    let sectionBtn = document.createElement('btn');
    sectionBtn.classList.add('btn');
    sectionBtn.innerHTML = "Open Sections";
    header.append(sectionBtn);
    sectionBtn.addEventListener('click', async () => {
        let sections = await bp.getAssociatedCourses();
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
            if (parentCourse && window) {
                window.open(parentCourse.courseUrl);
            }
        })
    }
}

async function addBpButton(header: HTMLElement, bp: Course, currentCourse: Course) {
    let bpBtn = document.createElement('btn');
    bpBtn.classList.add('btn');
    bpBtn.innerHTML = "BP";
    header.append(bpBtn);
    let currentContentItem : BaseContentItem | null = await currentCourse.getContentItemFromUrl();
    let targetContentItem = await currentContentItem?.getMeInAnotherCourse(bp);


    bpBtn.addEventListener('click', async () => {
        if (window) {
            if(targetContentItem) {
                window.open(targetContentItem.htmlContentUrl);
            } else {
                let url = document.URL.replace(currentCourse.id.toString(), bp.id.toString())
                window.open(bp.courseUrl);
            }

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
