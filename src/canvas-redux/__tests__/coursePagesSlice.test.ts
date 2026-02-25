import { mockPageData } from "@ueu/ueu-canvas/content/__mocks__/mockContentData";
import { configureStore } from '@reduxjs/toolkit';
import {coursePagesReducer, fetchCoursePages, updateCoursePages} from '../coursePagesSlice';
import { IPageData } from '@ueu/ueu-canvas/content/pages/types';
import PageKind from "@ueu/ueu-canvas/content/pages/PageKind";

// Mock dataGenerator as an async generator function
jest.mock('@ueu/ueu-canvas/content/pages/PageKind', () => ({
  dataGenerator: jest.fn(async function* () {
      yield {
          ...mockPageData,
          id: 1,
          title: 'Mock Page', // Assuming this is intended to be a string
      };
  })
}));

describe('coursePagesSlice', () => {
  let store: any;

  beforeEach(() => {
    store = configureStore({ reducer: { coursePages: coursePagesReducer } });
  });

  it('should return the initial state', () => {
    const state = store.getState().coursePages;
    expect(state).toEqual({
      data: [],
      loading: false,
      error: undefined,
    });
  });

  it('should handle updateCoursePages', () => {
    const mockData: IPageData = { ...mockPageData, id: 1, title: 'Mock Page' }; // Adjust based on IPageData structure
    store.dispatch(updateCoursePages({ pageData: mockData }));

    const state = store.getState().coursePages;
    expect(state.data).toContainEqual(mockData);
  });

  it('should handle fetchCoursePages pending', async () => {
    await store.dispatch(fetchCoursePages({ courseId: 1 }));

    const state = store.getState().coursePages;
    expect(state.loading).toBe(false);
    expect(state.error).toBeUndefined();
    expect(state.data).toHaveLength(1); // Expect one page to be added
  });

  it('should handle fetchCoursePages rejected', async () => {
    (PageKind.dataGenerator as jest.Mock).mockImplementation(async function* () {
      throw new Error('Network error');
    });

    const result = await store.dispatch(fetchCoursePages({ courseId: 2 }));

    const state = store.getState().coursePages;
    expect(result.type).toBe(fetchCoursePages.rejected.type);
    expect(state.loading).toBe(false);
    expect(state.error).toBe('Failed to fetch course pages Error: Network error');
  });
});
