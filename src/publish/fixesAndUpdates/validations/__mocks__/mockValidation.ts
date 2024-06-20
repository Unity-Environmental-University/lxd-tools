import {CourseValidation, ValidationTestResult} from "../index";


export const mockValidationResult: ValidationTestResult = {
    success: true,
    messages: [{
        bodyLines: ['message', 'message'],
        links: ['localhost:8080']
    }]
}

export const mockValidation: CourseValidation = {
    name: "Mock Validation",
    description: "This is a mock validation",
    run: jest.fn(async () => mockValidationResult),
}

export const mockFailedValidation: CourseValidation = {
    name: "Mock Failed Validation",
    description: "This is a mock validation",
    run: jest.fn(async () => ({
        ...mockValidationResult,
        success: false
    })),
}