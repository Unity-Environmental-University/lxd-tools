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
import {
    CourseFixValidation,
    CourseValidation,
    TextReplaceValidation
} from "./types";
import {paraify} from "@/testing/DomUtils";
import { getCourseById } from "@/canvas/course";
import diff_match_patch, { patch_obj } from "diff-match-patch";
import {MalformedSyllabusError} from "@canvas/course/changeStartDate";

// ********************************** BEGIN: Looking at refactoring to use a source syllabus instead of individual tests
// TODO; Handle exclusions for information that is course-specific
//  DONE; Use document structure to identify and pull out course-specific information
//  STRUCTURAL; Add placeholder tags with specific ids in source syllabus
//  DONE; Run patch
//  Parse placeholder tags, look up id in preserved content, replace the placeholder tag with preserved content

type syllabusDifferenceUserData = {
    sourceSyllabus: string | undefined,
    courseSyllabus: string,
    preservedContent: [string, string][],
    patch:  Array<{ new(): diff_match_patch.patch_obj }>,
}

let UG_SOURCE_SYLLABUS: string | undefined;
let GRAD_SOURCE_SYLLABUS: string | undefined;
let CE_SOURCE_SYLLABUS: string | undefined;

async function getSourceSyllabus(course: ISyllabusHaver): Promise<string | undefined> {
    const testCourse = await getCourseById(course.id);
    if (testCourse.isGrad()) {
        if (!GRAD_SOURCE_SYLLABUS) {
            const gradSourceCourse = await getCourseById(7773747);
            GRAD_SOURCE_SYLLABUS = await gradSourceCourse.getSyllabus();
        }
        return GRAD_SOURCE_SYLLABUS;
    }

    if (testCourse.isCareerInstitute()) {
        if (!CE_SOURCE_SYLLABUS) {
            // const ceSourceCourse = await getCourseById(/*ID needed*/);
            // CE_SOURCE_SYLLABUS = await ceSourceCourse.getSyllabus();
            // For now, returning undefined until ID is available
            return undefined;
        }
        return CE_SOURCE_SYLLABUS;
    }

    if (!UG_SOURCE_SYLLABUS) {
        const ugSourceCourse = await getCourseById(7775658);
        UG_SOURCE_SYLLABUS = await ugSourceCourse.getSyllabus();
    }
    return UG_SOURCE_SYLLABUS;
}

function getTextAfterStrong(element: HTMLElement): string {
    const strongTag = element.querySelector('strong');
    if (!strongTag) {
        return element.textContent?.trim() || '';
    }

    let currentNode = strongTag.nextSibling;
    let text = '';

    while (currentNode) {
        text += currentNode.textContent;
        currentNode = currentNode.nextSibling;
    }

    return text.replace(/\u00A0/g, ' ').trim();
}

