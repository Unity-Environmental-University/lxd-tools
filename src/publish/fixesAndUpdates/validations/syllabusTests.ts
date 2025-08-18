import {getPlainTextFromHtml} from "@canvas/canvasUtils";
import {
AddPosition,
addSyllabusSectionFix,
badSyllabusFixFunc,
badSyllabusRunFunc,
errorMessageResult,
inSyllabusSectionFunc,
InSyllabusSectionFuncUserData,
testResult
} from "./utils";
import {ISyllabusHaver} from "@canvas/course/courseTypes";
import {CourseFixValidation, CourseValidation, TextReplaceValidation} from "@publish/fixesAndUpdates/validations/types";
import {beforeAndAfterSet, paraify} from "@/testing/DomUtils";

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


const classInclusiveDatesLanguageRegex = /<p>\s*<strong>\s*Class Inclusive[\s:]*<\/strong>[\s:]*(.*)<\/p>/ig;
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
run: badSyllabusRunFunc(classInclusiveDatesLanguageRegex),
fix: badSyllabusFixFunc(classInclusiveDatesLanguageRegex, (badText: string) => {
    badText = badText.replaceAll(/<\/?span>/ig, '');
    return badText.replaceAll(classInclusiveDatesLanguageRegex, '<p><strong>Class Inclusive Dates:</strong> $1</p>')
})
}
export const badDiscussionPostOrderLanguage = /If you submit[^.]*only one post\.\s*(&nbsp;)?\s*/g;
export const removeSameDayPostRestrictionTest: TextReplaceValidation<ISyllabusHaver> = {
name: "Remove discussion same day post restriction",
description: "remove 'If you submit your original post and your peer response on the same day, you will receive credit for only one post'",
beforeAndAfters: [
    ['If you submit your original post and your peer response on the same day, you will receive credit for only one post.', ''],
    ['If you submit your original post and your peer response on the same day, you will receive credit for only one post.   &nbsp; ', ''],
    ['Monkeys. If you submit your original post and your peer response on the same day, you will receive credit for only one post. However,', 'Monkeys. However,']

],
run: badSyllabusRunFunc(badDiscussionPostOrderLanguage),
fix: badSyllabusFixFunc(badDiscussionPostOrderLanguage, '')
}



export const aiPolicyInSyllabusTest: CourseValidation<ISyllabusHaver> = {
name: "AI Policy in Syllabus Test",
description: "The AI policy is present in the syllabus",
run: async (course: ISyllabusHaver) => {
    const text = await course.getSyllabus();
    const success = text.includes('Generative Artificial Intelligence');
    const links = [`/courses/${course.id}/assignments/syllabus`];
    const failureMessage = `Can't find AI boilerplate in syllabus`
    return testResult(success, {links, failureMessage})
}
}


