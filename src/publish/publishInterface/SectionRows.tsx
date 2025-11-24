import {ICourseRowProps, CourseRow} from "./CourseRow";
import React, {FormEvent} from "react";
import {Course} from "../../canvas/course/Course";
import {IProfile} from "@canvas/type";

export interface ISectionRows {
    sections: Course[],
    onOpenAll: () => void,
    instructorsByCourseId: Record<number, ICourseRowProps["instructors"]>,
    frontPageProfilesByCourseId: Record<number, IProfile>,
    potentialProfilesByCourseId: Record<number, IProfile[]>,
    errorsByCourseId: Record<number, ICourseRowProps["errors"]>,
    setWorkingSection: (section: Course) => void,
    sectionPublishRecord?: Record<number, Course>,
    sectionPublishToggle?: (course: Course, publish: boolean) => void,
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

    return (<div className={'course-table'}>
        <div className={'row'}>
            <div className={'col-xs-1'}>
                <strong style={{textAlign: 'center'}}>Include?</strong>
            </div>
            <div className={'col-sm-5'}>
                <div><strong>Code</strong></div>
                <a href={'#'} onClick={openAll}>Open All</a>
            </div>
            <div className={'col-sm-1'}><strong>Student Count</strong></div>
            <div className={'col-sm-3'}><strong>Name on Front Page</strong></div>
            <div className={'col-sm-2'}><strong>Instructor(s)</strong></div>
        </div>
        {sections && sections.toSorted((a, b) => a.name.localeCompare(b.name)).map((course) => (
            <CourseRow
                instructors={instructorsByCourseId[course.id]}
                frontPageProfile={frontPageProfilesByCourseId[course.id]}
                facultyProfileMatches={potentialProfilesByCourseId[course.id]}
                key={course.id}
                errors={errorsByCourseId[course.id]}
                onSelectSection={(section) => setWorkingSection(section)}
                course={course}
                selected={Boolean(sectionPublishRecord?.[course.id])}
                selectionToggle={sectionPublishToggle}/>))}
    </div>)
}