import {CourseValidation} from "../publish/fixesAndUpdates/validations/validations";
import MultiSelect, {IMultiSelectOption, optionize, optionizeOne} from "../ui/widgets/MuliSelect";
import React, {FormEvent, useEffect, useState} from "react";
import {tests} from "./index";
import {Col, Form, Row} from "react-bootstrap";
import {CustomSearchValidation} from "./CustomSearchValidation";

type ValidationOption = CourseValidation & IMultiSelectOption

interface SelectValidationsProps {
    runValidations: () => any,
    setCoursesToRunOn: (courses: ValidationOption[]) => void
    allValidations: CourseValidation[]
    validationsToRun: ValidationOption[]
    setValidationsToRun: (validations: ValidationOption[]) => void
    onChangeCustomValidation: (validation: ValidationOption) => void
}

export function SelectValidations({
    runValidations, validationsToRun, setValidationsToRun,
    setCoursesToRunOn, onChangeCustomValidation, allValidations
}: SelectValidationsProps) {

    const [allValidationOptions, setAllValidationOptions] = useState(optionize(allValidations))
    function getTestName(test: CourseValidation) {
        return test.name;
    }

    useEffect(() => {
      setAllValidationOptions(optionize(allValidations))
    }, [allValidations]);

    function onSubmit(e: FormEvent) {
        e.preventDefault();
        e.stopPropagation();
        runValidations();
    }

    return <>
        <Form onSubmit={onSubmit}>
            <Row>
                <Col sm={12}>
                    <MultiSelect
                        options={optionize(allValidations, a => `${a.name}${a.description}`, a => a.name)}
                        selectedOptions={validationsToRun}
                        onSelectionChange={setValidationsToRun}></MultiSelect>
                    <button onClick={runValidations}>Run Tests</button>
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
                    setValidationsToRun(optionize([validation], undefined, a => a.name))
                    onChangeCustomValidation(optionizeOne(validation, validation.name));
                    runValidations();
                }}/>
            </Col>

        </Row>
    </>
}