import React, {useEffect, useState} from "react";
import {IUserData} from "../canvas/canvasDataDefs";
import {Course} from "../canvas/index";
import {IProfile} from "../canvas/profile";

type CourseRowProps = {
    course: Course,
    errors: string[],
    facultyProfileMatches: IProfile[],
    onClickDx?: (course: Course) => void,
}

export function PublishCourseRow({course, onClickDx, errors}: CourseRowProps) {
    const [instructors, setInstructors] = useState<IUserData[]>([])
    const [frontPageProfile, setFrontPageProfile] = useState<IProfile>();

    useEffect(() => {
        async function getCourse() {
            course.getInstructors().then((instructors) => instructors && setInstructors(instructors));
            setFrontPageProfile(await course.getFrontPageProfile())
        }

        getCourse().then();
    }, [course])

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
        <div className={'col-xs-3'}>{instructors.map((instructor) => instructor.name).join(', ')}</div>
    </div>)
}