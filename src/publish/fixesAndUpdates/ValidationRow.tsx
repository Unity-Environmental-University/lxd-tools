import React, {useState} from "react";
import {useEffectAsync} from "../../ui/utils";
import {Course} from "../../canvas/course";
import {CourseValidationTest, ValidationTestResult} from "./validations";
import assert from "assert";

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
    const [fixText, setFixText] = useState("Fix?")

    function setResult(result: ValidationTestResult) {
        _setResult(result);
        onResult && onResult(result, test);
    }

    async function reRun() {
        setLoading(true);
        await refreshCourse();
        setResult(await test.run(course))
        setLoading(false);
    }

    async function fix() {
        setFixText('Fixing..');
        setLoading(true);
        assert(test.fix);
        await test.fix(course);
        setFixText('Fixed...');
        await refreshCourse();
        setResult(await test.run(course))
<<<<<<< HEAD
        await refreshCourse();
=======
        setLoading(false);
>>>>>>> dev
    }


    useEffectAsync(async () => {
        setLoading(true);
        setResult(await test.run(course));
        setLoading(false);
    }, [course, test])

    function statusMessage(result: ValidationTestResult | undefined) {
        if (loading) return "running..."
        if (!result) return loading? "still running" : "No Result, an error may have occured."
        if (result.success) return "Succeeded!"
        return typeof result.message === 'string' ?
            <p>{result.message}</p>
            : result.message.map(message => (<div>
                {message}
                </div>))
    }

    if (!showOnlyFailures || loading || (!result?.success)) {
        return <div className={'row test-row'}>
            <div className={'col-sm-2'}>{test.name}</div>
            <div className={'col-sm-3'}>
                {test.description}
            </div>
            <div className={'col-sm-4'}>
                <p>{statusMessage(result)}</p>
                {result?.links?.map(link => <div key={link}>
                    <a href={link} target={'_blank'}>{link}</a>
                </div>)}

            </div>
            <div className={'col-sm-1'}>
                {test.fix && result && !result.success && <button
                    onClick={fix}
                >
                    {fixText}
                </button>}
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