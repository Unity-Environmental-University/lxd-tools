import { IContentHaver } from "@ueu/ueu-canvas/course/courseTypes";
import { getCourseById } from "@ueu/ueu-canvas/course/index";
import { CourseFixValidation } from "@publish/fixesAndUpdates/validations/types";
import { testResult, ValidationResult } from "@publish/fixesAndUpdates/validations/utils";
import PageKind from "@ueu/ueu-canvas/content/pages/PageKind";
import { Course } from "@ueu/ueu-canvas/course/index";

// Declaring types
type MinPageData = {
  title: string;
  body: string;
  url: string;
  page_id: number;
};

type UserData = {
  overviewPage: MinPageData;
  honorCodeDiv: HTMLDivElement;
  confirmDiv: HTMLDivElement;
  courseObj: Course;
};

// Declaring variables here so they don't make the code messier
const ugLangKeyPhrases = [
  "unity de student handbook",
  "what happens if this occurs more than once",
  "in all terms:",
  "first term:",
  "second term:",
  "third term:",
  "why we do this",
  "resubmission (if permitted) is limited to 50%",
  "learning module",
  "academic honor code supersedes the grading rubric",
];

// Phrases that appear in HTML attributes (e.g. href), not visible text
const ugHtmlKeyPhrases = ["?docid=3341&app"];

const gradLangKeyPhrases = [
  "graduate academic honor code",
  "expects graduate students",
  "how violations are addressed",
  "first low-level issue",
  "level 1",
  "level 2",
  "level 3",
  "level 4",
  "cumulative across terms",
  "capstone course",
];

const ugConfirmKeyPhrase: string = "please confirm your agreement to the three numbered items above";

const gradConfirmKeyPhrase: string = "you acknowledge that you have read and agree to comply";

