import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import DateRangeExportDialog, { IDateRangeExportProps } from '../DateRangeExportDialog';
import { Course } from "@/canvas/course/Course";
import {mockCourseData} from "@/canvas/course/__mocks__/mockCourseData";
import {getPagedDataGenerator} from "@/canvas/fetch/getPagedDataGenerator";
import {mockAsyncGen} from "@/__mocks__/utils";
import {getCourseDataGenerator} from "@/canvas/course";

// Mocking the dependencies
jest.mock('@/ui/speedGrader/saveDataGenFunc', () => ({
  saveDataGenFunc: jest.fn(() => jest.fn()),
}));

jest.mock('@/ui/speedGrader/getData/getRowsForSections', () => ({
  getRowsForSections: jest.fn(() => Promise.resolve([])),
}));
jest.mock('@/canvas/fetch/getPagedDataGenerator');
jest.mock('@/canvas/course/index', () => ({
  getCourseDataGenerator: jest.fn(),
}));

jest.mock('@/canvas/course/blueprint');

const mockCourse: Course = new Course(mockCourseData);

describe('DateRangeExportDialog', () => {
  const handleShow = jest.fn();
  const handleHide = jest.fn();
  const onExporting = jest.fn();
  const onFinishedExporting = jest.fn();

  const defaultProps: IDateRangeExportProps = {
    course: mockCourseData,
    show: true,
    handleShow,
    handleHide,
    onExporting,
    onFinishedExporting,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders component correctly', () => {
    render(<DateRangeExportDialog {...defaultProps} />);

    expect(screen.getByText('Export Range of Sections')).toBeInTheDocument();
    expect(screen.getByText('Start Date')).toBeInTheDocument();
    expect(screen.getByText('End Date')).toBeInTheDocument();
    expect(screen.getByText('Export Date Range')).toBeInTheDocument();
  });

  it('handles date selection', () => {
    render(<DateRangeExportDialog {...defaultProps} />);

    const startDatePicker = screen.getByLabelText('Start Date') as HTMLInputElement;
    const endDatePicker = screen.getByLabelText('End Date') as HTMLInputElement;

    fireEvent.change(startDatePicker, { target: { value: new Date(2021, 6, 10) } });
    fireEvent.change(endDatePicker, { target: { value: new Date(2021, 6, 20) } });

    expect(startDatePicker.value).toBe('07/10/2021');
    expect(endDatePicker.value).toBe('07/20/2021');
  });

  it('handles export button click', async () => {
    (getCourseDataGenerator as jest.Mock).mockReturnValue(mockAsyncGen([mockCourseData]))
    render(<DateRangeExportDialog {...defaultProps} />);

    const exportButton = screen.getByText('Export Date Range');
    fireEvent.click(exportButton);

    expect(onExporting).toHaveBeenCalled();
    expect(handleHide).toHaveBeenCalled();

    await waitFor(() => {
      expect(onFinishedExporting).toHaveBeenCalled();
    });
  });
});
