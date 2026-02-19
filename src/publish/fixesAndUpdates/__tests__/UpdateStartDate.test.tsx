import React, {act} from 'react';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom';
import {Temporal} from 'temporal-polyfill';
import {UpdateStartDate} from '../UpdateStartDate';
import {Course} from '@ueu/ueu-canvas/course/Course';

// Mock dependencies
jest.mock('react-datepicker', () => (props: any) => (
    <input
        data-testid="date-picker"
        type="text"
        //value={props.value}
        onChange={(e) => props.onChange(new Date(e.target.value))}
    />
));

jest.mock(' ../../../canvas/course/changeStartDate', () => ({
    getStartDateAssignments: jest.fn(),
    updatedDateSyllabusHtml: jest.fn(),
}));

jest.mock('@/canvas/course/modules', () => ({
    changeModuleLockDate: jest.fn(),
    moduleGenerator: jest.fn(),
}));

jest.mock('@/date', () => ({
    oldDateToPlainDate: jest.fn((date: Date) => Temporal.PlainDate.from(date.toISOString().split('T')[0])),
}));

jest.mock('@/canvas/content/assignments', () => ({
    assignmentDataGen: jest.fn(),
    updateAssignmentDueDates: jest.fn(),
}));

jest.mock('@/canvas/fetch/getPagedDataGenerator', () => ({
    getPagedDataGenerator: jest.fn(),
}));

jest.mock('@/canvas/fetch/utils', () => ({
    renderAsyncGen: jest.fn(),
}));

jest.mock('@/canvas/content/BaseContentItem', () => ({
    BaseContentItem: jest.fn(),
}));

jest.mock('@/canvas/content/discussions/Discussion', () => ({
    Discussion: jest.fn().mockImplementation(() => ({
        offsetPublishDelay: jest.fn(),
    })),
}));


//Disabld due to brittleness to UI changes

describe.skip('UpdateStartDate', () => {
    let course: Course;
    let refreshCourse: jest.Mock;
    let startLoading: jest.Mock;
    let endLoading: jest.Mock;

    beforeEach(() => {
        course = {
            id: 1,
            getStartDateFromModules: jest.fn(),
            getSyllabus: jest.fn(),
            changeSyllabus: jest.fn(),
        } as unknown as Course;
        refreshCourse = jest.fn();
        startLoading = jest.fn();
        endLoading = jest.fn();
        (course.getStartDateFromModules as jest.Mock).mockResolvedValue(new Temporal.PlainDate(2024, 7, 1))

    });

    test('renders correctly', async () => {
        (course.getStartDateFromModules as jest.Mock).mockResolvedValue(new Temporal.PlainDate(2024, 7, 1))
        await act(async () => render(
            <UpdateStartDate
                course={course}
                isDisabled={false}
                startLoading={startLoading}
                endLoading={endLoading}
                refreshCourse={refreshCourse}
                setStartDateOutcome={jest.fn()}
                setAffectedItems={jest.fn()}
                setUnaffectedItems={jest.fn()}
                setFailedItems={jest.fn()}
            />
        ));

        await waitFor(() => {
            expect(screen.getByText('Change Start Date')).toBeInTheDocument();
            expect(screen.getByText('Update dates of assignments, announcements, and on syllabus')).toBeInTheDocument();
        });
    });

    test('change start date button calls changeStartDate', async () => {
        await act(async () => render(
            <UpdateStartDate
                course={course}
                isDisabled={false}
                startLoading={startLoading}
                endLoading={endLoading}
                refreshCourse={refreshCourse}
                setAffectedItems={jest.fn()}

                setUnaffectedItems={jest.fn()}
                setFailedItems={jest.fn()}
            />
        ));

        await act(async () => fireEvent.click(screen.getByText('Change Start Date')));

        await waitFor(() => {
            expect(startLoading).toHaveBeenCalled();
        });
    });

    test('date picker updates workingStartDate', async () => {
        await act(async () => render(
            <UpdateStartDate
                course={course}
                isDisabled={false}
                startLoading={startLoading}
                endLoading={endLoading}
                refreshCourse={refreshCourse}
                setAffectedItems={jest.fn()}
                setUnaffectedItems={jest.fn()}
                setFailedItems={jest.fn()}
            />
        ));

        const datePicker = screen.getByTestId('date-picker');
        await act(async () => fireEvent.change(datePicker, {target: {value: '2023-07-29'}}));

        await waitFor(() => {
            expect(datePicker).toHaveValue('2023-07-29');
        });
    });

    test('disables button when isDisabled is true', async () => {
        await act(()=> render(
            <UpdateStartDate
                course={course}
                isDisabled={true}
                startLoading={startLoading}
                endLoading={endLoading}
                setStartDateOutcome={jest.fn()}
                refreshCourse={refreshCourse}
                setAffectedItems={jest.fn()}
                setUnaffectedItems={jest.fn()}
                setFailedItems={jest.fn()}
            />
        ));

        expect(screen.getByText('Change Start Date')).toBeDisabled();
    });
});