const ugHonorCodeHtml =
  '<p class=c8><strong><span class=c11>By participating in this course, you agree:</span></strong><ol class="c2 start lst-kix_no0h5pq6o19m-0"start=1><li class="c4 c7 li-bullet-0"><span>To adhere to the Code of Conduct, found in the </span><span class=c10><a class=c13 href="https://www.google.com/url?q=https://nam11.safelinks.protection.outlook.com/?url%3Dhttps%253A%252F%252Funity.edu%252Fwp-content%252Fuploads%252F2025%252F06%252FDistance-Education-Student-Handbook-v.5-2-28-25.pdf%26data%3D05%257C02%257CHLarsson%2540unity.edu%257C445b0329ad954bcfb97f08de3f265dbd%257Ca5df695b72854f398c84d1c50676d682%257C0%257C0%257C639017631178060818%257CUnknown%257CTWFpbGZsb3d8eyJFbXB0eU1hcGkiOnRydWUsIlYiOiIwLjAuMDAwMCIsIlAiOiJXaW4zMiIsIkFOIjoiTWFpbCIsIldUIjoyfQ%253D%253D%257C0%257C%257C%257C%26sdata%3DF492mPozOhmiWU8v2thCwQFF0oY4YZMCFe8uCooz%252Bko%253D%26reserved%3D0&sa=D&source=editors&ust=1767801604939379&usg=AOvVaw1gRAZ1nfKD-y2gD-dDMK6j">Unity DE Student Handbook</a></span><span class=c0> at all times.<br></span></ol><p style=padding-left:40px><i><span style=font-weight:400>Violations are subject to formal academic review and may result in administrative course withdrawal, or dismissal from Unity Environmental University.</span></i><ol class="c2 start lst-kix_no0h5pq6o19m-0"start=2><li class="c4 c7 li-bullet-0"><span class=c0>To adhere to the Unity DE Honor Code. You can read the <a class=inline_disabled href="https://unitycollege.policytech.com/dotNet/documents/?docid=3341&app=pt&source=browse&public=true"rel="noopener noreferrer"target=_blank>full policy here</a>.</span></ol><p class=c4 style=padding-left:40px><strong><span class=c11>Overview: Honor Code & Academic Integrity</span></strong><p class=c4 style=padding-left:40px><span style=font-weight:400>Unity Environmental University expects all students to demonstrate academic integrity. This means doing your own work, using sources ethically, providing proper citations, and using AI tools responsibly.</span><p class=c4 style=padding-left:40px><span style=font-weight:400>Academic dishonesty includes plagiarism, falsified or fabricated citations, unauthorized collaboration, falsifying data, misrepresenting your work, or submitting AI-generated work without reviewing or verifying its accuracy.</span><p class=c4 style=padding-left:40px><span style=font-weight:400>If academic dishonesty occurs, the Academic Honor Code supersedes the grading rubric. Repeated instances have increasingly serious consequences and may result in a zero on the assignment, failing a course, and possible dismissal.</span><p class=c4 style=padding-left:40px><span class=c0>In all terms:</span><ul><li style=list-style-type:none><ul><li style=list-style-type:none><ul class="c2 start lst-kix_rvuoj7p3q2oq-1"><li class="li-bullet-0 c5"><span class=c0>You will receive feedback about the issue<br></span><li class="li-bullet-0 c5"><span class=c0>You will receive a zero on the assignment<br></span><li class="li-bullet-0 c5"><span class=c0>The instructor will report the incident to the Academic Dean<br></span></ul></ul></ul><p class=c4 style=padding-left:40px><span class=c0>What Happens if This Occurs More Than Once?</span><p class=c4 style=padding-left:40px><span class=c1><em>First term:</em><br></span><span class=c0>You may be offered a chance to complete a learning module, discuss with your instructor, and redo your work.</span><p class=c4 style=padding-left:40px><span class=c1><em>Second term:</em><br></span><span class=c0>You may be invited to meet with the Academic Dean. Resubmission (if permitted) is limited to 50%.</span><p class=c4 style=padding-left:40px><span class=c1><em>Third term:</em><br></span><span class=c0>A meeting with the Academic Dean is required, and repeated dishonesty after that meeting may result in dismissal from the University.</span><p class=c4 style=padding-left:40px><span class=c0>Why We Do This</span><p class=c4 style=padding-left:40px><span style=font-weight:400>The process is designed to help you learn proper academic practices, ensure fairness, and support your development as a scholar and professional.</span><ol class="c2 lst-kix_50gj9gk8xv4y-0"start=3><li class="c4 c7 li-bullet-0"><span>That you have access to the equipment, skills and time necessary for completing Unity DE courses, as stated on the </span><span class=c10><a class=c13 href="https://www.google.com/url?q=https://nam11.safelinks.protection.outlook.com/?url%3Dhttps%253A%252F%252Funity.edu%252Fdistance-education%252Fget-started%252Ftechnology-commitment%252F%26data%3D05%257C02%257CHLarsson%2540unity.edu%257C445b0329ad954bcfb97f08de3f265dbd%257Ca5df695b72854f398c84d1c50676d682%257C0%257C0%257C639017631178093707%257CUnknown%257CTWFpbGZsb3d8eyJFbXB0eU1hcGkiOnRydWUsIlYiOiIwLjAuMDAwMCIsIlAiOiJXaW4zMiIsIkFOIjoiTWFpbCIsIldUIjoyfQ%253D%253D%257C0%257C%257C%257C%26sdata%3Dn8dD8X1dRnuI3wCIZlEvNh4gJd8%252BKSTnSYGPBhPg8JU%253D%26reserved%3D0&sa=D&source=editors&ust=1767801604943006&usg=AOvVaw38OFYk5a9Fak39M8tpUmsf">Technology for Success</a></span><span class=c0> webpage.</span></ol><p class=c4 style=padding-left:40px><i><span style=font-weight:400>It is your responsibility to ensure that you have the minimum requirements necessary to fully access and receive support from our staff and faculty. Without the Required Technology Skills for Coursework, you may not be able to access all course materials and/or complete certain assignments, and you will still be financially responsible for the course.</span></i>';

const ugConfirmHtml = `<p class=c4><span style=font-weight:400>Please confirm your agreement to the </span><strong>three numbered items above</strong><span style=font-weight:400> (code of conduct, honor code, and tech requirements) by selecting the 'Confirm your agreement' button below. It is mandatory to agree to the honor code before proceeding with this unit.</span><div class="cbt-button scaffold-media-box"data-canhavechild=false data-caninsertinto=true data-context-menu="insert delete"data-editable=true><a href=#>Confirm your agreement</a></div>`;

