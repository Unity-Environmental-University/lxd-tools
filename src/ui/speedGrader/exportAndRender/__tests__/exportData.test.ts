import { exportData } from '@/ui/speedGrader/exportAndRender/exportData';
import { csvRowsForCourse } from '@/ui/speedGrader/exportAndRender/csvRowsForCourse';
import { saveDataGenFunc } from '@/ui/speedGrader/saveDataGenFunc';
import { Course } from '@/canvas/course/Course';
import { UiHandlerProps } from '@/ui/speedGrader/controls/UiHandlerProps';
import { Assignment } from '@/canvas/content/assignments';

jest.mock('@/ui/speedGrader/exportAndRender/csvRowsForCourse');
jest.mock('@/ui/speedGrader/saveDataGenFunc');

describe('exportData', () => {
    let mockCourse: Course;
    let mockUiHandlerProps: UiHandlerProps;
    let mockAssignment: Assignment | null;
    let mockCsvRows: string[];
    let mockSaveData: jest.Mock;

    beforeEach(() => {
        mockCourse = {
            courseCode: 'CS101',

        } as Course;

        mockUiHandlerProps = {
            popUp: jest.fn(),
            popClose: jest.fn(),
            showError: jest.fn(),
        };

        mockAssignment = {
            name: 'Assignment 1',
            // other properties as needed
        } as Assignment;

        mockCsvRows = ['header', 'row1', 'row2'];
        (csvRowsForCourse as jest.Mock).mockResolvedValue(mockCsvRows);

        mockSaveData = jest.fn();
        (saveDataGenFunc as jest.Mock).mockReturnValue(mockSaveData);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should call csvRowsForCourse and saveDataGenFunc with correct parameters when assignment is provided', async () => {
        await exportData(mockCourse, mockUiHandlerProps, mockAssignment);

        expect(csvRowsForCourse).toHaveBeenCalledWith(mockCourse, mockAssignment);
        expect(mockSaveData).toHaveBeenCalledWith(mockCsvRows, 'Rubric Scores Assignment 1.csv');
    });

    test('should call csvRowsForCourse and saveDataGenFunc with correct parameters when assignment is not provided', async () => {
        await exportData(mockCourse, mockUiHandlerProps);

        expect(csvRowsForCourse).toHaveBeenCalledWith(mockCourse, null);
        expect(mockSaveData).toHaveBeenCalledWith(mockCsvRows, 'Rubric Scores CS101.csv');
    });

    test('should call popUp and popClose on error', async () => {
        const error = new Error('test error');
        (csvRowsForCourse as jest.Mock).mockRejectedValue(error);

        await expect(exportData(mockCourse, mockUiHandlerProps)).rejects.toThrow(error);

        expect(mockUiHandlerProps.popClose).toHaveBeenCalled();
        expect(mockUiHandlerProps.popUp).toHaveBeenCalledWith(`ERROR ${error} while retrieving assignment data from Canvas. Please refresh and try again.`, 'OK');
    });

    test('should add and remove event listeners for error handling', async () => {
        const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
        const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

        await exportData(mockCourse, mockUiHandlerProps, mockAssignment);

        expect(addEventListenerSpy).toHaveBeenCalledWith('error', mockUiHandlerProps.showError);
        expect(removeEventListenerSpy).toHaveBeenCalledWith('error', mockUiHandlerProps.showError);

        addEventListenerSpy.mockRestore();
        removeEventListenerSpy.mockRestore();
    });
});
