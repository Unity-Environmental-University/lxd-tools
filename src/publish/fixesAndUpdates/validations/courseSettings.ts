/// Course Settings
import {errorMessageResult, testResult, ValidationResult} from "./utils";
import {
    IGradingStandardData,
    ILatePolicyHaver,
    IModulesHaver,
    IPagesHaver
} from "@canvas/course/courseTypes";
import {Course} from "@canvas/course/Course";
import assert from "assert";
import {setGradingStandardForCourse} from "@canvas/course";

import {ICourseData, ICourseSettings} from "@/canvas/courseTypes";
import {CourseFixValidation, CourseValidation} from "@publish/fixesAndUpdates/validations/types";

export const extensionsInstalledTest: CourseValidation<Course> = {
    name: "Extensions Installed",
    description: 'Dropout Detective in nav bar',
    run: async (course, config) => {
        const missing: Set<string> = new Set(extensionsToTest);
        const tabs = await course.getTabs(config);
        for (const tab of tabs) {
            if (missing.has(tab.label) && !tab.hidden) missing.delete(tab.label);
        }
        return {
            success: missing.size === 0,
            messages: [{bodyLines: [Array.from(missing).join(',') + ' missing from enabled navigation tabs.']}]
        }
    }
}
export const extensionsToTest = ['Dropout Detective'];


/**
 * Creates a validation and fix mechanism for a specific course setting.
 *
 * This function generates a structure that includes methods to check
 * the current state of a course setting and to attempt to fix it if
 * it does not match the expected value. It supports both retrieval
 * of current settings and an update mechanism that adjusts the
 * specified setting to the desired value.
 *
 * @template SettingNameType - The type of the setting name, which must
 * be a key of the ICourseSettings interface.
 * @param {SettingNameType} settingName - The name of the course setting
 * to validate and potentially fix.
 * @param {ICourseSettings[SettingNameType]} correctSettingValue - The
 * expected value that the specified course setting should hold (e.g.,
 * true or false for boolean settings).
 *
 * @returns {CourseFixValidation} An object containing:
 * - name: A formatted string representing the test's name.
 * - description: A detailed string describing what the test checks and fixes.
 * - run: An asynchronous method that checks the current state of the setting.
 * - fix: An asynchronous method that attempts to update the setting to the correct value.
 */
export function createSettingsValidation<
    SettingNameType extends keyof ICourseSettings,
>(settingName: SettingNameType, correctSettingValue: ICourseSettings[SettingNameType]): CourseFixValidation {
    const formattedSettingName = settingName.replaceAll('_', ' ');
    return {
        name: `Course Settings: "${formattedSettingName}"`,
        description: `"${formattedSettingName}" should be ${correctSettingValue}`,
        run: async (course: Course): Promise<ValidationResult> => {
            const settings = await course.getSettings();
            const success = settings[settingName] == correctSettingValue;
            const failureMessage = `Setting "${settingName}" not set to ${correctSettingValue}`;
            return testResult(success, {failureMessage});
        },
        fix: async (course: Course): Promise<ValidationResult> => {
            try {
                const response = await course.updateSettings({[settingName]: correctSettingValue});
                return testResult(response[settingName] == correctSettingValue, { failureMessage: `Failed to turn "${settingName}" on.`});
            } catch (e) {
                if (e instanceof Error) {
                    return testResult(false, {failureMessage: e.toString()});
                } else {
                    throw new Error("Threw a non-error: " + String(e));
                }
            }
        }
    };
}

export const announcementsOnHomePageTest = createSettingsValidation('show_announcements_on_home_page', true);
export const noStudentEditDiscussions = createSettingsValidation('allow_student_discussion_editing', false)
export const noStudentCreateDiscussions = createSettingsValidation('allow_student_discussion_topics', false)



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

            const success = currentGradingStandard?.title == expectedStandard.title;

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
    badGradingPolicyTest,
    noStudentCreateDiscussions,
    noStudentEditDiscussions
]