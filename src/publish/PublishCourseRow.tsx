import {Course} from "../canvas/index";
import React, {useEffect, useState} from "react";
import {IUserData} from "../canvas/canvasDataDefs";

type CourseRowProps = {
    course: Course,
}

function PublishCourseRow({course}: CourseRowProps) {
    const [instructors, setInstructors] = useState<IUserData[]>([])
    useEffect(() => {
        if (instructors.length <= 0) {
            course.getInstructors().then((instructors) => instructors && setInstructors(instructors));
        }
    }, [course, instructors])

    return (<div className={'row course-row'}>
        <div className={'col-xs-6'}>
            <a href={`/courses/${course.id}`} target={"blank_"}>{course.getItem<string>('course_code')}</a>
        </div>
        <div className={'col-xs-3'}>{course.workflowState}</div>
        <div className={'col-xs-3'}>{instructors.map((instructor) => instructor.name).join(', ')}</div>
    </div>)
}

export default PublishCourseRow