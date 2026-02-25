import { useSelector } from "react-redux";
import { selectCourses } from "@/reporting/data/selectors/courseSelectors";
import { ICourseData, ITermData } from "@ueu/ueu-canvas";

const sortCourseByName = (a: ICourseData, b: ICourseData) => a.name.localeCompare(b.name);

export const useCourses = (selectedTerms?: ITermData[]) => {
    const courses = useSelector(selectCourses);

    const termIds = selectedTerms?.map(t => t.id) ?? []

    // return useMemo(() => {
        const filtered = courses.filter(c => {
            if (!c.enrollment_term_id) return false; // Exclude undefined cases

            // Normalize to an array for uniform comparison
            const enrollmentTermIds = Array.isArray(c.enrollment_term_id) ? c.enrollment_term_id : [c.enrollment_term_id];

            return enrollmentTermIds.some(id => termIds.includes(id));
        });

        return filtered.sort(sortCourseByName);
    // }, [courses, termIds]);
};
