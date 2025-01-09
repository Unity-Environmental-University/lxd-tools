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
}

export function CourseRow({course, frontPageProfile, instructors, onSelectSection, errors}: ICourseRowProps) {
    return (<div className={'row course-row'}>
        <div className={'col-xs-6'}>
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