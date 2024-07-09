import {CourseValidation, ValidationResult} from "../publish/fixesAndUpdates/validations/index";
import courseContent from "../publish/fixesAndUpdates/validations/courseContent";
import courseSettings from "../publish/fixesAndUpdates/validations/courseSettings";
import syllabusTests from "../publish/fixesAndUpdates/validations/syllabusTests";
import {Course} from "@/canvas/course/Course";

export function bpify(code: string) {
    let [, prefix] = code.match(/^([^_ ]*)[_ ]/) || [null, ''];
    let [, body] = code.match(`${prefix || ''}[ _]?(.*)`) || [null, code];
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