import {CourseValidation} from "../publish/fixesAndUpdates/validations/index";
import MultiSelect, {IMultiSelectOption, optionize, optionizeOne} from "../ui/widgets/MuliSelect";
import React, {FormEvent, useState} from "react";
import {tests} from "./index";
import {Col, Form, Row} from "react-bootstrap";
import {CustomSearchValidation} from "./CustomSearchValidation";

type ValidationOption = CourseValidation & IMultiSelectOption

interface SelectValidationsProps {
    runTests: () => any,
    setCoursesToRunOn: (courses: ValidationOption[]) => void
    testsToRun: ValidationOption[]
    setTestsToRun: (validations: ValidationOption[]) => void
    onChangeCustomValidation: (validation: ValidationOption) => void
}

export function SelectValidations({

    runTests, testsToRun, setTestsToRun, setCoursesToRunOn, onChangeCustomValidation
}: SelectValidationsProps) {

    function getTestName(test:CourseValidation) {
        return test.name;
    }
    const [allValidations, _] = useState(optionize(tests, getTestName, getTestName))

    function onSubmit(e: FormEvent) {
        e.preventDefault();
        e.stopPropagation();
        runTests();
    }

    return <>
        <Form onSubmit={onSubmit}>
            <Row>
                <Col sm={12}>
                    <MultiSelect
                        options={allValidations}
                        selectedOptions={testsToRun}
                        onSelectionChange={setTestsToRun}></MultiSelect>
                    <button onClick={runTests}>Run Tests</button>
                </Col>
                <Col>
                    <button
                        onClick={() => setCoursesToRunOn([])}
                    >Clear
                    </button>
                </Col>
            </Row>
        </Form>
        <Row>
            <Col sm={12}>
                <CustomSearchValidation onGenerateSearchValidation={async (validation) => {
                    setTestsToRun(optionize([validation]))
                    onChangeCustomValidation(optionizeOne(validation, validation.name));
                    runTests();
                }}/>
            </Col>

        </Row>
    </>
}