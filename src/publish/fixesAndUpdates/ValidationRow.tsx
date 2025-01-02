import React, {useEffect, useState} from "react";
import {useEffectAsync} from "@/ui/utils";
import {errorMessageResult, ValidationResult} from "./validations/utils";
import assert from "assert";
import {Row} from "react-bootstrap";
import {Course} from "@/canvas/course/Course";


import {ICourseData} from "@/canvas/courseTypes";
import {CourseValidation} from "@publish/fixesAndUpdates/validations/types";

export type ValidationRowProps = {
    course: Course,
    potemkinVillage?: boolean,
    test: CourseValidation,
    slim?: boolean,
    initialResult?: ValidationResult,
    refreshCourse: (courseData?: ICourseData) => Promise<any>
    onValidationResult?: (result: ValidationResult, test: CourseValidation) => any,
    onFixResult?: (result: ValidationResult, test: CourseValidation) => any,
    showOnlyFailures?: boolean,
}

export function ValidationRow({
    test,
    slim,
    potemkinVillage,
    initialResult,
    course,
    refreshCourse,
    onValidationResult,
    onFixResult,
    showOnlyFailures = false
}: ValidationRowProps) {
    const [loading, setLoading] = useState(false);
    const [validationResult, setValidationResult] = useState(initialResult);
    const [fixResult, setFixResult] = useState<ValidationResult>();
    const [fixText, setFixText] = useState("Fix?")
    const [updateTest, setUpdateTest] = useState(false)


    useEffect(() => {
        if (validationResult && onValidationResult) onValidationResult(validationResult, test);
    }, [validationResult]);

    useEffect(() => {
        if (fixResult && onFixResult) onFixResult(fixResult, test);
    }, [fixResult]);

    async function fix() {
        setFixText('Fixing..');
        setLoading(true);
        try {
            assert(test.fix);
            const result = await test.fix(course, validationResult);
            setFixResult(result);
            setUpdateTest(true);
            await refreshCourse();
            setFixText('Fixed...');
        } catch (e) {
            console.error(e);
            setFixResult(errorMessageResult(e))
        }
        setLoading(false);
    }

    useEffectAsync(async () => {
        if (validationResult && !updateTest) return; //only run once and only if we don't have a result
        if (potemkinVillage && !updateTest) return;
        setLoading(true);
        try {
            setValidationResult(await test.run(course));

        } catch (e) {
            setValidationResult(errorMessageResult(e))
        }
        setUpdateTest(false);
        setLoading(false);
    }, [course, test])


    function fixResultText() {
        if(fixResult) {
            const { success } = fixResult;
            if(success && typeof success === 'boolean') return "Fixed!";
            if(success) return success;
            return "Fix Failed";
        }
    }

    function ResultStatus({result}:{result?: ValidationResult}) {
        return <>
            {resultStatusMessage(result, loading, slim)}
            {result?.links?.map((link, i) => <div key={i}>
                <a href={link} target={'_blank'}>{link}</a>
            </div>)}
        </>

    }


    if (!showOnlyFailures || loading || (!validationResult?.success)) {
        return <Row className={slim ? 'test-row-slim' : 'test-row'}>
            <div className={'col-sm-2'}>{test.name}</div>
            <div className={'col-sm-3 message'}>
                {test.description}

            </div>
            <div className={'col-sm-4'}>
                <ResultStatus result={fixResult ?? validationResult}/>
            </div>
            <div className={'col-sm-1'}>
                {test.fix &&
                    validationResult &&
                    validationResult.success !== true &&
                    <button
                        onClick={fix}
                    >
                        {fixText}
                    </button>}
            </div>

            <div className={'col-sm-1'}>
                {!validationResult && <span className={'badge badge-info'}>Running</span>}
                {validationResult?.success && <span className={'badge badge-success'}>OK!</span>}
                {validationResult && validationResult.success !== true &&
                    <span className={'badge badge-warning'}>Failed</span>}
                {fixResult &&
                    <span className={'badge badge-warning'}>{fixResultText()}</span>}
            </div>
        </Row>
    }
    return <></>
}

export function truncateMessage(messageString: string, slim?: boolean) {
    if (slim) return messageString.replace(/^(.{200}).*$/, '$1...')
    return messageString;
}


export function resultStatusMessage(result: ValidationResult | undefined, loading: boolean, slim?: boolean) {
    if (loading) return "running..."
    if (!result) return loading ? "still running" : "No Result, an error may have occurred."
    if (result.success) return "Succeeded!"


    return result.messages?.map((message, i) => (<div key={`m${i}`} className='message'>
        {message.bodyLines.map((line, j) => <Row key={`bl${j}`}>{truncateMessage(line, slim)}</Row>)}
        {message.links?.map((link, k) => <Row key={`ml${k}`}><a href={link}>{link}</a></Row>)}
        <hr/>
    </div>))
}