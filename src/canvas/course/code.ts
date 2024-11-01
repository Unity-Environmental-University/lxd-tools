import {COURSE_CODE_REGEX} from "@/canvas/course/Course";

export function parseCourseCode(code: string) {
    const match = COURSE_CODE_REGEX.exec(code);
    if (!match) return null;
    const prefix = match[1] || "";
    const courseCode = match[2] || "";
    if (prefix.length > 0) {
        return `${prefix}_${courseCode}`;
    }
    return courseCode;
}

export function baseCourseCode(code: string) {
    const match = COURSE_CODE_REGEX.exec(code);
    if (!match) return null;
    return match[2];
}

export function stringIsCourseCode(code: string) {
    return COURSE_CODE_REGEX.exec(code);
}

export class MalformedCourseCodeError extends Error {
    name = "MalformedCourseCodeError";
    courseCode:string|null;
    constructor(courseCode:string|null, message?: string, options?:ErrorOptions) {
        if(!message) message = `${courseCode} is not a valid course code`;
        super(message, options);
        this.courseCode = courseCode;
    }
}