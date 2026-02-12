/*
 * ============================================================================
 * FEATURE STATUS: RE-ENABLED (2026-02-10)
 * ============================================================================
 *
 * This feature was disabled in hotfix/2.9.9.3 (2026-02-05) due to bugs.
 * RE-ENABLED after fix on 2026-02-10 by mvirgin.
 *
 * WHAT WAS FIXED:
 * - Missing <p> tag bug: Now ensures <p> exists as insertion point
 * - Sections were deleting themselves without importing content
 * - Feature re-bundled into extension
 *
 * REMAINING FRAGILITY (marked inline with FRAGILITY WARNING):
 * - Text search for "Week 1 Learning Materials" - breaks if renamed
 * - Theme selectors (.content, .cbt-video-container) - breaks if theme updates
 * - Hardcoded page slug "week-1-learning-materials" - breaks if page renamed
 * - Still has silent failures (console.error but no user notification)
 *
 * THE CORE PROBLEM REMAINS:
 * We don't control the Canvas theme. No stable semantic hooks (data attributes, IDs).
 * This code guesses structure via selectors and text search.
 * Current fix makes it MORE reliable, but still fragile.
 *
 * POTENTIAL FUTURE IMPROVEMENTS:
 * 1. Add validation: Check if selectors exist BEFORE attempting import, show error UI
 * 2. Detect already-imported content to prevent duplication
 * 3. Add explicit failure alerts instead of silent console.error()
 * 4. Make "copy to clipboard" alternative for when auto-inject fails
 * ============================================================================
 */

import {Button} from "react-bootstrap";
import { Course } from "ueu_canvas";
import { Page } from "@canvas/content/pages/Page";  // TODO these don't exist in ueu_canvas yet?
import PageKind from "@canvas/content/pages/PageKind";
import {useState} from "react";

// FRAGILITY WARNING: This depends on CBT theme selectors that we don't control
// Breaks when: theme updates, course template changes, selector patterns vary
// If this fails: content won't be found, returns empty array, silent fail
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
}

// FRAGILITY WARNING: Text-search based section finding
// This breaks when: syllabus wording changes, section renamed, localized courses
// Failure mode: Returns unchanged body, button appears to work but does nothing
// FIXED (2026-02-10): Now ensures <p> tag exists for insertion point
function clearMatsSection(syllabusBody: string): string {
    const parser = new DOMParser();
    const syllabusDoc = parser.parseFromString(syllabusBody, "text/html");

    const textHeader = "Week 1 Learning Materials";

    // BRITTLE: Text search for "Week 1 Learning Materials" - no semantic hooks available
    // Alternative approach: Use heading tags (h2, h3) with pattern matching
    const targetDiv = Array.from(syllabusDoc.querySelectorAll(".content"))
        .find(div => div.textContent?.includes(textHeader));

    if (!targetDiv) {
        console.error("SYLLABUS IMPORT FAILED: Could not find 'Week 1 Learning Materials' section. Template may have changed.");
        return syllabusBody; // SILENT FAIL: User won't know nothing happened
    }

    const targetChildren = Array.from(targetDiv.children);

    targetChildren.forEach(child => {
        const tag = child.tagName.toLowerCase();
        if (tag !== "p" && tag !== "h3") {  // h3 contains Wk1 Lmats title so we want to keep it, p we use to recognize where to insert
            child.remove();
        }
    });

    // BUGFIX: Ensure a <p> tag exists for insertion point (was causing silent failures)
    const referencePt = targetChildren.find(child => child.tagName === "P");
    if (!referencePt) {
        const newP = syllabusDoc.createElement("p");
        targetDiv.appendChild(newP);
    }

    const newBody = syllabusDoc.body.innerHTML;

    return newBody;
}

