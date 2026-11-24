import { createAsyncThunk } from "@reduxjs/toolkit";

import { deepObjectMerge, getCourseData, GetCourseOptions } from "@ueu/ueu-canvas";
import { addCourseDetails, CoursesState, setCourseStatus } from "@/reporting/data/coursesSlice";

export type FetchCourseParams = {
  courseId: number;
  options?: GetCourseOptions;
};
const defaults: GetCourseOptions = {
  include: ["teachers"],
};

type StateWithCourses = { courses: CoursesState };

/**
 * Fetches a single course and stores it. A course that is already stored, loading, or failed
 * is not requested again, so this is safe to dispatch from a render-driven effect.
 */
export const fetchCourseThunk = createAsyncThunk<Awaited<ReturnType<typeof getCourseData>>, FetchCourseParams, { state: StateWithCourses }>(
  "courses/fetchCourseThunk",
  async ({ courseId, options }, { dispatch }) => {
    // Mark the course before the first await so duplicate dispatches are rejected by `condition`.
    dispatch(setCourseStatus({ courseId, status: "loading" }));
    try {
      const data = await getCourseData(courseId, { queryParams: deepObjectMerge(options, defaults) });
      // Display only: these come from instructors' enrollments anywhere in Canvas, so they must not
      // join the account's course list that the roster fetches are driven from.
      dispatch(addCourseDetails(data));
      dispatch(setCourseStatus({ courseId, status: "fulfilled" }));
      return data;
    } catch (e) {
      dispatch(setCourseStatus({ courseId, status: "failed" }));
      throw e;
    }
  },
  {
    condition: ({ courseId }, { getState }) => {
      const { coursesById, courseStatus } = getState().courses;
      if (coursesById[courseId]) return false;
      const status = courseStatus[courseId];
      return typeof status === "undefined" || status === "idle";
    },
  }
);
