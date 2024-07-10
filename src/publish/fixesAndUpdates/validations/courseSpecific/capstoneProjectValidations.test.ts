import capstoneProjectValidations from "./capstoneProjectValidations";

import {badContentTextValidationFixTest, badContentTextValidationTest} from "../__mocks__";
jest.mock('@/canvas/fetch/fetchJson')


describe("Capstone content tests", () => {
    for (let validation of capstoneProjectValidations) {
        for (const [badExample, goodExample] of validation.beforeAndAfters) {
            test(`Find ${validation.name} test: ${badExample}`, badContentTextValidationTest(validation, badExample, goodExample));
            test(`Fix ${validation.name} test: ${badExample}`, badContentTextValidationFixTest(validation));
        }
    }
})