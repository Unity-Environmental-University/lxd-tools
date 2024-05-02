import React from "react";
import {Course} from "../../canvas/index";
import {UnitTestResult} from "./publishValidation";
import './CourseValidTest.scss'
import {ICanvasCallConfig} from "../../canvas/canvasUtils";
import {ValidationRow} from "./ValidationRow";

type CourseValidatorProps<T = Course> = {
    course: T,
    showOnlyFailures: boolean,
    refreshCourse: () => Promise<any>,
    tests: CourseValidationTest<T>[]
}
export type CourseValidationTest<T = Course> = {
    name: string,
    description: string,
    run:  (course: T, config?:ICanvasCallConfig) => Promise<UnitTestResult>
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

