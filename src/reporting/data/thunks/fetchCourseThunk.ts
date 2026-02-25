import {createAsyncThunk} from "@reduxjs/toolkit";


import {deepObjectMerge, getCourseData, GetCourseOptions } from "@ueu/ueu-canvas";
import {setCourseStatus} from "@/reporting/data/coursesSlice";
import {RootReportingState} from "@/reporting/data/reportingStore";

export type FetchCourseParams = {
    courseId: number;
    options?: GetCourseOptions,
}
const defaults: GetCourseOptions = {
    include: ['teachers'],
}
export const fetchCourseThunk = createAsyncThunk(
    "courses/fetchCourseThunk",
    async ({courseId, options}: FetchCourseParams, {dispatch, getState}) => {

        const state = getState() as RootReportingState;
        const status = state.courses.courseStatus[courseId];
        if(state.courses.status === 'loading')

        dispatch(setCourseStatus({courseId, status: "loading"}));
        const data = await getCourseData(courseId, { queryParams: deepObjectMerge(options, defaults) })
        dispatch(setCourseStatus({courseId, status: "fulfilled"}));

        return data;
    },
)