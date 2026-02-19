import {testResult} from "@publish/fixesAndUpdates/validations/utils";

import genAssignmentGroups from "@ueu/ueu-canvas/content/assignments/genAssignmentGroups";
import {Course} from "@ueu/ueu-canvas/course/Course";
import deleteAssignmentGroup from "@ueu/ueu-canvas/content/assignments/deleteAssignmentGroup";
import {CourseFixValidation} from "@publish/fixesAndUpdates/validations/types";
import {AssignmentGroup} from "@ueu/ueu-canvas/content/types";

export const emptyAssignmentCategories: CourseFixValidation<Course, AssignmentGroup[]> = {
    name: "Empty assignment categories",
    description: "There are assignment categories with no entries",
    async run(course) {
        const groupGen = genAssignmentGroups(course.id);
        const emptyGroups:AssignmentGroup[] = [];
        for await(const assignmentGroup of groupGen) {
            if(assignmentGroup.assignments.length === 0) emptyGroups.push(assignmentGroup)
        }
        return testResult(emptyGroups.length === 0, {
            failureMessage: `Groups ${emptyGroups.map(a => `'${a.name}'`).join(', ')} are empty.`,
            userData: emptyGroups
        })
    },
    async fix(course, result) {
        if(!result) result = await this.run(course);
        if(result.success) return testResult('not run', {notFailureMessage: "No empty groups to fix"});
        if(!result.userData) return testResult(false, { failureMessage: "Unable to find bad groups. Failed to fix."})
        const deletedIds = [] as number[];
        try {
            for (const assignmentGroup of result.userData) {
                await deleteAssignmentGroup(course.id, assignmentGroup.id);
                deletedIds.push(assignmentGroup.id);
            }
            return await this.run(course);

        } catch(e) {
            const failureMessage = e instanceof Error? e.message : "Failed due to unknown error."
            return testResult(false, {
                failureMessage,
                userData: [] as AssignmentGroup[],
            })
        }

    }
}

export default emptyAssignmentCategories;