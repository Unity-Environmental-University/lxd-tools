import { Course } from "@ueu/ueu-canvas/course/Course";

export type SectionKey = number | string;

/**
 * The key a section is stored under in the section manager's lookup tables.
 *
 * Normally the Canvas course id. A section without a usable id (Course.id is
 * NaN) gets a key built from its name and code instead, so that several such
 * sections don't all collapse onto one "NaN" entry and can each be reported.
 */
export function sectionKey(section: Course): SectionKey {
  const id = section.id;
  if (typeof id === "number" && Number.isFinite(id)) return id;
  return `no-id:${section.name ?? ""}:${section.courseCode ?? ""}`;
}
