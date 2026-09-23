import React, { useState } from "react";
import { Button } from "react-bootstrap";
import Modal from "@/ui/widgets/Modal/index";

/**
 * Reference for the data-profile-* convention, kept next to the code that
 * implements it (src/publish/fixesAndUpdates/profileRenderer.ts) so the two
 * can't drift. If you change what attributes exist or how they're matched,
 * update both.
 */
export function ProfileTemplateHelp() {
  const [show, setShow] = useState(false);

  return (
    <>
      <Button className="btn" onClick={() => setShow(true)} style={{ marginLeft: "8px" }}>
        How do Instructor Bio Pages work?
      </Button>
      <Modal id={"lxd-profile-template-help"} isOpen={show} requestClose={() => setShow(false)}>
        <div style={{ maxWidth: "700px" }}>
          <h3>
            Instructor Bio Pages
            <button onClick={() => setShow(false)} style={{ float: "right" }}>
              X
            </button>
          </h3>

          <p>
            "Set Bios" looks for exactly one page on the blueprint whose HTML contains one of the
            attributes below, then fills in the matched instructor's data and writes the result into
            every section's copy of that page. A course can use whatever page and layout it wants — the
            attributes are what make a page "the profile page," not its slug or position.
          </p>

          <h4>The attributes</h4>
          <table className="table" style={{ width: "100%" }}>
            <thead>
              <tr>
                <th>Attribute</th>
                <th>Goes on</th>
                <th>Does what</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <code>data-profile-name</code>
                </td>
                <td>any element</td>
                <td>its text content is replaced with the instructor's display name</td>
              </tr>
              <tr>
                <td>
                  <code>data-profile-bio</code>
                </td>
                <td>any element</td>
                <td>
                  its HTML content is replaced with the instructor's bio (plus a short "contact via
                  Canvas Inbox / email" line, if the instructor has an email on file)
                </td>
              </tr>
              <tr>
                <td>
                  <code>data-profile-image</code>
                </td>
                <td>
                  a wrapper <em>around</em> an <code>&lt;img&gt;</code>, not the <code>&lt;img&gt;</code>{" "}
                  itself
                </td>
                <td>
                  the <code>&lt;img&gt;</code> inside it gets its <code>src</code>/<code>alt</code>{" "}
                  swapped for the instructor's photo
                </td>
              </tr>
              <tr>
                <td>
                  <code>data-profile-message</code>
                </td>
                <td>
                  an <code>&lt;a&gt;</code>
                </td>
                <td>its <code>href</code> is set to open Canvas Inbox, pre-addressed to the instructor</td>
              </tr>
              <tr>
                <td>
                  <code>data-profile-help</code>
                </td>
                <td>any element(s)</td>
                <td>removed entirely the moment a real profile is written — for template setup notes, never seen by students</td>
              </tr>
            </tbody>
          </table>

          <p>
            <strong>Why not directly on the image?</strong> Canvas's page renderer strips unrecognized{" "}
            <code>data-*</code> attributes from <code>&lt;img&gt;</code> tags specifically — and the RCE
            drops them again on every manual save. Putting the marker on a wrapper element sidesteps
            that entirely.
          </p>

          <h4>Minimal example</h4>
          <pre style={{ background: "#f5f5f5", padding: "12px", overflowX: "auto" }}>
            {`<h2 data-profile-name>Instructor Name</h2>

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
</div>`}
          </pre>

          <h4>Building your own layout</h4>
          <ul>
            <li>Attributes can go on any element, in any order, anywhere in the page's own HTML.</li>
            <li>
              Only <strong>one</strong> page per blueprint may carry these attributes. If two pages
              have them, "Set Bios" reports an ambiguous match and writes nothing until it's fixed.
            </li>
            <li>
              If a course has <strong>no</strong> page with these attributes, "Set Bios" reports that
              too, rather than guessing at the front page.
            </li>
            <li>
              The image wrapper just needs to <em>contain</em> an <code>&lt;img&gt;</code> — nesting,
              styling classes, and surrounding markup are entirely up to you.
            </li>
            <li>
              A page's target section copy is unlocked automatically for the duration of a "Set Bios"
              run, and re-locked afterward — you don't need to touch blueprint lock settings yourself.
            </li>
          </ul>
        </div>
      </Modal>
    </>
  );
}
