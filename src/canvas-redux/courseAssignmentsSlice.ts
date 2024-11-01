import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { createSelector } from 'reselect'; // Import createSelector for memoization
import { IAssignmentData } from "@canvas/content/assignments/types";
import AssignmentKind from "@canvas/content/assignments/AssignmentKind";

// Define types for payload and state
type PayloadParams = {
    courseId: number,
};

export const SLICE_NAME = "courseAssignments"

const initialState = {
    data: [] as IAssignmentData[],
    loading: false,
    error: undefined as string | undefined,
};

type State = typeof initialState;

// Async thunk for fetching course assignments
export const fetchCourseAssignments = createAsyncThunk(
    `${SLICE_NAME}/fetchCourseAssignments`,
    async ({ courseId }: PayloadParams, thunkAPI) => {
        const assignmentDataGen = AssignmentKind.dataGenerator(courseId);

        for await (const assignmentData of assignmentDataGen) {
            thunkAPI.dispatch(updateCourseAssignments({ assignmentData }));
        }
    }
);

// Create the slice
const courseAssignmentsSlice = createSlice({
    name: SLICE_NAME,
    initialState,
    reducers: {
        updateCourseAssignments: (state, action) => {
            const { assignmentData } = action.payload;
            state.data.push(assignmentData);
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCourseAssignments.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchCourseAssignments.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(fetchCourseAssignments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            });
    },
});

// Export actions
export const { updateCourseAssignments } = courseAssignmentsSlice.actions;


// Define PartialRootState
type PartialRootState = {
    [key in typeof SLICE_NAME]?: State;
};

// Base selector for accessing the courseAssignments slice
const selectCourseAssignmentsState = (state: PartialRootState) => state[SLICE_NAME];

// Memoized selectors for data, loading, and error states
export const getSliceCourseAssignmentsData = createSelector(
    selectCourseAssignmentsState,
    (courseAssignments) => courseAssignments?.data
);

export const getSliceCourseAssignmentsStatus = createSelector(
    selectCourseAssignmentsState,
    (courseAssignments) => courseAssignments?.loading
);

export const getSliceCourseAssignmentsError = createSelector(
    selectCourseAssignmentsState,
    (courseAssignments) => courseAssignments?.error
);

// Export the reducer
export default courseAssignmentsSlice.reducer;
