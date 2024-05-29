/// Course Settings
import {
    ICourseSettingsHaver,
    IGradingStandardsHaver,
    ILatePolicyHaver,
    IModulesHaver,
    IPagesHaver
} from "../../../canvas/course/index";
import {CourseValidationTest, testResult} from "./index";
import {config} from "dotenv";

export const extensionsToTest = ['Dropout Detective', "BigBlueButton"];
export const extensionsInstalledTest: CourseValidationTest = {
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
            message: Array.from(missing).join(',') + ' missing from enabled navigation tabs.'
        }
    }
}
export const announcementsOnHomePageTest: CourseValidationTest = {
    name: "Show Announcements",
    description: 'Confirm under "Settings" --> "more options" that the "Show announcements" box is checked',
    run: async (course) => {
        const settings = await course.getSettings();
        const success = !!settings.show_announcements_on_home_page
        return {
            success,
            message: success ? 'success' : "'show announcements on home page' not turned on"
        }
    }
}
export const latePolicyTest: CourseValidationTest<ILatePolicyHaver> = {
    name: "Late Policy Correct",
    description: "Go to the gradebook and  click the cog in the upper right-hand corner, then check the box to automatically apply a 0 for missing submissions; or confirm that this setting has already been made.",
    run: async (course: ILatePolicyHaver, config) => {
        const latePolicy = await course.getLatePolicy(config);
        return testResult(
            latePolicy?.missing_submission_deduction_enabled,
            ["'Automatically apply grade for missing submission' not turned on"]
        );
    }
}
export const noEvaluationTest: CourseValidationTest<IPagesHaver> = {
    name: "Remove Course Evaluation",
    description: 'Course Eval page (in final module) entirely deleted from the course.',
    run: async (course, config) => {
        config = {...config};
        config.queryParams = {...config.queryParams, search_term: 'Course Evaluation'}
        const pages = await (course.getPages(config))
        const evalPages = pages.filter(page => /Course Evaluation/i.test(page.name));
        const success = evalPages.length === 0;
        const result = testResult(success, ["Course eval found"]);
        if (!success) result.links = evalPages.map(page => page.htmlContentUrl);
        return result;
    }
}


export const badGradingPolicyTest: CourseValidationTest<IModulesHaver & IGradingStandardsHaver> = {
    name: "Correct grading policy selected",
    description: "5 week courses have REVISED DE Undergraduate Programs grading scheme selected. 8 week courses have  DE Graduate Programs grading scheme selected",
    run: async (course, config) => {
        try {
            const gradingStandards = await course.getAvailableGradingStandards(config);
            const currentGradingStandard = await course.getCurrentGradingStandard(config);

            const modulesByWeekNumber = await course.getModulesByWeekNumber(config);
            const isGrad = modulesByWeekNumber.hasOwnProperty(8);
            if (!gradingStandards) return testResult(false, [`Grading standards not accessible from ${course.id}`])

            const [undergradStandard] = gradingStandards.filter(standard => /REVISED DE Undergraduate Programs/.test(standard.title))
            const [gradStandard] = gradingStandards.filter(standard => /DE Graduate Programs/.test(standard.title))
            const expectedStandard = isGrad ? gradStandard : undergradStandard;

            let success = currentGradingStandard?.title == expectedStandard.title;
            const result = testResult(success, [`Grading standard set to ${currentGradingStandard?.title} expected to be ${expectedStandard.title}`]);

            if (!success) result.links = [`/courses/${course.id}/settings`];
            return result;
        } catch (e) {
            return {
                success: false,
                message: e instanceof Error? [e.message, e.stack ?? ''] : ['ERROR']
            }
        }
    }
}

export default [
    noEvaluationTest,
    latePolicyTest,
    extensionsInstalledTest,
    badGradingPolicyTest
]