export const bottomOfSyllabusLanguageTest: CourseValidation<ISyllabusHaver> = {
name: "Bottom-of-Syllabus Test",
description: "Replace language at the bottom of the syllabus with: \"Learning materials for Weeks 2 forward" +
    " are organized with the rest of the class in your weekly modules. The modules will become available after " +
    "you've agreed to the Honor Code, Code of Conduct, and Tech for Success requirements on the Course Overview" +
    " page, which unlocks on the first day of the term.\" (**Do not link to the Course Overview Page**)",
run: async (course) => {
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
async run(course) {
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


export function htmlDiv(text: string) {
const el = document.createElement('div');
el.innerHTML = text;
return el;
}


function findSecondParaOfDiscExpect(syllabusEl: HTMLElement) {
const discussExpectH3 = [...syllabusEl.querySelectorAll('h3')]
    .find(h3 => (h3.innerText ?? h3.textContent ?? '').includes('Discussion Expectations'));
if (!discussExpectH3) return undefined;
const discussExpectEl = discussExpectH3.closest('td');
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

const goodApaLanguage = 'The standard citation style for all Unity DE courses, ' +
'unless otherwise noted in assignment instructions, ' +
'is APA.';


const runApaNote = inSyllabusSectionFunc(/grading policies/i, /standard citation style/i);
const fixApaNote = addSyllabusSectionFix(runApaNote, paraify(goodApaLanguage), AddPosition.DirectlyAfterHeader);

export const addApaNoteToGradingPoliciesTest  = {
name: "Add APA default language",
beforeAndAfters: [
    ['<div><h3>Grading</h3><h4>Grading Policies</h4><p>control</p></div>',
    `<div><h3>Grading</h3><h4>Grading Policies</h4><p>${goodApaLanguage}</p><p>control</p></div>`]
],
description: `Add the following language to the grading policies section: ${goodApaLanguage}`,
run: runApaNote,
fix: fixApaNote,
} as TextReplaceValidation<
ISyllabusHaver,
InSyllabusSectionFuncUserData,
InSyllabusSectionFuncUserData | undefined
>


//nbsp; is a non-breaking space, which is used in HTML to prevent line breaks
const tableHtml = `
<h3>Unity's Late Policy</h3>
<div class="cbt-table">
<table style="border-collapse: collapse; width: 92%;">
<thead>
<tr>
<th scope="col">Number of Days Late</th>
<th scope="col">Penalty</th>
</tr>
</thead>
<tbody>
<tr><td>0.01 to 1</td><td>10%</td></tr>
<tr><td>1.01 to 2</td><td>30%</td></tr>
<tr><td>2.01 to 6</td><td>50%</td></tr>
<tr><td>More than 6 days late</td><td>Not&nbsp;Accepted:Grade = 0 (zero)</td>
</tr>
</tbody>
</table>
</div>
`

//This is hacky -- TECHNICALLY the grading policies section is not its own section,
// but we are adding it to the end of the grading section, so it will go in the right place.
// and will continue to work if the grading policies section is moved to its own section.

const runLatePolicyTableCheck = inSyllabusSectionFunc(/grading/i,/<tr>\s*<td>0\.01 to 1/i)

export const latePolicyTableTest  = {
name: "Add Late Policy table",
beforeAndAfters: [
    [
        '<div><h2>Grading</h2><h3>Grading Policies</h3><p>Lorem</p><h3>Grading Scale</h3><div class="cbt-table"><table></table></div><p>ipsum</p></div>',
        `<div><h2>Grading</h2><h3>Grading Policies</h3><p>Lorem</p>${tableHtml}<h3>Grading Scale</h3><div class="cbt-table"><table></table></div><p>ipsum</p></div>`,
        ]
],
description: `Add the late policy table to the grading section of the syllabus. The table should look like this: ${tableHtml}`,
run: runLatePolicyTableCheck,
fix: async (course: ISyllabusHaver) => {
    const results = await runLatePolicyTableCheck(course);
    if(results.success) return testResult("not run", {notFailureMessage: "Late policy table already exists."});
    const syllabus = await course.getSyllabus();
    const el = htmlDiv(syllabus);
    const gradingHeaderText = 'Grading Scale';
    const gradingHeader = el.querySelectorAll(`h3`);

    // Find the first h3 that contains the grading header text
    const gradingHeaderEl = Array.from(gradingHeader).find(h3 => h3.textContent?.includes(gradingHeaderText));

    //grab the next table after that header
    if (!gradingHeaderEl) {
        // If the table doesn't exist, add it after the grading header
        return testResult(false, {
            failureMessage: "Grading Policies section not found or grading table not found.",
            links: [`/courses/${course.id}/assignments/syllabus`]
        })
    }
    // If the table exists, insert the new table after main grading table
    gradingHeaderEl.insertAdjacentHTML('beforebegin', tableHtml);
    try {
        await course.changeSyllabus(el.innerHTML);
        return testResult(true, {
            links: [`/courses/${course.id}/assignments/syllabus`]
        });
    } catch (e) {
        return errorMessageResult(e);
    }
}} as TextReplaceValidation<
ISyllabusHaver,
InSyllabusSectionFuncUserData,
InSyllabusSectionFuncUserData | undefined
>


const badAiLanguage = 'n this course, you may be encouraged to explore';
const badAiRegex = /n this course,? you may be encouraged to explore/ig;
const goodAiLanguage = 'n this course, you may be asked to use or encouraged to explore';

export const addAiGenerativeLanguageTest  = {
name: "Add AI generative Language",
description: `Add the following language to the generative ai section: ${goodAiLanguage}`,
beforeAndAfters: [
    [badAiLanguage, goodAiLanguage],
    [`<p>${badAiLanguage}</p>`, `<p>${goodAiLanguage}</p>`],
    [`<p>abcd${badAiLanguage}efg</p>`, `<p>abcd${goodAiLanguage}efg</p>`],
],
run: badSyllabusRunFunc(badAiRegex),
fix: badSyllabusFixFunc(badAiRegex, goodAiLanguage)
}

const badSupportEmail = 'helpdesk@unity.edu';
const goodSupportEmail = 'unitysupport@unity.edu';

const badSupportEmailRegex = /helpdesk@unity\.edu/ig;


export const fixSupportEmailTest: TextReplaceValidation<ISyllabusHaver> = {
name: "Update Support Email",
description: `Update the support email in the syllabus from ${badSupportEmail} to ${goodSupportEmail}`,
beforeAndAfters: [
    [badSupportEmail, goodSupportEmail],
    [
        `<p>For support, please contact <a href="mailto:${badSupportEmail}`,
        `<p>For support, please contact <a href="mailto:${goodSupportEmail}`
    ],
],
run: badSyllabusRunFunc(badSupportEmailRegex),
fix: badSyllabusFixFunc(badSupportEmailRegex, goodSupportEmail)
}

//Attempt at creating a honor code language fix
const badHCLanguage = 'Any student found to be responsible for violating the Unity Environmental University Honor Code may be suspended or dismissed from the university.';
const goodHCLanguage = 'Penalties may include, but are not limited to, grade penalty or a failing grade for the work in question or a failing grade for the course.';

const badHCRegex = /Any student found to be responsible for violating the Unity Environmental University Honor Code may be suspended or dismissed from the university\./ig;

export const honorCodeLanguageText: TextReplaceValidation<ISyllabusHaver> =
{
name: "Fix Honor Code Language",
description: 'Update language at the bottom of the honor code.',
beforeAndAfters: [
[badHCLanguage, goodHCLanguage],
[`<p>${badHCLanguage}</p>`, `<p>${goodHCLanguage}</p>`],
],
run: badSyllabusRunFunc(badHCRegex),
fix: badSyllabusFixFunc(badHCRegex, goodHCLanguage)
}

export default [
addAiGenerativeLanguageTest,
removeSameDayPostRestrictionTest,
classInclusiveNoDateHeaderTest,
courseCreditsInSyllabusTest,
finalNotInGradingPolicyParaTest,
communication24HoursTest,
aiPolicyInSyllabusTest,
latePolicyTableTest,
bottomOfSyllabusLanguageTest,
gradeTableHeadersCorrectTest,
secondDiscussionParaOff,
fixSupportEmailTest,
honorCodeLanguageText,
addApaNoteToGradingPoliciesTest,
]

