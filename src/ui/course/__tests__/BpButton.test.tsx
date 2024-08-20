import React from 'react';
import {render, fireEvent, waitFor, act, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import {BpButton} from '../BpButton';
import {Course} from "@/canvas/course/Course";
import {ICourseData} from "@/canvas/courseTypes";
import {genBlueprintDataForCode} from "@/canvas/course/blueprint";
import {renderAsyncGen} from "@/canvas/fetch";
import openThisContentInTarget from "@/canvas/content/openThisContentInTarget";
import {mockCourseData} from "@/canvas/course/__mocks__/mockCourseData";
import {mockAsyncGen} from "@/__mocks__/utils";
import getAutoLockDelay = chrome.idle.getAutoLockDelay;

// Mock dependencies
jest.mock('@/canvas/course/blueprint', () => ({
    genBlueprintDataForCode: jest.fn()
}));
jest.mock('@/canvas/fetch');
jest.mock('@/canvas/content/openThisContentInTarget', () => jest.fn());

describe('BpButton', () => {
    let course: Course;
    let currentBp: Course;

    beforeEach(() => {
        course = {
            id: 1,
            courseCode: 'CS101',
            accountId: 1,
            rootAccountId: 1
        } as Course;
        currentBp = {
            id: 2,
            courseCode: 'BP_CS101',
            accountId: 1,
            rootAccountId: 1
        } as Course;
    });

    it('displays "No BPs Found" button when no blueprints are available', async () => {
        (genBlueprintDataForCode as jest.Mock).mockReturnValue(null);
        (renderAsyncGen as jest.Mock).mockResolvedValue([]);

        await act(async () => {
            render(<BpButton course={course}/>);
        });

        await waitFor(() => {
            expect(screen.getByText('No BPs Found')).toBeInTheDocument();
        });
    });

    it('displays "BP" button and opens the main BP when clicked', async () => {
        (genBlueprintDataForCode as jest.Mock).mockReturnValueOnce([]);
        (renderAsyncGen as jest.Mock).mockResolvedValueOnce([currentBp]);
        global.open = jest.fn();
        const {getByText} = await act(async () => render(<BpButton course={course} currentBp={currentBp}/>));
        await waitFor(() => {
            expect(getByText('BP')).toBeInTheDocument();
        });
        await act(async () => fireEvent.click(screen.getByText('BP')));
        await waitFor(() => {
            expect(openThisContentInTarget).toHaveBeenCalledWith(course.id, currentBp.id);
        });
    });


    it('displays "Archived BPs" button and opens modal with blueprint list when clicked', async () => {
        const blueprintData: ICourseData[] = [
            {...mockCourseData, id: 2, course_code: 'CS102'},
            {...mockCourseData, id: 3, course_code: 'CS103'}
        ];

        (genBlueprintDataForCode as jest.Mock).mockReturnValueOnce(mockAsyncGen(blueprintData));

        const {getByText, getByTitle} = await act(async () => render(<BpButton
            course={course}
            currentBp={currentBp}
        />));
        await waitFor(() => {
            expect(getByTitle('Open the blueprint version of this course')).toBeInTheDocument();
        });
        await act(async () => fireEvent.click(getByTitle('Open the blueprint version of this course')));

        await waitFor(() => {
            expect(getByText('BPs')).toBeInTheDocument();
        });
        await act(async () => fireEvent.click(getByText('BPs')));

        await waitFor(() => {
            expect(getByText('CS102')).toBeInTheDocument();
            expect(getByText('CS103')).toBeInTheDocument();
        });
        await act(async () => fireEvent.click(getByText('CS102')));
        await waitFor(() => {
            expect(openThisContentInTarget).toHaveBeenCalledWith(course, 2);
        });
    });
});
