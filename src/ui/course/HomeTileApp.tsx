import Modal from "../widgets/Modal/index";
import { useState } from "react";
import { createPortal } from "react-dom";
import { getCroppedSquareBlob, getResizedBlob } from "@canvas/image";
import { Course } from "@canvas/course/Course";
import { getHometileSrcPage } from "@canvas/course/modules";
import { getBannerImage } from "@/canvas";
import { Row } from "react-bootstrap";

type HomeTileAppProps = {
  course: Course;
  el: HTMLElement;
};

export function HomeTileApp({ course, el }: HomeTileAppProps) {
  const [showModal, setShowModal] = useState(false);
  const [running, setRunning] = useState(false);
  const [modalText, setModalText] = useState("Home Tiles");
  const [moduleNumber, setModuleNumber] = useState(0);
  const [useDefault, setUseDefault] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  async function regenerate() {
    // Check if we should show the warning
    const showWarning = localStorage.getItem("showHometileWarning");
    if (showWarning !== "false") {
      setShowConfirmModal(true);
      return; // Wait for user confirmation
    }

    // Proceed with regeneration
    setRunning(true);
    setShowModal(true);
    await course.regenerateHomeTiles();
    // eslint-disable-next-line @/no-undef
    const homeTiles = document.querySelectorAll(".cbt-module-card-img img") as NodeListOf<HTMLImageElement>;
    try {
      await Promise.all(
        Array.from(homeTiles).map(async (tile) => {
          await fetch(tile.src, { cache: "reload", mode: "no-cors" });
          tile.src = tile.src + "?" + Date.now();
        })
      );
    } catch (e) {
      console.log(e);
    }
    setRunning(false);
  }

  async function downloadStoreTiles() {
    setRunning(true);
    setShowModal(true);
    setModalText("Salesforce Storefront Images");
    await generateStorefrontBanners(course, moduleNumber);
    setRunning(false);
    setShowModal(false);
  }

  function handleConfirmRegenerate() {
    if (dontShowAgain) {
      localStorage.setItem("showHometileWarning", "false");
    }
    setShowConfirmModal(false);
    setDontShowAgain(false);

    // Now proceed with regeneration
    setRunning(true);
    setShowModal(true);
    course.regenerateHomeTiles().then(() => {
      // eslint-disable-next-line @/no-undef
      const homeTiles = document.querySelectorAll(".cbt-module-card-img img") as NodeListOf<HTMLImageElement>;
      return Promise.all(
        Array.from(homeTiles).map(async (tile) => {
          await fetch(tile.src, { cache: "reload", mode: "no-cors" });
          tile.src = tile.src + "?" + Date.now();
        })
      );
    }).catch((e) => {
      console.log(e);
    }).finally(() => {
      setRunning(false);
    });
  }

  function handleCancelRegenerate() {
    setShowConfirmModal(false);
    setDontShowAgain(false);
  }

  return (
    <>
      {createPortal(
        <>
          <Row>
            <button onClick={regenerate}>Generate Home Tiles</button>
            <button onClick={downloadStoreTiles}>Salesforce Image Download</button>
          </Row>
          <Row>
            <label>Use Course Image</label>
            <input type={"checkbox"} checked={useDefault} onChange={(e) => setUseDefault(e.target.checked)} />
          </Row>
          {!useDefault && (
            <Row>
              <label>Module Number (0 is course?)</label>
              <input
                type={"number"}
                onChange={(e) => setModuleNumber(parseInt(e.target.value) ?? 0)}
                placeholder={"Module Number to User"}
                value={moduleNumber}
              ></input>
            </Row>
          )}
        </>,
        el
      )}
      <Modal isOpen={showConfirmModal} canClose={true} requestClose={handleCancelRegenerate}>
        <p>Running this will delete existing hometiles. Is that okay?</p>
        <div>
          <label>
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
            />
            {" Don't show this warning again"}
          </label>
        </div>
        <div style={{ marginTop: "10px" }}>
          <button onClick={handleConfirmRegenerate}>OK</button>
          <button onClick={handleCancelRegenerate} style={{ marginLeft: "10px" }}>Cancel</button>
        </div>
      </Modal>
      <Modal isOpen={showModal} canClose={!running} requestClose={() => setShowModal(false)}>
        <p>{running ? `Updating ${modalText}...` : `Finished Updating ${modalText}`}</p>
        {!running && <button onClick={() => setShowModal(false)}>Close</button>}
      </Modal>
    </>
  );
}

async function generateStorefrontBanners(course: Course, moduleNumber = 0) {
  const code = course.baseCode ?? "CODE_NOT_FOUND";
  const module = (await course.getModules())[moduleNumber];

  const sourcePage = await getHometileSrcPage(module, module.id);
  if (!sourcePage) throw new Error("Module does not have a page to pull from.");

  const bannerImg = getBannerImage(sourcePage);
  if (!bannerImg) throw new Error("No banner image on page");

  // Resize the image to 1920px wide (maintaining aspect ratio)
  const bannerBlob = await getResizedBlob(bannerImg.src, 1920);
  if (!bannerBlob) throw new Error("Unable to resize banner img");

  const bannerUrl = URL.createObjectURL(bannerBlob!);
  downloadFile(bannerUrl, `${code.toLocaleLowerCase()}DetailImage.png`);

  const squareBlob = await getCroppedSquareBlob(bannerImg.src, 600);
  if (!squareBlob) throw new Error("Square blob not found");
  const squareUrl = URL.createObjectURL(squareBlob);
  downloadFile(squareUrl, `${code.toLocaleLowerCase()}ListImage.png`);
}

function downloadFile(url: string, fileName: string) {
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
