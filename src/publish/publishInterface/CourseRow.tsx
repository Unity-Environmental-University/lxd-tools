import React, {useEffect, useState} from "react";
import {IUserData} from "../../canvas/canvasDataDefs";
import {useEffectAsync} from "../../ui/utils";
import {Course} from "../../canvas/course/Course";
import {IProfile} from "@canvas/type";

export interface ICourseRowProps {
    course: Course,
    errors: string[],
    instructors?: IUserData[],
    facultyProfileMatches: IProfile[],
    frontPageProfile: IProfile | null,
    onSelectSection?: (course: Course) => void,
    selectionToggle?: (course: Course, publish: boolean) => void,
    selected?: boolean
}

export function CourseRow({
                              course,
                              frontPageProfile,
                              instructors,
                              onSelectSection,
                              errors,
                              selectionToggle,
                              selected
                          }: ICourseRowProps) {
    return (<div className={'row course-row align-items-center'}>
        <div className={'col-xs-1'}>
            <input type={'checkbox'} checked={selected}
                   onChange={e => selectionToggle?.(course, e.currentTarget.checked)}/>
        </div>
        <div className={'col-xs-4'}>
            <a href={`/courses/${course.id}`} className={`course-link ${course?.workflowState}`}
               target={"blank_"}>{course.name}</a>
        </div>
        <div className={'col-xs-1'}>
            {course.data.total_students}
        </div>
        <div className={'col-xs-2'}>
            {frontPageProfile && frontPageProfile.displayName}
        </div>
        <div className={'col-xs-1'}>{(onSelectSection && course) && (
            <button onClick={() => onSelectSection(course)}>Details</button>)}</div>
        <div className={'col-xs-2'}>{instructors?.map((instructor) => instructor.name).join(', ')}</div>
    </div>)
}