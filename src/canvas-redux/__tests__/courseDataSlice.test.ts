import {
    fetchCourseData,
    setWorkingCourseData,
    getWorkingCourseData,
    initialState,
    courseDataReducer
} from "../courseDataSlice";
import { ICourseData } from "@ueu/ueu-canvas/courseTypes";
import { mockCourseData } from "@ueu/ueu-canvas/course/__mocks__/mockCourseData";
import { getCourseData } from "@ueu/ueu-canvas/course";

// Mock the fetchJson function to simulate API calls
jest.mock('@canvas/fetch/fetchJson', () => ({
    fetchJson: jest.fn(),
}));

describe('courseDataSlice reducer', () => {

    it('should handle initial state', () => {
        expect(courseDataReducer(undefined, { type: '' })).toEqual(initialState);
    });

    it('should handle setWorkingCourseData', () => {
        const courseData: ICourseData = { ...mockCourseData, id: 1, name: 'Test Course' };
        const nextState = courseDataReducer(initialState, setWorkingCourseData(courseData));
        expect(nextState.data).toEqual(courseData);
    });

    it('should handle fetchCourseData.pending', () => {
        const nextState = courseDataReducer(initialState, fetchCourseData.pending('courseId', { courseId: 157 }));
        expect(nextState.status).toEqual('loading');
    });

    it('should handle fetchCourseData.fulfilled', () => {
        const courseData: ICourseData = { ...mockCourseData, id: 1, name: 'Test Course' };
        const nextState = courseDataReducer(initialState, {
            type: fetchCourseData.fulfilled.type,
            payload: courseData
        });
        expect(nextState.status).toEqual('succeeded');
        expect(nextState.data).toEqual(courseData);
    });

    it('should handle fetchCourseData.rejected', () => {
        const nextState = courseDataReducer(initialState, {
            type: fetchCourseData.rejected.type,
            payload: 'Failed to fetch data'
        });
        expect(nextState.status).toEqual('failed');
        expect(nextState.error).toEqual('Failed to fetch data');
    });
});

describe('courseDataSlice selectors', () => {
    it('getWorkingCourseData should return course data', () => {
        // Ensure the status matches the defined union type
        const state = {
            course: {  // Update this to match the expected shape
                data: { ...mockCourseData, id: 1, name: 'Test Course' },
                status: 'idle' as const,
                error: undefined,
            },
        };
        const result = getWorkingCourseData(state);
        expect(result).toEqual({...mockCourseData, id: 1, name: 'Test Course' });
    });
});

// Mock the API call
jest.mock('@canvas/course/index.ts');

describe('fetchCourseData asyncThunk', () => {
    const courseId = 123;

    it('should dispatch fulfilled when API call is successful', async () => {
        const mockData = { courseName: 'Intro to Testing' };  // mock response

        // Make the mocked function resolve to the mock data
        (getCourseData as jest.Mock).mockResolvedValueOnce(mockData);

        // Mock a Redux dispatch and getState function
        const dispatch = jest.fn();
        const getState = jest.fn();

        // Call the thunk
        const result = await fetchCourseData({ courseId })(dispatch, getState, undefined);

        // Check if the thunk returns the fulfilled action with the right payload
        expect(result.type).toBe('course/fetchCourseData/fulfilled');
        expect(result.payload).toEqual(mockData);

        // Confirm the pending action was dispatched first, followed by fulfilled
        expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'course/fetchCourseData/pending' }));
        expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'course/fetchCourseData/fulfilled' }));
    });

    it('should dispatch rejected when API call fails', async () => {
        const mockError = new Error('Failed to fetch course data');

        // Make the mocked function reject with an error
        (getCourseData as jest.Mock).mockRejectedValueOnce(mockError);

        // Mock a Redux dispatch and getState function
        const dispatch = jest.fn();
        const getState = jest.fn();

        // Call the thunk
        const result = await fetchCourseData({ courseId })(dispatch, getState, undefined);

        // Check if the thunk returns the rejected action with the error message
        expect(result.type).toBe('course/fetchCourseData/rejected');
        expect(result.payload).toEqual('Error: Failed to fetch course data');

        // Confirm the pending action was dispatched first, followed by rejected
        expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'course/fetchCourseData/pending' }));
        expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'course/fetchCourseData/rejected' }));
    });
});
