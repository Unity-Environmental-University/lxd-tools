import React from "react";
import './CourseValidTest.scss'
import {ValidationRow} from "./ValidationRow";
import {CourseValidation} from "./validations/validations";
import {Course} from "../../canvas/course/Course";
import {Col} from "react-bootstrap";

export type CourseValidatorProps<T = Course> = {
    course: T,
    showOnlyFailures: boolean,
    refreshCourse: () => Promise<any>,
    tests: CourseValidation<T>[]
}

export function CourseValidator({course, tests, refreshCourse, showOnlyFailures=false}: CourseValidatorProps) {
    return <Col>
        {showOnlyFailures || <h2 data-testid="header">Course Settings and Content Tests</h2>}
        {tests.map((test, i) => <ValidationRow
            key={`${course.id}${test.name}${i}`}
            course={course}
            test={test}
            showOnlyFailures={showOnlyFailures}
            refreshCourse={refreshCourse}
        />)}
    </Col>
}