function getPreservedContent(syllabus: string): [string, string][] {
    const el = document.createElement('div');
    el.innerHTML = syllabus;
    const preservedContent: [string, string][] = [];

    // Find the course number and title
    // Find Year/Term/Session
    // Find Class Inclusive Dates
    // Find Credits
    const syllabusCalloutBox = el.querySelector('div.cbt-callout-box');
    if(!syllabusCalloutBox) throw new MalformedSyllabusError("Can't find syllabus callout box");

    const paras = Array.from(syllabusCalloutBox.querySelectorAll('p'));
    const strongParas = paras.filter((para) => para.querySelector('strong'));

    const [
        courseNameEl,
        termNameEl,
        datesEl,
        _instructorNameEl,
        _instructorContactInfoEl,
        creditsEl
    ] = strongParas;

    preservedContent.push(
        ["course.name", getTextAfterStrong(courseNameEl)],
        ["course.termname", getTextAfterStrong(termNameEl)],
        ["course.dates", getTextAfterStrong(datesEl)],
        ["course.credits", getTextAfterStrong(creditsEl)]
    );

    // Find Course Description
    const headers = Array.from(el.querySelectorAll('h2'));
    const courseDescHeader = headers.find(h => h.textContent?.trim() === 'Course Description');
    if (courseDescHeader) {
        const parentDiv = courseDescHeader.parentElement;
        if (parentDiv) {
            const nextElement = parentDiv.nextElementSibling;
            if (nextElement && nextElement.tagName === 'P') {
                preservedContent.push(["course.description", nextElement.textContent?.trim() || '']);
            }
        }
    }
    
    // Find Course Outcomes
    const courseOutcomesHeader = headers.find(h => h.textContent?.trim() === 'Course Outcomes');
    if (courseOutcomesHeader) {
        const parentDiv = courseOutcomesHeader.parentElement;
        if (parentDiv) {
            let nextElement = parentDiv.nextElementSibling;
            let outcomesText = '';
            // The outcomes can be split across multiple p tags
            while (nextElement && nextElement.tagName === 'P') {
                outcomesText += (nextElement.textContent?.trim() || '') + '\n';
                nextElement = nextElement.nextElementSibling;
            }
            preservedContent.push(["course.outcomes", outcomesText.trim()]);
        }
    }

    // Find textbook information
    const strongs = Array.from(el.querySelectorAll('strong'));
    const textbookHeaderStrong = strongs.find(s => s.textContent?.trim() === 'Textbook');

    if (textbookHeaderStrong) {
        const headerP = textbookHeaderStrong.parentElement;
        if (headerP && headerP.tagName === 'P') {
            const nextElement = headerP.nextElementSibling;
            if (nextElement) {
                preservedContent.push(["course.textbook", nextElement.textContent?.trim() || '']);
            }
        }
    }

    // Find Week 1 Learning Materials Preview
    const h3s = Array.from(el.querySelectorAll('h3'));
    const week1PreviewHeader = h3s.find(h => h.textContent?.trim() === 'Week 1 Learning Materials Preview');
    if (week1PreviewHeader) {
        let nextElement = week1PreviewHeader.nextElementSibling;
        let previewHtml = '';
        while(nextElement) {
            previewHtml += nextElement.outerHTML;
            nextElement = nextElement.nextElementSibling;
        }
        if (previewHtml) {
            preservedContent.push(["course.week1preview", previewHtml.trim()]);
        }
    }
    return preservedContent;
}

export const syllabusDifferencesTest: CourseValidation<ISyllabusHaver, syllabusDifferenceUserData> = {
    name: "Syllabus Differences",
    description: "Checks for differences between source syllabus and actual syllabus",
    run: async (course) => {
        const sourceSyllabus = await getSourceSyllabus(course);
        const courseSyllabus = await course.getSyllabus();
        const dmp = new diff_match_patch();

        const preservedContent = getPreservedContent(courseSyllabus);

        if (!sourceSyllabus || !courseSyllabus) return testResult("not run", {notFailureMessage: "No source syllabus found."});

        const patch = dmp.patch_make(courseSyllabus, sourceSyllabus);
        const success = patch.length === 0;

        return testResult(success, {
            failureMessage: `Syllabus does not match source syllabus.`,
            links: [`/courses/${course.id}/assignments/syllabus`],
            userData: {
                sourceSyllabus,
                courseSyllabus,
                preservedContent,
                patch,
            },
        });
    },
    fix: async (course, result) => {
        const dmp = new diff_match_patch();
        const userData = result?.userData;
        if (!userData || userData.patch.length === 0)
            return testResult("not run", {failureMessage: "No user data found."});

       const [newSyllabus, results] = dmp.patch_apply(userData.patch, userData.courseSyllabus);

       if(results.some(applied => !applied))
           return testResult(false, {failureMessage: "Failed to apply some patches."});

        try {
            await course.changeSyllabus(newSyllabus);
            return testResult(true);
        } catch (e) {
            if (e instanceof Error) {
                return testResult(false, {failureMessage: e.message});
            }
            return testResult(false, {failureMessage: "An unknown error occurred during fix."});
        }
    },
};
// *********************************** END: Looking at refactoring to use a source syllabus instead of individual tests

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
};

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
        const links = [`/courses/${course.id}/assignments/syllabus`];
        return testResult(text.includes(testString) && !text.match(/48 hours .* weekends/), {failureMessage, links})
    }
};

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
};


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
};
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
};


export const aiPolicyInSyllabusTest: CourseValidation<ISyllabusHaver> = {
    name: "AI Policy in Syllabus Test",
    description: "The AI policy is present in the syllabus",
    run: async (course: ISyllabusHaver) => {
        const raw = await course.getSyllabus();
        const text = raw.toLowerCase();
        const success = text.includes('generative artificial intelligence');
        const links = [`/courses/${course.id}/assignments/syllabus`];
        const failureMessage = `Can't find AI boilerplate in syllabus`;
        return testResult(success, {links, failureMessage})
    }
};


