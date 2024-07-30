import ReactDOM from "react-dom/client";
import {HighlightBigImages} from "@/ui/course/HighlightBigImages";
import React from "react";
import {Course} from "@/canvas/course/Course";
import openThisContentInTarget from "@/canvas/content/openThisContentInTarget";
import {HomeTileApp} from "@/ui/course/HomeTileApp";
import {BpButton} from "@/ui/course/BpButton";
import {BaseContentItem} from "@/canvas/content/BaseContentItem";
import {getExternalLinks, getFileLinks} from "@/canvas/content/getContentFuncs";
import {ContentKinds} from "@/canvas/content/determineContent";

export function addHomeTileButton(el: HTMLElement, course: Course) {
    const root = document.createElement("div")
    const rootDiv = ReactDOM.createRoot(root);
    rootDiv.render(
        <HomeTileApp el={el} course={course}/>
    );
    document.body.append(root);
}

export async function addSectionsButton(header: HTMLElement, bp: Course, currentCourse: Course | null = null) {
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

export async function addDevButton(header: HTMLElement, course: Course) {
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

export async function addBpButton(header: HTMLElement, currentCourse: Course, currentBp?: Course) {
    const rootDiv = document.createElement('div');
    header.append(rootDiv);
    const bpButtonRoot = ReactDOM.createRoot(rootDiv);
    bpButtonRoot.render(<BpButton course={currentCourse} currentBp={currentBp}/>)
}

export async function addOpenAllLinksButton(
    header: HTMLElement,
    currentContentItem: BaseContentItem
) {
    let btn = document.createElement('btn');
    btn.classList.add('btn');
    btn.innerHTML = "Links";
    btn.title = "Open all links in the content of this page into their own tabs."
    header.append(btn);
    if (!currentContentItem) return;
    btn.addEventListener('click', () => {
        openContentFiles(currentContentItem);
        openContentExternalLinks(currentContentItem);
    })
    return btn;
}

export function openContentFiles(contentItem: BaseContentItem) {
    if(!contentItem.body) return;
    const urls = new Set(getFileLinks(contentItem.body, contentItem.courseId));
    for (let url of urls) window.open(url, "_blank");
}

export function openContentExternalLinks(contentItem: BaseContentItem) {
    if(!contentItem.body) return;
    const urls = new Set(getExternalLinks(contentItem.body, contentItem.courseId));
    for (let url of urls) window.open(url, "_blank");
}


export function addHighlightBigImageResizer(currentContentItem: BaseContentItem) {
    const bannerImageContainer = document.querySelector<HTMLDivElement>('div.cbt-banner-image');
    if (!bannerImageContainer) return;
    const image = bannerImageContainer.querySelector('img')
    if (!image) return;

    if (image.naturalWidth > 2000) {
        const notification = document.createElement('div');
        bannerImageContainer.parentElement?.append(notification)
        const root = document.createElement("div")
        const rootDiv = ReactDOM.createRoot(root);
        rootDiv.render(
            <HighlightBigImages el={notification} bannerImage={image} currentContentItem={currentContentItem}
                                resizeTo={1200}/>
        );
        document.body.append(root);
    }
}