// FRAGILITY WARNING: Selector-based injection with no validation
// This breaks when: template structure changes, selector doesn't match, content array empty
// Failure mode: Content injected in wrong place OR silently not injected at all
function importContentIntoSyllabus(syllabusBody: string, content: HTMLElement[], selector: string, position: InsertPosition): string {
    const parser = new DOMParser();
    const syllabusDoc = parser.parseFromString(syllabusBody, "text/html");

    // BRITTLE: Same text-search pattern as clearMatsSection (should extract to shared function)
    // DUPLICATED LOGIC: Third place we search for "Week 1 Learning Materials"
    const targetDiv = Array.from(syllabusDoc.querySelectorAll(".content"))
        .find(div => div.textContent?.includes("Week 1 Learning Materials"));

    if (!targetDiv) {
        console.error("SYLLABUS IMPORT FAILED: Could not find 'Week 1 Learning Materials' section. Template may have changed.");
        return syllabusBody; // SILENT FAIL: Changed nothing but returns as if successful
    }

    // BRITTLE: Text-based placeholder detection
    const paragraphs = targetDiv.querySelectorAll("p");
    paragraphs.forEach(p => {
        if (p.textContent?.includes("[bulleted list]")) {
            p.remove();
        }
        // HARDCODED: Overwrites specific template text - breaks if wording changes
        if (p.textContent?.includes("The following learning materials will")) {
            p.textContent = "Please watch the overview video(s) for context on the learning materials below:"
        }
    });

    // FRAGILITY WARNING: Generic selector 'p' assumes structure - what if no <p> exists?
    const insertionPoint = targetDiv.querySelector(selector);
    content.reverse(); // reverse to maintain order when inserting
    if (insertionPoint) {
        content.forEach(element => {
            insertionPoint.insertAdjacentElement(position, element);
        });
    }
    else{
        console.error(`SYLLABUS IMPORT FAILED: Could not find insertion point with selector "${selector}". Template structure changed.`);
        // SILENT FAIL: Function still returns updated body even though nothing was inserted
    }     

    const newBody = syllabusDoc.body.innerHTML;

    return newBody;
}


// FRAGILITY WARNING: This entire function depends on:
// 1. Page slug being exactly "week-1-learning-materials" (never renamed)
// 2. Specific CBT theme selectors (change = breakage)
// 3. Syllabus having exact text "Week 1 Learning Materials"
// 4. Silent failures at multiple points (user never knows it didn't work)
async function handleImportClick() {
    try {
        const course = await Course.getFromUrl();
        if (!course) {
            console.error("No course found from URL");
            return;
        }

        // BRITTLE: Hardcoded page slug - if faculty rename page, this breaks
        const pageSlug = "week-1-learning-materials";

        const pageData = await PageKind.getByString(
            course.id,
            pageSlug,
            { queryParams: { include: ["body"] } },
            { allowPartialMatch: false }
        );

        if ("message" in pageData) {
            console.error(`IMPORT FAILED: Page "${pageSlug}" not found. May have been renamed or deleted.`, pageData.message);
            return; // SILENT FAIL: User sees loading spinner then nothing
        }

        const wk1_mats_page = new Page(pageData, course.id);

        // BRITTLE: Theme-specific selectors - these changed from commit 69a5676
        // Previous selector: "div#cbt_panel_2_content.cbt-accordion-content.cbt-answer"
        // Current selector: "div.scaffold-media-box.cbt-content.cbt-accordion-container"
        // Both break when theme updates
        const extractedContent = extractContentFromHTML(wk1_mats_page.body, ".cbt-video-container");
        const extractedMats = extractContentFromHTML(wk1_mats_page.body, "div.scaffold-media-box.cbt-content.cbt-accordion-container");

        if (!extractedContent || extractedContent.length === 0) {
            console.error("IMPORT FAILED: No video content found. Theme selectors may have changed.");
            return; // SILENT FAIL
        }

        if (!extractedMats || extractedMats.length === 0) {
            console.error("IMPORT FAILED: No learning materials found. Theme selectors may have changed.");
            return; // SILENT FAIL
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

// FRAGILITY WARNING: This button provides no feedback on failure
// User clicks → spinner shows → page reloads → looks like it worked (even if it failed)
// FIX: Add success/failure modal before reload, or don't reload at all
export function ImportButton() {
    const [loading, setLoading] = useState(false);

    return (
        <Button
            title={"Import the Week 1 Learning mats into the syllabus"}
            disabled={loading}
            onClick={async e => {
                setLoading(true);
                console.log("Import Syllabus clicked", e);
                await handleImportClick(); // Can fail silently at multiple points
                console.log("About to reload");
                location.reload(); // PROBLEM: Reloads even if import failed, masking errors
            }}
        >
            {loading ? "..." : "Import Wk1 Mats"}
        </Button>
    );
}
// TODO there might be some edge cases for lmats pages that don't use a dropdown?
// TODO users might prefer a carousel over listing the videos out?
// TODO replace stock line with titles of the dropdowns from the lmats page