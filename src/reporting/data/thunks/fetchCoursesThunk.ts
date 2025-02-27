// coursesThunk.ts

import {addCourse, setCourseStatus, setStatus} from '@/reporting/data/coursesSlice';
import {createAsyncThunk} from "@reduxjs/toolkit";
import {
    deepObjectMerge,
    GetCoursesFromAccountOptions,
    ICanvasCallConfig
} from "ueu_canvas";
import {RootReportingState} from "@/reporting/data/reportingStore";
import {getPagedDataGenerator} from "ueu_canvas";


export type FetchCoursesParams = {
    accountId: number;
    termId?: number | number[];
    queryString?: string;
    config?: GetCoursesFromAccountOptions;
};

const courseDefaultConfig: GetCoursesFromAccountOptions = {
    include: ['term', 'teachers']
};


export const fetchCoursesThunk = createAsyncThunk(
    "courses/fetchCourses",
    async (params: FetchCoursesParams, {dispatch, getState}) => {
        let {config: _config, ...rest} = params;

        const config = {
            queryParams: deepObjectMerge(_config, courseDefaultConfig)
        } as ICanvasCallConfig<GetCoursesFromAccountOptions>;

        const termIds = Array.isArray(rest.termId) ? rest.termId : [rest.termId];

        const accountId = rest.accountId;
        dispatch(setStatus('loading'));
        for (let termId of termIds) {

            let gen = getPagedDataGenerator(`/api/v1/accounts/${accountId}/courses`, {
                queryParams: {
                    enrollment_term_id: termId,
                    ...config.queryParams,
                }
            })
            for await (let course of gen) {
                console.log(course.course_code);
                const state = getState() as RootReportingState;
                console.log(state.courses.courseStatus[course.id])
                if (state.courses.courseStatus[course.id] === 'loading') continue;
                dispatch(addCourse(course));
                dispatch(setCourseStatus({courseId: course.id, status: 'fulfilled'}))
            }
        }

        dispatch(setStatus('fulfilled'));
    }
);


