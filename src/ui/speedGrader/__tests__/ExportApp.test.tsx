import React, {act} from 'react';
import {render, screen, waitFor, fireEvent} from '@testing-library/react';
import '@testing-library/jest-dom';
import ExportApp from '../ExportApp';
import {Course} from "@ueu/ueu-canvas/course/Course";
import {mockCourseData} from "@ueu/ueu-canvas/course/__mocks__/mockCourseData";
import {mockAssignmentData} from "@ueu/ueu-canvas/content/__mocks__/mockContentData";


import * as courseApi from '@ueu/ueu-canvas/course';
import getCourseIdFromUrl from "@ueu/ueu-canvas/course/getCourseIdFromUrl";
import AssignmentKind from "@ueu/ueu-canvas/content/assignments/AssignmentKind";

const getCourseById = jest.spyOn(courseApi, 'getCourseById');
const getCourseData = jest.spyOn(courseApi, 'getCourseData');
jest.mock('@/canvas/course/getCourseIdFromUrl', () => jest.fn())
const getAssignmentById = jest.spyOn(AssignmentKind, 'get')

jest.mock('@/ui/speedGrader/controls/ExportOneButton', () => () => (
    <div data-testid="export-one-button">Export One Button</div>
));
jest.mock('@/ui/speedGrader/controls/ExportAllButton', () => () => (
    <div data-testid="export-all-button">Export All Button</div>
));
jest.mock('@/ui/speedGrader/controls/SpeedGraderModalDialog', () => ({show, header, message}: Record<string, any>) => (
    show ? <div data-testid="modal-dialog">{header}: {message}</div> : undefined
));
jest.mock('@/ui/speedGrader/controls/DateRangeExportDialog', () => ({show}: { show: boolean }) => (
    show ? <div data-testid="date-range-export-dialog">Date Range Export Dialog</div> : undefined
));

jest.mock('@/canvas/fetch/fetchJson')
jest.mock('@/canvas/fetch/canvasDataFetchGenFunc')
jest.mock('@/canvas/fetch/getPagedDataGenerator')

describe('ExportApp Component', () => {
    beforeEach(() => {
        getCourseById.mockResolvedValue(new Course({...mockCourseData}));
        (getCourseIdFromUrl as jest.Mock).mockReturnValue(15);

    })

    test('renders without crashing', async () => {
        await act(async () => render(<ExportApp/>));
        expect(getCourseData).toHaveBeenCalled();
        expect(getCourseIdFromUrl).toHaveBeenCalled();
    });

    test('renders ExportOneButton and ExportAllButton when course and assignment are set', async () => {
        window.history.pushState({}, 'Test page', '/?assignment_id=1');
        getAssignmentById.mockImplementation(async() => mockAssignmentData)
        await act(async () => render(<ExportApp/>));
        await waitFor(() => expect(screen.getByTestId('export-one-button')).toBeInTheDocument());
        await waitFor(() => expect(screen.getByTestId('export-all-button')).toBeInTheDocument());
    });

    test('shows ModalDialog when popUp is called', async () => {
        await act(async () => render(<ExportApp/>));
        await act(async () => fireEvent.click(screen.getByText('...')))
        await waitFor(() => expect(screen.getByTestId('date-range-export-dialog')).toBeInTheDocument());
    });

});
