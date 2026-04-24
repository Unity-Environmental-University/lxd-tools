import { getPlainTextFromHtml } from "@ueu/ueu-canvas/canvasUtils";
import {
  AddPosition,
  addSyllabusSectionFix,
  badSyllabusFixFunc,
  badSyllabusRunFunc,
  errorMessageResult,
  inSyllabusSectionFunc,
  InSyllabusSectionFuncUserData,
  testResult,
} from "./utils";
import {
  ICourseDataHaver,
  ISyllabusHaver,
} from "@ueu/ueu-canvas/course/courseTypes";
import {
  CourseFixValidation,
  CourseValidation,
  TextReplaceValidation,
} from "@publish/fixesAndUpdates/validations/types";
import { paraify } from "@/testing/DomUtils";
import { Course } from "@ueu/ueu-canvas";

//Syllabus Tests
export const finalNotInGradingPolicyParaTest: TextReplaceValidation<ISyllabusHaver> =
  {
    name: "Remove Final",
    beforeAndAfters: [["off the final grade", "off the grade"]],
    description:
      'Remove "final" from the grading policy paragraphs of syllabus',
    run: async (course, _config) => {
      const syllabus = await course.getSyllabus();
      const match = /off the final grade/gi.test(syllabus);
      return testResult(!match, {
        failureMessage: ["'off the final grade' found in syllabus"],
        links: [`/courses/${course.id}/assignments/syllabus`],
      });
    },
    fix: badSyllabusFixFunc(/off the final grade/gi, "off the grade"),
  };

const ugCommunicationHtml = `<h3><strong>Communication</strong></h3><div><p>The instructor will conduct all correspondence with students related to the class in Canvas, and you should expect to receive a response to emails within 24 hours. Students are also expected to check email at least once every 24 hours. While instructors are not required to have a set list of standard office hours each week, faculty are expected to be available to meet with students to achieve the same goals as typical office hours based on requests from students, and to respond to requests within the response windows described above.</p><p>Please remember to start assignments early so you have time to ask questions and get answers before the due date. Instructors are encouraged to post announcements at least once a week, so please check your Canvas profile to make sure that Announcements are sent to your preferred communication pathway.</p><p>While all course-specific communication should take place in Canvas, remember to check your @unity.edu email account regularly for important communication from advisors/concierges and other Unity Environmental University offices. If your @unity.edu email account isn't working, reach out to <a class="inline_disabled external" href="https://unity.edu/contact-us/" target="_blank" rel="noopener"><span>Unity Environmental University's IT Support </span></a>for assistance.</p><p>Non-degree students without a @unity.edu email account can expect to receive correspondence from Unity Environmental University administrative staff via the email account used to sign up for classes.</p></div>`;

const gradCommunicationHtml = `<h3><strong>Communication</strong></h3><div><p>All course communication will occur through Canvas. Instructors respond to messages within 24 hours, and students are expected to check Canvas and email at least once daily. Faculty hold flexible office hours by request and will coordinate meeting times within this same response window.</p><p>Start assignments early to allow time for questions before deadlines. Instructors typically post weekly announcements&mdash;please ensure your Canvas notifications are set to your preferred contact method.</p><p>Check your @unity.edu email regularly for university updates from advisors, faculty, and other offices. If you experience email issues, contact <a href="https://unity.edu/contact-us/">Unity Environmental University IT Support</a>.</p><p>Non-degree students without a @unity.edu address will receive communication through the email used at registration.</p></div>`;

export const communication24HoursTest: CourseFixValidation<
  ISyllabusHaver & ICourseDataHaver
> = {
  name: "Syllabus - Within 24 Hours",
  description:
    "UG: Communication section must open with the standard 24-hour response sentence. " +
    "Grad: Communication section must contain the grad-specific 24-hour response language.",
  async run(course, _config) {
    const syllabus = await course.getSyllabus();
    const el = document.createElement("div");
    el.innerHTML = syllabus;
    const text = (el.textContent?.toLowerCase() || "").replace(/\s+/g, " ");
    const failureMessage =
      "Communication language section in syllabus does not look right.";
    const links = [`/courses/${course.id}/assignments/syllabus`];
    const courseObj = new Course(course.rawData);
    if (courseObj.isGrad()) {
      const gradTestString =
        "Instructors respond to messages within 24 hours".toLowerCase();
      return testResult(
        text.includes(gradTestString) && !text.match(/48 hours .* weekends/),
        {
          failureMessage,
          links,
        },
      );
    }
    const ugTestString =
      "The instructor will conduct all correspondence with students related to the class in Canvas, and you should expect to receive a response to emails within 24 hours".toLowerCase();
    return testResult(
      text.includes(ugTestString) && !text.match(/48 hours .* weekends/),
      { failureMessage, links },
    );
  },
  async fix(course) {
    const { success } = await this.run(course);
    if (success)
      return testResult("not run", {
        notFailureMessage: "Communication section already correct.",
      });

    const syllabus = await course.getSyllabus();
    const el = htmlDiv(syllabus);
    const links = [`/courses/${course.id}/assignments/syllabus`];

    const commH3 = [...el.querySelectorAll("h3")].find(
      (h3) => (h3.innerText ?? h3.textContent ?? "").trim() === "Communication",
    );
    if (!commH3)
      return testResult(false, {
        failureMessage: "Communication section heading not found.",
        links,
      });

    const commTd = commH3.closest("td");
    if (!commTd)
      return testResult(false, {
        failureMessage: "Communication section table cell not found.",
        links,
      });

    const courseObj = new Course(course.rawData);
    commTd.innerHTML = courseObj.isGrad()
      ? gradCommunicationHtml
      : ugCommunicationHtml;

    try {
      await course.changeSyllabus(el.innerHTML);
      return testResult(true, { links });
    } catch (e) {
      return errorMessageResult(e);
    }
  },
};

export const courseCreditsInSyllabusTest: CourseValidation<ISyllabusHaver> = {
  name: "Syllabus Credits",
  description: "Credits displayed in summary box of syllabus",

  run: async (course: ISyllabusHaver, _config) => {
    const syllabus = await course.getSyllabus();
    const el = document.createElement("div");
    el.innerHTML = syllabus;
    const strongs = el.querySelectorAll("strong");
    const creditList = Array.from(strongs).filter((strong) =>
      /credits/i.test(strong.textContent || ""),
    );
    const links = [`/courses/${course.id}/assignments/syllabus`];
    const failureMessage = "Can't find credits in syllabus";
    return testResult(creditList && creditList.length > 0, {
      failureMessage,
      links,
    });
  },
};

