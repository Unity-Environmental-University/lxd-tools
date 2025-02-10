import { ICourseData } from "@/canvas";
import { LoadStatus } from "@/reporting/data/loadStatus";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type CoursesState = {
    coursesById: Record<string, ICourseData>;
    status: LoadStatus;
    error?: string;
};

const initialState: CoursesState = {
    coursesById: {},
    status: "idle",
};

const coursesSlice = createSlice({
    name: "courses",
    initialState,
    reducers: {
        setStatus: (state, action: PayloadAction<LoadStatus>) => {
            state.status = action.payload;
        },
        addCourse: (state, action: PayloadAction<ICourseData>) => {
            const course = action.payload;
            state.coursesById[String(course.id)] = course;
        },
    },
});

export const { setStatus, addCourse } = coursesSlice.actions;
export const courseReducer = coursesSlice.reducer;

export const selectCourses = (state: { courses: CoursesState }) =>
    Object.values(state.courses.coursesById);
