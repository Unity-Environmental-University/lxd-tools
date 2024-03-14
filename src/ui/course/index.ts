import {BaseContentItem, Course, NotImplementedException} from "../../canvas";

(async () => {
    const currentCourse = await Course.getFromUrl(document.documentURI);
    if (!currentCourse) return;
    let header: HTMLElement | null = document.querySelector('.right-of-crumbs');
    if (!header) return;
    let bp: Course | null;

    if (currentCourse.isBlueprint) {
        await addDevButton(header, currentCourse);
        await addSectionsButton(header, currentCourse);
    } else {
        bp = await Course.getByCode(`BP_${currentCourse.baseCode}`);
        if (bp) {
            await addBpButton(header, bp, currentCourse);
            await addSectionsButton(header, bp, currentCourse);
        }
    }

    let moduleCardsEl: HTMLElement | null = document.querySelector('.cbt-home-cards');
    console.log(moduleCardsEl);
    //Not working due to CORS issue;  likely need server to proxy images.
    //if (moduleCardsEl) await addHomeTilesButton(moduleCardsEl, currentCourse);


})();


async function openThisContentInTarget(currentCourse: Course, target: Course | Course[]) {
    if (!window) return;
    let currentContentItem: BaseContentItem | null = await currentCourse.getContentItemFromUrl();
    let targetCourses = Array.isArray(target) ? target : [target];
    let targetInfos = targetCourses.map((targetCourse) => {
        return {
            course: targetCourse,
            contentItemPromise: currentContentItem?.getMeInAnotherCourse(targetCourse)
        }
    });

    for (let {course, contentItemPromise} of targetInfos) {
        let targetContentItem = await contentItemPromise;
        if (targetContentItem) {
            window.open(targetContentItem.htmlContentUrl);
        } else {
            let url = document.URL.replace(currentCourse.id.toString(), course.id.toString())
            window.open(url);
        }
    }
}

async function addSectionsButton(header: HTMLElement, bp: Course, currentCourse: Course | null = null) {
    const sourceCourse = currentCourse ?? bp;
    let sectionBtn = document.createElement('btn');
    sectionBtn.classList.add('btn');
    sectionBtn.innerHTML = "Open Sections";
    const sections = await bp.getAssociatedCourses();
    if (!sections) return;
    header.append(sectionBtn);
    sectionBtn.addEventListener('click', async () => await openThisContentInTarget(sourceCourse, sections))
}

async function addDevButton(header: HTMLElement, course: Course) {
    const parentCourse = await course.getParentCourse();
    if (parentCourse) {
        let parentBtn = document.createElement('btn');

        parentBtn.classList.add('btn');
        parentBtn.innerHTML = "DEV";
        header?.append(parentBtn);
        parentBtn.addEventListener('click', async () => await openThisContentInTarget(course, parentCourse))
    }
}

async function addBpButton(header: HTMLElement, bp: Course, currentCourse: Course) {
    let bpBtn = document.createElement('btn');
    bpBtn.classList.add('btn');
    bpBtn.innerHTML = "BP";
    header.append(bpBtn);

    bpBtn.addEventListener('click', async () => await openThisContentInTarget(currentCourse, bp))

}

/**
 * NOT IMPLEMENTED
 * @ TODO: Implement this if at all possible
 * @param container
 * @param course
 */
async function addHomeTilesButton(container: HTMLElement, course: Course) {
    throw new NotImplementedException();
    // console.log("Adding home tile buttons");
    // let homeTileBtn = document.createElement('btn');
    // homeTileBtn.classList.add('btn');
    // homeTileBtn.innerHTML = "Update Home Tiles";
    // homeTileBtn.addEventListener('click', async () => {
    //   await course.generateHomeTiles();
    // })
    // const parent = container.parentNode;
    // if (!parent) return;
    // parent.insertBefore(homeTileBtn, container);
}
