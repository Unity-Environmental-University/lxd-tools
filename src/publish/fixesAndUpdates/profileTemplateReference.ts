/**
 * Single source of truth for the data-profile-* convention reference —
 * consumed both as JSX (ProfileTemplateHelp modal) and as an HTML string
 * (injected into a real Canvas page via a data-profile-help box). Edit this
 * file; the two renderers stay in sync because they read from it instead of
 * each hand-writing the same table and example.
 */

export interface ProfileAttrRow {
  attr: string;
  goesOn: string;
  doesWhat: string;
}

export const PROFILE_ATTR_ROWS: ProfileAttrRow[] = [
  {
    attr: "data-profile-name",
    goesOn: "any element",
    doesWhat: "its text content is replaced with the instructor's display name",
  },
  {
    attr: "data-profile-bio",
    goesOn: "any element",
    doesWhat:
      'its HTML content is replaced with the instructor\'s bio (plus a short "contact via Canvas Inbox / email" line, if the instructor has an email on file)',
  },
  {
    attr: "data-profile-image",
    goesOn: "a wrapper around an <img>, not the <img> itself",
    doesWhat: "the <img> inside it gets its src/alt swapped for the instructor's photo",
  },
  {
    attr: "data-profile-message",
    goesOn: "an <a>",
    doesWhat: "its href is set to open Canvas Inbox, pre-addressed to the instructor",
  },
  {
    attr: "data-profile-help",
    goesOn: "any element(s)",
    doesWhat: "removed entirely the moment a real profile is written — for template setup notes, never seen by students",
  },
];

export const PROFILE_TEMPLATE_INTRO =
  '"Set Bios" looks for exactly one page on the blueprint whose HTML contains one of the attributes below, then fills in the matched instructor\'s data and writes the result into every section\'s copy of that page. A course can use whatever page and layout it wants — the attributes are what make a page "the profile page," not its slug or position.';

export const PROFILE_TEMPLATE_IMAGE_NOTE =
  "Why not directly on the image? Canvas's page renderer strips unrecognized data-* attributes from <img> tags specifically — and the RCE drops them again on every manual save. Putting the marker on a wrapper element sidesteps that entirely.";

export const PROFILE_TEMPLATE_EXAMPLE = `<h2 data-profile-name>Instructor Name</h2>

<div data-profile-bio>
  Bio goes here — this placeholder text is replaced.
</div>

<div data-profile-image>
  <img src="placeholder.png" alt="Instructor photo" />
</div>

<a data-profile-message href="#">Message Instructor</a>

<div data-profile-help>
  Any setup notes for whoever builds this page — removed automatically
  the moment a real profile is written, so students never see it.
</div>`;

export const PROFILE_TEMPLATE_NOTES = [
  "Attributes can go on any element, in any order, anywhere in the page's own HTML.",
  'Only one page per blueprint may carry these attributes. If two pages have them, "Set Bios" reports an ambiguous match and writes nothing until it\'s fixed.',
  'If a course has no page with these attributes, "Set Bios" reports that too, rather than guessing at the front page.',
  "The image wrapper just needs to contain an <img> — nesting, styling classes, and surrounding markup are entirely up to you.",
  'A page\'s target section copy is unlocked automatically for the duration of a "Set Bios" run, and re-locked afterward — you don\'t need to touch blueprint lock settings yourself.',
];

/**
 * Render the reference as a self-contained HTML block, for injecting into a
 * real Canvas page as a data-profile-help box (so it's stripped automatically
 * on the first real "Set Bios" run — see profileRenderer.ts's ATTR.help).
 */
export function renderProfileTemplateHelpHtml(): string {
  const rows = PROFILE_ATTR_ROWS.map(
    (row) => `<tr style="border-bottom: 1px solid #ddd;">
<td style="padding: 4px 8px;"><code>${row.attr}</code></td>
<td style="padding: 4px 8px;">${row.goesOn}</td>
<td style="padding: 4px 8px;">${row.doesWhat}</td>
</tr>`
  ).join("\n");

  const notes = PROFILE_TEMPLATE_NOTES.map((note) => `<li>${note}</li>`).join("\n");

  return `<div data-profile-help style="border: 2px dashed #8b9dc3; border-radius: 8px; padding: 16px 20px; margin-top: 24px; background-color: #f4f6fb;">
<h3 style="margin-top: 0;">How this page works (editors only — remove or leave, up to you)</h3>
<p>${PROFILE_TEMPLATE_INTRO}</p>
<table style="width: 100%; border-collapse: collapse;">
<thead>
<tr style="text-align: left; border-bottom: 1px solid #ccc;">
<th style="padding: 4px 8px;">Attribute</th>
<th style="padding: 4px 8px;">Goes on</th>
<th style="padding: 4px 8px;">Does what</th>
</tr>
</thead>
<tbody>
${rows}
</tbody>
</table>
<p>${PROFILE_TEMPLATE_IMAGE_NOTE}</p>
<p><strong>Minimal example:</strong></p>
<pre style="background: #eef0f5; padding: 12px; overflow-x: auto; white-space: pre-wrap;">${escapeHtml(PROFILE_TEMPLATE_EXAMPLE)}</pre>
<ul>
${notes}
</ul>
</div>`;
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * Insert or replace the data-profile-help reference box in a page's HTML.
 * Uses DOM parsing rather than a regex: the box's own content includes
 * nested elements (a table, a <pre>, a <ul>), so a naive "match to the next
 * </div>" regex matches the first nested closing tag instead of the box's
 * own — this replaces exactly the querySelector-matched element instead.
 */
export function upsertProfileTemplateHelpHtml(pageHtml: string): string {
  const container = document.createElement("div");
  container.innerHTML = pageHtml;

  const existing = container.querySelector("[data-profile-help]");
  const helpEl = document.createElement("div");
  helpEl.innerHTML = renderProfileTemplateHelpHtml();
  const newHelpNode = helpEl.firstElementChild;
  if (!newHelpNode) return pageHtml;

  if (existing) {
    existing.replaceWith(newHelpNode);
  } else {
    container.appendChild(newHelpNode);
  }

  return container.innerHTML;
}
