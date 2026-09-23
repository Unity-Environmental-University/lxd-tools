import React, { useState } from "react";
import { Button } from "react-bootstrap";
import Modal from "@/ui/widgets/Modal/index";
import { Course } from "@ueu/ueu-canvas/course/Course";
import {
  PROFILE_ATTR_ROWS,
  PROFILE_TEMPLATE_EXAMPLE,
  PROFILE_TEMPLATE_IMAGE_NOTE,
  PROFILE_TEMPLATE_INTRO,
  PROFILE_TEMPLATE_NOTES,
  upsertProfileTemplateHelpHtml,
} from "@publish/fixesAndUpdates/profileTemplateReference";
import { findProfilePageSlug, getProfilePage } from "@publish/fixesAndUpdates/courseDataStore";

export interface ProfileTemplateHelpProps {
  blueprintCourse?: Course | null;
}

/**
 * Reference for the data-profile-* convention, read from
 * profileTemplateReference.ts — the same source that generates the HTML
 * version injected into a real Canvas page. Edit that file, not this one, to
 * change the actual content; this file is just the JSX rendering of it.
 */
export function ProfileTemplateHelp({ blueprintCourse }: ProfileTemplateHelpProps) {
  const [show, setShow] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  async function insertOrRefreshHelpBox() {
    if (!blueprintCourse) return;
    setStatus("Working...");
    const result = await findProfilePageSlug(blueprintCourse.id);
    if (result.status !== "found") {
      setStatus(
        result.status === "none"
          ? "No profile page found on this blueprint — add the data-profile-* attributes to a page first."
          : `Multiple profile pages found: ${result.candidates.join(", ")} — resolve that before adding a help box.`
      );
      return;
    }
    const targetPage = await getProfilePage(blueprintCourse.id, result.slug);
    if (!targetPage) {
      setStatus(`Profile page "${result.slug}" not found.`);
      return;
    }
    const hadExisting = targetPage.body.includes("data-profile-help");
    const newBody = upsertProfileTemplateHelpHtml(targetPage.body);
    await targetPage.updateContent(newBody);
    setStatus(hadExisting ? `Updated the help box on "${result.slug}".` : `Added a help box to "${result.slug}".`);
  }

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

          <p>{PROFILE_TEMPLATE_INTRO}</p>

          {blueprintCourse && (
            <p>
              <Button className="btn" onClick={insertOrRefreshHelpBox}>
                Add/refresh this reference on the blueprint's profile page
              </Button>
              {status && <span style={{ marginLeft: "8px" }}>{status}</span>}
            </p>
          )}

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
              {PROFILE_ATTR_ROWS.map((row) => (
                <tr key={row.attr}>
                  <td>
                    <code>{row.attr}</code>
                  </td>
                  <td>{row.goesOn}</td>
                  <td>{row.doesWhat}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <p>{PROFILE_TEMPLATE_IMAGE_NOTE}</p>

          <h4>Minimal example</h4>
          <pre style={{ background: "#f5f5f5", padding: "12px", overflowX: "auto" }}>{PROFILE_TEMPLATE_EXAMPLE}</pre>

          <h4>Building your own layout</h4>
          <ul>
            {PROFILE_TEMPLATE_NOTES.map((note, i) => (
              <li key={i}>{note}</li>
            ))}
          </ul>
        </div>
      </Modal>
    </>
  );
}
