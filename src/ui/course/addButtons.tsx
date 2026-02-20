import ReactDOM from "react-dom/client";
import {HighlightBigImages} from "@/ui/course/HighlightBigImages";
import React from "react";
import {Course} from '@ueu/ueu-canvas/course/Course';
import openThisContentInTarget from "@ueu/ueu-canvas/content/openThisContentInTarget";
import {HomeTileApp} from "@/ui/course/HomeTileApp";
import {BpButton} from "@/ui/course/BpButton";
import {BaseContentItem} from "@ueu/ueu-canvas/content/BaseContentItem";
import {resizeBannerOnItem} from "@/ui/course/resizeBanner";
import {getExternalLinks, getFileLinks} from "@ueu/ueu-canvas/content/getContentFuncs";
import {getContentKindFromUrl} from "@ueu/ueu-canvas/content/determineContent";
import {RubricButton} from "@/ui/course/RubricButton";
import DiscussionKind from "@ueu/ueu-canvas/content/discussions/DiscussionKind";
import AssignmentKind from "@ueu/ueu-canvas/content/assignments/AssignmentKind";

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
    const sectionBtn = document.createElement('btn');
    sectionBtn.classList.add('btn');
    sectionBtn.innerHTML = "Sections";
    sectionBtn.title = "Open all sections associated with the current BP for this course."
    const sections = await bp.getAssociatedCourses();
    if (!sections) return;
    header.append(sectionBtn);
    sectionBtn.addEventListener('click', async () => await openThisContentInTarget(sourceCourse, sections))
}

export async function addDevButton(header: HTMLElement, course: Course) {
    if(course.courseCode && !course.courseCode.includes('DEV')) {
      const parentCourse = await course.getParentCourse();

      if (parentCourse) {
          const parentBtn = document.createElement('btn');

          parentBtn.classList.add('btn');
          parentBtn.innerHTML = "DEV";
          parentBtn.title = "Open the dev version of this course"
          header?.append(parentBtn);
          parentBtn.addEventListener('click', async () => await openThisContentInTarget(course, parentCourse))
      }
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
    const btn = document.createElement('btn');
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
    for (const url of urls) window.open(url, "_blank");
}

export function openContentExternalLinks(contentItem: BaseContentItem) {
    if(!contentItem.body) return;
    const urls = new Set(getExternalLinks(contentItem.body, contentItem.courseId));
    for (const url of urls) window.open(url, "_blank");
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
        const itemWithResizeBanner = {
            courseId: currentContentItem.courseId,
            resizeBanner: (maxWidth?: number) => resizeBannerOnItem(currentContentItem, maxWidth),
        };
        rootDiv.render(
            <HighlightBigImages el={notification} bannerImage={image} currentContentItem={itemWithResizeBanner}
                                resizeTo={1200}/>
        );
        document.body.append(root);
    }
}

export async function addRubricButton(header: HTMLElement) {
    const page = window.document.URL;
    const course = await Course.getFromUrl(page);
    const contentKind = getContentKindFromUrl(page);

    if(!course) return;

    if(contentKind === AssignmentKind || contentKind === DiscussionKind) {
        const rootDiv = document.createElement('div');
        header.append(rootDiv);
        const rubricButtonRoot = ReactDOM.createRoot(rootDiv);
        rubricButtonRoot.render(
            <RubricButton course={course}/>
        );
    }
}