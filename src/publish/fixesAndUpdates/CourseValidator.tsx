import React, {useState} from "react";
import {Course} from "../../canvas/index";
import {UnitTestResult} from "./publishValidation";
import {useEffectAsync} from "../../ui/utils";
import './CourseValidTest.scss'
import {ICanvasCallConfig} from "../../canvas/canvasUtils";

type ValidateSectionTestProps<T = Course> = {
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

export function ValidateSectionTest({course, tests, refreshCourse, showOnlyFailures=false}: ValidateSectionTestProps) {
    return <div className={'container'}>
        {showOnlyFailures || <h2>Course Settings and Content Tests</h2>}
        {tests.map((test) => <ValidationRow
            key={test.name}
            course={course}
            test={test}
            showOnlyFailures={showOnlyFailures}
            refreshCourse={refreshCourse}
        />)}
    </div>
}

type ValidationRowProps = {
    course: Course,
    test: CourseValidationTest,
    refreshCourse: () => Promise<any>
    onResult? : (result:UnitTestResult, test:CourseValidationTest) => any,
    showOnlyFailures?: boolean,
}

function ValidationRow({test, course, refreshCourse, onResult, showOnlyFailures=false}: ValidationRowProps) {
    const [loading, setLoading] = useState(false);
    const [result, _setResult] = useState<UnitTestResult>()

    function setResult(result:UnitTestResult) {
        _setResult(result);
        onResult && onResult(result, test);
    }
    async function reRun() {
        await refreshCourse();
        setResult(await test.run(course))
    }

    useEffectAsync(async () => {
        setResult(await test.run(course));
    }, [course, test])

    function statusMessage(result:UnitTestResult|undefined) {
        if(loading) return "running..."
        if(!result) return "No result. An error may have occurred."
        if(result.success) return "Succeeded!"
        return result.message;
    }

    if(!showOnlyFailures || result?.success === false) {
        return <div className={'row test-row'}>
            <div className={'col-sm-3'}>{test.name}</div>
            <div className={'col-sm-4'}>{test.description}</div>
            <div className={'col-sm-4'}>{statusMessage(result)}</div>
            <div className={'col-sm-1'}>
                {!result && <span className={'badge badge-info'}>Running</span>}
                {result?.success && <span className={'badge badge-success'}>OK!</span>}
                {result && !result.success && <span className={'badge badge-warning'}>Failed</span>}
            </div>
        </div>
    }
    return <></>
}

