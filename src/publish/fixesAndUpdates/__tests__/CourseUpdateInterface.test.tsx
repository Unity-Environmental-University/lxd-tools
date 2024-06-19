import {render, waitFor} from "@testing-library/react";
import "@testing-library/jest-dom"
import React from "react";
import {CourseUpdateInterface, CourseUpdateInterfaceProps} from "../CourseUpdateInterface";
import {mockCourseData} from "../../../canvas/course/__mocks__/mockCourseData";
import {Course} from "../../../canvas/course/Course";
import {mockValidation} from "../validations/__mocks__/mockValidation";

import {screen} from "@testing-library/react";
import {wait} from "@testing-library/user-event/dist/utils";

describe('CourseUpdateInterface', () => {
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

    it('is disabled when not a BP or DEV', async() => {
        renderComponent({
            course: new Course({...mockCourseData, name: '24_ANIM102', blueprint: false})
        })
        await waitFor(()=> screen.getByRole('button'));
        expect(screen.getByRole('button')).toBeInTheDocument();
        expect(screen.getByRole('button')).toBeDisabled();
    })
    it('is enabled when BP', async() => {
        renderComponent({
            course: new Course({...mockCourseData, name: 'BP_ANIM102', blueprint: true})
        })
        await waitFor(()=> screen.getByRole('button'));
        expect(screen.getByRole('button')).toBeInTheDocument();
        expect(screen.getByRole('button')).not.toBeDisabled();
    })
    it('is enabled when DEV', async() => {
        let course = new Course({...mockCourseData, name: 'DEV_ANIM102'});
        renderComponent({
        })
        await waitFor(()=> screen.getByRole('button'));
        expect(screen.getByRole('button')).toBeInTheDocument();
        expect(screen.getByRole('button')).not.toBeDisabled();
    })
})