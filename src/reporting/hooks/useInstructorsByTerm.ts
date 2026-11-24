import { useMemo } from "react";
import { useCourses } from "@/reporting/hooks/useCourses";
import { useInstructors } from "@/reporting/hooks/useInstructors";
import {ITermData} from "@ueu/ueu-canvas/term/Term";
import {IUserData} from "@ueu/ueu-canvas";

type UseInstructorsByTermProps = {
    selectedTerms?: ITermData[],
}

const lastLoginTime = (user: IUserData) => {
    const time = user.last_login ? new Date(user.last_login).getTime() : NaN;
    return Number.isNaN(time) ? -Infinity : time;
}

export const useInstructorsByTerm = ({selectedTerms}: UseInstructorsByTermProps) => {
    const courses = useCourses(selectedTerms); // Get courses for the selected terms
    const courseIds = useMemo(() => courses.map(course => course.id), [courses]);

    const { instructorsByCourseId } = useInstructors(courseIds); // Get instructors

    return useMemo(() => {
        // De-duplicate instructors who teach more than one of the courses
        const allInstructors = new Map<number, IUserData>();

        courseIds.forEach((courseId) => {
            const instructors = instructorsByCourseId[courseId] || [];

            instructors.forEach((instructor) => {
                if (!instructor) return;
                const existing = allInstructors.get(instructor.id);
                if (!existing || lastLoginTime(instructor) > lastLoginTime(existing)) {
                    allInstructors.set(instructor.id, instructor);
                }
            });
        });

        // Most recent login first
        return Array.from(allInstructors.values()).sort((a, b) => lastLoginTime(b) - lastLoginTime(a));
    }, [instructorsByCourseId, courseIds]);
};
