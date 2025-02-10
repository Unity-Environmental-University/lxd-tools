import {createSelector, createSlice, PayloadAction} from "@reduxjs/toolkit";
import { EnrollmentData } from 'ueu_canvas'

export type UpdateEnrollmentAction = PayloadAction<{
    enrollment: EnrollmentData,
}>
export type EnrollmentsState = {
    enrollmentsById: Record<number, EnrollmentData>,
    enrollmentsByCourseId: Record<number, Set<number>>,
    enrollmentsByUserId: Record<number, Set<number>>,
}
const enrollmentsInitialState: EnrollmentsState = {
    enrollmentsById: {},
    enrollmentsByCourseId: {},
    enrollmentsByUserId: {},
}
export const enrollmentsSlice = createSlice({
    name: "enrollments",
    initialState: enrollmentsInitialState,
    reducers: {
        clear: function (state: EnrollmentsState) {
            state.enrollmentsById = {};
            state.enrollmentsByCourseId = {};
            state.enrollmentsByUserId = {};
        },
        updateEnrollment: (state:EnrollmentsState, action: UpdateEnrollmentAction) => {
            const {enrollment} = action.payload;
            state.enrollmentsById[enrollment.id] = enrollment;
            state.enrollmentsByCourseId[enrollment.course_id] ??= new Set();
            state.enrollmentsByCourseId[enrollment.course_id].add(enrollment.id);
            state.enrollmentsByUserId[enrollment.user_id] ??= new Set();
            state.enrollmentsByUserId[enrollment.user_id].add(enrollment.id);
        },
    }

})

export const { clear, updateEnrollment } = enrollmentsSlice.actions;



type EnrollmentsSliceState = {
    enrollments: EnrollmentsState
}




export const selectEnrollments = ({enrollments}: EnrollmentsSliceState) =>
    Object.values(enrollments.enrollmentsById)

export const enrollmentsReducer = enrollmentsSlice.reducer;
