import {createAsyncThunk} from "@reduxjs/toolkit";
import {setStatus} from "@/reporting/data/coursesSlice";
import {updateEnrollment} from "@/reporting/data/enrollmentsSlice";
import { GetEnrollmentGenConfig, getEnrollmentGenerator } from "ueu_canvas";



export const fetchEnrollmentsThunk = createAsyncThunk(
    "enrollments/fetchEnrollments",
    async (params: GetEnrollmentGenConfig, {dispatch}) => {

        const gen = getEnrollmentGenerator(params)
        dispatch(setStatus('loading'))
        for await (const enrollments of gen) {
            updateEnrollment(enrollments)
        }
    }
)