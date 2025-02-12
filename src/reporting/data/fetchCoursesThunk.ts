// coursesThunk.ts

import {addCourse, setCourseStatus, setStatus} from '@/reporting/data/coursesSlice';
import {createAsyncThunk} from "@reduxjs/toolkit";
import {deepObjectMerge, getCourseDataGenerator, GetCoursesFromAccountOptions, ICanvasCallConfig,} from "ueu_canvas";
import {RootReportingState} from "@/reporting/data/reportingStore";


export type FetchCoursesParams = {
    accountId: number;
    termId?: number;
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

        // Generate data using provided generator function and parameters.
        const gen = getCourseDataGenerator(rest.queryString, [rest.accountId], rest.termId, {
            ...courseDefaultConfig,
            config,
        })

        dispatch(setStatus('loading'));

        for await (const course of gen) {
            const state = getState() as RootReportingState;
            if (state.courses.courseStatus[course.id] == 'loading') continue; //skip individually loading courses.
            dispatch(addCourse(course));
            dispatch(setCourseStatus({courseId: course.id, status: 'fulfilled'}))
        }
        dispatch(setStatus('fulfilled'));
    }
);


