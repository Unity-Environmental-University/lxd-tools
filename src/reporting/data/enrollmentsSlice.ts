import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {EnrollmentData} from '@ueu/ueu-canvas'
import {LoadStatus} from "@/reporting/data/loadStatus";

export type UpdateEnrollmentAction = PayloadAction<{
    enrollment: EnrollmentData,
}>
export type EnrollmentsState = {
    enrollmentsById: Record<number, EnrollmentData>,
    enrollmentsByCourseId: Record<number, number[]>,
    enrollmentsByUserId: Record<number, number[]>,
    loadStatusByUserId: Record<number, LoadStatus | undefined>,
}
const enrollmentsInitialState: EnrollmentsState = {
    enrollmentsById: {},
    enrollmentsByCourseId: {},
    enrollmentsByUserId: {},
    loadStatusByUserId: {},
}
export const enrollmentsSlice = createSlice({
    name: "enrollments",
    initialState: enrollmentsInitialState,
    reducers: {
        clear: function (state: EnrollmentsState) {
            state.enrollmentsById = {};
            state.enrollmentsByCourseId = {};
            state.enrollmentsByUserId = {};
            state.loadStatusByUserId = {};
        },
        setUserEnrollmentsStatus: (state, action: PayloadAction<{ userId: number, status: LoadStatus }>) => {
            const {userId, status} = action.payload;
            state.loadStatusByUserId[userId] = status;
        },
        updateEnrollment: (state:EnrollmentsState, action: UpdateEnrollmentAction) => {
            const {enrollment} = action.payload;
            const {id, course_id, user_id} = enrollment;
            state.enrollmentsById[id] = enrollment;
            state.enrollmentsByCourseId[course_id] ??= [];

            // `in` on an array checks indices, not values; compare values instead
            if (!state.enrollmentsByCourseId[course_id].includes(id)) {
                state.enrollmentsByCourseId[course_id].push(id);
            }

            state.enrollmentsByUserId[user_id] ??= [];
            if (!state.enrollmentsByUserId[user_id].includes(id)) {
                state.enrollmentsByUserId[user_id].push(id);
            }
        },
    }

})

export const { clear, setUserEnrollmentsStatus, updateEnrollment } = enrollmentsSlice.actions;


export const enrollmentsReducer = enrollmentsSlice.reducer;
