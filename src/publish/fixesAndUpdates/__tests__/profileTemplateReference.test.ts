import { upsertProfileTemplateHelpHtml } from "../profileTemplateReference";

// The rendered help box's own content (the "minimal example" <pre> block,
// and the attribute reference table) legitimately mentions the string
// "data-profile-help" multiple times as text, separate from the one real
// [data-profile-help] element. Count elements via the DOM, not raw
// substring occurrences, so the box's own reference text doesn't skew it.
function countHelpBoxElements(html: string): number {
  const el = document.createElement("div");
  el.innerHTML = html;
  return el.querySelectorAll("[data-profile-help]").length;
}

describe("upsertProfileTemplateHelpHtml", () => {
  it("appends a help box to a page with none", () => {
    const page = `<div><h2 data-profile-name>Name</h2></div>`;
    const result = upsertProfileTemplateHelpHtml(page);
    expect(result).toContain("data-profile-name");
    expect(countHelpBoxElements(result)).toBe(1);
  });

  it("replaces an existing help box in place, even with nested elements inside it", () => {
    // The help box's own content includes nested divs (table, pre, ul) — a
    // naive "match to the next </div>" approach would stop at the first
    // nested closing tag instead of the box's own, and duplicate the box
    // instead of replacing it.
    const page = `
      <p>before</p>
      <div data-profile-help style="old-style">
        <h3>Old Title</h3>
        <div>nested content</div>
        <ul><li>old note</li></ul>
      </div>
      <script>after</script>
    `;
    const result = upsertProfileTemplateHelpHtml(page);
    expect(countHelpBoxElements(result)).toBe(1);
    expect(result).not.toContain("Old Title");
    expect(result).not.toContain("old note");
    expect(result).toContain("How this page works");
  });

  it("is idempotent: running it twice yields one help box, not two", () => {
    const page = `<div><h2 data-profile-name>Name</h2></div>`;
    const once = upsertProfileTemplateHelpHtml(page);
    const twice = upsertProfileTemplateHelpHtml(once);
    expect(countHelpBoxElements(twice)).toBe(1);
  });
});
