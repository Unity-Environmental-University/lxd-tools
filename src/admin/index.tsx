import {ValidationResult} from "@publish/fixesAndUpdates/validations/utils";
import courseContent from "@publish/fixesAndUpdates/validations/courseContent";
import courseSettings from "../publish/fixesAndUpdates/validations/courseSettings";
import syllabusTests from "../publish/fixesAndUpdates/validations/syllabusTests";
import {Course} from "@ueu/ueu-canvas/course/Course";
import {CourseValidation} from "@publish/fixesAndUpdates/validations/types";

export function bpify(code: string) {
    const [, prefix] = code.match(/^([^_ ]*)[_ ]/) || [null, ''];
    const [, body] = code.match(`${prefix || ''}[ _]?(.*)`) || [null, code];
    return `BP_${body}`;
}

export interface IIncludesTestAndCourseId extends ValidationResult {
    test: CourseValidation,
    courseId: number,
}

export const tests: CourseValidation<Course, any, any>[] = [
    ...courseContent,
    ...courseSettings,
    ...syllabusTests,
]