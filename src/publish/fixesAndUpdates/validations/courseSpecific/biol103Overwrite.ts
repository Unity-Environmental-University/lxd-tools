import {
    badContentFixFunc,
    badContentRunFunc, testResult
} from "@publish/fixesAndUpdates/validations/utils";
import {IContentHaver} from "@/canvas/course/courseTypes";
import {Course} from "@/canvas/course/Course";
import {IPageData} from "@/canvas/content/pages/types";
import {Temporal} from "temporal-polyfill";
import {oldDateToPlainDate} from "@/date";
import {CourseValidation, TextReplaceValidation} from "@publish/fixesAndUpdates/validations/types";

export const biol103OverwriteCheck: CourseValidation = {
    courseCodes: ['BIOL103'],
    name: "Accidental Import",
    description: `Checking for bad imports on BIOL103`,

    run: async (course:Course) => {
        const frontPage = await course.getFrontPage();
        const page = frontPage?.rawData as IPageData | undefined;

        if(page) {
            const lastUpdatedOld = new Date(page.updated_at);
            const lastUpdated = oldDateToPlainDate(lastUpdatedOld);

            const courseStart = oldDateToPlainDate(new Date(course.rawData.start_at))

            if (courseStart.until(lastUpdated).months > 2) {
                return testResult(false, {
                    failureMessage: `${course.courseCode} updated much more recently than start date: ${course.rawData.start_at}`
                })
            }
        }

        return testResult(true);
    },
}


export default [biol103OverwriteCheck]