import {CourseValidationTest} from "./CourseValidator";
import {ISyllabusHaver} from "../../canvas/index";

export type UnitTestResult = {
    success: boolean,
    message: string
}

///Syllabus Fixes



const finalNotInGradingPolicyParaTest:CourseValidationTest<ISyllabusHaver> = {
    name: "Remove Final",
    description: 'Remove "final" from the grading policy paragraphs of syllabus',
    run: async (course, config) => {
        const syllabus = await course.getSyllabus(config);
        const match = /off the final grade/gi.test(syllabus);
        return {
            success: !match,
            message: "'off the final grade' found in syllabus"
        }
    }
}

const communication24HoursTest: CourseValidationTest<ISyllabusHaver> = {
    name: "Syllabus - Withing 24 Hours",
    description: "Revise the top sentence of the \"Communication\" section of the syllabus to read: \"The instructor will " +
        "conduct all correspondence with students related to the class in Canvas, and you should " +
        "expect to receive a response to emails within 24 hours.\"",
    run: async (course, config) => {
        const syllabus = await course.getSyllabus();
        const testString = 'The instructor will conduct all correspondence with students related to the class in Canvas, and you should expect to receive a response to emails within 24 hours'.toLowerCase();
        const el = document.createElement('div');
        el.innerHTML = syllabus;
        const text = el.textContent?.toLowerCase() || "";
        return {
            success: text.includes(testString) && !text.match(/48 hours .* weekends/),
            message: "Communication language section in syllabus does not look right."
        }
    }
}

const courseCreditsInSyllabusTest:CourseValidationTest<ISyllabusHaver> = {
    name: "Syllabus Credits",
    description: 'Credits displayed in summary box of syllabus',
    run: async (course: ISyllabusHaver, config) => {
        const syllabus = await course.getSyllabus(config);
        const el = document.createElement('div');
        el.innerHTML = syllabus;
        let strongs = el.querySelectorAll('strong');
        const creditList = Array.from(strongs).filter((strong) => /credits/i.test(strong.textContent || ""));
        return {
            success: creditList && creditList.length > 0,
            message: "Can't find credits in syllabus"
        }
    }
}

const aiPolicyInSyllabusTest:CourseValidationTest<ISyllabusHaver> = {
    name: "AI Policy in Syllabus Test",
    description: "The AI policy is present in the syllabus",
    run: async (course: ISyllabusHaver, config ) => {
        const text = await course.getSyllabus(config);
        const success = text.includes('Generative Artificial Intelligence');
        return {
            success,
            message: `Can't find AI boilerplate in syllabus`
        }
    }
}


const bottomOfSyllabusLanguageTest: CourseValidationTest<ISyllabusHaver> = {
    name: "Bottom-of-Syllabus Test",
    description: "Replace language at the bottom of the syllabus with: \"Learning materials for Weeks 2 forward are organized with the rest of the class in your weekly modules. The modules will become available after you've agreed to the Honor Code, Code of Conduct, and Tech for Success requirements on the Course Overview page, which unlocks on the first day of the term.\" (**Do not link to the Course Overview Page**)",
    run: async(course, config) => {
        const text = getPlainTextFromHtml(await course.getSyllabus(config));
        const success = text.toLowerCase().includes(`The modules will become available after you've agreed to the Honor Code, Code of Conduct, and Tech for Success requirements on the Course Overview page, which unlocks on the first day of the term.`.toLowerCase())
        return {
            success,
            message: "Text at the bottom of the syllabus looks incorrect."
        }

    }
}


function getPlainTextFromHtml(html:string) {
    const el = document.createElement('div');
    el.innerHTML = html;
    return el.innerText || el.textContent || "";
}


/// Course Settings

const extensionsToTest = ['Dropout Detective', "BigBlueButton"];
const extensionsInstalledTest:CourseValidationTest = {
    name: "Extensions Installed",
    description: 'Big Blue Button and Dropout Detective in nav bar',
    run: async (course, config) => {
        const missing:Set<string> = new Set(extensionsToTest);
        const tabs = await course.getTabs(config);
        for(let tab of tabs) {
            if (missing.has(tab.label) && !tab.hidden) missing.delete(tab.label);
        }
        return {
            success: missing.size === 0,
            message: Array.from(missing).join(',') + ' missing from enabled navigation tabs.'
        }
    }
}

const announcementsOnHomePageTest:CourseValidationTest = {
    name: "Show Announcements",
    description: 'Confirm under "Settings" --> "more options" that the "Show announcements" box is checked',
    run: async (course) => {
        const settings = await course.getSettings();
        return {
            success: !!settings.show_announcements_on_home_page,
            message: "'show announcements on home page' not turned on"
        }
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
]

export {
    aiPolicyInSyllabusTest,
    announcementsOnHomePageTest,
    extensionsInstalledTest,
    courseCreditsInSyllabusTest,
    finalNotInGradingPolicyParaTest,
    communication24HoursTest,
    bottomOfSyllabusLanguageTest,
}