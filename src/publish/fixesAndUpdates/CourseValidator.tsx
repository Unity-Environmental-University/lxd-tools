import React from "react";
import './CourseValidTest.scss'
import {ValidationRow} from "./ValidationRow";
import {Course} from "../../canvas/course";
import {CourseValidationTest} from "./validations";

type CourseValidatorProps<T = Course> = {
    course: T,
    showOnlyFailures: boolean,
    refreshCourse: () => Promise<any>,
    tests: CourseValidationTest<T>[]
}

export function CourseValidator({course, tests, refreshCourse, showOnlyFailures=false}: CourseValidatorProps) {
    return <div className={'container'}>
        {showOnlyFailures || <h2>Course Settings and Content Tests</h2>}
        {tests.map((test, i) => <ValidationRow
            key={test.name}
            course={course}
            test={test}
            showOnlyFailures={showOnlyFailures}
            refreshCourse={refreshCourse}
        />)}
    </div>
}

