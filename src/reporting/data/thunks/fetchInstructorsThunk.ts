import {InstructorsState, setCourseInstructorsStatus, updateInstructors} from "@/reporting/data/instructorsSlice";
import {getPagedDataGenerator, GetUserQueryParams, IUserData} from "@ueu/ueu-canvas";
import {createAsyncThunk} from "@reduxjs/toolkit";

export type FetchInstructorsParams = {
    courseId: number;
    queryParams?: Omit<GetUserQueryParams, 'enrollment_type'>;
};

type StateWithInstructors = { instructors: InstructorsState };

/**
 * Fetches the teachers of a single course.
 *
 * Each course is fetched at most once per store: the `condition` skips the request when the
 * course's roster is already loading, loaded, or has failed. That makes it safe to dispatch
 * from render-driven effects without triggering repeated requests.
 */
export const fetchInstructorsThunk = createAsyncThunk<void, FetchInstructorsParams, { state: StateWithInstructors }>(
    "instructors/fetchInstructors",
    async ({courseId, queryParams}, {dispatch}) => {
        // Mark the course before the first await so duplicate dispatches are rejected by `condition`.
        dispatch(setCourseInstructorsStatus({courseId, status: 'loading'}));

        try {
            // This calls the paged endpoint directly instead of ueu-canvas's getUserGenerator, which
            // (as of 0.0.17) sends its whole config object as the query string, so Canvas never sees
            // enrollment_type and returns every user in the course. Switch back once that is fixed.
            const gen = getPagedDataGenerator<IUserData>(`/api/v1/courses/${courseId}/users`, {
                queryParams: {...queryParams ?? {}, enrollment_type: ['teacher']},
            });
            const instructors: IUserData[] = [];
            for await (const user of gen) {
                instructors.push(user);
            }
            dispatch(updateInstructors({instructor: instructors, courseId, overwrite: true}));
            dispatch(setCourseInstructorsStatus({courseId, status: 'fulfilled'}));
        } catch (e) {
            dispatch(setCourseInstructorsStatus({courseId, status: 'failed'}));
            throw e;
        }
    },
    {
        condition: ({courseId}, {getState}) => {
            const status = getState().instructors.loadStatusByCourseId?.[courseId];
            return typeof status === 'undefined' || status === 'idle';
        },
    }
);
