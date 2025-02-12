import {ICourseData} from "@/canvas";
import {LoadStatus} from "@/reporting/data/loadStatus";
import {createSlice, PayloadAction} from "@reduxjs/toolkit";

export type CoursesState = {
    coursesById: Record<number, ICourseData>;
    courseStatus: Record<number, LoadStatus|undefined>;
    status: LoadStatus;
    error?: string;
};

const initialState: CoursesState = {
    coursesById: {},
    courseStatus: {},
    status: "idle",
};

const coursesSlice = createSlice({
    name: "courses",
    initialState,
    reducers: {
        setStatus: (state, action: PayloadAction<LoadStatus>) => {
            state.status = action.payload;
        },
        setCourseStatus(state, action: PayloadAction<{ status: LoadStatus, courseId:number }>) {
            const { status, courseId } = action.payload;
            state.courseStatus[courseId] = status;
        },
        addCourse: (state, action: PayloadAction<ICourseData>) => {
            const course = action.payload;
            state.coursesById[course.id] = course;
        },
    },
});

export const { setStatus, addCourse, setCourseStatus } = coursesSlice.actions;
export const courseReducer = coursesSlice.reducer;

