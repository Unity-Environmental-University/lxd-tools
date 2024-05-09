import React, {useState} from "react";
import {useEffectAsync} from "../../ui/utils";
import {Course} from "../../canvas/course";
import {CourseValidationTest, ValidationTestResult} from "./validations";

type ValidationRowProps = {
    course: Course,
    test: CourseValidationTest,
    refreshCourse: () => Promise<any>
    onResult?: (result: ValidationTestResult, test: CourseValidationTest) => any,
    showOnlyFailures?: boolean,
}

export function ValidationRow({test, course, refreshCourse, onResult, showOnlyFailures = false}: ValidationRowProps) {
    const [loading, setLoading] = useState(false);
    const [result, _setResult] = useState<ValidationTestResult>()

    function setResult(result: ValidationTestResult) {
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

    function statusMessage(result: ValidationTestResult | undefined) {
        if (loading) return "running..."
        if (!result) return "No result. An error may have occurred."
        if (result.success) return "Succeeded!"
        return result.message;
    }

    if (!showOnlyFailures || (result && !result.success)) {
        return <div className={'row test-row'}>
            <div className={'col-sm-3'}>{test.name}</div>
            <div className={'col-sm-4'}>
                <p>{test.description}</p>
            </div>
            <div className={'col-sm-4'}>
                <p>{statusMessage(result)}</p>
                {result?.links?.map(link => <div key={link}>
                    <a href={link} target={'_blank'}>{link}</a>
                </div>)}

            </div>
            <div className={'col-sm-1'}>
                {!result && <span className={'badge badge-info'}>Running</span>}
                {result?.success && <span className={'badge badge-success'}>OK!</span>}
                {result && !result.success && <span className={'badge badge-warning'}>Failed</span>}
            </div>
        </div>
    }
    return <></>
}