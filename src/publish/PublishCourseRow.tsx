import {Course} from "../canvas/index";
import React, {useEffect, useState} from "react";
import {IUserData} from "../canvas/canvasDataDefs";

type CourseRowProps = {
    course: Course,
}

function PublishCourseRow({course}: CourseRowProps) {
    const [instructors, setInstructors] = useState<IUserData[]>([])
    const [freshCourse, setFreshCourse] = useState<Course | null>(course);
    useEffect(() => {
        if (instructors.length <= 0) {
            async function getCourse() {
                course.getInstructors().then((instructors) => instructors && setInstructors(instructors));
                setFreshCourse(await Course.getCourseById(course.id))
                console.log(course);
            }
            getCourse().then();
        }
    }, [freshCourse, course, instructors])

    return (<div className={'row course-row'}>
        <div className={'col-xs-9'}>
            <a href={`/courses/${course.id}`} className={ freshCourse?.workflowState} target={"blank_"}>{course.getItem<string>('course_code')}</a>
        </div>
        <div className={'col-xs-3'}>{instructors.map((instructor) => instructor.name).join(', ')}</div>
    </div>)
}

export default PublishCourseRow