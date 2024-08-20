import {CourseValidation, ValidationResult} from "../validations";


export const mockValidationResult: ValidationResult<any> = {
    success: true,
    messages: [{
        bodyLines: ['message', 'message'],
        links: ['localhost:8080']
    }]
}

export const mockValidation: CourseValidation<any> = {
    name: "Mock Validation",
    description: "This is a mock validation",
    run: jest.fn(async () => mockValidationResult),
}

export const mockFailedValidation: CourseValidation<any> = {
    name: "Mock Failed Validation",
    description: "This is a mock validation",
    run: jest.fn(async () => ({
        ...mockValidationResult,
        success: false
    })),
}