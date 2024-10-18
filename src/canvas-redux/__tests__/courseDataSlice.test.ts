import courseDataReducer, {fetchCourseData, setWorkingCourseData, getWorkingCourseData, initialState} from "../courseDataSlice";
import { ICourseData } from "@canvas/courseTypes";
import {mockCourseData} from "@canvas/course/__mocks__/mockCourseData";
import {fetchJson} from "@canvas/fetch/fetchJson";

// Mock the fetchJson function to simulate API calls
jest.mock('@canvas/fetch/fetchJson', () => ({
    fetchJson: jest.fn(),
}));

describe('courseDataSlice reducer', () => {

    it('should handle initial state', () => {
        expect(courseDataReducer(undefined, { type: '' })).toEqual(initialState);
    });

    it('should handle setWorkingCourseData', () => {
        const courseData: ICourseData = {  ...mockCourseData, id: 1, name: 'Test Course' };
        const nextState = courseDataReducer(initialState, setWorkingCourseData(courseData));
        expect(nextState.courseData).toEqual(courseData);
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
        expect(nextState.courseData).toEqual(courseData);
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
        const state: ReturnType<typeof courseDataReducer> = { courseData: { ...mockCourseData, id: 1, name: 'Test Course' }, status: 'idle', error: null };
        const result = getWorkingCourseData(state);
        expect(result).toEqual({...mockCourseData, id: 1, name: 'Test Course' });
    });
});
