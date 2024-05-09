import {Course} from "../../../canvas/course/index";
import {ICanvasCallConfig} from "../../../canvas/canvasUtils";

export type ValidationTestResult = {
    success: boolean | 'unknown',
    message: string,
    links?: string[],
}

export type ValidationFixResult = {
    success: boolean | 'unknown',
    message: string,
    links?: string[],
}

export type CourseValidationTest<T = Course> = {
    name: string,
    description: string,
    run: (course: T, config?: ICanvasCallConfig) => Promise<ValidationTestResult>
    fix?: (course: T) => Promise<ValidationFixResult>
}

export function testResult(success: boolean, failureMessage: string, links?: string[], successMessage = 'success'): ValidationTestResult {
    const response: ValidationTestResult = {
        success,
        message: success ? successMessage : failureMessage

    }
    if (links) response.links = links;
    return response;
}