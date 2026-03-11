import capstoneProjectValidations from "./capstoneProjectValidations";

import {badContentTextValidationFixTest, badContentTextValidationTest} from "../__mocks__/validations";
jest.mock('@ueu/ueu-canvas/fetch/fetchJson')


describe("Capstone content tests", () => {
    for (const validation of capstoneProjectValidations) {
        for (const [badExample, goodExample] of validation.beforeAndAfters) {
            test(`Find ${validation.name} test: ${badExample}`, badContentTextValidationTest(validation, badExample, goodExample));
            test(`Fix ${validation.name} test: ${badExample}`, badContentTextValidationFixTest(validation));
        }
    }
})