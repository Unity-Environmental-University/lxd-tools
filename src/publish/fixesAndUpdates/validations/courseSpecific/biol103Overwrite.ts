import {
    testResult
} from "@publish/fixesAndUpdates/validations/utils";
import {Course} from "@ueu/ueu-canvas/course/Course";
import {IPageData} from "@ueu/ueu-canvas/content/pages/types";
import {oldDateToPlainDate} from "@/date";
import {CourseValidation} from "@publish/fixesAndUpdates/validations/types";

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