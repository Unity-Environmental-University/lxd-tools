import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { createSelector } from "reselect";
import { ICourseData } from "@ueu/ueu-canvas";
import { getCourseData } from "@ueu/ueu-canvas";
import { GetCourseOptions } from "@ueu/ueu-canvas";

// Define a type for the fetch parameters
type FetchCourseDataParams = {
  courseId: number;
  options?: GetCourseOptions;
};

// Step 1: Define the slice name as a constant

// Step 2: Create an async thunk for fetching course data
export const fetchCourseData = createAsyncThunk(
  `course/fetchCourseData`,
  async ({ courseId, options }: FetchCourseDataParams, { rejectWithValue }) => {
    try {
      return await getCourseData(courseId, { queryParams: options });
    } catch (error) {
      const errorText = error ? error.toString() : "Error";
      return rejectWithValue(errorText);
    }
  }
);

// Define the initial state type
export type InitialCourseSliceState = {
  data: ICourseData | undefined;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | undefined;
};

// Step 3: Set the initial state
export const initialState: InitialCourseSliceState = {
  data: undefined,
  status: "idle",
  error: undefined,
};

// Create the slice
const courseDataSlice = createSlice({
  name: "course", // Use the constant slice name
  initialState,
  reducers: {
    setWorkingCourseData(state, action: PayloadAction<ICourseData | undefined>) {
      state.data = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCourseData.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCourseData.fulfilled, (state, action: PayloadAction<ICourseData | undefined>) => {
        state.status = "succeeded";
        state.data = action.payload;
        state.error = undefined;
      })
      .addCase(fetchCourseData.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

// Export actions and reducer
export const { setWorkingCourseData } = courseDataSlice.actions;

// Step 4: Define the base selector
const selectCourseDataState = (state: { course: InitialCourseSliceState }) => state.course;

// Step 5: Define memoized selectors
export const getWorkingCourseData = createSelector(selectCourseDataState, (courseData) => courseData.data);

export const getStatus = createSelector(selectCourseDataState, (courseData) => courseData.status);

export const getError = createSelector(selectCourseDataState, (courseData) => courseData.error);

export const courseDataReducer = courseDataSlice.reducer;
