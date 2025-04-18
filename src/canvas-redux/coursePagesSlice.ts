import { createSlice, createAsyncThunk, PayloadAction, createSelector } from '@reduxjs/toolkit';
import { IPageData } from "@canvas/content/pages/types";
import PageKind from "@canvas/content/pages/PageKind";

// Define types for your state
type CoursePagesState = {
  data: IPageData[];
  loading: boolean;
  error?: string;
};

// Initial state
const initialState: CoursePagesState = {
  data: [],
  loading: false,
  error: undefined,
};

type State = typeof initialState;

// Define the payload type for your thunk
type FetchCoursePagesPayload = {
  courseId: number;
};

// Thunk for fetching course pages
export const fetchCoursePages = createAsyncThunk<
  void,
  FetchCoursePagesPayload,
  { rejectValue: string }
>(
  'coursePages/fetchCoursePages',
  async ({ courseId }, { dispatch, rejectWithValue }) => {
    const pageDataGen = PageKind.dataGenerator(courseId);
    try {
      for await (const pageData of pageDataGen) {
        dispatch(updateCoursePages({ pageData })); // Ensure updateCoursePages has the correct payload
      }
    } catch (error) {

      return rejectWithValue(`Failed to fetch course pages ${error}`);
    }
  }
);

// Slice definition
const coursePagesSlice = createSlice({
  name: 'coursePages',
  initialState,
  reducers: {
    updateCoursePages: (state, action: PayloadAction<{ pageData: IPageData }>) => {
      state.data.push(action.payload.pageData);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCoursePages.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCoursePages.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(fetchCoursePages.rejected, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.error = action.payload;
        }
      });
  },
});

// Memoized selectors
const selectCoursePages = (state: { coursePages: CoursePagesState }) => state.coursePages;

export const getSliceCoursePagesData = createSelector(
  selectCoursePages,
  (coursePages) => coursePages.data
);

export const getSliceCoursePagesStatus = createSelector(
  selectCoursePages,
  (coursePages) => coursePages.loading
);

export const getSliceCoursePagesError = createSelector(
  selectCoursePages,
  (coursePages) => coursePages.error
);

export const { updateCoursePages } = coursePagesSlice.actions;

export const coursePagesReducer = coursePagesSlice.reducer;
