import {mockAssignmentData} from "@canvas/content/__mocks__/mockContentData"; // Adjust import for assignment mock data
import { configureStore } from '@reduxjs/toolkit';
import {courseAssignmentsReducer, fetchCourseAssignments, updateCourseAssignments} from '../courseAssignmentsSlice'; // Update the path as needed
import { IAssignmentData } from "@canvas/content/assignments/types";
import AssignmentKind from "@canvas/content/assignments/AssignmentKind";

// Mock dataGenerator as an async generator function
jest.mock('@canvas/content/assignments/AssignmentKind', () => ({
  dataGenerator: jest.fn(async function* () {
    yield {
      ...mockAssignmentData, // Change this to appropriate mock assignment data
      id: 1,
      title: 'Mock Assignment', // Assuming this is intended to be a string
    };
  })
}));

describe('courseAssignmentsSlice', () => {
  let store: any;

  beforeEach(() => {
    store = configureStore({ reducer: { courseAssignments: courseAssignmentsReducer } });
  });

  it('should return the initial state', () => {
    const state = store.getState().courseAssignments;
    expect(state).toEqual({
      data: [],
      loading: false,
      error: undefined,
    });
  });

  it('should handle updateCourseAssignments', () => {
    const mockData: IAssignmentData = { ...mockAssignmentData, id: 1, title: 'Mock Assignment' }; // Adjust based on IAssignmentData structure
    store.dispatch(updateCourseAssignments({ assignmentData: mockData }));

    const state = store.getState().courseAssignments;
    expect(state.data).toContainEqual(mockData);
  });

  it('should handle fetchCourseAssignments pending', async () => {
    await store.dispatch(fetchCourseAssignments({ courseId: 1 }));

    const state = store.getState().courseAssignments;
    expect(state.loading).toBe(false);
    expect(state.error).toBeUndefined();
    expect(state.data).toHaveLength(1); // Expect one assignment to be added
  });

  it('should handle fetchCourseAssignments rejected', async () => {
    (AssignmentKind.dataGenerator as jest.Mock).mockImplementation(async function* () {
      throw new Error('Network error');
    });

    const result = await store.dispatch(fetchCourseAssignments({ courseId: 2 }));

    const state = store.getState().courseAssignments;
    expect(result.type).toBe(fetchCourseAssignments.rejected.type);
    expect(state.loading).toBe(false);
    expect(state.error).toBe('Network error');
  });
});
