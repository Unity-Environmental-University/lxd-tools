import React, {useEffect, useState} from "react";
import {IUserData} from "../../canvas/canvasDataDefs";
import {IProfile} from "../../canvas/profile";
import {Course} from "../../canvas/course/index";
import {useEffectAsync} from "../../ui/utils";

type CourseRowProps = {
    course: Course,
    errors: string[],
    instructors?: IUserData[],
    facultyProfileMatches: IProfile[],
    frontPageProfile: IProfile | null,
    onClickDx?: (course: Course) => void,
}

export function PublishCourseRow({course, frontPageProfile, instructors, onClickDx, errors}: CourseRowProps) {
    return (<div className={'row course-row'}>
        <div className={'col-xs-6'}>
            <a href={`/courses/${course.id}`} className={`course-link ${course?.workflowState}`}
               target={"blank_"}>{course.getItem<string>('course_code')}</a>
        </div>
        <div className={'col-xs-2'}>
            {frontPageProfile && frontPageProfile.displayName}
        </div>
        <div className={'col-xs-1'}>{(onClickDx && course) && (
            <button onClick={() => onClickDx(course)}>Details</button>)}</div>
        <div className={'col-xs-3'}>{instructors?.map((instructor) => instructor.name).join(', ')}</div>
    </div>)
}