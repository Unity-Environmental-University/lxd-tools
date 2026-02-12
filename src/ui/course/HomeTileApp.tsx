/*
 * Hometile generation and Salesforce image export
 * ============================================================================
 * TWO FEATURES HERE:
 * 1. "Generate Home Tiles" - Regenerate module card images from overview banners
 * 2. "Salesforce Image Download" - Export resized images for course catalog
 *
 * RECENT IMPROVEMENTS (2026-02-10):
 * - Now explicitly deletes old files before uploading new ones
 * - Added 2-second delay for Canvas CDN propagation
 * - Better error reporting (shows success/failure counts)
 * - More aggressive cache busting
 *
 * REMAINING LIMITATIONS:
 * - Still depends on CBT theme selectors (.cbt-module-card-img img)
 * - Still uses filename conventions (Images/hometile/hometileN.png)
 * - If theme changes, this breaks
 *
 * But file replacement is now deterministic - should work reliably.
 * ============================================================================
 */

import Modal from "../widgets/Modal/index";
import {useState} from "react";
import {createPortal} from "react-dom";
import {getCroppedSquareBlob, getResizedBlob} from "@canvas/image";
import {Course} from "@canvas/course/Course";
import {getHometileSrcPage} from "@canvas/course/modules";
import {getBannerImage} from "@/canvas";
import {Row} from "react-bootstrap";

type HomeTileAppProps = {
    course: Course,
    el: HTMLElement,
}

// TODO: Move to shared components when progress bars are needed elsewhere
interface ProgressBarProps {
    current: number;
    total: number;
    label?: string;
}

// TODO: Style this properly with CSS/SCSS
function ProgressBar({current, total, label}: ProgressBarProps) {
    const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

    return (
        <div style={{margin: '10px 0'}}>
            {label && <div style={{marginBottom: '5px', fontSize: '14px'}}>{label}</div>}
            <div style={{
                width: '100%',
                height: '20px',
                backgroundColor: '#e0e0e0',
                borderRadius: '4px',
                overflow: 'hidden'
            }}>
                <div style={{
                    width: `${percentage}%`,
                    height: '100%',
                    backgroundColor: '#4CAF50',
                    transition: 'width 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: 'bold'
                }}>
                    {percentage > 10 && `${current}/${total}`}
                </div>
            </div>
            <div style={{marginTop: '5px', fontSize: '12px', color: '#666'}}>
                {current} of {total} modules ({percentage}%)
            </div>
        </div>
    );
}

export function HomeTileApp({course, el}: HomeTileAppProps) {

    const [showModal, setShowModal] = useState(false);
    const [running, setRunning] = useState(false);
    const [modalText, setModalText] = useState("Home Tiles");
    const [moduleNumber, setModuleNumber] = useState(0);
    const [useDefault, setUseDefault] = useState(true);

    // Progress tracking
    const [progressCurrent, setProgressCurrent] = useState(0);
    const [progressTotal, setProgressTotal] = useState(0);
    const [currentModuleName, setCurrentModuleName] = useState("");

    // IMPROVED: Now waits for Canvas to propagate file changes before cache busting
    async function regenerate() {
        setRunning(true);
        setShowModal(true);
        setProgressCurrent(0);
        setProgressTotal(0);
        setModalText("Initializing...");

        // Progress callback for regenerateHomeTiles
        const onProgress = (current: number, total: number, moduleName: string) => {
            setProgressCurrent(current);
            setProgressTotal(total);
            setCurrentModuleName(moduleName);
            setModalText(`Processing module ${current} of ${total}...`);
        };

        const results = await course.regenerateHomeTiles(onProgress);

        // Update modal with results
        if (results.failed > 0) {
            setModalText(`Generated ${results.success} tiles. ${results.failed} failed (check console).`);
        } else {
            setModalText(`Successfully generated ${results.success} tiles. Refreshing...`);
        }

        // Wait for Canvas CDN to propagate new files (critical for reliability)
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Force browser cache refresh
        // BRITTLE: Theme selector - breaks if CBT theme changes class names
        // eslint-disable-next-line @/no-undef
        const homeTiles = document.querySelectorAll(".cbt-module-card-img img") as NodeListOf<HTMLImageElement>;
        try {
            await Promise.all(Array.from(homeTiles).map((async (tile) => {
                // More aggressive cache busting
                await fetch(tile.src, {cache: 'reload', mode: 'no-cors'});
                // Remove old query params and add new timestamp
                const baseUrl = tile.src.split('?')[0];
                tile.src = `${baseUrl}?v=${Date.now()}`;
            })))
        } catch (e) {
            console.error('Cache refresh failed:', e);
        }

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
            <Row>
                <button onClick={regenerate}>Generate Home Tiles</button>
                <button onClick={downloadStoreTiles}>Salesforce Image Download</button>



            </Row>
                <Row>
                    <label>Use Course Image</label>
                    <input type={"checkbox"} checked={useDefault} onChange={(e) => setUseDefault(e.target.checked)}/>
                </Row>
            {!useDefault && <Row>
                <label>Module Number (0 is course?)</label>
                <input type={"number"}
                       onChange={(e) => setModuleNumber(parseInt(e.target.value) ?? 0)}
                       placeholder={"Module Number to User"}
                       value={moduleNumber}></input>
            </Row>}

        </>, el)}
        <Modal isOpen={showModal} canClose={!running} requestClose={() => setShowModal(false)}>
            <div>
                {running ? (
                    <>
                        <p>{modalText}</p>
                        {progressTotal > 0 && (
                            <>
                                <ProgressBar
                                    current={progressCurrent}
                                    total={progressTotal}
                                />
                                {currentModuleName && (
                                    <div style={{fontSize: '12px', color: '#666', marginTop: '10px'}}>
                                        Current: {currentModuleName}
                                    </div>
                                )}
                            </>
                        )}
                    </>
                ) : (
                    <p>Finished: {modalText}</p>
                )}
            </div>
            {!running && <button onClick={() => setShowModal(false)}>Close</button>}
        </Modal>
    </>)
}

async function generateBanners(course:Course, moduleNumber=0) {
    const code = course.baseCode ?? "CODE_NOT_FOUND";
    const module = (await course.getModules())[moduleNumber];

    const sourcePage = await getHometileSrcPage(module, module.id);
    if (!sourcePage) throw new Error("Module does not have a page to pull from.");

    const bannerImg = getBannerImage(sourcePage);
    if (!bannerImg) throw new Error("No banner image on page");

    // Resize the image to 1920px wide (maintaining aspect ratio)
    const bannerBlob = await getResizedBlob(bannerImg.src, 1920);
    if(!bannerBlob) throw new Error("Unable to resize banner img");

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
