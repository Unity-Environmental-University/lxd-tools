import React from "react";
import './CourseValidTest.scss'
import {ValidationRow} from "./ValidationRow";
import {Course} from '@ueu/ueu-canvas/course/Course';
import {Col} from "react-bootstrap";
import {CourseValidation} from "@publish/fixesAndUpdates/validations/types";
import {ValidationResult} from "./validations/utils";

export type CourseValidatorProps<T = Course> = {
    course: T,
    showOnlyFailures: boolean,
    refreshCourse: () => Promise<any>,
    tests: CourseValidation<T>[]
}

export function CourseValidator({course, tests, refreshCourse, showOnlyFailures = false}: CourseValidatorProps) {

    type ResultSet = {
        courseId: number,
        result: ValidationResult,
        test: CourseValidation
    }
    const [results, setResults] = React.useState<ResultSet[]>([]);


    const validated = (courseId: number, result: ValidationResult, test: CourseValidation) => {
        setResults([
            ...results,
            {
                courseId,
                result,
                test
            }
        ]);
    }


    return <Col>
        {showOnlyFailures || <h2 data-testid="header">Course Settings and Content Tests</h2>}

        {tests.map((test, i) => <ValidationRow
            key={`${course.id}${test.name}`}
            course={course}
            test={test}
            showOnlyFailures={showOnlyFailures}
            refreshCourse={refreshCourse}
            onValidationResult={(result, test) => validated(course.id, result, test)}
        />)}
    </Col>
}

