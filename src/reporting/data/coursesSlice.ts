import {ICourseData} from "@ueu/ueu-canvas";
import {LoadStatus} from "@/reporting/data/loadStatus";
import {createSlice, PayloadAction} from "@reduxjs/toolkit";

export type CoursesState = {
    coursesById: Record<number, ICourseData>;
    courseIdsByTermId: Record<number, number[]>;
    courseStatus: Record<number, LoadStatus | undefined>;
    status: LoadStatus;
    error?: string;
};

const initialState: CoursesState = {
    coursesById: {},
    courseStatus: {},
    courseIdsByTermId: {},
    status: "idle",
};

const coursesSlice = createSlice({
    name: "courses",
    initialState,
    reducers: {
        setStatus: (state, action: PayloadAction<LoadStatus>) => {
            state.status = action.payload;
        },
        setCourseStatus(state, action: PayloadAction<{ status: LoadStatus, courseId: number }>) {
            const {status, courseId} = action.payload;
            state.courseStatus[courseId] = status;
        },
        addCourse: (state, action: PayloadAction<ICourseData>) => {
            const course = action.payload;
            state.coursesById[course.id] = course;

            // Ensure courseIdsByTermId is initialized
            state.courseIdsByTermId ??= {};

            const termIds = Array.isArray(course.enrollment_term_id) ? course.enrollment_term_id : [course.enrollment_term_id];
            for (const termId of termIds) {
                // Initialize the Set if it doesn't exist
                if (!state.courseIdsByTermId[termId]) {
                    state.courseIdsByTermId[termId] = [];
                }
                try {
                    // State update logic
                    if(!(course.id in state.courseIdsByTermId[termId])) {
                        state.courseIdsByTermId[termId].push(course.id);

                    }
                } catch (error) {
                    console.error("Error in state update:", error);
                }

            }
        }

    },
});

export const {setStatus, addCourse, setCourseStatus} = coursesSlice.actions;
export const courseReducer = coursesSlice.reducer;

