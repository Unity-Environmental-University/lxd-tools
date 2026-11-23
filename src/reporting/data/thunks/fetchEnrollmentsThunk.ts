import {createAsyncThunk} from "@reduxjs/toolkit";
import {setStatus} from "@/reporting/data/coursesSlice";
import {updateEnrollment} from "@/reporting/data/enrollmentsSlice";
import { GetEnrollmentGenConfig, getEnrollmentGenerator } from "@ueu/ueu-canvas";



export const fetchEnrollmentsThunk = createAsyncThunk(
    "enrollments/fetchEnrollments",
    async (params: GetEnrollmentGenConfig, {dispatch}) => {

        const gen = getEnrollmentGenerator(params)
        dispatch(setStatus('loading'))
        try {
            for await (const enrollments of gen) {
                dispatch(updateEnrollment({ enrollment: enrollments }))
            }
        } catch (error) {
            // Canvas errors now throw from the generator; surface them instead of staying on 'loading'
            dispatch(setStatus('failed'))
            throw error
        }
    }
)