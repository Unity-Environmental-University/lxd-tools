import {Button} from "react-bootstrap";
import { Course } from "@ueu/ueu-canvas";
import { Page } from "@ueu/ueu-canvas/content/pages/Page";
import PageKind from "@ueu/ueu-canvas/content/pages/PageKind";
import {useState} from "react";
import {extractContentFromHTML, clearMatsSection, importContentIntoSyllabus} from "@/ui/syllabus/ImportHelpers";

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
            { queryParams: { include: ["body"] } }
        );

        if ("message" in pageData) {
            console.error(`Page with slug "${pageSlug}" not found:`, pageData.message);
            return;
        }

        const wk1_mats_page = new Page(pageData, course.id); // TODO dont need to create this if all i need is body
        const extractedContent = extractContentFromHTML(wk1_mats_page.body, ".cbt-video-container");
        const extractedMats = extractContentFromHTML(wk1_mats_page.body, "div.scaffold-media-box.cbt-content.cbt-accordion-container"); // assuming learning mats are in a <ul>

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
        newBody = importContentIntoSyllabus(newBody, extractedContent, 'p', "beforebegin");
        newBody = importContentIntoSyllabus(newBody, extractedMats, 'p', "afterend");

        // only update the body if it changed
        if (newBody != syllabusBody){
            await course.changeSyllabus(newBody);
        }
        else{
            console.log("Syllabus already up to date");
        }
    } 
    catch (err) {
        console.error("Error fetching Week 1 Learning Materials page and importing into syllabus:", err);
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
}
// TODO there might be some edge cases for lmats pages that don't use a dropdown?
// TODO users might prefer a carousel over listing the videos out?
// TODO replace stock line with titles of the dropdowns from the lmats page