const gradHonorCodeHtml = `<div class="cbt-content scaffold-media-box cbt-lined-heading"data-canhavechild=true data-caninsertinto=true data-context-menu="delete moveup movedown duplicate insertbefore insertafter insert"><h2>Honor Code, Code of Conduct, and Tech for Success</h2></div><div class="cbt-content scaffold-media-box"data-canhavechild=true data-caninsertinto=true data-context-menu="delete moveup movedown duplicate insertbefore insertafter insert"><h4><strong>By participating in this course, you agree:</strong></h4><ol style=list-style-type:decimal><li><strong>To adhere to the Unity DE Honor Code and Code of Conduct, found in the <a class=inline_disabled href=https://unity.edu/distance-education/student-resources/#catalog-and-handbook rel=noopener target=_blank>Student Handbook</a><span class=external_link_icon role=presentation><span class=screenreader-only>Links to an external site.</span></span> at all times.</strong><p><i><span>Violations are subject to formal review and may result in administrative course withdrawal, or dismissal from Unity Environmental University.</span></i><li><strong>That you have access to the equipment necessary for completing Unity DE courses, as stated on the <a class=inline_disabled href="https://nam11.safelinks.protection.outlook.com/?url=https%3A%2F%2Funity.edu%2Fdistance-education%2Fget-started%2Ftechnology-commitment%2F&data=05%7C02%7CHLarsson%40unity.edu%7C445b0329ad954bcfb97f08de3f265dbd%7Ca5df695b72854f398c84d1c50676d682%7C0%7C0%7C639017631178093707%7CUnknown%7CTWFpbGZsb3d8eyJFbXB0eU1hcGkiOnRydWUsIlYiOiIwLjAuMDAwMCIsIlAiOiJXaW4zMiIsIkFOIjoiTWFpbCIsIldUIjoyfQ%3D%3D%7C0%7C%7C%7C&sdata=n8dD8X1dRnuI3wCIZlEvNh4gJd8%2BKSTnSYGPBhPg8JU%3D&reserved=0"rel=noopener target=_blank>Technology for Success</a> webpage.</strong><p><i><span>It is your responsibility to ensure that you have the minimum requirements necessary to fully access and receive support from our staff and faculty. Without the Required Technology Skills for Coursework, you may not be able to access all course materials and/or complete certain assignments, and you will still be financially responsible for the course.</span></i></p><strong></strong><li><strong>To adhere to the Unity DE Graduate Academic Honor Code. You can read the <a class=inline_disabled href="https://unitycollege.policytech.com/docview/?docid=3327&app=pt&source=unspecified&public=true"rel=noopener target=_blank>full policy here</a>.</strong><p><strong>Overview: Graduate Academic Honor Code</strong><p><span>Unity Environmental University expects graduate students to demonstrate professional standards of academic integrity. This means submitting original work, citing sources accurately, and using AI tools responsibly. </span><p><span>Academic dishonesty includes plagiarism, falsifying data or citations, unauthorized collaboration, misrepresenting authorship, or submitting AI-generated content without meaningful review and authorship. </span><p><strong>How violations are addressed:</strong><p>Formal violations accumulate across courses and terms. First time, low-level issues may be treated as a learning opportunity rather than a formal violation.<div style=margin-left:30px><p><strong>Level 1 – Instructional Response (No Formal Violation)</strong> A first low-level issue may be treated as a learning opportunity. The instructor provides feedback and guidance. This does not count as a formal violation, but similar issues afterward may be treated as an academic dishonesty violation.<p><strong>Level 2 – First Formal Violation</strong> The assignment associated with the violation receives a zero and the violation is formally recorded with the Dean.<p><strong>Level 3 – Second Formal Violation or Serious Violation</strong> The student fails the course in which the violation occurred and must meet with an Academic Dean. First formal violations in a capstone course are treated at this level.<p><strong>Level 4 – Third Formal Violation</strong> A third formal report of academic dishonesty indicating a pattern of behavior may result in dismissal from the University.</div><p>Academic integrity violations may be reviewed at any time, including after course or program completion.<p><strong>IMPORTANT NOTE: Formal violations ARE cumulative across terms. Three formal graduate violations may result in dismissal from the University.</strong></ol></div>`;

const gradConfirmHtml = `<div class="scaffold-media-box cbt-content cbt-page-as-agreement"data-canhavechild=true data-caninsertinto=true data-context-menu="delete moveup movedown duplicate insertbefore insertafter insert"><p><span style=font-size:12pt><span>By selecting </span><strong style=font-size:1rem>“Confirm Your Agreement,”</strong><span> you acknowledge that you have read and agree to comply with the Student Code of Conduct, Graduate Academic Honor Code, and Technology for Success requirements.</span></span><p><span style=font-size:12pt><span>Confirmation is required before proceeding with the course. </span></span><div class="scaffold-media-box cbt-button"data-canhavechild=false data-caninsertinto=true data-context-menu="insert delete"data-editable=true><a href=#>Confirm your agreement</a></div></div>`;

export const courseOverviewLanguageTest: CourseFixValidation<IContentHaver, UserData> = {
  name: "Course Overview Language",
  description: "Boilerplate text for the overview page matches expected",
  run,
  fix,
};