const classInclusiveDatesLanguageRegex =
  /<p>\s*<strong>\s*Class Inclusive[\s:]*<\/strong>[\s:]*(.*)<\/p>/gi;
export const classInclusiveNoDateHeaderTest: TextReplaceValidation<ISyllabusHaver> =
  {
    name: "Class Inclusive -> Class Inclusive Dates",
    beforeAndAfters: [
      [
        "<p><strong>Class Inclusive:</strong> Aug 12 - Sept 12</p>",
        "<p><strong>Class Inclusive Dates:</strong> Aug 12 - Sept 12</p>",
      ],
      [
        "<p><strong>Class Inclusive:</strong> Aug 12 - Sept 12</p>",
        "<p><strong>Class Inclusive Dates:</strong> Aug 12 - Sept 12</p>",
      ],
      [
        "<p><strong>Class Inclusive</strong> : Aug 12 - Sept 12</p>",
        "<p><strong>Class Inclusive Dates:</strong> Aug 12 - Sept 12</p>",
      ],
      [
        "<p><strong>Class Inclusive: </strong> Aug 12 - Sept 12</p>",
        "<p><strong>Class Inclusive Dates:</strong> Aug 12 - Sept 12</p>",
      ],
      [
        "<p> <strong> Class Inclusive: </strong> Aug 12 - Sept 12</p>",
        "<p><strong>Class Inclusive Dates:</strong> Aug 12 - Sept 12</p>",
      ],
      [
        "<p><strong>Class Inclusive : </strong><span> Aug 12 - Sept 12</span></p>",
        "<p><strong>Class Inclusive Dates:</strong> Aug 12 - Sept 12</p>",
      ],
    ],
    description:
      'Syllabus lists date range for course as "Class Inclusive Dates:" NOT as "Class Inclusive:"',
    run: badSyllabusRunFunc(classInclusiveDatesLanguageRegex),
    fix: badSyllabusFixFunc(
      classInclusiveDatesLanguageRegex,
      (badText: string) => {
        badText = badText.replaceAll(/<\/?span>/gi, "");
        return badText.replaceAll(
          classInclusiveDatesLanguageRegex,
          "<p><strong>Class Inclusive Dates:</strong> $1</p>",
        );
      },
    ),
  };
export const badDiscussionPostOrderLanguage =
  /If you submit[^.]*only one post\.\s*(&nbsp;)?\s*/g;
export const removeSameDayPostRestrictionTest: TextReplaceValidation<ISyllabusHaver> =
  {
    name: "Remove discussion same day post restriction",
    description:
      "remove 'If you submit your original post and your peer response on the same day, you will receive credit for only one post'",
    beforeAndAfters: [
      [
        "If you submit your original post and your peer response on the same day, you will receive credit for only one post.",
        "",
      ],
      [
        "If you submit your original post and your peer response on the same day, you will receive credit for only one post.   &nbsp; ",
        "",
      ],
      [
        "Monkeys. If you submit your original post and your peer response on the same day, you will receive credit for only one post. However,",
        "Monkeys. However,",
      ],
    ],
    run: badSyllabusRunFunc(badDiscussionPostOrderLanguage),
    fix: badSyllabusFixFunc(badDiscussionPostOrderLanguage, ""),
  };

export const aiPolicyInSyllabusTest: CourseValidation<ISyllabusHaver> = {
  name: "AI Policy in Syllabus Test",
  description: "The AI policy is present in the syllabus",
  run: async (course: ISyllabusHaver) => {
    const raw = await course.getSyllabus();
    const text = raw.toLowerCase();
    const success = text.includes("generative artificial intelligence");
    const links = [`/courses/${course.id}/assignments/syllabus`];
    const failureMessage = `Can't find AI boilerplate in syllabus`;
    return testResult(success, { links, failureMessage });
  },
};

export const bottomOfSyllabusLanguageTest: CourseValidation<ISyllabusHaver> = {
  name: "Bottom-of-Syllabus Test",
  description:
    'Replace language at the bottom of the syllabus with: "Learning materials for Weeks 2 forward' +
    " are organized with the rest of the class in your weekly modules. The modules will become available after " +
    "you've agreed to the Honor Code, Code of Conduct, and Tech for Success requirements on the Course Overview" +
    ' page, which unlocks on the first day of the term." (**Do not link to the Course Overview Page**)',
  run: async (course) => {
    const text = getPlainTextFromHtml(await course.getSyllabus());
    const success = text
      .toLowerCase()
      .includes(
        `The modules will become available after you've agreed to the Honor Code, Code of Conduct, and Tech for Success requirements on the Course Overview page, which unlocks on the first day of the term.`.toLowerCase(),
      );
    const links = [`/courses/${course.id}/assignments/syllabus`];
    const failureMessage =
      "Text at the bottom of the syllabus looks incorrect.";
    return testResult(success, { links, failureMessage });
  },
};

export const gradeTableHeadersCorrectTest: CourseValidation<ISyllabusHaver> = {
  name: "Grade headers correct",
  description:
    "Grade table headers on syllabus should read Letter Grade, Percent, and the third should be blank",
  async run(course) {
    const el = document.createElement("div");
    el.innerHTML = await course.getSyllabus();
    const ths = [...el.querySelectorAll("th")];
    const letterGradeTh = ths.filter((th) =>
      /Letter Grade/i.test(th.innerHTML),
    );
    const percentTh = ths.filter((th) => /Percent/i.test(th.innerHTML));
    const success = letterGradeTh.length === 1 && percentTh.length === 1;
    const links = [`/courses/${course.id}/assignments/syllabus`];
    const failureMessage = "Grade headers incorrect";
    return testResult(success, { links, failureMessage });
  },
};

export function htmlDiv(text: string) {
  const el = document.createElement("div");
  el.innerHTML = text;
  return el;
}

function findSecondParaOfDiscExpect(syllabusEl: HTMLElement) {
  const discussExpectH3 = [...syllabusEl.querySelectorAll("h3")].find((h3) =>
    (h3.innerText ?? h3.textContent ?? "").includes("Discussion Expectations"),
  );
  if (!discussExpectH3) return undefined;
  const discussExpectEl = discussExpectH3.closest("td");
  if (!discussExpectEl) return undefined;
  return discussExpectEl.querySelectorAll("p")[1] as
    | HTMLParagraphElement
    | undefined;
}

