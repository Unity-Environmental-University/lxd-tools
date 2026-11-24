// coursesThunk.ts

import {addCourse, setCourseStatus, setStatus} from '@/reporting/data/coursesSlice';
import {createAsyncThunk} from "@reduxjs/toolkit";
import {
    deepObjectMerge,
    GetCoursesFromAccountOptions,
    ICanvasCallConfig,
    ICourseData
} from "@ueu/ueu-canvas";
import {getPagedDataGenerator} from "@ueu/ueu-canvas";


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
    async (params: FetchCoursesParams, {dispatch}) => {
        const {config: _config, ...rest} = params;

        const config = {
            queryParams: deepObjectMerge(_config, courseDefaultConfig)
        } as ICanvasCallConfig<GetCoursesFromAccountOptions>;

        const termIds = Array.isArray(rest.termId) ? rest.termId : [rest.termId];

        const accountId = rest.accountId;
        dispatch(setStatus('loading'));
        try {
            for (const termId of termIds) {

                const gen = getPagedDataGenerator(`/api/v1/accounts/${accountId}/courses`, {
                    queryParams: {
                        enrollment_term_id: termId,
                        ...config.queryParams,
                    }
                })
                for await (const course of gen) {
                    dispatch(addCourse(course as ICourseData));
                    dispatch(setCourseStatus({courseId: course.id, status: 'fulfilled'}))
                }
            }
        } catch (e) {
            dispatch(setStatus('failed'));
            throw e;
        }

        dispatch(setStatus('fulfilled'));
    }
);


