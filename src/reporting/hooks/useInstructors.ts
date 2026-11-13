import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchInstructorsThunk } from "@/reporting/data/thunks/fetchInstructorsThunk";
import {AppDispatch} from "@/reporting/data/reportingStore";
import { selectInstructorsByCourseId } from "@/reporting/data/selectors/instructorSelectors";

export const useInstructors = (courseIds: number[]) => {
    const dispatch = useDispatch<AppDispatch>();
    const instructorsByCourseId = useSelector(selectInstructorsByCourseId);

    // Callers often pass a freshly built array on every render; key the effect on its contents
    // so an equivalent list does not re-run it.
    const courseIdsKey = courseIds.join(",");
    const stableCourseIds = useMemo(
        () => courseIdsKey ? courseIdsKey.split(",").map(Number) : [],
        [courseIdsKey]
    );

    useEffect(() => {
        // fetchInstructorsThunk's condition skips courses that are already loading or loaded.
        stableCourseIds.forEach(courseId => {
            dispatch(fetchInstructorsThunk({ courseId }));
        });
    }, [stableCourseIds, dispatch]);

    return {
        instructorsByCourseId,
    }
};
