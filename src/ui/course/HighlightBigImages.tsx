/*
 * FRAGILITY WARNING: Banner image resize feature
 * ============================================================================
 * This works "about half the time" according to the UI warning (line 48).
 *
 * THE PROBLEM:
 * - Uploads a NEW file to Canvas but doesn't update the page HTML reference
 * - Canvas file API doesn't have a clean "replace file content" endpoint
 * - Old file remains, page still points to it sometimes (depends on Canvas internals)
 * - Cache busting helps but doesn't fix the root issue
 *
 * WHY IT'S UNRELIABLE:
 * 1. Canvas assigns new file ID on upload
 * 2. Page HTML still references old file ID
 * 3. We don't delete old file or update page HTML
 * 4. Sometimes Canvas serves new file anyway (CDN caching behavior?), sometimes not
 *
 * See: BaseContentItem.resizeBanner() at src/canvas/content/BaseContentItem.ts:167
 * ============================================================================
 */

import React, {useState} from "react";
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

    // FRAGILITY WARNING: This uploads a new file but doesn't guarantee it replaces the old one
    // Success rate ~50% depending on Canvas file resolution behavior
    async function resizeBanner() {
        setRunning(true);
        setShowModal(true);
        await currentContentItem?.resizeBanner(resizeTo); // May upload but not replace
        // Attempt cache invalidation (doesn't solve file ID mismatch)
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
                {/* HONEST DOCUMENTATION: We tell users it's unreliable */}
                <div className={"lxd-notice"}>This button works about half the time. It may upload the file but not replace the old one sometimes?</div>
                <div className={"lxd-notice"}>Using it won't break anything</div>
                {/* TECHNICAL REASON: Canvas file upload creates new ID, page HTML still references old ID */}
            </>}
        </div>, el)}
        <Modal isOpen={showModal}>
            <p>{running ? "Replacing banner" : "Finished replacing banner"}</p>
            {!running && <button onClick={() => setShowModal(false)}>Close</button>}
        </Modal>

    </>)
}