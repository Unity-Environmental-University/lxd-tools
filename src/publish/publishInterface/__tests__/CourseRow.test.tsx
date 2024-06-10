// CourseRow.test.tsx

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CourseRow, ICourseRowProps } from '../CourseRow';
import { Course } from '../../../canvas/course';
import { IProfile } from '../../../canvas/profile';
import { IUserData } from '../../../canvas/canvasDataDefs';
import { mockCourseData } from '../../../canvas/course/__mocks__/mockCourseData';

const mockCourse: Course = new Course({
    ...mockCourseData,
    id: 1,
    name: 'Test Course',
    workflowState: 'active',
    course_code: 'BP_TEST000',
}) as Course;

const mockFrontPageProfile: IProfile = {
    id: 1,
    displayName: 'Front Page Profile',
} as IProfile;

const mockInstructors: IUserData[] = [
    { id: 1, name: 'Instructor 1' },
    { id: 2, name: 'Instructor 2' },
] as IUserData[];

const mockOnSelectSection = jest.fn();
const mockErrors: string[] = [];

const renderComponent = (props: Partial<ICourseRowProps> = {}) => {
    const defaultProps: ICourseRowProps = {
        course: mockCourse,
        frontPageProfile: mockFrontPageProfile,
        instructors: mockInstructors,
        facultyProfileMatches: [mockFrontPageProfile],
        onSelectSection: mockOnSelectSection,
        errors: mockErrors,
        ...props,
    };

    return render(<CourseRow {...defaultProps} />);
};

describe('CourseRow Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders without crashing', () => {
        renderComponent();
        expect(screen.getByText('BP_TEST000')).toBeInTheDocument();
        expect(screen.getByText('Front Page Profile')).toBeInTheDocument();
        expect(screen.getByText('Instructor 1, Instructor 2')).toBeInTheDocument();
    });

    it('calls onSelectSection when "Details" button is clicked', () => {
        renderComponent();
        const detailsButton = screen.getByText('Details');
        fireEvent.click(detailsButton);
        expect(mockOnSelectSection).toHaveBeenCalledWith(mockCourse);
    });

    it('does not render "Details" button if onSelectSection is not provided', () => {
        renderComponent({ onSelectSection: undefined });
        expect(screen.queryByText('Details')).toBeNull();
    });
});
