import { useMemo } from "react";
import { useCourses } from "@/reporting/hooks/useCourses";
import { useInstructors } from "@/reporting/hooks/useInstructors";
import {ITermData} from "@canvas/term/Term";
import {IUserData} from "@canvas/canvasDataDefs";

type UseInstructorsByTermProps = {
    selectedTerms?: ITermData[],
}

export const useInstructorsByTerm = ({selectedTerms}: UseInstructorsByTermProps) => {
    const courses = useCourses(selectedTerms); // Get courses for the selected terms
    const courseIds = courses.map(course => course.id);

    const { instructorsByCourseId } = useInstructors(courseIds); // Get instructors

    return useMemo(() => {
        let allInstructors = new Map<symbol|string|number, { id: number, name: string, last_login: string }>();

        courseIds.forEach((courseId) => {
            const instructors = instructorsByCourseId[courseId] || [];

            instructors.forEach(({id, name, last_login}) => {
                const lastLastLogin = allInstructors.get(id)?.last_login;
                if (!allInstructors.has(id) ||  !lastLastLogin|| new Date(last_login) > new Date(lastLastLogin)) {
                    allInstructors.set(id, { id, name, last_login });
                }
            });
        });

        const sortedIds = Array.from(allInstructors.values()).sort((a, b) =>
            new Date(b.last_login).getTime() - new Date(a.last_login).getTime()
        ).map(({id}) => id);

        return sortedIds.flatMap((id )=> instructorsByCourseId[id]).filter(user => typeof user !== 'undefined');
    }, [instructorsByCourseId, courseIds]);
};