const correctSecondPara =
  'To access a discussion\'s grading rubric, click on the "View Rubric" button in the discussion directions and/or the "Dot Dot Dot" (for screen readers, titled "Manage this Discussion") button in the upper right corner of the discussion, and then click "show rubric".';
export const secondDiscussionParaOff: CourseFixValidation<
  ISyllabusHaver & ICourseDataHaver,
  | {
      el: HTMLElement;
      secondPara?: HTMLElement;
    }
  | undefined
> = {
  name: "Second discussion expectation paragraph",
  description:
    'To access a discussion\'s grading rubric, click on the "View Rubric" button in the discussion directions and/or the "Dot Dot Dot" ' +
    '(for screen readers, titled "Manage this Discussion") button in the upper right corner of the discussion, and then click "show rubric". (Skipped for grad courses which have a different discussion structure.)',
  async run(course) {
    if (new Course(course.rawData).isGrad())
      return testResult("not run", {
        notFailureMessage:
          "Skipped for grad courses — discussion structure differs.",
      });

    const el = htmlDiv(await course.getSyllabus());
    const secondPara = findSecondParaOfDiscExpect(el);
    const userData = { el, secondPara };
    if (!secondPara)
      return testResult("not run", {
        notFailureMessage:
          "Second paragraph of discussion expectations not found",
        userData,
      });

    const secondParaText = secondPara.textContent ?? secondPara.innerText ?? "";
    const success =
      secondParaText.toLowerCase().replace(/\W*/, "") ===
      correctSecondPara.toLowerCase().replace(/\W*/, "");
    return testResult(success, {
      failureMessage: `Second paragraph does not match ${correctSecondPara}`,
      userData,
    });
  },
  async fix(course) {
    if (new Course(course.rawData).isGrad())
      return testResult("not run", {
        notFailureMessage:
          "Skipped for grad courses — discussion structure differs.",
      });

    const { success, userData } = await this.run(course);
    if (success)
      return testResult("not run", { notFailureMessage: "No need to run fix" });

    if (!userData?.secondPara)
      return testResult(false, {
        failureMessage: "There was a problem accessing the syllabus.",
      });
    const { el, secondPara } = userData;

    secondPara.innerHTML = correctSecondPara;
    try {
      await course.changeSyllabus(el.innerHTML);
      return testResult(true);
    } catch (e) {
      return errorMessageResult(e);
    }
  },
};

const goodApaLanguage =
  "The standard citation style for all Unity DE courses, " +
  "unless otherwise noted in assignment instructions, " +
  "is APA.";

const runApaNote = inSyllabusSectionFunc(
  /grading policies/i,
  /standard citation style/i,
);
const fixApaNote = addSyllabusSectionFix(
  runApaNote,
  paraify(goodApaLanguage),
  AddPosition.DirectlyAfterHeader,
);