export const bottomOfSyllabusLanguageTest: CourseValidation<ISyllabusHaver> = {
    name: "Bottom-of-Syllabus Test",
    description: "Replace language at the bottom of the syllabus with: \"Learning materials for Weeks 2 forward" +
        " are organized with the rest of the class in your weekly modules. The modules will become available after " +
        "you've agreed to the Honor Code, Code of Conduct, and Tech for Success requirements on the Course Overview" +
        " page, which unlocks on the first day of the term.\" (**Do not link to the Course Overview Page**)",
    run: async (course) => {
        const text = getPlainTextFromHtml(await course.getSyllabus());
        const success = text.toLowerCase().includes(`The modules will become available after you've agreed to the Honor Code, Code of Conduct, and Tech for Success requirements on the Course Overview page, which unlocks on the first day of the term.`.toLowerCase());
        const links = [`/courses/${course.id}/assignments/syllabus`];
        const failureMessage = "Text at the bottom of the syllabus looks incorrect.";
        return testResult(success, {links, failureMessage})
    },

};

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
        const links = [`/courses/${course.id}/assignments/syllabus`];
        const failureMessage = 'Grade headers incorrect';
        return testResult(success, {links, failureMessage})
    }

};


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


const correctSecondPara = 'To access a discussion\'s grading rubric, click on the "View Rubric" button in the discussion directions and/or the "Dot Dot Dot" (for screen readers, titled "Manage this Discussion") button in the upper right corner of the discussion, and then click "show rubric".';
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
        });

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

        if (!userData?.secondPara) return testResult(false, {failureMessage: "There was a problem accessing the syllabus."});
        const {el, secondPara} = userData;

        secondPara.innerHTML = correctSecondPara;
        try {
            await course.changeSyllabus(el.innerHTML);
            return testResult(true);
        } catch (e) {
            return errorMessageResult(e);
        }
    }
};

const goodApaLanguage = 'The standard citation style for all Unity DE courses, ' +
    'unless otherwise noted in assignment instructions, ' +
    'is APA.';


const runApaNote = inSyllabusSectionFunc(/grading policies/i, /standard citation style/i);
const fixApaNote = addSyllabusSectionFix(runApaNote, paraify(goodApaLanguage), AddPosition.DirectlyAfterHeader);

