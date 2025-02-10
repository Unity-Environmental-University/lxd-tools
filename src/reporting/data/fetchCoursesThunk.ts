// coursesThunk.ts

import {addCourse, setStatus} from '@/reporting/data/coursesSlice';
import {getCourseDataGenerator, GetCoursesFromAccountOptions } from 'ueu_canvas';
import {createAsyncThunk} from "@reduxjs/toolkit";
import {deepObjectMerge, ICanvasCallConfig} from "ueu_canvas";



export type FetchCoursesParams = {
  accountId: number;
  termId?: number;
  config?: GetCoursesFromAccountOptions;
};

const courseDefaultConfig: GetCoursesFromAccountOptions = {
  include: ['term', 'teachers']
};


export const fetchCoursesThunk = createAsyncThunk(
    "courses/fetchCourses",
    async (params: FetchCoursesParams, {dispatch}) => {
        const {config, ...rest} = params;


        const callConfig:ICanvasCallConfig<GetCoursesFromAccountOptions> = {
            queryParams: deepObjectMerge(config, courseDefaultConfig)
        }

        // Generate data using provided generator function and parameters.
        const gen = getCourseDataGenerator(undefined, [rest.accountId], rest.termId, {...courseDefaultConfig,  config})
        dispatch(setStatus('loading'));

        for await (const course of gen) {
            dispatch(addCourse(course));
        }
        dispatch(setStatus('fulfilled'));
    }
);


