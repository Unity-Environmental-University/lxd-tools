import {getPlainTextFromHtml} from "@canvas/canvasUtils";
import {
    badSyllabusFixFunc, badSyllabusRunFunc,
    errorMessageResult,
    testResult
} from "./utils";
import {ISyllabusHaver} from "@canvas/course/courseTypes";
import {CourseFixValidation, CourseValidation, TextReplaceValidation} from "@publish/fixesAndUpdates/validations/types";

//Syllabus Tests
export const finalNotInGradingPolicyParaTest: TextReplaceValidation<ISyllabusHaver> = {
    name: "Remove Final",
    beforeAndAfters: [['off the final grade', 'off the grade']],
    description: 'Remove "final" from the grading policy paragraphs of syllabus',
    run: async (course, config) => {
        const syllabus = await course.getSyllabus();
        const match = /off the final grade/gi.test(syllabus);
        return testResult(!match, {
                failureMessage: ["'off the final grade' found in syllabus"],
                links: [`/courses/${course.id}/assignments/syllabus`]
            }
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
        const syllabus = await course.getSyllabus();
        const el = document.createElement('div');
        el.innerHTML = syllabus;
        const strongs = el.querySelectorAll('strong');
        const creditList = Array.from(strongs).filter((strong) => /credits/i.test(strong.textContent || ""));
        const links = [`/courses/${course.id}/assignments/syllabus`];
        const failureMessage = "Can't find credits in syllabus";
        return testResult(creditList && creditList.length > 0, {failureMessage, links})

    }
}


const badTest = /<p>\s*<strong>\s*Class Inclusive[\s:]*<\/strong>[\s:]*(.*)<\/p>/ig;
export const classInclusiveNoDateHeaderTest: TextReplaceValidation<ISyllabusHaver> = {
    name: "Class Inclusive -> Class Inclusive Dates",
    beforeAndAfters: [
        ['<p><strong>Class Inclusive:</strong> Aug 12 - Sept 12</p>', '<p><strong>Class Inclusive Dates:</strong> Aug 12 - Sept 12</p>'],
        ['<p><strong>Class Inclusive:</strong> Aug 12 - Sept 12</p>', '<p><strong>Class Inclusive Dates:</strong> Aug 12 - Sept 12</p>'],
        ['<p><strong>Class Inclusive</strong> : Aug 12 - Sept 12</p>', '<p><strong>Class Inclusive Dates:</strong> Aug 12 - Sept 12</p>'],
        ['<p><strong>Class Inclusive: </strong> Aug 12 - Sept 12</p>', '<p><strong>Class Inclusive Dates:</strong> Aug 12 - Sept 12</p>'],
        ['<p> <strong> Class Inclusive: </strong> Aug 12 - Sept 12</p>', '<p><strong>Class Inclusive Dates:</strong> Aug 12 - Sept 12</p>'],
        ['<p><strong>Class Inclusive : </strong><span> Aug 12 - Sept 12</span></p>', '<p><strong>Class Inclusive Dates:</strong> Aug 12 - Sept 12</p>'],
    ],
    description: 'Syllabus lists date range for course as "Class Inclusive Dates:" NOT as "Class Inclusive:"',
    run: badSyllabusRunFunc(badTest),
    fix: badSyllabusFixFunc(badTest, (badText:string) => {
        badText = badText.replaceAll(/<\/?span>/ig, '');
        return badText.replaceAll(badTest, '<p><strong>Class Inclusive Dates:</strong> $1</p>')
    })
}


export const aiPolicyInSyllabusTest: CourseValidation<ISyllabusHaver> = {
    name: "AI Policy in Syllabus Test",
    description: "The AI policy is present in the syllabus",
    run: async (course: ISyllabusHaver, config) => {
        const text = await course.getSyllabus();
        const success = text.includes('Generative Artificial Intelligence');
        const links = [`/courses/${course.id}/assignments/syllabus`];
        const failureMessage = `Can't find AI boilerplate in syllabus`
        return testResult(success, {links, failureMessage})
    }
}


export const bottomOfSyllabusLanguageTest: CourseValidation<ISyllabusHaver> = {
    name: "Bottom-of-Syllabus Test",
    description: "Replace language at the bottom of the syllabus with: \"Learning materials for Weeks 2 forward are organized with the rest of the class in your weekly modules. The modules will become available after you've agreed to the Honor Code, Code of Conduct, and Tech for Success requirements on the Course Overview page, which unlocks on the first day of the term.\" (**Do not link to the Course Overview Page**)",
    run: async (course, config) => {
        const text = getPlainTextFromHtml(await course.getSyllabus());
        const success = text.toLowerCase().includes(`The modules will become available after you've agreed to the Honor Code, Code of Conduct, and Tech for Success requirements on the Course Overview page, which unlocks on the first day of the term.`.toLowerCase())
        const links = [`/courses/${course.id}/assignments/syllabus`];
        const failureMessage = "Text at the bottom of the syllabus looks incorrect."
        return testResult(success, {links, failureMessage})
    },

}

export const gradeTableHeadersCorrectTest: CourseValidation<ISyllabusHaver> = {
    name: "Grade headers correct",
    description: "Grade table headers on syllabus should read Letter Grade, Percent, and the third should be blank",
    async run(course, config) {
        const el = document.createElement('div');
        el.innerHTML = await course.getSyllabus();
        const ths = [...el.querySelectorAll('th')];
        const letterGradeTh = ths.filter(th => /Letter Grade/i.test(th.innerHTML));
        const percentTh = ths.filter(th => /Percent/i.test(th.innerHTML));
        const success = letterGradeTh.length === 1 && percentTh.length === 1;
        const links = [`/courses/${course.id}/assignments/syllabus`]
        const failureMessage = 'Grade headers incorrect';
        return testResult(success, {links, failureMessage})
    }

}


function htmlDiv(text: string) {
    const el = document.createElement('div');
    el.innerHTML = text;
    return el;
}


function findSecondParaOfDiscExpect(syllabusEl: HTMLElement) {
    const discussExpectEl = [...document.querySelectorAll('h3')]
        .find(h3 => (h3.innerText ?? h3.textContent ?? '').includes('Discussion Expectations'))
    if (!discussExpectEl) return undefined;
    return discussExpectEl.querySelectorAll('p')[1] as HTMLParagraphElement | undefined;

}


const correctSecondPara = 'To access a discussion\'s grading rubric, click on the "View Rubric" button in the discussion directions and/or the "Dot Dot Dot" (for screen readers, titled "Manage this Discussion") button in the upper right corner of the discussion, and then click "show rubric".'


export const secondDiscussionParaOff: CourseFixValidation<ISyllabusHaver, {
    el: HTMLElement,
    secondPara?: HTMLElement
} | undefined> = {
    name: "Second discussion expectation paragraph",
    description: 'To access a discussion\'s grading rubric, click on the "View Rubric" button in the discussion directions and/or the "Dot Dot Dot" ' +
        '(for screen readers, titled "Manage this Discussion") button in the upper right corner of the discussion, and then click "show rubric".',
    async run(course) {
        const el = htmlDiv(await course.getSyllabus());
        const secondPara = findSecondParaOfDiscExpect(el);
        const userData = {el, secondPara};
        if (!secondPara) return testResult('not run', {
            notFailureMessage: "Second paragraph of discussion expectations not found",
            userData,
        })

        const secondParaText = secondPara.textContent ?? secondPara.innerText ?? '';
        const success =
            secondParaText.toLowerCase().replace(/\W*/, '')
            === correctSecondPara.toLowerCase().replace(/\W*/, '');
        return testResult(success, {
            failureMessage: `Second paragraph does not match ${correctSecondPara}`,
            userData
        })
    },
    async fix(course) {
        const {success, userData} = await this.run(course);
        if (success) return testResult('not run', {notFailureMessage: "No need to run fix"});

        if (!userData?.secondPara) return testResult(false, {failureMessage: "There was a problem accessing the syllabus."})
        const {el, secondPara} = userData;

        secondPara.innerHTML = correctSecondPara;
        try {
            await course.changeSyllabus(el.innerHTML)
            return testResult(true);
        } catch (e) {
            return errorMessageResult(e);
        }
    }
}

export default [
    classInclusiveNoDateHeaderTest,
    courseCreditsInSyllabusTest,
    finalNotInGradingPolicyParaTest,
    communication24HoursTest,
    aiPolicyInSyllabusTest,
    bottomOfSyllabusLanguageTest,
    gradeTableHeadersCorrectTest,
    secondDiscussionParaOff
]

