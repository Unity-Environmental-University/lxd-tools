import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {IAssignmentData} from "@canvas/content/assignments/types";
import AssignmentKind from "@canvas/content/assignments/AssignmentKind";

type PayloadParams = {
    courseId: number,

}


const initialState = {
    data: [] as IAssignmentData[],
    loading: false,
    error: undefined as string | undefined,
}

type State = typeof initialState;

export const fetchCourseAssignments = createAsyncThunk(
    'courseAssignments/fetchCourseAssignments',
    async ({courseId}: PayloadParams, thunkAPI) => {
        // Fetch modules if not provided

        // Filter out modules already processed
        const assignmentDataGen = AssignmentKind.dataGenerator(courseId)

        for await (const assignmentData of assignmentDataGen) {
            thunkAPI.dispatch(updateCourseAssignments({assignmentData}));
        }
    }
)

const courseAssignmentsSlice = createSlice({
    name: 'courseAssignments',
    initialState,
    reducers: {
        updateCourseAssignments: (state, action) => {
            const {assignmentData} = action.payload;
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


export const {updateCourseAssignments} = courseAssignmentsSlice.actions;
export const getSliceCourseAssignmentsData = (state: State) => state.data;
export const getSliceCourseAssignmentsStatus = (state: State) => state.loading;
export const getSliceCourseAssignmentsError = (state: State) => state.error;
export default courseAssignmentsSlice.reducer;
