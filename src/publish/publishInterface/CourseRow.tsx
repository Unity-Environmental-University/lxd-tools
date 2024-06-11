import React, {useEffect, useState} from "react";
import {IUserData} from "../../canvas/canvasDataDefs";
import {IProfile} from "../../canvas/profile";
import {useEffectAsync} from "../../ui/utils";
import {Course} from "../../canvas/course/Course";

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
               target={"blank_"}>{course.parsedCourseCode}</a>
        </div>
        <div className={'col-xs-2'}>
            {frontPageProfile && frontPageProfile.displayName}
        </div>
        <div className={'col-xs-1'}>{(onSelectSection && course) && (
            <button onClick={() => onSelectSection(course)}>Details</button>)}</div>
        <div className={'col-xs-3'}>{instructors?.map((instructor) => instructor.name).join(', ')}</div>
    </div>)
}