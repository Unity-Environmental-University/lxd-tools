import {ICourseRowProps, CourseRow} from "./CourseRow";
import {IProfile} from "../../canvas/profile";
import React, {FormEvent} from "react";
import {Course} from "../../canvas/course/Course";

export interface ISectionRows {
    sections: Course[],
    onOpenAll: () => void,
    instructorsByCourseId: Record<number, ICourseRowProps["instructors"]>,
    frontPageProfilesByCourseId: Record<number, IProfile>,
    potentialProfilesByCourseId: Record<number, IProfile[]>,
    errorsByCourseId: Record<number, ICourseRowProps["errors"]>,
    setWorkingSection: (section: Course) => void
}

export function SectionRows({
    onOpenAll,
    sections,
    instructorsByCourseId,
    frontPageProfilesByCourseId,
    potentialProfilesByCourseId,
    errorsByCourseId,
    setWorkingSection,
}: ISectionRows) {

    function openAll(e: FormEvent) {
        e.preventDefault();
        onOpenAll();
    }

    return (<div className={'course-table'}>
        <div className={'row'}>
            <div className={'col-sm-5'}>

                <div><strong>Code</strong></div>
                <a href={'#'} onClick={openAll}>Open All</a>
            </div>
            <div className={'col-sm-1'}><strong>Student Count</strong></div>
            <div className={'col-sm-3'}><strong>Name on Front Page</strong></div>
            <div className={'col-sm-3'}><strong>Instructor(s)</strong></div>
        </div>
        {sections && sections.toSorted((a, b) => a.name.localeCompare(b.name)).map((course) => (
            <CourseRow
                instructors={instructorsByCourseId[course.id]}
                frontPageProfile={frontPageProfilesByCourseId[course.id]}
                facultyProfileMatches={potentialProfilesByCourseId[course.id]}
                key={course.id}
                errors={errorsByCourseId[course.id]}
                onSelectSection={(section) => setWorkingSection(section)}
                course={course}/>))}
    </div>)
}