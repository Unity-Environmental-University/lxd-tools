import {createSelector} from "@reduxjs/toolkit";
import {ICourseData} from "@ueu/ueu-canvas";
import {LoadStatus} from "@/reporting/data/loadStatus";
import {CoursesState} from "@/reporting/data/coursesSlice";


type RootStateCourse = {
    courses: CoursesState;
}

export const selectCoursesById = (state: RootStateCourse) => state.courses.coursesById;
export const selectCoursesStatusById = (state: RootStateCourse) => state.courses.courseStatus;
export const selectCourses = createSelector(
    [selectCoursesById],
    (coursesById) => Object.values(coursesById)
);

const courseSelectorsCache = new Map<number, (state:RootStateCourse) => ICourseData|undefined>();
const courseStatusSelectorsCache = new Map<number, (state:RootStateCourse) => LoadStatus|undefined>();

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

export const selectCourseIdsByTermId = ({courses}: { courses: CoursesState }) => courses.courseIdsByTermId;
export const selectCoursesByTermIds = (termIds: number[]) =>
    createSelector(
        [selectCourseIdsByTermId, selectCoursesById],
        (idLookup, coursesById) =>
            termIds.flatMap(termId =>
                (Array.from(idLookup[termId] || [])).map(courseId => coursesById[courseId])
            )
    );