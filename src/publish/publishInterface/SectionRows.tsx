import { ICourseRowProps, CourseRow } from "./CourseRow";
import React, { FormEvent } from "react";
import { Course } from "@ueu/ueu-canvas";
import { IProfile } from "@ueu/ueu-canvas";

export interface ISectionRows {
  sections: Course[];
  onOpenAll: () => void;
  instructorsByCourseId: Record<number, ICourseRowProps["instructors"]>;
  frontPageProfilesByCourseId: Record<number, IProfile>;
  potentialProfilesByCourseId: Record<number, IProfile[]>;
  errorsByCourseId: Record<number, ICourseRowProps["errors"]>;
  setWorkingSection: (section: Course) => void;
  sectionPublishRecord?: Record<number, Course>;
  sectionPublishToggle?: (course: Course, publish: boolean) => void;
}

export function SectionRows({
  onOpenAll,
  sections,
  instructorsByCourseId,
  frontPageProfilesByCourseId,
  potentialProfilesByCourseId,
  errorsByCourseId,
  setWorkingSection,
  sectionPublishRecord,
  sectionPublishToggle,
}: ISectionRows) {
  function openAll(e: FormEvent) {
    e.preventDefault();
    onOpenAll();
  }

  function toggleAll(e: FormEvent) {
    e.preventDefault();

    if (!sectionPublishToggle || !sectionPublishRecord) return;

    // Count how many sections are currently checked vs unchecked
    const checkedCount = sections.filter((section) => sectionPublishRecord[section.id]).length;
    const uncheckedCount = sections.length - checkedCount;

    // Determine the minority status (what we should set all checkboxes to)
    const shouldCheckAll = uncheckedCount >= checkedCount;

    // Set all sections to the minority status
    sections.forEach((section) => {
      sectionPublishToggle(section, shouldCheckAll);
    });
  }

  // Determine what the toggle action will do for display text
  function getToggleAllText(): string {
    if (!sectionPublishRecord) return "Check/Uncheck All";

    const checkedCount = sections.filter((section) => sectionPublishRecord[section.id]).length;
    const uncheckedCount = sections.length - checkedCount;

    // If more are unchecked (or equal), clicking will check all
    if (uncheckedCount >= checkedCount) {
      return "Select All";
    } else {
      return "Unselect All";
    }
  }

  return (
    <div className={"course-table"}>
      <div className={"row"}>
        <div className={"col-xs-1"}>
          <strong style={{ textAlign: "center", fontSize: ".92rem" }}>Include?</strong>
          <a href={"#"} onClick={toggleAll} style={{ textAlign: "center", fontSize: ".92rem" }}>
            {getToggleAllText()}
          </a>
        </div>
        <div className={"col-sm-4"}>
          <div>
            <strong>Code</strong>
          </div>
          <a href={"#"} onClick={openAll}>
            Open All
          </a>
        </div>
        <div className={"col-sm-1"}>
          <strong>Student Count</strong>
        </div>
        <div className={"col-sm-3"}>
          <strong>Name on Front Page</strong>
        </div>
        <div className={"col-sm-2"}>
          <strong>Instructor(s)</strong>
        </div>
      </div>
      {sections &&
        sections
          .toSorted((a, b) => a.name.localeCompare(b.name))
          .map((course) => (
            <CourseRow
              instructors={instructorsByCourseId[course.id]}
              frontPageProfile={frontPageProfilesByCourseId[course.id]}
              facultyProfileMatches={potentialProfilesByCourseId[course.id]}
              key={course.id}
              errors={errorsByCourseId[course.id]}
              onSelectSection={(section) => setWorkingSection(section)}
              course={course}
              selected={Boolean(sectionPublishRecord?.[course.id])}
              selectionToggle={sectionPublishToggle}
            />
          ))}
    </div>
  );
}