export const addApaNoteToGradingPoliciesTest = {
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
>;


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
`;

//This is hacky -- TECHNICALLY the grading policies section is not its own section,
// but we are adding it to the end of the grading section, so it will go in the right place.
// and will continue to work if the grading policies section is moved to its own section.

const runLatePolicyTableCheck = inSyllabusSectionFunc(/grading/i, /<tr>\s*<td>0\.01 to 1/i);

export const latePolicyTableTest = {
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
        if (results.success) return testResult("not run", {notFailureMessage: "Late policy table already exists."});
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
    }
} as TextReplaceValidation<
    ISyllabusHaver,
    InSyllabusSectionFuncUserData,
    InSyllabusSectionFuncUserData | undefined
>;


const badAiLanguage = 'n this course, you may be encouraged to explore';
const badAiRegex = /n this course,? you may be encouraged to explore/ig;
const goodAiLanguage = 'n this course, you may be asked to use or encouraged to explore';

export const addAiGenerativeLanguageTest = {
    name: "Add AI generative Language",
    description: `Add the following language to the generative ai section: ${goodAiLanguage}`,
    beforeAndAfters: [
        [badAiLanguage, goodAiLanguage],
        [`<p>${badAiLanguage}</p>`, `<p>${goodAiLanguage}</p>`],
        [`<p>abcd${badAiLanguage}efg</p>`, `<p>abcd${goodAiLanguage}efg</p>`],
    ],
    run: badSyllabusRunFunc(badAiRegex),
    fix: badSyllabusFixFunc(badAiRegex, goodAiLanguage)
};

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
};

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
    };

const titleIXHTML = `<tr><td><h3><strong>Title IX Mandatory Reporting</strong></h3><p>Please note that instructors are mandatory reporters under Title IX. If you share information about sexual harassment, assault, relationship violence, stalking, or gender-based discrimination that involves another Unity student or employee, they are required to notify the University&rsquo;s Title IX office so they can offer you support and resources.</p></td></tr>`;

const runTitleIXPolicyCheck = inSyllabusSectionFunc(/Title IX/i, /Please note that instructors are mandatory/i);

export const titleIXPolicyTest = {
    name: "Add Title IX Policy to Syllabus",
    beforeAndAfters: [
        [
            `<table><p>course.</p></td></tr></tbody></table>`,
            `<table><p>course.</p></td></tr>${titleIXHTML}</tbody></table>`
        ]
    ],
    description: `Add the Title IX policy to the bottom of the Syllabus table.`,
    run: runTitleIXPolicyCheck,
    fix: async (course: ISyllabusHaver) => {
        const results = await runTitleIXPolicyCheck(course);
        if (results.success) return testResult("not run", {notFailureMessage: "Title IX policy cell already exists."});
        const syllabus = await course.getSyllabus();

        let newHtml: string;
        if (/course\.\s*<\/p>\s*<\/td>\s*<\/tr>\s*<\/tbody>\s*<\/table>/i.test(syllabus)) {
            newHtml = syllabus.replace(
                /course\.\s*<\/p>\s*<\/td>\s*<\/tr>\s*<\/tbody>\s*<\/table>/i,
                `course.</p></td></tr>${titleIXHTML}</tbody></table>`
            );
        } else {
            newHtml = syllabus.replace(
                /course\.<\/p>\s*<\/td>\s*<\/tr>\s*<\/table>/i,
                `course.</p></td></tr>${titleIXHTML}</table>`
            );
        }

        try {
            await course.changeSyllabus(newHtml);
            return testResult(true, {
                links: [`/courses/${course.id}/assignments/syllabus`]
            });
        } catch (e) {
            return errorMessageResult(e);
        }
    }
} as TextReplaceValidation<
    ISyllabusHaver,
    InSyllabusSectionFuncUserData,
    InSyllabusSectionFuncUserData | undefined
>;

const gradingDeadlineLanguage = `Any graded work that is a <em>Discussion</em> will have two formal deadlines. The initial post is due Thursday at 3 AM ET, and responses to classmates are due on the deadline listed below (Monday at 3am ET). Full instructions are listed at the top of the Discussion assignment details.`;

const gradingDeadlineRun = async (course: ISyllabusHaver) => {
    const parser = new DOMParser();
    const syllabus = await course.getSyllabus();
    const parsedSyllabus = parser.parseFromString(syllabus, "text/html");

    const pTags = Array.from(parsedSyllabus.querySelectorAll('p'));
    const courseP = pTags.find(p => p.textContent?.trim().startsWith("Course Number and Title:"));

    if (!courseP) return testResult("not run", {notFailureMessage: "Course number and title not found."});

    const content = courseP.textContent?.split("Course Number and Title:")[1].trim();
    const courseCodeMatch = content?.match(/\b([A-Za-z]{4})\s*([0-9]{3})\b/);

    if (!courseCodeMatch) return testResult("not run", {notFailureMessage: "Course code not found."});

    const numericPart = parseInt(courseCodeMatch[2], 10);
    const isUndergrad = numericPart < 500;

    if (isUndergrad) {
        if (syllabus.toString().includes("Any graded")) return testResult(true, {
            notFailureMessage: "Syllabus already has language about grading deadlines."
        });
        return testResult(false, {
                failureMessage: "Syllabus does not have language about grading deadlines.",
                links: [`/courses/${course.id}/assignments/syllabus`]
            },
        )
    } else {
        return testResult(true, {notFailureMessage: "Not run because course is not undergrad."})
    }
};

const gradingDeadlineFix = async (course: ISyllabusHaver) => {
    const syllabus = await course.getSyllabus();
    const syllabusText = syllabus.toString();
    const fixedText = syllabusText.replace(/<\/div>\s*<\/div>\s*$/, '');
    const newSyllabus = fixedText + `<br /><p><strong>${gradingDeadlineLanguage}</strong></p></div><div>`;
    try {
        course.changeSyllabus(newSyllabus);
        return testResult(true);
    } catch (e) {
        return errorMessageResult(e);
    }
};

export const gradingDeadlineLanguageTest: CourseFixValidation<ISyllabusHaver> = {
    name: "UG Grading Deadline Language",
    description: "Adds clarifying language about the discussion deadlines to the bottom of the syllabus",
    run: gradingDeadlineRun,
    fix: gradingDeadlineFix
};

const aiPolicyVideoLink = "https://drive.google.com/file/d/16O7s7_nX9NZF3orhogb3-nusBCCZ796x/view?t=2";
const aiPolicyInfographicLink = "https://drive.google.com/file/d/1Gzbgp5piaQk9PQT5BbNsSfWfqEqWmNak/view";

const aiPolicyMediaRun = async (course: ISyllabusHaver) => {
    const syllabus = await course.getSyllabus();

    if(syllabus.includes(aiPolicyVideoLink) && syllabus.includes(aiPolicyInfographicLink)) {
        return testResult(true, {
            notFailureMessage: "Syllabus already has infographic and video links in AI Policy section."
        });
    } else if (syllabus.includes(aiPolicyVideoLink) && !syllabus.includes(aiPolicyInfographicLink)) {
        return testResult(false, {
            failureMessage: "Syllabus does not have infographic link in AI Policy section.",
            links: [`/courses/${course.id}/assignments/syllabus`]
        });
    } else if (!syllabus.includes(aiPolicyVideoLink) && syllabus.includes(aiPolicyInfographicLink)) {
        return testResult(false, {
            failureMessage: "Syllabus does not have video link in AI Policy section.",
            links: [`/courses/${course.id}/assignments/syllabus`]
        });
    } else {
        return testResult(false, {
            failureMessage: "Syllabus does not have infographic and video links in AI Policy section.",
            links: [`/courses/${course.id}/assignments/syllabus`]
        });
    }
};

const aiPolicyMediaFix = async (course: ISyllabusHaver) => {
    const parser = new DOMParser();
    const syllabus = await course.getSyllabus();
    const parsedSyllabus = parser.parseFromString(syllabus, "text/html");

    const aiPolicyMediaText = `<p>For more information on Unity's AI policy, you can check out <a href="${aiPolicyVideoLink}">this video</a> or <a href="${aiPolicyInfographicLink}">this inforgraphic</a>.</p>`;

    const syllabusTds = Array.from(parsedSyllabus.querySelectorAll('td'));
    const aiPolicyTd = syllabusTds.find(td => td.textContent?.includes("Artificial Intelligence Policy for Students"));

    if(!aiPolicyTd) {
        return testResult("not run", {
            notFailureMessage: "AI Policy section not found."
        });
    }

    if(aiPolicyTd.innerHTML.includes("<h3><strong>&nbsp;</strong></h3>")) {
        aiPolicyTd.innerHTML = aiPolicyTd.innerHTML.replace("<h3><strong>&nbsp;</strong></h3>", "");
    }

    aiPolicyTd.innerHTML += aiPolicyMediaText;
    const container = document.createElement('div');
    container.innerHTML = parsedSyllabus.body.innerHTML || parsedSyllabus.documentElement.innerHTML;
    const updatedSyllabus = container.innerHTML;

    try {
        //Update Syllabus
        await course.changeSyllabus(updatedSyllabus);
        return testResult(true);
    } catch (e) {
        return errorMessageResult(e);
    }

};

export const aiPolicyMediaTest: CourseFixValidation<ISyllabusHaver> = {
    name: "AI Policy Media",
    description: "Checks for infographic and video links in AI Policy section of syllabus",
    run: aiPolicyMediaRun,
    fix: aiPolicyMediaFix
};


const badSupportNumber = "207-509-7277";
const goodSupportNumber = "207-509-7110";

export const supportPhoneNumberFix: CourseFixValidation<ISyllabusHaver> = {
    name: "Support Phone Number Fix",
    description: "Checks for incorrect support phone number in syllabus",
    run: badSyllabusRunFunc(new RegExp(badSupportNumber, "ig")),
    fix: badSyllabusFixFunc(new RegExp(badSupportNumber, "ig"), goodSupportNumber)
};

export default [
    syllabusDifferencesTest,
    /*addAiGenerativeLanguageTest,
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
    titleIXPolicyTest,
    gradingDeadlineLanguageTest,
    aiPolicyMediaTest,
    supportPhoneNumberFix*/
]
