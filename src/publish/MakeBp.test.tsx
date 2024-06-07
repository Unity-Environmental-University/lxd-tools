// MakeBp.test.tsx initial pass by ChatGPT 4o

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { MakeBp, IMakeBpProps } from './MakeBp';
import { Course } from '../canvas/course';
import * as blueprintApi from '../canvas/course/blueprint';

jest.mock('../canvas/course/blueprint');

const mockCourse: Course = {
    isDev: true,
    parsedCourseCode: 'DEV101',
    rawData: {
        account_id: 1,
        root_account_id: 1,
    },
    isBlueprint: () => true,
} as any;

const mockBlueprintCourse: Course = {
    isBlueprint: () => true,
} as any;

const renderComponent = (props: Partial<IMakeBpProps> = {}) => {
    const defaultProps: IMakeBpProps = {
        devCourse: mockCourse,
        ...props,
    };

    return render(<MakeBp {...defaultProps} />);
};

describe('MakeBp Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders without crashing', () => {
        renderComponent();
        expect(screen.getByText(/Cannot find Existing Blueprint/)).toBeInTheDocument();
    });

    // it('displays alert if not a DEV course', () => {
    //     renderComponent({ devCourse: { ...mockCourse, isDev: false } });
    //     expect(screen.getByText(/This is not a DEV course/)).toBeInTheDocument();
    // });

    it('fetches and sets blueprint info on mount', async () => {
        (blueprintApi.getBlueprintsFromCode as jest.Mock).mockResolvedValue([mockBlueprintCourse]);
        (blueprintApi.getSections as jest.Mock).mockResolvedValue([]);
        (blueprintApi.getTermNameFromSections as jest.Mock).mockResolvedValue('Spring 2024');

        renderComponent();

        await waitFor(() => expect(blueprintApi.getBlueprintsFromCode).toHaveBeenCalled());
        await waitFor(() => expect(screen.queryByText(/Cannot find Existing Blueprint/)).not.toBeInTheDocument());
    });

    it('disables archive button if term name is empty', async () => {
        (blueprintApi.getBlueprintsFromCode as jest.Mock).mockResolvedValue([mockBlueprintCourse]);
        (blueprintApi.getSections as jest.Mock).mockResolvedValue([]);
        renderComponent();
        await waitFor(() => screen.getByText(/Archive/));
        expect(screen.getByPlaceholderText(/This should autofill if bp exists and has sections/)).toHaveValue('');
        expect(screen.getByText(/Archive/)).toBeDisabled();
    });

    it('calls retireBlueprint and updates blueprint info on archive', async () => {
        (blueprintApi.getBlueprintsFromCode as jest.Mock).mockResolvedValue([mockBlueprintCourse]);
        (blueprintApi.getSections as jest.Mock).mockResolvedValue([]);
        (blueprintApi.getTermNameFromSections as jest.Mock).mockResolvedValue('Spring 2024');
        (blueprintApi.retireBlueprint as jest.Mock).mockResolvedValue(undefined);

        renderComponent();

        await waitFor(() => screen.getByText(/Archive/));
        fireEvent.change(screen.getByPlaceholderText(/This should autofill if bp exists and has sections/), { target: { value: 'Spring 2024' } });

        fireEvent.click(screen.getByText(/Archive/));

        await waitFor(() => expect(blueprintApi.retireBlueprint).toHaveBeenCalled());
        expect(blueprintApi.getBlueprintsFromCode).toHaveBeenCalledTimes(2); // initial call and after archiving
    });
});
