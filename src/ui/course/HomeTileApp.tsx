import Modal from "../widgets/Modal/index";
import {useEffect, useState} from "react";
import {useEffectAsync} from "../utils";
import {createPortal} from "react-dom";
import {getCroppedSquareBlob, getResizedBlob} from "@canvas/image";
import {Course} from "@canvas/course/Course";
import {getModuleOverview} from "@canvas/course/modules";
import {getBannerImage} from "@/canvas";

type HomeTileAppProps = {
    course: Course,
    el: HTMLElement,
}

export function HomeTileApp({course, el}: HomeTileAppProps) {

    const [showModal, setShowModal] = useState(false);
    const [running, setRunning] = useState(false);
    const [modalText, setModalText] = useState("Home Tiles");
    const [moduleNumber, setModuleNumber] = useState(0);


    async function regenerate() {
        setRunning(true);
        setShowModal(true);
        await course.regenerateHomeTiles();
        const homeTiles = document.querySelectorAll(".cbt-module-card-img img") as NodeListOf<HTMLImageElement>;
        await Promise.all(Array.from(homeTiles).map((async (tile) => {
            await fetch(tile.src, {cache: 'reload', mode: 'no-cors'});
            tile.src = tile.src + '?' + Date.now();
        })))
        setRunning(false);
    }

    async function downloadStoreTiles() {
        setRunning(true);
        setShowModal(true);
        setModalText("Salesforce Storefront Images");
        await generateBanners(course, moduleNumber);
        setRunning(false);
        setShowModal(false);
    }

    return (<>
        {createPortal(<>
            <button onClick={regenerate}>Generate Home Tiles</button>
            <button onClick={downloadStoreTiles}>Salesforce Image Download</button>
            <input type={"number"} onChange={(e) => setModuleNumber(parseInt(e.target.value) ?? 0)} value={moduleNumber}></input>
        </>, el)}
        <Modal isOpen={showModal} canClose={!running} requestClose={() => setShowModal(false)}>
            <p>{running ? `Updating ${modalText}...` : `Finished Updating ${modalText}`}</p>
            {!running && <button onClick={() => setShowModal(false)}>Close</button>}
        </Modal>
    </>)
}

async function generateBanners(course:Course, moduleNumber=0) {
    const code = course.baseCode ?? "CODE_NOT_FOUND";
    const module = (await course.getModules())[moduleNumber];

    const overviewPage = await getModuleOverview(module, module.id);
    if (!overviewPage) throw new Error("Module does not have an overview");

    const bannerImg = getBannerImage(overviewPage);
    if (!bannerImg) throw new Error("No banner image on page");

    // Resize the image to 1920px wide (maintaining aspect ratio)
    const bannerBlob = await getResizedBlob(bannerImg.src, 1920);

    const bannerUrl = URL.createObjectURL(bannerBlob!);
    downloadFile(bannerUrl, `${code.toLocaleLowerCase()}DetailImage.png`);

    const squareBlob = await getCroppedSquareBlob(bannerImg.src, 600);
    if(!squareBlob) throw new Error("Square blob not found");
    const squareUrl = URL.createObjectURL(squareBlob);
    downloadFile(squareUrl, `${code.toLocaleLowerCase()}ListImage.png`);
}

function downloadFile(url: string, fileName: string) {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
