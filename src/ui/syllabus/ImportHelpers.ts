// helper functions for extracting & importing content into syllabus body

// takes html string, parses it, and returns the first HTMLElement with class "cbt-video-container"
export function extractContentFromHTML(html: string, query: string): HTMLElement[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  const elements = Array.from(doc.querySelectorAll<HTMLElement>(query));
  elements.forEach(element => {
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
export function clearMatsSection(syllabusBody: string): string {
    const parser = new DOMParser();
    const syllabusDoc = parser.parseFromString(syllabusBody, "text/html");

    const textHeader = "Week 1 Learning Materials";

    // find all divs with class "content" in syllabus, then find
    // the one that contains "Week 1 Learning Materials" - thats where we want to import
    const targetDiv = Array.from(syllabusDoc.querySelectorAll(".content"))
        .find(div => div.textContent?.includes(textHeader));

    if (!targetDiv) {
        console.error("Could not find 'Week 1 Learning Materials' section in syllabus");
        return syllabusBody;
    }

    const targetChildren = Array.from(targetDiv.children)

    targetChildren.forEach(child => {
        const tag = child.tagName.toLowerCase();
        if (tag !== "p" && tag !== "h3") {  //h3 contains Wk1 Lmats title so we want to keep it, p we use to recognize where to insert
            child.remove();
        }
    });

    // add a <p> if none exist in above array so we have a reference point for where to insert the new content
    const referencePt = targetChildren.find(child => child.tagName === "P");
    if (!referencePt){
        const newP = syllabusDoc.createElement("p");
        targetDiv.appendChild(newP);
    }

    const newBody = syllabusDoc.body.innerHTML;

    return newBody;
}

// takes a syllabus, an html element, a selector string, and an insert position,
// removes the [bulleted list] placeholder from the "Week 1 Learning Materials" section,
// and inserts the provided html element into the section of the syllabus specified by the selector and position
// if we fail to locate a div we return the same syllabus body passed
export function importContentIntoSyllabus(syllabusBody: string, content: HTMLElement[], selector: string, position: InsertPosition): string {
    const parser = new DOMParser();
    const syllabusDoc = parser.parseFromString(syllabusBody, "text/html");

    // find all divs with class "content" in syllabus, then find
    // the one that contains "Week 1 Learning Materials" - thats where we want to import
    // TODO I use this same targetdiv a lot - make a function for this
    const targetDiv = Array.from(syllabusDoc.querySelectorAll(".content"))
        .find(div => div.textContent?.includes("Week 1 Learning Materials"));

    if (!targetDiv) {
        console.error("Could not find 'Week 1 Learning Materials' section in syllabus");
        return syllabusBody;
    }

    // remove the [bulleted list] placeholder
    const paragraphs = targetDiv.querySelectorAll("p");
    paragraphs.forEach(p => {
        if (p.textContent?.includes("[bulleted list]")) {
            p.remove();
        }
        if (p.textContent?.includes("The following learning materials will")) { // TODO dropdown titles instead of this
            p.textContent = "Please watch the overview video(s) for context on the learning materials below:"
        }
    });
    
    // insert content
    const insertionPoint = targetDiv.querySelector(selector);   
    content.reverse(); // reverse to maintain order when inserting
    if (insertionPoint) {
        content.forEach(element => {
            insertionPoint.insertAdjacentElement(position, element);
        });
    }
    else{
        console.error(`Could not find insertion point with selector "${selector}"`);
    }     

    const newBody = syllabusDoc.body.innerHTML;

    return newBody;
}