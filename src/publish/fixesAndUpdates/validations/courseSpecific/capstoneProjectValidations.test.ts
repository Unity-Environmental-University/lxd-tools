import capstoneProjectValidations from "./capstoneProjectValidations";

import {badContentTextValidationFixTest, badContentTextValidationTest} from "../__mocks__";

jest.mock('../../../../canvas/fetch');


describe("Capstone content tests", () => {
    for (let validation of capstoneProjectValidations) {
        for (const [badExample, goodExample] of validation.negativeExemplars) {
            test(`Find ${validation.name} test: ${badExample}`, badContentTextValidationTest(validation, badExample, goodExample));
            test(`Fix ${validation.name} test: ${badExample}`, badContentTextValidationFixTest(validation, badExample, goodExample));
        }
    }

})