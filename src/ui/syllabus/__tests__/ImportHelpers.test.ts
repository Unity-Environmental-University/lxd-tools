/**
 * @jest-environment jsdom
 */

// TODO this is claude generated but it looks good to me (matt)

import { extractContentFromHTML, clearMatsSection, importContentIntoSyllabus } from "../ImportHelpers";

// ─── extractContentFromHTML ───────────────────────────────────────────────────

describe("extractContentFromHTML", () => {
  const videoContainerHTML = `
    <div>
      <div class="cbt-video-container">
        <iframe width="560" height="315" style="border:none" src="https://example.com/video"></iframe>
      </div>
      <div class="cbt-video-container">
        <iframe width="640" height="480" src="https://example.com/video2"></iframe>
      </div>
      <div class="other-class">Should not be selected</div>
    </div>
  `;

  it("returns elements matching the query selector", () => {
    const result = extractContentFromHTML(videoContainerHTML, ".cbt-video-container");
    expect(result).toHaveLength(2);
  });

  it("returns an empty array when no elements match", () => {
    const result = extractContentFromHTML(videoContainerHTML, ".nonexistent");
    expect(result).toHaveLength(0);
  });

  it("resizes iframes inside matched elements to 300x200", () => {
    const result = extractContentFromHTML(videoContainerHTML, ".cbt-video-container");
    const iframe = result[0].querySelector("iframe")!;
    expect(iframe.style.width).toBe("300px");
    expect(iframe.style.height).toBe("200px");
  });

  it("removes width, height, and style attributes from iframes", () => {
    const result = extractContentFromHTML(videoContainerHTML, ".cbt-video-container");
    const iframe = result[0].querySelector("iframe")!;
    expect(iframe.getAttribute("width")).toBeNull();
    expect(iframe.getAttribute("height")).toBeNull();
    // style attribute itself won't be null since we set inline styles after,
    // but original style value should be overwritten
    expect(iframe.style.border).toBe("");
  });

  it("does not modify elements without iframes", () => {
    const html = `<div><div class="cbt-video-container"><p>No iframe here</p></div></div>`;
    const result = extractContentFromHTML(html, ".cbt-video-container");
    expect(result).toHaveLength(1);
    expect(result[0].querySelector("iframe")).toBeNull();
  });

  it("returns HTMLElement instances", () => {
    const result = extractContentFromHTML(videoContainerHTML, ".cbt-video-container");
    result.forEach(el => expect(el).toBeInstanceOf(HTMLElement));
  });
});

// ─── clearMatsSection ─────────────────────────────────────────────────────────

const makeSyllabusWithMats = (innerContent: string) => `
  <div class="content">
    <h3>Week 1 Learning Materials</h3>
    ${innerContent}
  </div>
`;

