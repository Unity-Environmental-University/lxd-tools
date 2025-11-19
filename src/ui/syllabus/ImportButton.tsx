import {Button} from "react-bootstrap";
import { Course, renderAsyncGen } from "ueu_canvas";
//import { getCourseIdFromUrl } from "ueu_canvas"; // Driving me crazy, thinks it doesnt exist

// import { Course } from "@canvas/course/Course";
// import {renderAsyncGen} from "@canvas/canvasUtils";
import { Page } from "@canvas/content/pages/Page";  // these don't exist in ueu_canvas yet
import PageKind from "@canvas/content/pages/PageKind";
import AssignmentKind from "@/canvas/content/assignments/AssignmentKind";
import { get, set } from "lodash";
import {useState} from "react";

// TODO I probably want to extract small things - just the video and just the list of mats underneath instead of grabbing all at once
// TODO then carefully insert into syllabus
// takes html string, parses it, and returns the first HTMLElement with class "cbt-video-container"
function extractContentFromHTML(html: string, query: string): HTMLElement[] {
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
}   // TODO would it be best to select all and return a list of HTMLElements that we can then sort thru in caller
    // TODO to see if the HTMLElement contains what we want? Can fetch all vids that way and probably all learning mats as well - two calls

// takes a syllabus, an html element, a selector string, and an insert position,
// removes the [bulleted list] placeholder from the "Week 1 Learning Materials" section,
// and inserts the provided html element into the section of the syllabus specified by the selector and position
function importContentIntoSyllabus(syllabusBody: string, content: HTMLElement[], selector: string, position: InsertPosition): string|null { // TODO returns modified syllabus body? (string) - then use course.changeSyllabus in caller - well then we would api call change te syllabus to the same thing for no reason - dumb
    const parser = new DOMParser();
    const syllabusDoc = parser.parseFromString(syllabusBody, "text/html");

    // find all divs with class "content" in syllabus, then find
    // the one that contains "Week 1 Learning Materials" - thats where we want to import
    const targetDiv = Array.from(syllabusDoc.querySelectorAll(".content"))
        .find(div => div.textContent?.includes("Week 1 Learning Materials"));

    if (!targetDiv) {
        console.error("Could not find 'Week 1 Learning Materials' section in syllabus");
        return null;
    }

    // remove the [bulleted list] placeholder
    const paragraphs = targetDiv.querySelectorAll("p");
    paragraphs.forEach(p => {
        if (p.textContent?.includes("[bulleted list]")) {
            p.remove();
        }
    });
    
    // insert content
    const insertionPoint = targetDiv.querySelector(selector);   
    if (insertionPoint) {   // TODO should I return null or throw error if insertion point not found? why return newBody if no changes?
        content.forEach(element => {
            insertionPoint.insertAdjacentElement(position, element);
        });
    }     

    const newBody = syllabusDoc.body.innerHTML;

    return newBody;
}


// main handler for import button click
async function handleImportClick() {    // TODO don't do anything / don't render button if videos/mats already detected in syllabus
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
        const extractedMats = extractContentFromHTML(wk1_mats_page.body, "div#cbt_panel_2_content.cbt-accordion-content.cbt-answer"); // assuming learning mats are in a <ul>
        
        if (!extractedContent) {
            console.error("No video content found on Week 1 Learning Materials page");
            return;
        }

        if (!extractedMats) {   // TODO doesnt matter putting this further down because it still wont reach the api call
            console.error("No learning materials content found on Week 1 Learning Materials page");
            return;
        }

        const syllabusBody = await course.getSyllabus();  
        let newBody = importContentIntoSyllabus(syllabusBody, extractedContent, 'p', "beforebegin");   // TODO is ! bad practice? just use an if else w an error
        
        if (newBody){
            newBody = importContentIntoSyllabus(newBody, extractedMats, 'p', "afterend");
            const response = await course.changeSyllabus(newBody!);
        }
        else{
            console.error("Failed to import content into syllabus"); // is this needed? ImportContentIntoSyllabus already logs error
        }
    } 
    catch (err) {
        console.error("Error fetching Week 1 Learning Materials page:", err);
    }
}

export function ImportButton() {
    const [loading, setLoading] = useState(false);

    return (
        <Button 
            title={"Import the Week 1 Learning mats into the syllabus"}
            disabled={loading}
            onClick={async e => {
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
}   // TODO am I stuffing the kaltura video for ESCI 620 full of categories by using it my test course? oops
// TODO - next, test on courses with multiple vids and learning mats - should work unless class/ids are different
// TODO there might be some edge cases for lmats pages that don't use a dropdown?