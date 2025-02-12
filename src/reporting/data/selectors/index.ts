import {createSelector} from "@reduxjs/toolkit";
import {RootReportingState} from "@/reporting/data/reportingStore";
import {generateGroupGetter} from "@/reporting/data/selectors/generateGroupGetter";
import {IUserData} from "@canvas/canvasDataDefs";


export const selectInstructorState = (state: RootReportingState) => state.instructors;
export const selectInstructorsById = createSelector(
    [selectInstructorState], (instructors) => instructors.instructorsById)


export const selectInstructors = createSelector([selectInstructorState], (state) =>
    Object.values(state.instructorsById))
// Selector to get instructors for a specific course
export const selectInstructorIdsByCourseId = createSelector([selectInstructorState], (instructors) => instructors.instructorsByCourseId)
export const selectInstructorsByCourseId = createSelector([selectInstructorIdsByCourseId, selectInstructorsById], (userIdByCourseId, userById) => {
    const output: Record<number, IUserData[]|undefined> = {};
    for (const courseId in userIdByCourseId) {
        output[courseId] = userIdByCourseId[courseId].map(id => userById[id]);
    }
    return output;
})



export const createInstructorSelector = (id: number) => createSelector(
    [selectInstructorsById],
    (instructorsById) => instructorsById[id]
);


export * from './courseSelectors';
export * from './enrollmentSelectors';
