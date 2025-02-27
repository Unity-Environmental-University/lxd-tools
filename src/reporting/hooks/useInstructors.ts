import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchInstructorsThunk } from "@/reporting/data/thunks/fetchInstructorsThunk";
import {AppDispatch, RootReportingState} from "@/reporting/data/reportingStore";
import { selectInstructorsByCourseId } from "@/reporting/data/selectors/instructorSelectors";

export const useInstructors = (courseIds: number[]) => {
    const dispatch = useDispatch<AppDispatch>();
    const instructorsByCourseId = useSelector(selectInstructorsByCourseId);

    useEffect(() => {
        courseIds.forEach(courseId => {
            if (!instructorsByCourseId[courseId]) {
                dispatch(fetchInstructorsThunk({ courseId }));
            }
        });
    }, [courseIds, instructorsByCourseId, dispatch]);
    return {
        instructorsByCourseId,
    }
};