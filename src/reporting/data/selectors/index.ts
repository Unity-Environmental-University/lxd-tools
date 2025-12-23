import {RootReportingState} from "@/reporting/data/reportingStore";
import {createSelector} from "@reduxjs/toolkit";

export * from './courseSelectors';
export * from './enrollmentSelectors';
export * from './instructorSelectors';


export const termStateSelector = (state:RootReportingState) => state.terms;

export const termsByIdSelector = createSelector([termStateSelector], (state) => state.termsById);
export const termsSelector = createSelector([termsByIdSelector], termsById => Object.values(termsById));