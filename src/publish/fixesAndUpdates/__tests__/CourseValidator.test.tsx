import {render, screen} from "@testing-library/react";
import "@testing-library/jest-dom"
import {mockCourseData} from "@/canvas/course/__mocks__/mockCourseData";
import {Course} from "@/canvas/course/Course";
import React from "react";
import {CourseValidator, CourseValidatorProps} from "../CourseValidator";
import {mockFailedValidation, mockValidation} from "../validations/__mocks__/mockValidation";

const renderComponent = (props: Partial<CourseValidatorProps> = {}) => {
    const defaultProps: CourseValidatorProps = {
        course: new Course(mockCourseData),
        tests: [],
        refreshCourse: jest.fn(),
        showOnlyFailures: false,
        ...props,
    };

    return render(<CourseValidator {...defaultProps} />);
};

jest.mock('../ValidationRow', () => ({
    ValidationRow: jest.fn(() => <div>row</div>)
}))


it('does not show header when showOnlyFailures is set', async ()=> {
    const tests = [mockValidation, mockFailedValidation, mockFailedValidation];
    renderComponent({ tests, showOnlyFailures: true});
    expect(screen.queryByTestId(/header/)).not.toBeInTheDocument();
    expect(screen.queryAllByText(/row/)).toHaveLength(3);
})

it('shows header when showOnlyFailures is set to false', async ()=> {
    const tests = [mockValidation, mockFailedValidation, mockFailedValidation];
    renderComponent({ tests, showOnlyFailures: false});
    expect(screen.getByTestId(/header/)).toBeInTheDocument();
    expect(screen.queryAllByText(/row/)).toHaveLength(3);
})