async function run(course: IContentHaver): Promise<ValidationResult<UserData>> {
  const courseObj = await getCourseById(course.id);

  if (!courseObj.isUndergrad() && !courseObj.isGrad()) {
    return testResult("not run", { notFailureMessage: "Not run because course isn't grad or UG." });
  }

  const pages = await course.getPages({
    queryParams: { include: ["body"] },
  });
  console.log("pages: ", pages);

  if (!pages.length) {
    return testResult(false, {
      failureMessage: "Unable to find pages in the course.",
    });
  }

  let overviewPage: MinPageData | undefined = undefined;
  for (const page of pages) {
    console.log("Page title: ", page.title);
    if (page.title.toLowerCase().includes("course overview")) {
      overviewPage = { title: page.title, body: page.body, url: page.rawData.url, page_id: page.rawData.page_id };
      console.log("overview page: ", overviewPage);
    }
  }

  if (!overviewPage) {
    return testResult("not run", {
      notFailureMessage: "Can't find the course overview page.",
    });
  }

  console.log("Overview Page: ", overviewPage);

  // Parse the page
  const parser = new DOMParser();
  const parsedPage = parser.parseFromString(overviewPage.body, "text/html");

  // Find the div containing 'By participating in this course, you agree:'
  const divs = Array.from(parsedPage.querySelectorAll("div"));
  let honorCodeDiv: HTMLDivElement | undefined;
  let confirmDiv: HTMLDivElement | undefined;
  for (const div of divs) {
    if (div.textContent?.toLowerCase().includes("by participating in this course, you agree:")) {
      honorCodeDiv = div;
    } else if (div.textContent?.toLowerCase().includes("confirm your agreement")) {
      confirmDiv = div;
    }

    if (honorCodeDiv && confirmDiv) {
      break;
    }
  }

  console.log("Honor code div: ", honorCodeDiv);
  console.log("confirm div: ", confirmDiv);

  if (!honorCodeDiv || !confirmDiv) return testResult(false, { failureMessage: "Can't find text to check." });

  const honorCodeTextContent = honorCodeDiv.textContent?.toLowerCase();
  const confirmTextContent = confirmDiv.textContent?.toLowerCase();

  console.log("textContent: ", honorCodeTextContent);

  if (!honorCodeTextContent || !confirmTextContent)
    return testResult(false, { failureMessage: "Couldn't find text to compare." });

  let langKeyPhrases: string[] = [];
  let htmlKeyPhrases: string[] = [];
  let confirmKeyPhrase: string = "";
  let success: boolean | undefined = undefined;

  if (courseObj.isUndergrad()) {
    langKeyPhrases = ugLangKeyPhrases;
    htmlKeyPhrases = ugHtmlKeyPhrases;
    confirmKeyPhrase = ugConfirmKeyPhrase;
  }

  if (courseObj.isGrad()) {
    langKeyPhrases = gradLangKeyPhrases;
    confirmKeyPhrase = gradConfirmKeyPhrase;
  }

  const rawPageBody = overviewPage.body.toLowerCase();

  success =
    langKeyPhrases.every((phrase) => honorCodeTextContent.includes(phrase)) &&
    htmlKeyPhrases.every((phrase) => rawPageBody.includes(phrase)) &&
    confirmTextContent.includes(confirmKeyPhrase);

  //Hand off a result
  return testResult(success, {
    failureMessage: "Honor code div does not match expected",
    links: [`/courses/${course.id}/pages/${overviewPage.url}`],
    notFailureMessage: "Honor code div matches expected",
    userData: {
      overviewPage,
      honorCodeDiv,
      confirmDiv,
      courseObj,
    },
  });
}

async function fix(
  course: IContentHaver,
  result: ValidationResult<UserData> | undefined
): Promise<ValidationResult<UserData>> {
  if (!result || !result.userData)
    return testResult("not run", {
      notFailureMessage: "Fix didn't run because of an error passing test results to fix.",
    });

  if (result.success) {
    return testResult("not run", {
      notFailureMessage: "Fix not run because test was a success",
    });
  }

  let success: boolean = false;
  const { overviewPage, honorCodeDiv, confirmDiv, courseObj } = result.userData;

  if (!courseObj.isUndergrad() && !courseObj.isGrad()) {
    return testResult("not run", { notFailureMessage: "Fix not run because course isn't Grad or Undergrad." });
  }

  let updatePageLocal: string | undefined = undefined;

  let honorCodeHtml: string = "";
  let confirmHtml: string = "";

  if (courseObj.isUndergrad()) {
    honorCodeHtml = ugHonorCodeHtml;
    confirmHtml = ugConfirmHtml;
  }

  if (courseObj.isGrad()) {
    honorCodeHtml = gradHonorCodeHtml;
    confirmHtml = gradConfirmHtml;
  }

  updatePageLocal = overviewPage.body
    .replace(honorCodeDiv.innerHTML, honorCodeHtml)
    .replace(confirmDiv.innerHTML, confirmHtml);

  const updatePage = await PageKind.put(course.id, overviewPage.page_id, { wiki_page: { body: updatePageLocal } });

  console.log(updatePage);

  if (updatePage && updatePage.page_id) {
    success = true;
  }

  //Hand off a response
  return testResult(success, {
    notFailureMessage: "Course overview updated successfully.",
    failureMessage: success ? [] : [{ bodyLines: ["Failed to update course overview page."] }],
  });
}
