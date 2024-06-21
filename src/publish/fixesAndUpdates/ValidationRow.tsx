import React, {useState} from "react";
import {useEffectAsync} from "../../ui/utils";
import {CourseValidation, errorMessageResult, ValidationResult} from "./validations";
import assert from "assert";
import {Row} from "react-bootstrap";
import {Course} from "../../canvas/course/Course";
import {ICourseData} from "../../canvas/canvasDataDefs";

type ValidationRowProps = {
    course: Course,
    potemkinVillage?: boolean,
    test: CourseValidation,
    slim?: boolean,
    initialResult?: ValidationResult,
    refreshCourse: (courseData?:ICourseData) => Promise<any>
    onResult?: (result: ValidationResult, test: CourseValidation) => any,
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
    const [updateTest, setUpdateTest] = useState(false)
    function setResult(result: ValidationResult) {
        _setResult(result);
        onResult && onResult(result, test);
    }

    async function fix() {
        setFixText('Fixing..');
        setLoading(true);
        try {
            assert(test.fix);
            await test.fix(course);
            setUpdateTest(true);
            await refreshCourse();
            setFixText('Fixed...');
        } catch (e) {
            setResult(errorMessageResult(e))
        }
        setLoading(false);
    }

    useEffectAsync(async () => {
        if (result && !updateTest) return; //only run once and only if we don't have a result
        if (potemkinVillage && !updateTest) return;
        setLoading(true);
        try {
            setResult(await test.run(course));

        } catch (e) {
            setResult(errorMessageResult(e))
        }
        setUpdateTest(false);
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


export function validationStatusMessage(result: ValidationResult | undefined, loading: boolean, slim?:boolean) {
    if (loading) return "running..."
    if (!result) return loading ? "still running" : "No Result, an error may have occurred."
    if (result.success) return "Succeeded!"


    return result.messages.map(message => (<div className='message'>
        {message.bodyLines.map(message => <Row>{truncateMessage(message, slim)}</Row>)}
        {message.links?.map(link => <Row><a href={link}>{link}</a></Row>)}
        <hr/>
    </div>))
}