export const addApaNoteToGradingPoliciesTest = {
  name: "Add APA default language",
  beforeAndAfters: [
    [
      "<div><h3>Grading</h3><h4>Grading Policies</h4><p>control</p></div>",
      `<div><h3>Grading</h3><h4>Grading Policies</h4><p>${goodApaLanguage}</p><p>control</p></div>`,
    ],
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

const runLatePolicyTableCheck = inSyllabusSectionFunc(
  /grading/i,
  /<tr>\s*<td>0\.01 to 1/i,
);

export const latePolicyTableTest = {
  name: "Add Late Policy table",
  beforeAndAfters: [
    [
      '<div><h2>Grading</h2><h3>Grading Policies</h3><p>Lorem</p><h3>Grading Scale</h3><div class="cbt-table"><table></table></div><p>ipsum</p></div>',
      `<div><h2>Grading</h2><h3>Grading Policies</h3><p>Lorem</p>${tableHtml}<h3>Grading Scale</h3><div class="cbt-table"><table></table></div><p>ipsum</p></div>`,
    ],
  ],
  description: `Add the late policy table to the grading section of the syllabus. The table should look like this: ${tableHtml} (Skipped for grad courses.)`,
  run: async (course: ISyllabusHaver & ICourseDataHaver) => {
    if (new Course(course.rawData).isGrad())
      return testResult("not run", {
        notFailureMessage: "Late policy table check skipped for grad courses.",
      });
    return runLatePolicyTableCheck(course);
  },
  fix: async (course: ISyllabusHaver & ICourseDataHaver) => {
    if (new Course(course.rawData).isGrad())
      return testResult("not run", {
        notFailureMessage: "Late policy table fix skipped for grad courses.",
      });
    const results = await runLatePolicyTableCheck(course);
    if (results.success)
      return testResult("not run", {
        notFailureMessage: "Late policy table already exists.",
      });
    const syllabus = await course.getSyllabus();
    const el = htmlDiv(syllabus);
    const gradingHeaderText = "Grading Scale";
    const gradingHeader = el.querySelectorAll(`h3`);

    // Find the first h3 that contains the grading header text
    const gradingHeaderEl = Array.from(gradingHeader).find((h3) =>
      h3.textContent?.includes(gradingHeaderText),
    );

    //grab the next table after that header
    if (!gradingHeaderEl) {
      // If the table doesn't exist, add it after the grading header
      return testResult(false, {
        failureMessage:
          "Grading Policies section not found or grading table not found.",
        links: [`/courses/${course.id}/assignments/syllabus`],
      });
    }
    // If the table exists, insert the new table after main grading table
    gradingHeaderEl.insertAdjacentHTML("beforebegin", tableHtml);
    try {
      await course.changeSyllabus(el.innerHTML);
      return testResult(true, {
        links: [`/courses/${course.id}/assignments/syllabus`],
      });
    } catch (e) {
      return errorMessageResult(e);
    }
  },
} as TextReplaceValidation<
  ISyllabusHaver & ICourseDataHaver,
  InSyllabusSectionFuncUserData,
  InSyllabusSectionFuncUserData | undefined
>;

const badAiLanguage = "n this course, you may be encouraged to explore";
const badAiRegex = /n this course,? you may be encouraged to explore/gi;
const goodAiLanguage =
  "n this course, you may be asked to use or encouraged to explore";

export const addAiGenerativeLanguageTest = {
  name: "Add AI generative Language",
  description: `Add the following language to the generative ai section: ${goodAiLanguage}`,
  beforeAndAfters: [
    [badAiLanguage, goodAiLanguage],
    [`<p>${badAiLanguage}</p>`, `<p>${goodAiLanguage}</p>`],
    [`<p>abcd${badAiLanguage}efg</p>`, `<p>abcd${goodAiLanguage}efg</p>`],
  ],
  run: badSyllabusRunFunc(badAiRegex),
  fix: badSyllabusFixFunc(badAiRegex, goodAiLanguage),
};

const badSupportEmail = "helpdesk@unity.edu";
const goodSupportEmail = "unitysupport@unity.edu";

const badSupportEmailRegex = /helpdesk@unity\.edu/gi;

export const fixSupportEmailTest: TextReplaceValidation<ISyllabusHaver> = {
  name: "Update Support Email",
  description: `Update the support email in the syllabus from ${badSupportEmail} to ${goodSupportEmail}`,
  beforeAndAfters: [
    [badSupportEmail, goodSupportEmail],
    [
      `<p>For support, please contact <a href="mailto:${badSupportEmail}`,
      `<p>For support, please contact <a href="mailto:${goodSupportEmail}`,
    ],
  ],
  run: badSyllabusRunFunc(badSupportEmailRegex),
  fix: badSyllabusFixFunc(badSupportEmailRegex, goodSupportEmail),
};

type HonorCodeUserData = {
  parsedSyllabus: Document;
  honorCodeTable: HTMLTableElement | undefined;
  course: Course;
};

const ugSearchString = "students be honest in all academic work";
const ugHonorCodeLinkPhrase = "?docid=3341";
const gradHonorCodeSearchString =
  "Academic Integrity and the Graduate Honor Code";
const gradHonorCodeLinkPhrase = "?docid=3327";
const gradHonorCodeHtml = `<h3><strong>Academic Integrity and the Graduate Honor Code</strong></h3><p>Unity Environmental University expects graduate students to uphold the highest standards of academic integrity in all coursework and scholarship. This includes producing original work, citing sources accurately, acknowledging collaboration, and using AI tools responsibly.</p><p>Academic dishonesty includes (but is not limited to) plagiarism, falsifying data or citations, unauthorized collaboration, misrepresenting authorship, or submitting AI-generated content without meaningful human review and authorship.</p><p>Violations are cumulative across terms and may result in academic penalties up to and including dismissal. A first low-level issue may be treated as a learning opportunity; repeated or serious offenses become formal violations recorded with the Dean&rsquo;s office.</p><p>Unity uses Turnitin to support academic integrity. When Turnitin is enabled, you must agree that the work submitted is your own, with all sources properly cited.</p><p>The complete policy can be found in the <a href="https://unitycollege.policytech.com/dotNet/documents/?docid=3327&amp;app=pt&amp;source=unspecified&amp;public=true">Graduate Academic Honor Code</a>.</p>`;

export const honorCodeCheck: CourseValidation<
  ISyllabusHaver & ICourseDataHaver
> = {
  name: "Syllabus Honor Code Check",
  description:
    "Checks for outdated honor code section in syllabus and replaces it with new language.",
  async run(bp) {
    let honorCodeTable: HTMLTableElement | undefined = undefined;
    const syllabus = await bp.getSyllabus();
    const parser = new DOMParser();
    const parsedSyllabus = parser.parseFromString(syllabus, "text/html");
    const tables = parsedSyllabus.querySelectorAll("table");
    const course = new Course(bp.rawData);

    // UG check: flag any table that has old language, or mentions honor code without the new link
    if (course.isUndergrad()) {
      for (const table of tables) {
        const hasOldLanguage = table.textContent?.includes(ugSearchString);
        const hasHonorCodeText = table.textContent
          ?.toLowerCase()
          .includes("honor code");
        const hasNewLink = table.innerHTML.includes(ugHonorCodeLinkPhrase);

        if (hasOldLanguage || (hasHonorCodeText && !hasNewLink)) {
          honorCodeTable = table;
        }
      }

      return testResult(!honorCodeTable, {
        failureMessage:
          "Syllabus honor code section is missing or has incorrect language/link.",
        notFailureMessage: "Honor code table is up to date.",
        userData: {
          parsedSyllabus,
          honorCodeTable,
          course,
        } as HonorCodeUserData,
      });
    }

    // Grad check: passes only when the correct grad heading and link are both present
    if (course.isGrad()) {
      for (const table of tables) {
        const hasGradHeader = table.textContent?.includes(
          gradHonorCodeSearchString,
        );
        const hasGradLink = table.innerHTML.includes(gradHonorCodeLinkPhrase);
        if (hasGradHeader && hasGradLink) {
          honorCodeTable = table;
        }
      }

      return testResult(honorCodeTable !== undefined, {
        failureMessage:
          "Syllabus is missing the Graduate Honor Code section or has incorrect content/link.",
        notFailureMessage: "Honor code table is up to date.",
        userData: {
          parsedSyllabus,
          honorCodeTable,
          course,
        } as HonorCodeUserData,
      });
    }

    return testResult("not run", {
      notFailureMessage: "Not run because course is not grad or undergrad",
    });
  },
  async fix(bp, results) {
    if (!results)
      return testResult("not run", {
        notFailureMessage:
          "Fix did not run because results of test are unknown",
      });
    if (results?.success)
      return testResult("not run", {
        notFailureMessage:
          "Fix did not run because syllabus honor code section is correct.",
      });

    const { course }: HonorCodeUserData = results.userData;
    let honorCodeTd: HTMLTableCellElement | undefined = undefined;

    const syllabus = await bp.getSyllabus();
    const parser = new DOMParser();
    const parsedSyllabus = parser.parseFromString(syllabus, "text/html");
    const tables = Array.from(parsedSyllabus.querySelectorAll("table"));

    const ugNewSyllabusHtml = `<h3><strong>The Unity Environmental University Honor Code</strong></h3><p>Click on <a href="https://unitycollege.policytech.com/dotNet/documents/?docid=3341&app=pt&source=browse&public=true">this link to view the full Academic Honor Code</a>. You are responsible for being familiar with the Academic Honor Code.</p>`;

    if (course.isUndergrad()) {
      const honorCodeTable = tables.find((table) => {
        const hasOldLanguage = table.textContent?.includes(ugSearchString);
        const hasHonorCodeText = table.textContent
          ?.toLowerCase()
          .includes("honor code");
        const hasNewLink = table.innerHTML.includes(ugHonorCodeLinkPhrase);
        return hasOldLanguage || (hasHonorCodeText && !hasNewLink);
      });
      if (!honorCodeTable)
        return testResult("not run", {
          notFailureMessage: "Couldn't find table in syllabus",
        });

      honorCodeTd = Array.from(honorCodeTable.querySelectorAll("td")).find(
        (td) => {
          const hasOldLanguage = td.textContent?.includes(ugSearchString);
          const hasHonorCodeText = td.textContent
            ?.toLowerCase()
            .includes("honor code");
          const hasNewLink = td.innerHTML.includes(ugHonorCodeLinkPhrase);
          return hasOldLanguage || (hasHonorCodeText && !hasNewLink);
        },
      );
      if (!honorCodeTd)
        return testResult("not run", {
          notFailureMessage: "Couldn't find honor code table cell.",
        });

      honorCodeTd.innerHTML = ugNewSyllabusHtml;

      // Remove fixed heights so the table resizes naturally after the shorter UG content is inserted.
      for (const el of [
        honorCodeTable,
        ...Array.from(honorCodeTable.querySelectorAll("tr, td")),
      ]) {
        (el as HTMLElement).style.removeProperty("height");
        el.removeAttribute("height");
      }
    } else if (course.isGrad()) {
      const gradHonorCodeTable = tables.find((table) => {
        const hasHonorCodeText = table.textContent
          ?.toLowerCase()
          .includes("honor code");
        const hasCorrectGradHeader = table.textContent?.includes(
          gradHonorCodeSearchString,
        );
        const hasCorrectGradLink = table.innerHTML.includes(
          gradHonorCodeLinkPhrase,
        );
        return (
          hasHonorCodeText && !(hasCorrectGradHeader && hasCorrectGradLink)
        );
      });
      if (!gradHonorCodeTable)
        return testResult("not run", {
          notFailureMessage:
            "Couldn't find table with incorrect honor code content in syllabus",
        });

      honorCodeTd = Array.from(gradHonorCodeTable.querySelectorAll("td")).find(
        (td) => td.textContent?.toLowerCase().includes("honor code"),
      );
      if (!honorCodeTd)
        return testResult("not run", {
          notFailureMessage: "Couldn't find honor code table cell.",
        });

      honorCodeTd.innerHTML = gradHonorCodeHtml;
    } else if (course.isCareerInstitute()) {
      return testResult("not run", {
        notFailureMessage:
          "Fix not run because there's not specific career institute honor code language",
      });
    }

    if (!honorCodeTd) {
      return testResult("not run", {
        notFailureMessage:
          "Course is neither undergrad nor grad, or honor code cell not found.",
      });
    }

    try {
      await bp.changeSyllabus(parsedSyllabus.body.innerHTML);
      return testResult(true, {
        notFailureMessage: "Syllabus honor code section updated successfully!",
      });
    } catch (e) {
      return testResult(false, {
        failureMessage: `Could not update syllabus: ${e}`,
      });
    }
  },
};

const titleIXHTML = `<tr><td><h3><strong>Title IX Mandatory Reporting</strong></h3><p>Please note that instructors are mandatory reporters under Title IX. If you share information about sexual harassment, assault, relationship violence, stalking, or gender-based discrimination that involves another Unity student or employee, they are required to notify the University&rsquo;s Title IX office so they can offer you support and resources.</p></td></tr>`;

const runTitleIXPolicyCheck = inSyllabusSectionFunc(
  /Title IX/i,
  /Please note that instructors are mandatory/i,
);

export const titleIXPolicyTest = {
  name: "Add Title IX Policy to Syllabus",
  beforeAndAfters: [
    [
      `<table><p>course.</p></td></tr></tbody></table>`,
      `<table><p>course.</p></td></tr>${titleIXHTML}</tbody></table>`,
    ],
  ],
  description: `Add the Title IX policy to the bottom of the Syllabus table.`,
  run: runTitleIXPolicyCheck,
  fix: async (course: ISyllabusHaver) => {
    const results = await runTitleIXPolicyCheck(course);
    if (results.success)
      return testResult("not run", {
        notFailureMessage: "Title IX policy cell already exists.",
      });
    const syllabus = await course.getSyllabus();

    let newHtml: string;
    if (
      /course\.\s*<\/p>\s*<\/td>\s*<\/tr>\s*<\/tbody>\s*<\/table>/i.test(
        syllabus,
      )
    ) {
      newHtml = syllabus.replace(
        /course\.\s*<\/p>\s*<\/td>\s*<\/tr>\s*<\/tbody>\s*<\/table>/i,
        `course.</p></td></tr>${titleIXHTML}</tbody></table>`,
      );
    } else {
      newHtml = syllabus.replace(
        /course\.<\/p>\s*<\/td>\s*<\/tr>\s*<\/table>/i,
        `course.</p></td></tr>${titleIXHTML}</table>`,
      );
    }

    try {
      await course.changeSyllabus(newHtml);
      return testResult(true, {
        links: [`/courses/${course.id}/assignments/syllabus`],
      });
    } catch (e) {
      return errorMessageResult(e);
    }
  },
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

  const pTags = Array.from(parsedSyllabus.querySelectorAll("p"));
  const courseP = pTags.find((p) =>
    p.textContent?.trim().startsWith("Course Number and Title:"),
  );

  if (!courseP)
    return testResult("not run", {
      notFailureMessage: "Course number and title not found.",
    });

  const content = courseP.textContent
    ?.split("Course Number and Title:")[1]
    .trim();
  const courseCodeMatch = content?.match(/\b([A-Za-z]{4})\s*([0-9]{3})\b/);

  if (!courseCodeMatch)
    return testResult("not run", {
      notFailureMessage: "Course code not found.",
    });

  const numericPart = parseInt(courseCodeMatch[2], 10);
  const isUndergrad = numericPart < 500;

  if (isUndergrad) {
    if (syllabus.toString().includes("Any graded"))
      return testResult(true, {
        notFailureMessage:
          "Syllabus already has language about grading deadlines.",
      });
    return testResult(false, {
      failureMessage:
        "Syllabus does not have language about grading deadlines.",
      links: [`/courses/${course.id}/assignments/syllabus`],
    });
  } else {
    return testResult(true, {
      notFailureMessage: "Not run because course is not undergrad.",
    });
  }
};

const gradingDeadlineFix = async (course: ISyllabusHaver) => {
  const syllabus = await course.getSyllabus();
  const syllabusText = syllabus.toString();
  const fixedText = syllabusText.replace(/<\/div>\s*<\/div>\s*$/, "");
  const newSyllabus =
    fixedText +
    `<br /><p><strong>${gradingDeadlineLanguage}</strong></p></div><div>`;
  try {
    course.changeSyllabus(newSyllabus);
    return testResult(true);
  } catch (e) {
    return errorMessageResult(e);
  }
};

export const gradingDeadlineLanguageTest: CourseFixValidation<ISyllabusHaver> =
  {
    name: "UG Grading Deadline Language",
    description:
      "Adds clarifying language about the discussion deadlines to the bottom of the syllabus",
    run: gradingDeadlineRun,
    fix: gradingDeadlineFix,
  };

const aiPolicyVideoLink =
  "https://drive.google.com/file/d/16O7s7_nX9NZF3orhogb3-nusBCCZ796x/view?t=2";
const aiPolicyInfographicLink =
  "https://drive.google.com/file/d/1Gzbgp5piaQk9PQT5BbNsSfWfqEqWmNak/view";

const aiPolicyMediaRun = async (course: ISyllabusHaver) => {
  const syllabus = await course.getSyllabus();
  const hasVideoLink = syllabus.includes(`"${aiPolicyVideoLink}"`);
  const hasInfographicLink = syllabus.includes(`"${aiPolicyInfographicLink}"`);

  if (hasVideoLink && hasInfographicLink) {
    return testResult(true, {
      notFailureMessage:
        "Syllabus already has infographic and video links in AI Policy section.",
    });
  } else if (hasVideoLink && !hasInfographicLink) {
    return testResult(false, {
      failureMessage:
        "Syllabus does not have infographic link in AI Policy section.",
      links: [`/courses/${course.id}/assignments/syllabus`],
    });
  } else if (!hasVideoLink && hasInfographicLink) {
    return testResult(false, {
      failureMessage: "Syllabus does not have video link in AI Policy section.",
      links: [`/courses/${course.id}/assignments/syllabus`],
    });
  } else {
    return testResult(false, {
      failureMessage:
        "Syllabus does not have infographic and video links in AI Policy section.",
      links: [`/courses/${course.id}/assignments/syllabus`],
    });
  }
};

const aiPolicyMediaFix = async (course: ISyllabusHaver) => {
  const parser = new DOMParser();
  const syllabus = await course.getSyllabus();
  const parsedSyllabus = parser.parseFromString(syllabus, "text/html");

  const aiPolicyMediaText = `<p>For more information on Unity's AI policy, you can check out <a href="${aiPolicyVideoLink}">this video</a> or <a href="${aiPolicyInfographicLink}">this inforgraphic</a>.</p>`;

  const syllabusTds = Array.from(parsedSyllabus.querySelectorAll("td"));
  const aiPolicyTd = syllabusTds.find((td) =>
    td.textContent?.includes("Artificial Intelligence Policy for Students"),
  );

  if (!aiPolicyTd) {
    return testResult("not run", {
      notFailureMessage: "AI Policy section not found.",
    });
  }

  if (aiPolicyTd.innerHTML.includes("<h3><strong>&nbsp;</strong></h3>")) {
    aiPolicyTd.innerHTML = aiPolicyTd.innerHTML.replace(
      "<h3><strong>&nbsp;</strong></h3>",
      "",
    );
  }

  aiPolicyTd.innerHTML += aiPolicyMediaText;
  const container = document.createElement("div");
  container.innerHTML =
    parsedSyllabus.body.innerHTML || parsedSyllabus.documentElement.innerHTML;
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
  description:
    "Checks for infographic and video links in AI Policy section of syllabus",
  run: aiPolicyMediaRun,
  fix: aiPolicyMediaFix,
};

const badSupportNumber = "207-509-7277";
const goodSupportNumber = "207-509-7110";

export const supportPhoneNumberFix: CourseFixValidation<ISyllabusHaver> = {
  name: "Support Phone Number Fix",
  description: "Checks for incorrect support phone number in syllabus",
  run: badSyllabusRunFunc(new RegExp(badSupportNumber, "ig")),
  fix: badSyllabusFixFunc(
    new RegExp(badSupportNumber, "ig"),
    goodSupportNumber,
  ),
};

export const gradingPolicyTest: TextReplaceValidation<ISyllabusHaver> = {
  name: "Change 'Extenuating Circumstances' Sentence",
  beforeAndAfters: [
    [
      "If you experience extenuating circumstances that prevent you from completing your work on time, reach out to your instructor as soon as possible.",
      "If you experience extenuating circumstances that prevent you from completing your work on time, reach out to your instructor before the due date to request an extension.",
    ],
  ],
  description:
    "Update the extenuating circumstances sentence in the grading section of the syllabus",
  run: async (course, _config) => {
    const syllabus = await course.getSyllabus();
    const match = /reach out to your instructor as soon as possible/gi.test(
      syllabus,
    );
    return testResult(!match, {
      failureMessage: ["Outdated sentence found in syllabus"],
      links: [`/courses/${course.id}/assignments/syllabus`],
    });
  },
  fix: badSyllabusFixFunc(
    /reach out to your instructor as soon as possible/gi,
    "reach out to your instructor before the due date to request an extension",
  ),
};

type BadUrlData = {
  name: string;
  description?: string;
  badUrl: string;
  goodUrl: string;
};

const makeBeforeAndAfters = (badUrlData: BadUrlData) => {
  const { badUrl, goodUrl } = badUrlData;
  return [
    [`<a href="${badUrl}">`, `<a href="${goodUrl}">`],
    [
      `<a href="${badUrl}" target="_blank">`,
      `<a href="${goodUrl}" target="_blank">`,
    ],
  ];
};
const makeSyllabusUrlCheck: (
  data: BadUrlData,
) => CourseFixValidation<ISyllabusHaver> = (data: BadUrlData) => {
  const { badUrl, goodUrl, name } = data;
  let description = data.description;
  const escapedBadUrl = badUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const badUrlRegex = new RegExp(escapedBadUrl, "ig");
  const run = badSyllabusRunFunc(badUrlRegex);
  const fix = badSyllabusFixFunc(badUrlRegex, goodUrl);
  description ??= `Change ${badUrl} to ${goodUrl} in the syllabus.`;

  return {
    beforeAndAfters: makeBeforeAndAfters(data),
    description,
    name,
    run,
    fix,
  };
};

const gradDiscussionExpectationsHtml = `<h3><strong>Discussion Expectations</strong></h3><p class="grad">Some discussions require you to post your initial response before viewing your peers&rsquo; posts. All discussions have deadlines on two different days each week: your initial post by 3:00 a.m. ET Thursday and your peer responses by 3:00 a.m. ET Monday. This schedule ensures everyone has posts available for meaningful interaction. You are encouraged to post and/or respond on different days during the week to create an active, ongoing discussion.</p><p>Your posts should contribute thoughtfully to the conversation. Avoid brief responses such as &ldquo;I agree&rdquo; or &ldquo;I was thinking the same thing.&rdquo; Instead, write responses that offer constructive feedback, analysis, critique, or insights related to the topic and prompts.</p><p>To view the grading rubric, select &ldquo;View Rubric&rdquo; in the discussion directions or open the &ldquo;More Options&rdquo; menu (titled <em>&ldquo;Manage this Discussion&rdquo;</em> for screen readers) and click &ldquo;Show Rubric.&rdquo;</p><p>All students are expected to uphold the <a href="https://unity.instructure.com/courses/3266650/pages/digital-citizenship-expectations">Digital Citizenship Expectations</a>, which guide respectful and engaged participation in our online learning community.</p>`;

function findDiscussionExpectationsTd(el: HTMLElement) {
  const h3 = [...el.querySelectorAll("h3")].find((h) =>
    (h.innerText ?? h.textContent ?? "").includes("Discussion Expectations")
  );
  return h3?.closest("td") ?? null;
}

export const gradDiscussionExpectationsTest: CourseFixValidation<
  ISyllabusHaver & ICourseDataHaver
> = {
  name: "Grad Discussion Expectations",
  description:
    'Checks that grad syllabi have the correct Discussion Expectations paragraph (class="grad") with 3:00 a.m. ET Thursday and Monday deadlines.',
  async run(course) {
    if (!new Course(course.rawData).isGrad())
      return testResult("not run", { notFailureMessage: "Not a grad course." });

    const el = htmlDiv(await course.getSyllabus());
    const links = [`/courses/${course.id}/assignments/syllabus`];
    const discussExpectTd = findDiscussionExpectationsTd(el);

    if (!discussExpectTd)
      return testResult(false, { failureMessage: "Discussion Expectations section not found.", links });

    const gradPara = discussExpectTd.querySelector("p.grad");
    const text = (discussExpectTd.textContent?.toLowerCase() ?? "").replace(/\s+/g, " ");
    const hasDeadlines = text.includes("3:00 a.m. et thursday") && text.includes("3:00 a.m. et monday");

    return testResult(gradPara !== null && hasDeadlines, {
      failureMessage:
        'Discussion Expectations section is missing the correct grad paragraph (class="grad") or the 3:00 a.m. ET deadline language.',
      links,
    });
  },
  async fix(course) {
    if (!new Course(course.rawData).isGrad())
      return testResult("not run", { notFailureMessage: "Not a grad course." });

    const { success } = await this.run(course);
    if (success) return testResult("not run", { notFailureMessage: "Grad Discussion Expectations already correct." });

    const el = htmlDiv(await course.getSyllabus());
    const links = [`/courses/${course.id}/assignments/syllabus`];
    const discussExpectTd = findDiscussionExpectationsTd(el);

    if (!discussExpectTd)
      return testResult(false, { failureMessage: "Discussion Expectations section not found.", links });

    discussExpectTd.innerHTML = gradDiscussionExpectationsHtml;

    try {
      await course.changeSyllabus(el.innerHTML);
      return testResult(true, { links });
    } catch (e) {
      return errorMessageResult(e);
    }
  },
};

type GradSectionUserData = {
  parsedSyllabus: Document;
  sectionTd: HTMLTableCellElement | undefined;
  course: Course;
};

function findGradSectionTd(
  parsedSyllabus: Document,
  headingSearch: string | RegExp
): HTMLTableCellElement | undefined {
  return Array.from(parsedSyllabus.querySelectorAll("td")).find((td) => {
    const text = (td.textContent ?? "").replace(/\s+/g, " ");
    return typeof headingSearch === "string"
      ? text.includes(headingSearch)
      : headingSearch.test(text);
  }) as HTMLTableCellElement | undefined;
}

function gradSectionRun(
  headingSearch: string | RegExp,
  checkString: string,
  failureMessage: string
) {
  return async (bp: ISyllabusHaver & ICourseDataHaver) => {
    const syllabus = await bp.getSyllabus();
    const parser = new DOMParser();
    const parsedSyllabus = parser.parseFromString(syllabus, "text/html");
    const course = new Course(bp.rawData);

    if (!course.isGrad())
      return testResult("not run", { notFailureMessage: "Not a grad course." });

    const sectionTd = findGradSectionTd(parsedSyllabus, headingSearch);
    const text = (sectionTd?.textContent ?? "").replace(/\s+/g, " ");
    const success = text.includes(checkString);

    return testResult(success, {
      failureMessage,
      notFailureMessage: "Section content is correct.",
      userData: { parsedSyllabus, sectionTd, course } as GradSectionUserData,
    });
  };
}

function gradSectionFix(headingSearch: string | RegExp, canonicalHtml: string) {
  return async (
    bp: ISyllabusHaver & ICourseDataHaver,
    results?: { success: boolean | "not run" | "unknown"; userData?: GradSectionUserData }
  ) => {
    if (!results)
      return testResult("not run", { notFailureMessage: "Fix did not run because results of test are unknown." });
    if (results.success)
      return testResult("not run", { notFailureMessage: "Fix did not run because section is already correct." });

    const { course } = results.userData ?? {};
    if (!course?.isGrad())
      return testResult("not run", { notFailureMessage: "Not a grad course." });

    const syllabus = await bp.getSyllabus();
    const parser = new DOMParser();
    const parsedSyllabus = parser.parseFromString(syllabus, "text/html");
    const sectionTd = findGradSectionTd(parsedSyllabus, headingSearch);

    if (!sectionTd)
      return testResult("not run", { notFailureMessage: "Couldn't find section in syllabus." });

    sectionTd.innerHTML = canonicalHtml;

    // Remove fixed heights so the cell and its row resize naturally after content replacement.
    for (const el of [sectionTd, sectionTd.closest("tr")].filter(Boolean)) {
      (el as HTMLElement).style.removeProperty("height");
      el!.removeAttribute("height");
    }

    try {
      await bp.changeSyllabus(parsedSyllabus.body.innerHTML);
      return testResult(true, { notFailureMessage: "Section updated successfully." });
    } catch (e) {
      return testResult(false, { failureMessage: `Could not update syllabus: ${e}` });
    }
  };
}

const gradLearningAccommodationsHtml = `<h3><strong>Learning Accommodations</strong></h3><p>Unity Environmental University supports students with disabilities by providing reasonable learning accommodations.</p><p>If you believe you may need accommodations, please contact the <a href="https://unity.edu/policies/accessibility-and-ada-services/">Accessibility and ADA Services Office</a> to begin the review process. You&rsquo;ll complete an Accessibility and Accommodations Request Form and provide relevant documentation. Eligibility and appropriate supports will be determined confidentially, and you&rsquo;ll be contacted directly to discuss next steps.</p>`;

const gradLearningAccommodationsRun = gradSectionRun(
  "Learning Accommodations",
  "Accessibility and ADA Services Office",
  "Learning Accommodations section does not have the correct grad content."
);
export const gradLearningAccommodationsTest: CourseFixValidation<ISyllabusHaver & ICourseDataHaver> = {
  name: "Grad Learning Accommodations",
  description: "Checks that grad syllabi have the correct concise Learning Accommodations section referencing the Accessibility and ADA Services Office.",
  run: gradLearningAccommodationsRun,
  fix: gradSectionFix("Learning Accommodations", gradLearningAccommodationsHtml),
};

const gradAIPolicyHtml = `<h3><strong>Using Generative Artificial Intelligence(AI)</strong></h3><p>Students must follow the <a href="https://unity.instructure.com/courses/3266650/pages/gen-ai-student-policy">Unity Distance Education Generative AI Policy for Students</a>, which defines acceptable and unacceptable use of AI tools. Please review this policy before using AI in your coursework.</p><p>In this course, you may be invited to explore or apply generative AI tools to support learning. When AI use is <em>not</em> permitted for a particular assignment, it will be clearly stated in the instructions. If an assignment does not specify restrictions, AI use is allowed in line with the policy above.</p><p>If you have questions about using AI effectively or appropriately, contact your instructor.</p><p>For additional guidance, view Unity&rsquo;s <a href="https://drive.google.com/file/d/16O7s7_nX9NZF3orhogb3-nusBCCZ796x/view?t=2">AI Policy Video</a> or <a href="https://drive.google.com/file/d/1Gzbgp5piaQk9PQT5BbNsSfWfqEqWmNak/view">AI Policy Infographic</a>.</p>`;

const gradAIPolicyRun = gradSectionRun(
  /generative artificial intelligence/i,
  "Using Generative Artificial Intelligence(AI)",
  "AI policy section does not have the correct grad heading or content."
);
export const gradAIPolicyTest: CourseFixValidation<ISyllabusHaver & ICourseDataHaver> = {
  name: "Grad AI Policy",
  description: 'Checks that grad syllabi use the "Using Generative Artificial Intelligence(AI)" heading and paragraph-style content.',
  run: gradAIPolicyRun,
  fix: gradSectionFix(/generative artificial intelligence/i, gradAIPolicyHtml),
};

const gradTechnicalSupportHtml = `<h3><strong>Technical Support</strong></h3><p>For questions about Canvas, contact your instructor.</p><p>For issues with your Unity Environmental University email or other technical services, email unitysupport@unity.edu or call 207‑509‑7110 for faster assistance, especially outside business hours.</p>`;

const gradTechnicalSupportRun = gradSectionRun(
  "Technical Support",
  "For questions about Canvas, contact your instructor.",
  "Technical Support section does not have the correct grad content."
);
export const gradTechnicalSupportTest: CourseFixValidation<ISyllabusHaver & ICourseDataHaver> = {
  name: "Grad Technical Support",
  description: 'Checks that grad syllabi have the concise Technical Support section ("For questions about Canvas, contact your instructor.").',
  run: gradTechnicalSupportRun,
  fix: gradSectionFix("Technical Support", gradTechnicalSupportHtml),
};

const gradStatementOnFairPracticesHtml = `<h3><strong>Statement on Fair Practices</strong></h3><p>Unity Environmental University prohibits discrimination on the basis of race, color, creed or religion, national origin, sex, sexual orientation, age, marital status, pregnancy, veteran&rsquo;s status, or disability in regard to treatment, access to, or employment in its programs and activities, in accordance with federal and state laws and regulations. &nbsp;In compliance with the Americans with Disabilities Act (ADA), individuals with disabilities needing accommodation should contact the ADA compliance officer.</p><p>For further explanation on this topic, please contact the Dean.</p><p>This syllabus constitutes the agreement between the instructor and student.</p><p>Any modifications to this syllabus will be identified during the course.</p>`;

const gradStatementOnFairPracticesRun = gradSectionRun(
  "Statement on Fair Practices",
  "creed or religion",
  "Statement on Fair Practices does not contain the full standard language."
);
export const gradStatementOnFairPracticesTest: CourseFixValidation<ISyllabusHaver & ICourseDataHaver> = {
  name: "Grad Statement on Fair Practices",
  description: 'Checks that the Statement on Fair Practices includes "creed or religion" and "veteran\'s status" (the full standard language).',
  run: gradStatementOnFairPracticesRun,
  fix: gradSectionFix("Statement on Fair Practices", gradStatementOnFairPracticesHtml),
};

const badUrlDatas: BadUrlData[] = [
  {
    name: "Fix Send Message Url",
    badUrl: "https://community\\.canvaslms\\.com/docs/DOC-10574-4212710325",
    goodUrl:
      "https://community.instructure.com/en/kb/articles/662866-how-do-i-send-a-message-to-a-user-in-a-course-in-the-inbox",
  },
];

export default [
  ...badUrlDatas.map(makeSyllabusUrlCheck),
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
  honorCodeCheck,
  addApaNoteToGradingPoliciesTest,
  titleIXPolicyTest,
  gradingDeadlineLanguageTest,
  aiPolicyMediaTest,
  supportPhoneNumberFix,
  gradingPolicyTest,
  gradDiscussionExpectationsTest,
  gradLearningAccommodationsTest,
  gradAIPolicyTest,
  gradTechnicalSupportTest,
  gradStatementOnFairPracticesTest,
];
