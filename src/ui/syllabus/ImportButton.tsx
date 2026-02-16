import { Button } from "react-bootstrap";
import { Course } from "ueu_canvas";
import { Page } from "@ueu/ueu-canvas";
import PageKind from "@ueu/ueu-canvas";
import { useState } from "react";

// takes html string, parses it, and returns the first HTMLElement with class "cbt-video-container"
function extractContentFromHTML(html: string, query: string): HTMLElement[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  const elements = Array.from(doc.querySelectorAll<HTMLElement>(query));
  elements.forEach((element) => {
    const iframe = element?.querySelector<HTMLIFrameElement>("iframe");
    // should only be one iframe in each the video container
    // resize to video to fit in syllabus if iframe found
    if (iframe) {
      iframe.removeAttribute("width");
      iframe.removeAttribute("height");
      iframe.removeAttribute("style");
      iframe.style.width = "300px";
      iframe.style.height = "200px";
    }
  });

  return elements;
}

// takes a body, removes everything but the <p> elements in
// the bodies week 1 learning mats section. Used to clear the section
// before we import the new/current wk 1 learning mats
// if we fail to locate a div we return the same syllabus body passed
function clearMatsSection(syllabusBody: string): string {
  const parser = new DOMParser();
  const syllabusDoc = parser.parseFromString(syllabusBody, "text/html");

  // find all divs with class "content" in syllabus, then find
  // the one that contains "Week 1 Learning Materials" - thats where we want to import
  const targetDiv = Array.from(syllabusDoc.querySelectorAll(".content")).find((div) =>
    div.textContent?.includes("Week 1 Learning Materials")
  );

  if (!targetDiv) {
    console.error("Could not find 'Week 1 Learning Materials' section in syllabus");
    return syllabusBody;
  }

  Array.from(targetDiv.children).forEach((child) => {
    const tag = child.tagName.toLowerCase();
    if (tag !== "p" && tag !== "h3") {
      child.remove();
    }
  });

  const newBody = syllabusDoc.body.innerHTML;

  return newBody;
}

// takes a syllabus, an html element, a selector string, and an insert position,
// removes the [bulleted list] placeholder from the "Week 1 Learning Materials" section,
// and inserts the provided html element into the section of the syllabus specified by the selector and position
// if we fail to locate a div we return the same syllabus body passed
function importContentIntoSyllabus(
  syllabusBody: string,
  content: HTMLElement[],
  selector: string,
  position: InsertPosition
): string {
  const parser = new DOMParser();
  const syllabusDoc = parser.parseFromString(syllabusBody, "text/html");

  // find all divs with class "content" in syllabus, then find
  // the one that contains "Week 1 Learning Materials" - thats where we want to import
  // TODO I use this same targetdiv a lot - make a function for this
  const targetDiv = Array.from(syllabusDoc.querySelectorAll(".content")).find((div) =>
    div.textContent?.includes("Week 1 Learning Materials")
  );

  if (!targetDiv) {
    console.error("Could not find 'Week 1 Learning Materials' section in syllabus");
    return syllabusBody;
  }

  // remove the [bulleted list] placeholder
  const paragraphs = targetDiv.querySelectorAll("p");
  paragraphs.forEach((p) => {
    if (p.textContent?.includes("[bulleted list]")) {
      p.remove();
    }
    if (p.textContent?.includes("The following learning materials will")) {
      // TODO dropdown titles instead of this
      p.textContent = "Please watch the overview video(s) for context on the learning materials below:";
    }
  });

  // insert content
  const insertionPoint = targetDiv.querySelector(selector);
  content.reverse(); // reverse to maintain order when inserting
  if (insertionPoint) {
    content.forEach((element) => {
      insertionPoint.insertAdjacentElement(position, element);
    });
  } else {
    console.error(`Could not find insertion point with selector "${selector}"`);
  }

  const newBody = syllabusDoc.body.innerHTML;

  return newBody;
}

// main handler for import button click
async function handleImportClick() {
  try {
    const course = await Course.getFromUrl();
    if (!course) {
      console.error("No course found from URL");
      return;
    }

    // Canvas "slug" form of page name
    const pageSlug = "week-1-learning-materials";

    const pageData = await PageKind.getByString(
      course.id,
      pageSlug,
      { queryParams: { include: ["body"] } },
      { allowPartialMatch: false }
    );

    if ("message" in pageData) {
      console.error(`Page with slug "${pageSlug}" not found:`, pageData.message);
      return;
    }

    const wk1_mats_page = new Page(pageData, course.id); // TODO dont need to create this if all i need is body
    const extractedContent = extractContentFromHTML(wk1_mats_page.body, ".cbt-video-container");
    const extractedMats = extractContentFromHTML(
      wk1_mats_page.body,
      "div.scaffold-media-box.cbt-content.cbt-accordion-container"
    ); // assuming learning mats are in a <ul>

    if (!extractedContent) {
      console.error("No video content found on Week 1 Learning Materials page");
      return;
    }

    if (!extractedMats) {
      console.error("No learning materials content found on Week 1 Learning Materials page");
      return;
    }

    const syllabusBody = await course.getSyllabus();
    let newBody = clearMatsSection(syllabusBody);
    newBody = importContentIntoSyllabus(newBody, extractedContent, "p", "beforebegin");
    newBody = importContentIntoSyllabus(newBody, extractedMats, "p", "afterend");

    // only update the body if it changed
    if (newBody != syllabusBody) {
      await course.changeSyllabus(newBody);
    } else {
      console.log("Syllabus already up to date");
    }
  } catch (err) {
    console.error("Error fetching Week 1 Learning Materials page and importing into syllabus:", err);
  }
}

export function ImportButton() {
  const [loading, setLoading] = useState(false);

  return (
    <Button
      title={"Import the Week 1 Learning mats into the syllabus"}
      disabled={loading}
      onClick={async (e) => {
        setLoading(true);
        console.log("Import Syllabus clicked", e);
        await handleImportClick();
        console.log("About to reload");
        location.reload();
      }}
    >
      {loading ? "..." : "Import Wk1 Mats"}
    </Button>
  );
}
// TODO there might be some edge cases for lmats pages that don't use a dropdown?
// TODO users might prefer a carousel over listing the videos out?
// TODO replace stock line with titles of the dropdowns from the lmats page
