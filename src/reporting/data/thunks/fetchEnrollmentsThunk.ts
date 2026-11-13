import {createAsyncThunk} from "@reduxjs/toolkit";
import {EnrollmentsState, setUserEnrollmentsStatus, updateEnrollment} from "@/reporting/data/enrollmentsSlice";
import { GetEnrollmentUserGenConfig, getEnrollmentGenerator } from "@ueu/ueu-canvas";

type StateWithEnrollments = { enrollments: EnrollmentsState };

/**
 * Fetches the enrollments of a single user. Each user is fetched at most once per store,
 * so it is safe to dispatch from a render-driven effect.
 */
export const fetchEnrollmentsThunk = createAsyncThunk<void, GetEnrollmentUserGenConfig, { state: StateWithEnrollments }>(
    "enrollments/fetchEnrollments",
    async (params, {dispatch}) => {
        const {userId} = params;
        // Mark the user before the first await so duplicate dispatches are rejected by `condition`.
        dispatch(setUserEnrollmentsStatus({userId, status: 'loading'}));
        try {
            const gen = getEnrollmentGenerator(params);
            for await (const enrollment of gen) {
                dispatch(updateEnrollment({ enrollment }));
            }
            dispatch(setUserEnrollmentsStatus({userId, status: 'fulfilled'}));
        } catch (e) {
            dispatch(setUserEnrollmentsStatus({userId, status: 'failed'}));
            throw e;
        }
    },
    {
        condition: ({userId}, {getState}) => {
            const status = getState().enrollments.loadStatusByUserId?.[userId];
            return typeof status === 'undefined' || status === 'idle';
        },
    }
)
