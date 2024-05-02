import {CourseValidationTest} from "./CourseValidator";
import {ILatePolicyHaver, IPagesHaver, ISyllabusHaver} from "../../canvas/index";
import {getPlainTextFromHtml} from "../../canvas/canvasUtils";

export type UnitTestResult<T = undefined> = {
    success: boolean,
    message: string,
    links?: string[],
    userData?: T
}

//Syllabus Tests
export const finalNotInGradingPolicyParaTest: CourseValidationTest<ISyllabusHaver> = {
    name: "Remove Final",
    description: 'Remove "final" from the grading policy paragraphs of syllabus',
    run: async (course, config) => {
        const syllabus = await course.getSyllabus(config);
        const match = /off the final grade/gi.test(syllabus);
        return testResult(!match, "'off the final grade' found in syllabus", [`/course/${course.id}/syllabus`]
        );
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
            "Communication language section in syllabus does not look right.",
            [`/course/${course.id}/syllabus`]
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
        return testResult(
            creditList && creditList.length > 0,
            "Can't find credits in syllabus",
            [`/course/${course.id}/syllabus`]
        )

    }
}

export const aiPolicyInSyllabusTest: CourseValidationTest<ISyllabusHaver> = {
    name: "AI Policy in Syllabus Test",
    description: "The AI policy is present in the syllabus",
    run: async (course: ISyllabusHaver, config) => {
        const text = await course.getSyllabus(config);
        const success = text.includes('Generative Artificial Intelligence');
        return testResult(success, `Can't find AI boilerplate in syllabus`, [`/course/${course.id}/syllabus`]
        )
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
            "Text at the bottom of the syllabus looks incorrect.",
            [`/course/${course.id}/syllabus`]
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
            message: success ? 'success' : "'show announcements on home page' not turned on"
        }
    }
}

/// Etc

export const latePolicyTest: CourseValidationTest<ILatePolicyHaver> = {
    name: "Late Policy Correct",
    description: "Go to the gradebook and  click the cog in the upper right-hand corner, then check the box to automatically apply a 0 for missing submissions; or confirm that this setting has already been made.",
    run: async (course: ILatePolicyHaver, config) => {
        const latePolicy = await course.getLatePolicy(config);
        return testResult(
            latePolicy.missing_submission_deduction_enabled,
            "'Automatically apply grade for missing submission' not turned on");
    }
}

export const noEvaluationTest: CourseValidationTest<IPagesHaver> = {
    name: "Remove Course Evaluation",
    description: 'Course Eval page (in final module) entirely deleted from the course.',
    run: async (course, config) => {
        config = {...config};
        config.queryParams = {...config.queryParams, search_term: 'Course Evaluation'}
        const evalPages = await (course.getPages(config));
        const success = evalPages.length === 0;
        const result = testResult(success, "Course eval found");
        if (!success) result.links = evalPages.map(page => page.htmlContentUrl);
        return result;
    }
}

export const weeklyObjectivesTest: CourseValidationTest<IPagesHaver> = {
    name: "Learning Objectives -> Weekly Objectives",
    description: 'Make sure weekly objectives are called "Weekly Objectives" and not "Learning Objectives" throughout',
    run: async (course, config) => {
        let overviews = await course.getPages({
            ...config,
            queryParams: {...config?.queryParams, search_term: 'Overview', include: ['body']}
        });
        overviews = overviews.filter(overview => /week \d overview/i.test(overview.name));

        const badOverviews = overviews.filter(overview => {
            const el = document.createElement('div');
            el.innerHTML = overview.body;
            const h2s = el.querySelectorAll('h2');
            const weeklyObjectivesHeaders = Array.from(h2s).filter(h2 => /Weekly Objectives/i.test(h2.textContent || ''))
            return weeklyObjectivesHeaders.length === 0;

        })
        const success = badOverviews.length === 0;
        const result = testResult(
            badOverviews.length === 0,
            "No weekly objectives header found on " + badOverviews.map(page => page.name).sort().join(','))
        if (!success) result.links = badOverviews.map(page => page.htmlContentUrl)
        return result;
    }
}

function testResult(success: boolean, failureMessage: string, links?: string[], successMessage = 'success'): UnitTestResult {
    const response: UnitTestResult = {
        success,
        message: success ? successMessage : failureMessage

    }
    if (links) response.links = links;
    return response;
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
    noEvaluationTest,
    weeklyObjectivesTest
]

