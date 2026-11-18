import {ICourseData} from "@ueu/ueu-canvas";
import {LoadStatus} from "@/reporting/data/loadStatus";
import {createSlice, PayloadAction} from "@reduxjs/toolkit";

export type CoursesState = {
    coursesById: Record<number, ICourseData>;
    /** Only courses found by the account course search (fetchCoursesThunk); drives the Find Users roster fetches. */
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
        /**
         * Stores a course for display only. It is not indexed by term, so it is never treated as one of
         * the account's courses (e.g. courses looked up from an instructor's enrollments elsewhere).
         */
        addCourseDetails: (state, action: PayloadAction<ICourseData>) => {
            state.coursesById[action.payload.id] = action.payload;
        },
        /** Stores a course found by the account course search and indexes it under its terms. */
        addCourse: (state, action: PayloadAction<ICourseData>) => {
            const course = action.payload;
            state.coursesById[course.id] = course;

            // Ensure courseIdsByTermId is initialized
            state.courseIdsByTermId ??= {};

            const termIds = Array.isArray(course.enrollment_term_id) ? course.enrollment_term_id : [course.enrollment_term_id];
            for (const termId of termIds) {
                // Initialize the list if it doesn't exist
                if (!state.courseIdsByTermId[termId]) {
                    state.courseIdsByTermId[termId] = [];
                }
                // `in` on an array checks indices, not values; compare values instead
                if (!state.courseIdsByTermId[termId].includes(course.id)) {
                    state.courseIdsByTermId[termId].push(course.id);
                }
            }
        }

    },
});

export const {setStatus, addCourse, addCourseDetails, setCourseStatus} = coursesSlice.actions;
export const courseReducer = coursesSlice.reducer;

