import {render, waitFor} from "@testing-library/react";
import "@testing-library/jest-dom"
import React from "react";
import {CourseUpdateInterface, CourseUpdateInterfaceProps} from "../CourseUpdateInterface";
import {mockCourseData} from "@ueu/ueu-canvas";
import {Course} from "@ueu/ueu-canvas";
import {mockFailedValidation, mockValidation} from "../validations/__mocks__/mockValidation";

import {screen} from "@testing-library/react";
const mockDev = new Course({...mockCourseData, name: 'DEV_TEST000', course_code: 'DEV_TEST000'});
const mockBp = new Course({...mockCourseData, name: 'BP_TEST000', course_code: 'BP_TEST000', blueprint: true});

jest.mock('../CourseValidator', () => ({
    CourseValidator: jest.fn(() => <div>validator</div>)
}))
jest.mock('../UpdateStartDate', () => ({
    UpdateStartDate: jest.fn(() => <div>startDate</div>)
}))

const renderComponent = (props: Partial<CourseUpdateInterfaceProps> = {}) => {
    const defaultProps: CourseUpdateInterfaceProps = {
        course: new Course(mockCourseData),
        parentCourse: new Course(mockCourseData),
        allValidations: [],
        refreshCourse: jest.fn(),
        ...props,
    };

    return render(<CourseUpdateInterface {...defaultProps} />);
};
it('is disabled when not a BP or DEV', async () => {
    renderComponent({
        course: new Course({...mockCourseData, name: '24_ANIM102', blueprint: false})
    })
    await waitFor(() => screen.getByRole('button'));
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
})
it('is enabled when BP', async () => {
    renderComponent({
        course: mockBp
    })
    await waitFor(() => screen.getByRole('button'));
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByRole('button')).not.toBeDisabled();
})
it('is enabled when DEV', async () => {
    renderComponent({
        course: mockDev
    })
    await waitFor(() => screen.getByRole('button'));
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByRole('button')).not.toBeDisabled();
})

it('displays validator', async () => {
    const allValidations = [mockValidation, mockFailedValidation, mockFailedValidation];
    const course = mockDev;
    const onChangeMode = jest.fn();
    renderComponent({course, allValidations, onChangeMode});
    await waitFor(() => screen.getByRole('button'));
    await waitFor(() => screen.getByRole('button').click())
    await waitFor(() => screen.getByText(/Show All Tests/));
    await waitFor(() => screen.getByText(/Show All Tests/).click());
    await waitFor(() => expect(onChangeMode).toHaveBeenCalled());
    expect(onChangeMode).toHaveBeenCalledWith('unitTest')
    await waitFor(() => expect(screen.queryByText(/validator/)))
    expect(screen.getAllByText(/validator/)).toHaveLength(1);
})