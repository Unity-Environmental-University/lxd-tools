import Modal from "../widgets/Modal/index";
import {Course} from "../../canvas/index";
import {useEffect, useState} from "react";
import {useEffectAsync} from "../utils";
import {createPortal} from "react-dom";


type HomeTileAppProps = {
    course: Course,
    el: HTMLElement,
}


export function HomeTileApp({course, el}: HomeTileAppProps) {

    const [showModal, setShowModal] = useState(false);
    const [message, setMessage] = useState<string|null>();
    const [running, setRunning] = useState(false);
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

    return(<>
        {createPortal(<button onClick={regenerate}>Generate Home Tiles</button>, el)}
        <Modal isOpen={showModal} canClose={!running} requestClose={() => setShowModal(false)}>
            <p>{running ? "Updating Home Tiles..." : "Finished Updating Home Tiles"}</p>
            {!running && <button onClick={() => setShowModal(false)}>Close</button>}
        </Modal>
        </>)
}