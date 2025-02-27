
import {createSelector} from "@reduxjs/toolkit";
import {EnrollmentData} from "ueu_canvas";
import {generateGroupGetter} from "@/reporting/data/selectors/generateGroupGetter";
import {EnrollmentsState} from "@/reporting/data/enrollmentsSlice";

type RootReportingState = {
    enrollments: EnrollmentsState;
}

export const selectEnrollmentsById = ({enrollments}: RootReportingState) => enrollments.enrollmentsById;
export const selectEnrollmentsByCourseId = ({enrollments}: RootReportingState) =>
    Object.values(enrollments.enrollmentsByCourseId);
export const selectEnrollmentsByUserId = ({enrollments}: RootReportingState) =>
    enrollments.enrollmentsByUserId;

export const getEnrollment = (id:number) => createSelector(
    [selectEnrollmentsById],
    (enrollmentsById) => enrollmentsById[id]
);

export const getEnrollmentByCourseId = generateGroupGetter<EnrollmentData>(
  selectEnrollmentsByCourseId,
  selectEnrollmentsById
);
export const getEnrollmentByUserId = generateGroupGetter<EnrollmentData>(
  selectEnrollmentsByUserId,
  selectEnrollmentsById
);
