import {NotImplementedException} from "../../canvas";
import ReactDOM from "react-dom/client";
import React from "react";

import assert from "assert";
import {HomeTileApp} from "./HomeTileApp";
import {Assignment, BaseContentItem} from "../../canvas/content";
import {Course} from "../../canvas/course";

(async () => {
    const currentCourse = await Course.getFromUrl(document.documentURI);
    const CurrentContentClass = Course.getContentClassFromUrl();
    const currentContentItem = await CurrentContentClass?.getFromUrl();

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
    if(currentContentItem) {
        await addOpenAllLinksButton(header, currentContentItem);
    }
    const homeTileHost = document.querySelector('#Modules-anchor');

    if(homeTileHost) {
        console.log(homeTileHost);
        const buttonHolder = document.createElement('div');
        homeTileHost.append(buttonHolder);
        addHomeTileButton(buttonHolder,  currentCourse );
    }

})();

function addHomeTileButton(el:HTMLElement, course:Course) {

    const root = document.createElement("div")
    const rootDiv = ReactDOM.createRoot(root);
    rootDiv.render(
        <HomeTileApp el={el} course={course} />
    );
    document.body.append(root);
}

async function openThisContentInTarget(currentCourse: Course, target: Course | Course[]) {
    if (!window) return;
    let currentContentItem: BaseContentItem | null = await currentCourse.getContentItemFromUrl();
    let targetCourses = Array.isArray(target) ? target : [target];
    let targetInfos = targetCourses.map((targetCourse) => {
        return {
            course: targetCourse,
            contentItemPromise: currentContentItem?.getMeInAnotherCourse(targetCourse.id)
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
    sectionBtn.innerHTML = "Sections";
    sectionBtn.title = "Open all sections associated with the current BP for this course."
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
        parentBtn.title = "Open the dev version of this course"
        header?.append(parentBtn);
        parentBtn.addEventListener('click', async () => await openThisContentInTarget(course, parentCourse))
    }
}

async function addBpButton(header: HTMLElement, bp: Course, currentCourse: Course) {
    let bpBtn = document.createElement('btn');
    bpBtn.classList.add('btn');
    bpBtn.innerHTML = "BP";
    bpBtn.title = "Open the blueprint version of this course"
    header.append(bpBtn);

    bpBtn.addEventListener('click', async () => await openThisContentInTarget(currentCourse, bp))

}

async function addOpenAllLinksButton(
    header: HTMLElement,
    currentContentItem: BaseContentItem
) {
    let btn = document.createElement('btn');
    btn.classList.add('btn');
    btn.innerHTML = "Links";
    btn.title = "Open all links in the content of this page into their own tabs."
    header.append(btn);
    if(!currentContentItem) return;
    btn.addEventListener('click', () => openAllLinksInContent(currentContentItem))
}


function openAllLinksInContent(contentItem: BaseContentItem) {
    const urls = new Set(contentItem.getAllLinks());

    for(let url of urls) window.open(url, "_blank");
}

function GenerateAltText() {

}

