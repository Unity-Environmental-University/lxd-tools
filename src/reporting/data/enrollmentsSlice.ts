import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {EnrollmentData} from '@ueu/ueu-canvas'

export type UpdateEnrollmentAction = PayloadAction<{
    enrollment: EnrollmentData,
}>
export type EnrollmentsState = {
    enrollmentsById: Record<number, EnrollmentData>,
    enrollmentsByCourseId: Record<number, number[]>,
    enrollmentsByUserId: Record<number, number[]>,
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
            const {id, course_id, user_id} = enrollment;
            state.enrollmentsById[id] = enrollment;
            state.enrollmentsByCourseId[course_id] ??= [];

            if(!(id in state.enrollmentsByCourseId[course_id])) {
                state.enrollmentsByCourseId[course_id].push(id);
            }

            state.enrollmentsByUserId[user_id] ??= [];
            if(!(id in state.enrollmentsByUserId)) {
                state.enrollmentsByUserId[user_id].push(id);
            }
        },
    }

})

export const { clear, updateEnrollment } = enrollmentsSlice.actions;


export const enrollmentsReducer = enrollmentsSlice.reducer;
