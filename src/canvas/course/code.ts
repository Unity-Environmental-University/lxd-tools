import {COURSE_CODE_REGEX} from "@/canvas/course/Course";

export function parseCourseCode(code: string) {
    let match = COURSE_CODE_REGEX.exec(code);
    if (!match) return null;
    let prefix = match[1] || "";
    let courseCode = match[2] || "";
    if (prefix.length > 0) {
        return `${prefix}_${courseCode}`;
    }
    return courseCode;
}

export function baseCourseCode(code: string) {
    let match = COURSE_CODE_REGEX.exec(code);
    if (!match) return null;
    return match[2];
}

export function stringIsCourseCode(code: string) {
    return COURSE_CODE_REGEX.exec(code);
}