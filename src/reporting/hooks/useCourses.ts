import { useMemo } from "react";
import { useSelector } from "react-redux";
import { selectCourseIdsByTermId, selectCoursesById } from "@/reporting/data/selectors/courseSelectors";
import { ICourseData, ITermData } from "@ueu/ueu-canvas";

const sortCourseByName = (a: ICourseData, b: ICourseData) => a.name.localeCompare(b.name);

/**
 * The account's courses in the selected terms, as found by the account course search.
 * Courses stored only for display (fetched one at a time from instructors' enrollments)
 * are not indexed by term and so are never included.
 */
export const useCourses = (selectedTerms?: ITermData[]) => {
    const courseIdsByTermId = useSelector(selectCourseIdsByTermId);
    const coursesById = useSelector(selectCoursesById);

    // Key on the term ids so a new-but-equivalent selectedTerms array does not produce a new result
    const termIdsKey = selectedTerms?.map(t => t.id).join(",") ?? "";

    return useMemo(() => {
        const termIds = termIdsKey ? termIdsKey.split(",").map(Number) : [];
        const courseIds = new Set(termIds.flatMap(termId => courseIdsByTermId[termId] ?? []));
        const courses = Array.from(courseIds)
            .map(id => coursesById[id])
            .filter((course): course is ICourseData => typeof course !== "undefined");

        return courses.sort(sortCourseByName);
    }, [courseIdsByTermId, coursesById, termIdsKey]);
};
