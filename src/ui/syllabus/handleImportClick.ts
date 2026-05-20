import { Course } from "@ueu/ueu-canvas";
import { Page } from "@ueu/ueu-canvas/content/pages/Page";
import PageKind from "@ueu/ueu-canvas/content/pages/PageKind";
import {extractContentFromHTML, clearMatsSection, importContentIntoSyllabus} from "@/ui/syllabus/ImportHelpers";

// main handler for import button click
export async function handleImportClick(pageSlug:string = "week-1-learning-materials") {
    try {
        const course = await Course.getFromUrl();
        if (!course) {
            alert("No course found")
            console.error("No course found from URL");
            return;
        }

        const pageData = await PageKind.getByString(
            course.id,
            pageSlug,
            { queryParams: { include: ["body"] } }
        );

        if ("message" in pageData) {
            alert(`Page with slug "${pageSlug}" not found: ${pageData.message}`)
            console.error(`Page with slug "${pageSlug}" not found:`, pageData.message);
            return;
        }

        const wk1_mats_page = new Page(pageData, course.id); // TODO dont need to create this if all i need is body
        const extractedContent = extractContentFromHTML(wk1_mats_page.body, ".cbt-video-container");
        const extractedMats = extractContentFromHTML(wk1_mats_page.body, "div.cbt-accordion-list.utc-accordion-list"); // assuming learning mats are in a <ul>

        if (!extractedContent.length && !extractedMats.length) {
            alert("No video content or dropdowns found on Week 1 Learning Materials page")
            console.error("No video content or dropdowns found on Week 1 Learning Materials page");
            return;
        }

        const syllabusBody = await course.getSyllabus();  
        let newBody = clearMatsSection(syllabusBody);
        newBody = importContentIntoSyllabus(newBody, extractedContent, 'p', "beforebegin");
        newBody = importContentIntoSyllabus(newBody, extractedMats, 'p', "afterend");

        // only update the body if it changed
        if (newBody != syllabusBody){
            await course.changeSyllabus(newBody);
            alert("Syllabus successfully updated")
        }
        else{
            alert("Syllabus already up to date")
            console.log("Syllabus already up to date");
        }
    } 
    catch (err) {
        alert(`Error: ${err}`)
        console.error("Error fetching Week 1 Learning Materials page and importing into syllabus:", err);
    }
}