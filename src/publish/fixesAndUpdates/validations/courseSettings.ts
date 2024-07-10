/// Course Settings
import {CourseFixValidation, CourseValidation, errorMessageResult, stringsToMessageResult, testResult} from "./index";
import {config} from "dotenv";
import {
    ICourseSettingsHaver, IGradingStandardData,
    IGradingStandardsHaver,
    ILatePolicyHaver,
    IModulesHaver,
    IPagesHaver
} from "../../../canvas/course/courseTypes";
import {Course} from "../../../canvas/course/Course";
import assert from "assert";
import {setGradingStandardForCourse} from "@/canvas/course";

import {ICourseData} from "@/canvas/courseTypes";

export const extensionsToTest = ['Dropout Detective', "BigBlueButton"];
export const extensionsInstalledTest: CourseValidation<Course> = {
    name: "Extensions Installed",
    description: 'Big Blue Button and Dropout Detective in nav bar',
    run: async (course, config) => {
        const missing: Set<string> = new Set(extensionsToTest);
        const tabs = await course.getTabs(config);
        for (let tab of tabs) {
            if (missing.has(tab.label) && !tab.hidden) missing.delete(tab.label);
        }
        return {
            success: missing.size === 0,
            messages: [{bodyLines: [Array.from(missing).join(',') + ' missing from enabled navigation tabs.']}]
        }
    }
}
export const announcementsOnHomePageTest: CourseValidation<Course> = {
    name: "Show Announcements",
    description: 'Confirm under "Settings" --> "more options" that the "Show announcements" box is checked',
    run: async (course) => {
        const settings = await course.getSettings();
        const success = !!settings.show_announcements_on_home_page
        const failureMessage = "'show announcements on home page' not turned on";
        return testResult(success, {failureMessage})
    }
}
export const latePolicyTest: CourseValidation<ILatePolicyHaver> = {
    name: "Late Policy Correct",
    description: "Go to the gradebook and  click the cog in the upper right-hand corner, then check the box to automatically apply a 0 for missing submissions; or confirm that this setting has already been made.",
    run: async (course: ILatePolicyHaver, config) => {
        const latePolicy = await course.getLatePolicy(config);
        const failureMessage = "'Automatically apply grade for missing submission' not turned on";
        return testResult(latePolicy?.missing_submission_deduction_enabled, {failureMessage});
    }
}
export const noEvaluationTest: CourseValidation<IPagesHaver> = {
    name: "Remove Course Evaluation",
    description: 'Course Eval page (in final module) entirely deleted from the course.',
    run: async (course, config) => {
        config = {...config};
        config.queryParams = {...config.queryParams, search_term: 'Course Evaluation'}
        const pages = await (course.getPages(config))
        const evalPages = pages.filter(page => /Course Evaluation/i.test(page.name));
        const success = evalPages.length === 0;
        const result = testResult(success, {failureMessage: "Course eval found"});
        if (!success) result.links = evalPages.map(page => page.htmlContentUrl);
        return result;
    }
}


async function isGradByModules(course: IModulesHaver) {
    const modulesByWeekNumber = await course.getModulesByWeekNumber();
    return modulesByWeekNumber.hasOwnProperty(8);
}

export function getStandards(gradingStandards: (IGradingStandardData| undefined)[]) {

    const [grad] = gradingStandards.filter(standard => standard && /DE Graduate Programs/.test(standard.title));
    const [underGrad] = gradingStandards.filter(standard => standard && /REVISED DE Undergraduate Programs/.test(standard.title));
        return {
            grad, underGrad
        }
}


type BadGradingUserData = {
    expectedStandard:IGradingStandardData | undefined,
    gradingStandards:IGradingStandardData[],
    currentGradingStandard:IGradingStandardData | null,
    gradStandard:IGradingStandardData | undefined,
    underGradStandard:IGradingStandardData | undefined,
} | undefined

export const badGradingPolicyTest: CourseFixValidation<Course, BadGradingUserData, ICourseData | BadGradingUserData> = {
    name: "Correct grading policy selected",
    description: "5 week courses have REVISED DE Undergraduate Programs grading scheme selected. 8 week courses have  DE Graduate Programs grading scheme selected",
    async run(course) {
        try {
            const gradingStandards = await course.getAvailableGradingStandards();
            const currentGradingStandard = await course.getCurrentGradingStandard();
            if (!gradingStandards) return testResult(false, {
                failureMessage: `Grading standards not accessible from ${course.id}`
            })

            const isGrad = await isGradByModules(course);
            const {grad: gradStandard, underGrad: underGradStandard} = getStandards(gradingStandards);
            const expectedStandard = await isGradByModules(course) ? gradStandard : underGradStandard;



            if (!expectedStandard || !currentGradingStandard) {
                return testResult(false, {
                    failureMessage: (isGrad ? "Graduate" : "Undergraduate") + " grading standard not found. You may not have " +
                        "permissions to view grading standards on the root account.",
                })
            }

            const userData:BadGradingUserData = {
                expectedStandard,
                gradingStandards,
                currentGradingStandard,
                gradStandard,
                underGradStandard,
            }

            let success = currentGradingStandard?.title == expectedStandard.title;

            const failureMessage = [{
                bodyLines: [`Grading standard set to ${currentGradingStandard?.title} expected to be ${expectedStandard.title}`],
                links: [`/courses/${course.id}/settings`]
            }];

            return testResult<typeof userData>(success, {
                failureMessage,
                userData
            });
        } catch (e) {
            return errorMessageResult(e);
        }
    },
    async fix(course) {
        try {
            const vResult = await this.run(course);
            if (vResult.success) return vResult;
            const {expectedStandard} = vResult.userData!;
            if(!expectedStandard) return testResult(false, {failureMessage: "You likely dont have permission to access grading standards."})
            const courseDataResults = await setGradingStandardForCourse(course.id, expectedStandard.id);
            assert(courseDataResults.grading_standard_id.toString() === expectedStandard.id.toString())
            return testResult(true,{userData: courseDataResults})
        } catch (e) {
            return errorMessageResult(e);
        }
    }
}

export default [
    noEvaluationTest,
    latePolicyTest,
    announcementsOnHomePageTest,
    extensionsInstalledTest,
    badGradingPolicyTest
]