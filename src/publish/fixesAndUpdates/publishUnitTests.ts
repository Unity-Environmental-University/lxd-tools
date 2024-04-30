import {CourseUnitTest} from "./CourseUnitTest";
import {notInTest} from "../../canvas/fixes/index";

export type UnitTestResult = {
    success: boolean,
    message: string
}

///Syllabus Fixes

const finalNotInGradingPolicyParaTest:CourseUnitTest = {
    name: "Remove Final",
    description: 'Remove "final" from the grading policy paragraphs of syllabus',
    run: async (course) => {
        const syllabus = await course.getSyllabus();
        const match = /off the final grade/gi.test(syllabus);
        return {
            success: !match,
            message: "'off the final grade' found in syllabus"
        }
    }
}

const communication24HoursTest: CourseUnitTest = {
    name: "Syllabus - Withing 24 Hours",
    description: "Revise the top sentence of the \"Communication\" section of the syllabus to read: \"The instructor will " +
        "conduct all correspondence with students related to the class in Canvas, and you should " +
        "expect to receive a response to emails within 24 hours.\"",
    run: async (course) => {
        const syllabus = await course.getSyllabus();
        const testString = 'The instructor will conduct all correspondence with students related to the class in Canvas, and you should expect to receive a response to emails within 24 hours'.toLocaleLowerCase();
        const el = document.createElement('div');
        el.innerHTML = syllabus;
        return {
            success: el.innerText.toLowerCase().includes(testString),
            message: "Communication language section in syllabus does not look right."
        }
    }
}

const courseCreditsInSyllabusTest:CourseUnitTest = {
    name: "Syllabus Credits",
    description: 'Credits displayed in summary box of syllabus',
    run: async (course) => {
        const syllabus = await course.getSyllabus();
        const el = document.createElement('div');
        el.innerHTML = syllabus;
        let strongs = el.querySelectorAll('strong');
        const creditList = Array.from(strongs).filter((strong) => /credits/i.test(strong.innerText));
        const match = /<strong>Credits/gi.test(syllabus);
        return {
            success: creditList && creditList.length > 0,
            message: "Can't find credits in syllabus"
        }
    }
}

const bottomOfSyllabusLanguageTest: CourseUnitTest = {
    name: "Bottom-of-Syllabus Test",
    description: "Replace language at the bottom of the syllabus with: \"Learning materials for Weeks 2 forward are organized with the rest of the class in your weekly modules. The modules will become available after you've agreed to the Honor Code, Code of Conduct, and Tech for Success requirements on the Course Overview page, which unlocks on the first day of the term.\" (**Do not link to the Course Overview Page**)",
    run: async(course) => {
        const text = getPlainTextFromHtml(await course.getSyllabus());

        return {
            success: text.toLowerCase().includes(`The modules will become available after you've agreed to the Honor Code, Code of Conduct, and Tech for Success requirements on the Course Overview page, which unlocks on the first day of the term.`.toLowerCase()),
            message: "Text at the bottom of the syllabus looks incorrect."
        }

    }
}


function getPlainTextFromHtml(html:string) {
    const el = document.createElement('div');
    el.innerHTML = html;
    return el.innerText;
}


/// Course Settings

const extensionsToTest = ['Dropout Detective', "BigBlueButton"];
const extensionsInstalledTest:CourseUnitTest = {
    name: "Extensions Installed",
    description: 'Big Blue Button and Dropout Detective in nav bar',
    run: async (course) => {
        const missing:Set<string> = new Set(extensionsToTest);
        const tabs = await course.getTabs();
        for(let tab of tabs) {
            if (missing.has(tab.label) && !tab.hidden) missing.delete(tab.label);
        }
        return {
            success: missing.size === 0,
            message: Array.from(missing).join(',') + ' missing from enabled navigation tabs.'
        }
    }
}

const announcementsOnHomePageTest:CourseUnitTest = {
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
    bottomOfSyllabusLanguageTest,
]