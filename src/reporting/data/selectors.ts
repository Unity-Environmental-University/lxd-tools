import { createSelector } from "@reduxjs/toolkit";
import {InstructorsState} from "@/reporting/data/instructorsSlice";
import {RootReportingState} from "@/reporting/data/reportingStore";

export const selectInstructorsById = (state: RootReportingState) =>
    state.faculty.instructorsById

export const getInstructor = (id: number) => createSelector(
    [selectInstructorsById],
    (instructorsById) => instructorsById[id]
);
