import {ICourseData} from "@/canvas";
import {LoadStatus} from "@/reporting/data/loadStatus";
import {createSlice, PayloadAction} from "@reduxjs/toolkit";

export type CoursesState = {
    courses: ICourseData[] | undefined;
    coursesById: Record<number, ICourseData>;
    status: LoadStatus;
    error?: string | undefined;
}

const initialState: CoursesState = {
    courses: undefined,
    coursesById: {},
    status: 'idle',
}

const coursesSlice = createSlice({
    name: 'courses',
    initialState,
    reducers: {

        setStatus:(state, action: PayloadAction<LoadStatus>) => {
            state.status = action.payload;
        },
        addCourse: (state, action: PayloadAction<ICourseData>) => {
            const course = action.payload;
            state.courses = [...state.courses ?? [], course];
            state.coursesById[course.id] = action.payload;
        }
    },
})

export const { setStatus, addCourse } = coursesSlice.actions;
export const courseReducer = coursesSlice.reducer;