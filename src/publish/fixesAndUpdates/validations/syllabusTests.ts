import {getPlainTextFromHtml} from "../../../canvas/canvasUtils";
import {
    badContentFixFunc,
    badSyllabusFixFunc,
    CourseValidation,
    testResult,
    TextReplaceValidation
} from "./index";
import {ISyllabusHaver} from "../../../canvas/course/courseTypes";

//Syllabus Tests
export const finalNotInGradingPolicyParaTest: TextReplaceValidation<ISyllabusHaver> = {
    name: "Remove Final",
    negativeExemplars:[['off the final grade', 'off the grade'], ['final exam', 'final exam']],
    description: 'Remove "final" from the grading policy paragraphs of syllabus',
    run: async (course, config) => {
        const syllabus = await course.getSyllabus(config);
        const match = /off the final grade/gi.test(syllabus);
        return testResult(!match, {
            failureMessage: ["'off the final grade' found in syllabus"],
            links: [`/courses/${course.id}/assignments/syllabus`]}
        );
    },
    fix: badSyllabusFixFunc(/off the final grade/gi, 'off the grade')
}

export const communication24HoursTest: CourseValidation<ISyllabusHaver> = {
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
        const failureMessage = "Communication language section in syllabus does not look right.";
        const links = [`/courses/${course.id}/assignments/syllabus`]
        return testResult(text.includes(testString) && !text.match(/48 hours .* weekends/), {failureMessage, links})
    }
}

export const courseCreditsInSyllabusTest: CourseValidation<ISyllabusHaver> = {
    name: "Syllabus Credits",
    description: 'Credits displayed in summary box of syllabus',

    run: async (course: ISyllabusHaver, config) => {
        const syllabus = await course.getSyllabus(config);
        const el = document.createElement('div');
        el.innerHTML = syllabus;
        let strongs = el.querySelectorAll('strong');
        const creditList = Array.from(strongs).filter((strong) => /credits/i.test(strong.textContent || ""));
        const links = [`/courses/${course.id}/assignments/syllabus`];
        const failureMessage = "Can't find credits in syllabus";
        return testResult(creditList && creditList.length > 0, {failureMessage, links} )

    }
}

export const aiPolicyInSyllabusTest: CourseValidation<ISyllabusHaver> = {
    name: "AI Policy in Syllabus Test",
    description: "The AI policy is present in the syllabus",
    run: async (course: ISyllabusHaver, config) => {
        const text = await course.getSyllabus(config);
        const success = text.includes('Generative Artificial Intelligence');
        const links = [`/courses/${course.id}/assignments/syllabus`];
        const failureMessage = `Can't find AI boilerplate in syllabus`
        return testResult(success, {links, failureMessage} )
    }
}


export const bottomOfSyllabusLanguageTest: CourseValidation<ISyllabusHaver> = {
    name: "Bottom-of-Syllabus Test",
    description: "Replace language at the bottom of the syllabus with: \"Learning materials for Weeks 2 forward are organized with the rest of the class in your weekly modules. The modules will become available after you've agreed to the Honor Code, Code of Conduct, and Tech for Success requirements on the Course Overview page, which unlocks on the first day of the term.\" (**Do not link to the Course Overview Page**)",
    run: async (course, config) => {
        const text = getPlainTextFromHtml(await course.getSyllabus(config));
        const success = text.toLowerCase().includes(`The modules will become available after you've agreed to the Honor Code, Code of Conduct, and Tech for Success requirements on the Course Overview page, which unlocks on the first day of the term.`.toLowerCase())
        const links = [`/courses/${course.id}/assignments/syllabus`];
        const failureMessage = "Text at the bottom of the syllabus looks incorrect."
        return testResult(success, {links, failureMessage} )
    },

}

/// Etc




export default [
    courseCreditsInSyllabusTest,
    finalNotInGradingPolicyParaTest,
    communication24HoursTest,
    aiPolicyInSyllabusTest,
    bottomOfSyllabusLanguageTest,
]

