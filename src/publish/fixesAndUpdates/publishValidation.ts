import {CourseValidationTest} from "./CourseValidator";
import {ILatePolicyHaver, IPagesHaver, ISyllabusHaver} from "../../canvas/index";
import {getPlainTextFromHtml, ICanvasCallConfig} from "../../canvas/canvasUtils";
import {ILatePolicyData} from "../../canvas/canvasDataDefs";
export type UnitTestResult = {
    success: boolean,
    message: string,
    link?: string
}

//Syllabus Tests
export const finalNotInGradingPolicyParaTest: CourseValidationTest<ISyllabusHaver> = {
    name: "Remove Final",
    description: 'Remove "final" from the grading policy paragraphs of syllabus',
    run: async (course, config) => {
        const syllabus = await course.getSyllabus(config);
        const match = /off the final grade/gi.test(syllabus);
        return testResult(!match, "'off the final grade' found in syllabus");
    }
}

export const communication24HoursTest: CourseValidationTest<ISyllabusHaver> = {
    name: "Syllabus - Within 24 Hours",
    description: "Revise the top sentence of the \"Communication\" section of the syllabus to read: \"The instructor will " +
        "conduct all correspondence with students related to the class in Canvas, and you should " +
        "expect to receive a response to emails within 24 hours.\"",
    run: async (course, config) => {
        const syllabus = await course.getSyllabus();
        const testString = 'The instructor will conduct all correspondence with students related to the class in Canvas, and you should expect to receive a response to emails within 24 hours'.toLowerCase();
        const el = document.createElement('div');
        el.innerHTML = syllabus;
        const text = el.textContent?.toLowerCase() || "";
        return testResult(
        text.includes(testString) && !text.match(/48 hours .* weekends/),
        "Communication language section in syllabus does not look right."
        )
    }
}

export const courseCreditsInSyllabusTest: CourseValidationTest<ISyllabusHaver> = {
    name: "Syllabus Credits",
    description: 'Credits displayed in summary box of syllabus',
    run: async (course: ISyllabusHaver, config) => {
        const syllabus = await course.getSyllabus(config);
        const el = document.createElement('div');
        el.innerHTML = syllabus;
        let strongs = el.querySelectorAll('strong');
        const creditList = Array.from(strongs).filter((strong) => /credits/i.test(strong.textContent || ""));
        return testResult(creditList && creditList.length > 0,"Can't find credits in syllabus")

    }
}

export const aiPolicyInSyllabusTest: CourseValidationTest<ISyllabusHaver> = {
    name: "AI Policy in Syllabus Test",
    description: "The AI policy is present in the syllabus",
    run: async (course: ISyllabusHaver, config) => {
        const text = await course.getSyllabus(config);
        const success = text.includes('Generative Artificial Intelligence');
        return testResult(success, `Can't find AI boilerplate in syllabus`)
    }
}


export const bottomOfSyllabusLanguageTest: CourseValidationTest<ISyllabusHaver> = {
    name: "Bottom-of-Syllabus Test",
    description: "Replace language at the bottom of the syllabus with: \"Learning materials for Weeks 2 forward are organized with the rest of the class in your weekly modules. The modules will become available after you've agreed to the Honor Code, Code of Conduct, and Tech for Success requirements on the Course Overview page, which unlocks on the first day of the term.\" (**Do not link to the Course Overview Page**)",
    run: async (course, config) => {
        const text = getPlainTextFromHtml(await course.getSyllabus(config));
        const success = text.toLowerCase().includes(`The modules will become available after you've agreed to the Honor Code, Code of Conduct, and Tech for Success requirements on the Course Overview page, which unlocks on the first day of the term.`.toLowerCase())
        return testResult(
            success,
            "Text at the bottom of the syllabus looks incorrect."
        )
    }
}

/// Course Settings
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
            message: success? 'success' : "'show announcements on home page' not turned on"
        }
    }
}

/// Etc

export const latePolicyTest: CourseValidationTest<ILatePolicyHaver> = {
    name: "Late Policy Correct",
    description: "Go to the gradebook and  click the cog in the upper right-hand corner, then check the box to automatically apply a 0 for missing submissions; or confirm that this setting has already been made.",
    run: async (course: ILatePolicyHaver, config) => {
        const latePolicy = await course.getLatePolicy(config);
        console.log(latePolicy);

        const result = testResult(
            latePolicy.missing_submission_deduction_enabled,
            "'Automatically apply grade for missing submission' not turned on");
        return result;
    }
}

export const noEvaluationTest: CourseValidationTest<IPagesHaver> = {
    name: "Course Evaluation removed",
    description: 'Course Eval page (in final module) entirely deleted from the course.',
    run: async(course, config) => {
        config = { ...config};
        config.queryParams = { ...config.queryParams, search_term: 'Course Evaluation'}
        const evalPages = await(course.getPages(config));
        const success = evalPages.length === 0;
        const result = testResult(success,"Course eval found")
        return result;
    }
}

function testResult(success: boolean, failureMessage: string, successMessage = 'success') {
    return {
        success,
        message: success? successMessage : failureMessage
    }
}


export default [
    announcementsOnHomePageTest,
    extensionsInstalledTest,
    courseCreditsInSyllabusTest,
    finalNotInGradingPolicyParaTest,
    communication24HoursTest,
    aiPolicyInSyllabusTest,
    bottomOfSyllabusLanguageTest,
    latePolicyTest,
    noEvaluationTest
]

