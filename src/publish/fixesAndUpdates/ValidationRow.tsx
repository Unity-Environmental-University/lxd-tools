import React, {useState} from "react";
import {useEffectAsync} from "../../ui/utils";
import {CourseValidation, ValidationTestResult} from "./validations";
import assert from "assert";
import {Row} from "react-bootstrap";
import {Course} from "../../canvas/course/Course";

type ValidationRowProps = {
    course: Course,
    potemkinVillage?: boolean,
    test: CourseValidation,
    slim?: boolean,
    initialResult?: ValidationTestResult,
    refreshCourse: () => Promise<any>
    onResult?: (result: ValidationTestResult, test: CourseValidation) => any,
    showOnlyFailures?: boolean,
}

export function ValidationRow({
    test,
    slim,
    potemkinVillage,
    initialResult,
    course,
    refreshCourse,
    onResult,
    showOnlyFailures = false
}: ValidationRowProps) {
    const [loading, setLoading] = useState(false);
    const [result, _setResult] = useState(initialResult);
    const [fixText, setFixText] = useState("Fix?")

    function setResult(result: ValidationTestResult) {
        _setResult(result);
        onResult && onResult(result, test);
    }

    async function reRun() {
        setLoading(true);
        try {
            await refreshCourse();
            setResult(await (test.run(course)))

        } catch (e) {
            setResult({
                success: false,
                message: [e?.toString() || 'Error', test.name, e instanceof Error ? e.stack ?? '' : '']
            })
        }


        setLoading(false);
    }

    async function fix() {
        setFixText('Fixing..');
        setLoading(true);
        try {
            assert(test.fix);
            await test.fix(course);
            setFixText('Fixed...');
            await refreshCourse();
            setResult(await test.run(course))

        } catch (e) {
            setResult({
                success: false,
                message: [e?.toString() || 'Error', test.name, e instanceof Error ? e.stack ?? '' : '']
            })
        }
        setLoading(false);
    }

    useEffectAsync(async () => {
        if (result) return; //only run once and only if we don't have a result. MUST call r
        if (potemkinVillage) return;
        setLoading(true);
        try {
            setResult(await test.run(course));

        } catch (e) {
            setResult({
                success: false,
                message: [e?.toString() || 'Error', test.name, e instanceof Error ? e.stack ?? '' : '']
            })
        }


        setLoading(false);
    }, [course, test])

    function truncateMessage(messageString: string) {
        if (slim) return messageString.replace(/^(.{200}).*$/, '$1...')
        return messageString;
    }

    function statusMessage(result: ValidationTestResult | undefined) {
        if (loading) return "running..."
        if (!result) return loading ? "still running" : "No Result, an error may have occurred."
        if (result.success) return "Succeeded!"


        return typeof result.message === 'string' ?
            <div className={'message'}>{truncateMessage(result.message)}</div>
            : result.message.map(message => (<div className='message'>
                {truncateMessage(message)}
                <hr/>
            </div>))
    }

    if (!showOnlyFailures || loading || (!result?.success)) {
        return <Row className={slim ? 'test-row-slim' : 'test-row'}>
            <div className={'col-sm-2'}>{test.name}</div>
            <div className={'col-sm-3 message'}>
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
        </Row>
    }
    return <></>
}