import {CourseValidation, testResult} from "./index";
import {Course} from "../../../canvas/course/Course";


export const rubricsTiedToGradesTest: CourseValidation<Course> = {
    name: "Rubrics update grades",
    description: "All assignment rubrics have the ",
    run: async (course, config) => {
        try {
            let success = false;
            let message: string[] = [];

            return {
                success,
                message,
            }
        } catch (e) {
            return {
                success: false,
                message: e instanceof Error ? [e.message, e.stack ?? ''] : ['ERROR']
            }
        }
    }
}