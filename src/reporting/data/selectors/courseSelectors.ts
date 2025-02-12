import {createSelector} from "@reduxjs/toolkit";
import {RootReportingState} from "@/reporting/data/reportingStore";
import {ICourseData} from "@/canvas";
import {LoadStatus} from "@/reporting/data/loadStatus";

export const selectCoursesById = (state: RootReportingState) => state.courses.coursesById;
export const selectCoursesStatusById = (state: RootReportingState) => state.courses.courseStatus;
export const selectCourses = createSelector(
    [selectCoursesById],
    (coursesById) => Object.values(coursesById)
);

const courseSelectorsCache = new Map<number, (state:RootReportingState) => ICourseData|undefined>();
const courseStatusSelectorsCache = new Map<number, (state:RootReportingState) => LoadStatus|undefined>();


export const selectCourse = (id: number) => {
    if (!courseSelectorsCache.has(id)) {
        courseSelectorsCache.set(
            id,
            createSelector(
                [selectCoursesById],
                (coursesById) => coursesById[id]
            )
        );
    }
    return courseSelectorsCache.get(id)!;
};

export const selectCourseLoadingStatus = (id:number) => {
    if (!courseStatusSelectorsCache.has(id)) {
        courseStatusSelectorsCache.set(
            id,
            createSelector(
                [selectCoursesStatusById],
                (statusById) => statusById[id]
            )
        );
    }
    return courseStatusSelectorsCache.get(id)!;
}