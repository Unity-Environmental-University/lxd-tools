import {useState} from "react";
import {createPortal} from "react-dom";
import Modal from "../widgets/Modal/index";
import "./bigImages.scss"
import {BaseContentItem} from "@/canvas/content/BaseContentItem";

interface IHighlightBigImagesProps {
    el: HTMLElement,
    bannerImage: HTMLImageElement,
    resizeTo: number,
    currentContentItem: BaseContentItem | null
}

export function HighlightBigImages({el, bannerImage, currentContentItem, resizeTo = 1200}: IHighlightBigImagesProps) {
    const [showModal, setShowModal] = useState(false);
    const [running, setRunning] = useState(false);
    const [finished, setFinished] = useState(false);
    const [showButton, setShowButton] = useState(true);

    async function resizeBanner() {
        setRunning(true);
        setShowModal(true);
        await currentContentItem?.resizeBanner(resizeTo);
        await fetch(bannerImage.src, {cache: 'reload', mode: 'no-cors'});
        bannerImage.src = bannerImage.src + '?' + Date.now();
        setRunning(false);
        setFinished(true);
    }


    function notificationBoxStyle() {
        if (finished) return {}
        else
            return {
                backgroundColor: 'rgba(255,255,255,0.75)',
                border: "10px dashed red",
                fontSize: "64px",
                color: 'rgba(64,0,0,1)'
            }
    }

    return (<>
        {createPortal(<div style={notificationBoxStyle()}>
            <h2>IMAGE REAL BIG</h2>
            <h4><strong>This warning will not appear on student-facing canvas.</strong></h4>
            {showButton && <>
            <button onClick={resizeBanner}>Try Resize</button>
                <div className={"lxd-notice"}>This button works about half the time. It may upload the file but not replace the old one sometimes?</div>
                <div className={"lxd-notice"}>Using it won't break anything</div>
            </>}
        </div>, el)}
        <Modal isOpen={showModal}>
            <p>{running ? "Replacing banner" : "Finished replacing banner"}</p>
            {!running && <button onClick={() => setShowModal(false)}>Close</button>}
        </Modal>

    </>)
}