import { createSelector } from "@reduxjs/toolkit";
import {InstructorsState} from "@/reporting/data/instructorsSlice";
import {RootReportingState} from "@/reporting/data/reportingStore";
import {EnrollmentsState} from "@/reporting/data/enrollmentsSlice";
import {useSelector} from "react-redux";

export const selectInstructorsById = (state: RootReportingState) =>
    state.faculty.instructorsById

export const createInstructorSelector = (id: number) => createSelector(
    [selectInstructorsById],
    (instructorsById) => instructorsById[id]
);


export const selectEnrollmentsById = ({enrollments}: RootReportingState) => enrollments.enrollmentsById;
export const selectEnrollmentsByCourseId = ({enrollments}: RootReportingState) =>
    Object.values(enrollments.enrollmentsByCourseId);

export const selectEnrollmentsByUserId = ({enrollments}: RootReportingState) =>
    enrollments.enrollmentsByUserId;

export const getEnrollment = (id:number) => createSelector(
    [selectEnrollmentsById],
    (enrollmentsById) => enrollmentsById[id]
);

type EnrollmentGroupSelector = typeof selectEnrollmentsByUserId;


const generateGroupGetter =  (selector: EnrollmentGroupSelector) => (id: number) => createSelector(
    [selector, selectEnrollmentsById],
    (group: Record<number, Set<number>|undefined>, enrollments) => {
        let elements = group[id];
        let out = elements instanceof Set ? Array.from(elements) : elements;
        if(out) return out.map(a => enrollments[a]);
    }
)

export const getEnrollmentByCourseId = generateGroupGetter(selectEnrollmentsByCourseId);
export const getEnrollmentByUserId = generateGroupGetter(selectEnrollmentsByUserId);