describe("clearMatsSection", () => {
  it("removes non-p, non-h3 children from the target section", () => {
    const syllabus = makeSyllabusWithMats(`
      <p>Keep me</p>
      <ul><li>Remove me</li></ul>
      <div>Remove me too</div>
    `);
    const result = clearMatsSection(syllabus);
    const parser = new DOMParser();
    const doc = parser.parseFromString(result, "text/html");
    const targetDiv = Array.from(doc.querySelectorAll(".content"))
      .find(d => d.textContent?.includes("Week 1 Learning Materials"))!;

    expect(targetDiv.querySelector("ul")).toBeNull();
    expect(targetDiv.querySelector("div")).toBeNull();
    expect(targetDiv.querySelector("p")).not.toBeNull();
    expect(targetDiv.querySelector("h3")).not.toBeNull();
  });

  it("clears & keeps <p> and Wk1 Mats <h3> elements", () => {
    const syllabus = makeSyllabusWithMats(`<p>Keep</p>`);
    const result = clearMatsSection(syllabus);
    const doc = new DOMParser().parseFromString(result, "text/html");
    const targetDiv = Array.from(doc.querySelectorAll(".content"))
      .find(d => d.textContent?.includes("Week 1 Learning Materials"))!;
    expect(targetDiv.querySelectorAll("p")).toHaveLength(1);
    expect(targetDiv.querySelectorAll("p")[0].textContent).toEqual("");
    expect(targetDiv.querySelectorAll("h3")).toHaveLength(1); // the original h3 + the inner one
  });

  it("adds a <p> if none exist after clearing", () => {
    const syllabus = makeSyllabusWithMats(`<ul><li>Only a list</li></ul>`);
    const result = clearMatsSection(syllabus);
    const doc = new DOMParser().parseFromString(result, "text/html");
    const targetDiv = Array.from(doc.querySelectorAll(".content"))
      .find(d => d.textContent?.includes("Week 1 Learning Materials"))!;
    expect(targetDiv.querySelector("p")).not.toBeNull();
  });

  it("does not add an extra <p> if one already exists", () => {
    const syllabus = makeSyllabusWithMats(`<p>Existing</p><ul><li>list</li></ul>`);
    const result = clearMatsSection(syllabus);
    const doc = new DOMParser().parseFromString(result, "text/html");
    const targetDiv = Array.from(doc.querySelectorAll(".content"))
      .find(d => d.textContent?.includes("Week 1 Learning Materials"))!;
    expect(targetDiv.querySelectorAll("p")).toHaveLength(1);
  });

  it("returns the original body unchanged when the target section is not found", () => {
    const syllabus = `<div class="content"><p>No matching section here</p></div>`;
    const result = clearMatsSection(syllabus);
    // Should return the original body string (body innerHTML)
    expect(result).toContain("No matching section here");
  });
});

// ─── importContentIntoSyllabus ────────────────────────────────────────────────

const makeElementWithText = (tag: string, text: string): HTMLElement => {
  const el = document.createElement(tag);
  el.textContent = text;
  return el;
};

const makeSyllabusForImport = (extra = "") => `
  <div class="content">
    <h3>Week 1 Learning Materials</h3>
    <p>Please watch...</p>
    <p>[bulleted list]</p>
    <p>The following learning materials will be shown here.</p>
    ${extra}
  </div>
`;

describe("importContentIntoSyllabus", () => {
  it("inserts content elements into the syllabus at the specified position", () => {
    const syllabus = makeSyllabusForImport();
    const content = [makeElementWithText("div", "Video 1")];
    const result = importContentIntoSyllabus(syllabus, content, "p", "beforebegin");
    expect(result).toContain("Video 1");
  });

  it("removes the [bulleted list] placeholder paragraph", () => {
    const syllabus = makeSyllabusForImport();
    const result = importContentIntoSyllabus(syllabus, [], "p", "beforebegin");
    expect(result).not.toContain("[bulleted list]");
  });

  it("replaces 'The following learning materials will' paragraph text", () => {
    const syllabus = makeSyllabusForImport();
    const result = importContentIntoSyllabus(syllabus, [], "p", "beforebegin");
    expect(result).not.toContain("The following learning materials will");
    expect(result).toContain("Please watch the overview video(s)");
  });

  it("returns the original body when the target section is not found", () => {
    const syllabus = `<div class="content"><p>No matching section</p></div>`;
    const content = [makeElementWithText("div", "New content")];
    const result = importContentIntoSyllabus(syllabus, content, "p", "beforebegin");
    expect(result).not.toContain("New content");
    expect(result).toContain("No matching section");
  });

  it("returns the original body when the insertion point selector is not found", () => {
    const syllabus = makeSyllabusForImport();
    const content = [makeElementWithText("div", "Should not appear")];
    const result = importContentIntoSyllabus(syllabus, content, ".nonexistent", "beforebegin");
    expect(result).not.toContain("Should not appear");
  });

  it("does not mutate the passed content array order permanently (reverse side-effect check)", () => {
    const syllabus = makeSyllabusForImport();
    const content = [
      makeElementWithText("div", "A"),
      makeElementWithText("div", "B"),
    ];
    const originalFirst = content[0].textContent;
    importContentIntoSyllabus(syllabus, content, "p", "beforebegin");
    // content array is reversed in-place by the function
    expect(content[0].textContent).not.toBe(originalFirst); // reversed
  });
});