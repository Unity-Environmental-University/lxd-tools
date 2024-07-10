import ReactDOM from "react-dom/client";
import React, {FormEvent, useState} from "react";
import {HomeTileApp} from "./HomeTileApp";
import {BaseContentItem} from "../../canvas/content";
import {HighlightBigImages} from "./HighlightBigImages";
import {Course} from "../../canvas/course/Course";
import {Button} from "react-bootstrap";
import {useEffectAsync} from "@/ui/utils";
import {genBlueprintDataForCode} from "@/canvas/course/blueprint";
import {getContentClassFromUrl} from "@/canvas/content/getContent";
import Modal from "@/ui/widgets/Modal";
import assert from "assert";
import openThisContentInTarget from "@/canvas/content/openThisContentInTarget";

import {ICourseData} from "@/canvas/courseTypes";
import {renderAsyncGen} from "@/canvas/fetch";

(async () => {
    const currentCourse = await Course.getFromUrl(document.documentURI);
    let CurrentContentClass = getContentClassFromUrl(document.documentURI);
    let currentContentItem = await CurrentContentClass?.getFromUrl();
    if (!CurrentContentClass && /courses\/\d+/.test(document.URL)) {
        currentContentItem = await currentCourse?.getFrontPage();

    }

    if (!currentCourse) return;
    let header: HTMLElement | null = document.querySelector('.right-of-crumbs');
    if (!header) return;
    let bp: Course | undefined;

    if (currentCourse.isBlueprint()) {
        await addDevButton(header, currentCourse);
        await addSectionsButton(header, currentCourse);
    } else {
        bp = await Course.getByCode(`BP_${currentCourse.baseCode}`);
        await addBpButton(header, currentCourse);
        if (bp) {
            await addSectionsButton(header, bp, currentCourse);
        }
    }
    if (currentContentItem) {
        await addOpenAllLinksButton(header, currentContentItem);
        addHighlightBigImageResizer(currentContentItem);
    }
    const homeTileHost = document.querySelector('#Modules-anchor');

    if (homeTileHost) {
        console.log(homeTileHost);
        const buttonHolder = document.createElement('div');
        homeTileHost.append(buttonHolder);
        addHomeTileButton(buttonHolder, currentCourse);
    }

})();

function addHomeTileButton(el: HTMLElement, course: Course) {
    const root = document.createElement("div")
    const rootDiv = ReactDOM.createRoot(root);
    rootDiv.render(
        <HomeTileApp el={el} course={course}/>
    );
    document.body.append(root);
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

type BpButtonProps = {
    course: Course,
    currentBp?: Course,
}

function BpButton({course, currentBp}: BpButtonProps) {
    const [bps, setBps] = useState<ICourseData[]>([])
    const [open, setOpen] = useState(false);
    useEffectAsync(async () => {
        const bpGen = genBlueprintDataForCode(course.courseCode, [course.accountId, course.rootAccountId])
        setBps(bpGen ? await renderAsyncGen(bpGen) : []);
    }, [course]);

    async function openMainBp(e: FormEvent) {
        assert(currentBp, "Attempted to open main BP with no BP")
        await openThisContentInTarget(course.id, currentBp.id);
    }

    if (!currentBp || bps.length === 0) return <Button disabled={true}>No BPs Found</Button>;
    if (bps.length <= 1 && currentBp) return <Button onClick={openMainBp}>BP</Button>;
    return <>
        <Button
            title={"Open the blueprint version of this course"}
            onClick={openMainBp}
        >BP</Button>
        <Button
            onClick={e => setOpen(true)}
            title={"Open the blueprint version of this course"}
        >Archived BPs</Button>
        <Modal isOpen={open} requestClose={() => setOpen(false)}>
            {bps.map(bp =>
                <Button
                    key={bp.id}
                    onClick={e => openThisContentInTarget(course, bp.id)}
                >{bp.course_code}</Button>)}
        </Modal>
    </>
}

async function addBpButton(header: HTMLElement, currentCourse: Course) {
    const rootDiv = document.createElement('div');
    header.append(rootDiv);
    const bpButtonRoot = ReactDOM.createRoot(rootDiv);
    bpButtonRoot.render(<BpButton course={currentCourse}/>)
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
    if (!currentContentItem) return;
    btn.addEventListener('click', () => openAllLinksInContent(currentContentItem))
}


function openAllLinksInContent(contentItem: BaseContentItem) {
    const urls = new Set(contentItem.getAllLinks());

    for (let url of urls) window.open(url, "_blank");
}

function addHighlightBigImageResizer(currentContentItem: BaseContentItem) {
    const bannerImageContainer = document.querySelector<HTMLDivElement>('div.cbt-banner-image');
    console.log(bannerImageContainer);
    if (!bannerImageContainer) return;
    const image = bannerImageContainer.querySelector('img')
    console.log(image?.naturalWidth);
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

