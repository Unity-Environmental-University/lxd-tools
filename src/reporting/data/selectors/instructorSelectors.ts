import {createSelector} from "@reduxjs/toolkit";

import {IUserData} from "@ueu/ueu-canvas/canvasDataDefs";
import {InstructorsState} from "@/reporting/data/instructorsSlice";


type RootStateInstructors = {
    instructors: InstructorsState;
}


export const selectInstructorState = (state: RootStateInstructors) => state.instructors;
export const selectInstructorsById = createSelector(
    [selectInstructorState], (instructors) => instructors.instructorsById)

export const selectInstructorsStatus = createSelector([selectInstructorState], (instructors) => instructors.status);
export const selectInstructors = createSelector([selectInstructorState], (state) =>
    Object.values(state.instructorsById))
// Selector to get instructors for a specific course
export const selectInstructorIdsByCourseId = createSelector([selectInstructorState], (instructors) => instructors.instructorsByCourseId)
export const selectInstructorsByCourseId = createSelector([selectInstructorIdsByCourseId, selectInstructorsById], (userIdByCourseId, userById) => {
    const output: Record<number, IUserData[] | undefined> = {};
    for (const courseId in userIdByCourseId) {
        output[courseId] = userIdByCourseId[courseId].map(id => userById[id]);
    }
    return output;
})

export const createInstructorSelector = (id: number) => createSelector(
    [selectInstructorsById],
    (instructorsById) => instructorsById[id]
);