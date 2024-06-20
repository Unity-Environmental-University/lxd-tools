import React, {useState} from "react";
import {useEffectAsync} from "../../ui/utils";
import {CourseValidation, errorMessageResult, ValidationTestResult} from "./validations";
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
            setResult(errorMessageResult(e))
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
            setResult(errorMessageResult(e))
        }
        setLoading(false);
    }

    useEffectAsync(async () => {
        if (result) return; //only run once and only if we don't have a result
        if (potemkinVillage) return;
        setLoading(true);
        try {
            setResult(await test.run(course));

        } catch (e) {
            setResult(errorMessageResult(e))
        }

        setLoading(false);
    }, [course, test])



    if (!showOnlyFailures || loading || (!result?.success)) {
        return <Row className={slim ? 'test-row-slim' : 'test-row'}>
            <div className={'col-sm-2'}>{test.name}</div>
            <div className={'col-sm-3 message'}>
                {test.description}

            </div>
            <div className={'col-sm-4'}>
                {validationStatusMessage(result, loading, slim)}
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

export function truncateMessage(messageString: string, slim?: boolean) {
        if (slim) return messageString.replace(/^(.{200}).*$/, '$1...')
        return messageString;
    }


export function validationStatusMessage(result: ValidationTestResult | undefined, loading: boolean, slim?:boolean) {
    if (loading) return "running..."
    if (!result) return loading ? "still running" : "No Result, an error may have occurred."
    if (result.success) return "Succeeded!"


    return result.messages.map(message => (<div className='message'>
        {message.bodyLines.map(message => <Row>{truncateMessage(message, slim)}</Row>)}
        {message.links?.map(link => <Row><a href={link}>{link}</a></Row>)}
        <hr/>
    </div>))
}