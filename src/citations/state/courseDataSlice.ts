import {createAsyncThunk, createSlice, PayloadAction} from "@reduxjs/toolkit";
import {ICourseData} from "@canvas/courseTypes";
import {fetchJson} from "@canvas/fetch/fetchJson";

//OpenAI. (2024). ChatGPT [Large language model]. https://chatgpt.com/c/63b33b66-0ab7-4974-a35e-f6297411628e used for interactive learning on adding fetch behavior

// Define the async thunk to fetch course data
export const fetchCourseData = createAsyncThunk(
    'courseData/fetchCourseData',
    async (courseId: number, {rejectWithValue}) => {
        try {
            return await fetchJson<ICourseData>(`/api/courses/${courseId}`);
        } catch (error) {
            const errorText = error ? error.toString() : 'Error';
            return rejectWithValue(errorText);
        }
    }
);

export type InitialCourseSliceState = {
    courseData: ICourseData | undefined,
    status: 'idle' | 'loading' | 'succeeded' | 'failed',
    error: string | null,
}

export const initialState: InitialCourseSliceState = {
    courseData: undefined,
    status: 'idle',
    error: null,
}

const courseDataSlice = createSlice({
    name: 'courseData',
    initialState,
    reducers: {
        setWorkingCourseData(state, action: PayloadAction<ICourseData | undefined>) {
            state.courseData = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCourseData.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchCourseData.fulfilled, (state, action: PayloadAction<ICourseData|undefined>) => {
                state.status = 'succeeded';
                state.courseData = action.payload;
                state.error = null;
            })
            .addCase(fetchCourseData.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })
    }
})



export const getWorkingCourseData = (state: ReturnType<typeof courseDataSlice.reducer> ) => state.courseData;
export const getStatus = (state: ReturnType<typeof courseDataSlice.reducer> ) => state.status;
export const getError = (state: ReturnType<typeof courseDataSlice.reducer> ) => state.error;
export const {setWorkingCourseData} = courseDataSlice.actions
const courseDataReducer = courseDataSlice.reducer;

export default courseDataReducer;