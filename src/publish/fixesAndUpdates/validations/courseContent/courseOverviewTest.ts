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
  "by participating in this course, you agree:",
  "to confirm your intent to remain enrolled in this course",
  "to adhere to the code of conduct",
  "to adhere to the unity de academic honor code",
  "overview: academic honor code",
  "accurate, verifiable information and fair work",
  "completing original work",
  "using ai tools responsibly",
  "students are responsible for everything they submit",
  "submitting unverifiable citations",
  "the academic honor code supersedes the grading rubric",
  "if your instructor flags a concern",
  "what are the implications if this occurs repeatedly",
  "within a course:",
  "across terms:",
  "the purpose behind this process",
  "ensure fairness and academic rigor",
  "support your development as a scholar and professional",
];

// Phrases that appear in HTML attributes (e.g. href), not visible text
const ugHtmlKeyPhrases = ["?docid=3360"];

const gradLangKeyPhrases = [
  "by participating in this course, you agree:",
  "to confirm your intent to remain enrolled in this course",
  "to adhere to the unity de honor code and code of conduct",
  "to adhere to the unity de graduate academic honor code",
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


const ugConfirmKeyPhrase: string = "(code of conduct, honor code, and tech requirements)";

const gradConfirmKeyPhrase: string = "you acknowledge that you have read and agree to comply";

const ugHonorCodeHtml =
  '<div class="cbt-content scaffold-media-box"data-canhavechild=true data-caninsertinto=true data-context-menu="delete moveup movedown duplicate insertbefore insertafter insert"><h3><strong>By participating in this course, you agree:</strong></h3><ol start=1><li><span data-teams=true>To confirm your intent to remain enrolled in this course.</span><li>To adhere to the Code of Conduct, found in the <a href=https://unity.edu/distance-education/student-resources/#catalog-and-handbook>Unity DE Student Handbook</a> at all times.</ol><ul><li style=list-style-type:none><ul><li><em>Violations are subject to formal academic review and may result in administrative course withdrawal, or dismissal from Unity Environmental University.</em></ul></ul><ol start=2><li>To adhere to the Unity DE Academic Honor Code You can read the full <a href="https://unitycollege.policytech.com/dotNet/documents/?docid=3360&app=pt&source=unspecified&public=true">policy here.</a></ol><h4><strong>Overview: Academic Honor Code</strong></h4><p>At Unity Environmental University, you’re expected to approach every assignment and course activity with honesty and responsibility. This relies on accurate, verifiable information and fair work. The Academic Honor Code helps create a culture of trust and ensures that your grades truly reflect your own learning. By committing to these principles, you help protect the value of your education—for yourself and for others.<p>Unity Environmental University expects all students to demonstrate academic integrity. This includes completing original work, attributing source information accurately, verifying the accuracy of all citations, and using AI tools responsibly. Students are responsible for everything they submit—content, sources, and claims—and must be able to demonstrate their learning and skills through their coursework.<p>Failure to meet the standards of the Academic Honor Code (which is also referred to as academic dishonesty in some cases) may be intentional or unintentional and includes plagiarism, misattribution, patchwriting, submitting unverifiable citations, falsified or manipulated data or images, unauthorized collaboration, misrepresentation of work, or submitting AI-generated content without review or verification. You can review the full Academic Honor Code for more information and definitions.<p>The Academic Honor Code supersedes the grading rubric. Repeated issues may have increasingly serious consequences, which may include a zero on the assignment(s), failing the course, or dismissal from the university.<p>If your instructor flags a concern:<ul><li>You will receive feedback about the issue<li>There may be a grading penalty up to a zero on that assignment<li>You may be offered a learning opportunity such as a skill-building module or a meeting with your instructor, and you may be able to redo your work for the first instance in that course. </ul><p>What are the implications if this occurs repeatedly?<p><span style=text-decoration:underline>Within a course:</span> Repeated instances may result in a zero on affected assignments and/or failing the course.<p><span style=text-decoration:underline>Across terms:</span> You may be asked to meet with an academic dean if there are repeated or egregious instances. The dean may recommend dismissal from the university. <p>The Purpose Behind This Process:<p>The process is designed to help you learn proper academic practices, ensure fairness and academic rigor, and support your development as a scholar and professional.<ol start=3><li>That you have access to the equipment, skills and time necessary for completing Unity DE courses, as stated on the <a href=https://unity.edu/distance-education/get-started/technology-commitment/ >Technology for Success</a> webpage.  <br><br><em>It is your responsibility to ensure that you have the minimum requirements necessary to fully access and receive support from our staff and faculty. Without the Required Technology Skills for Coursework, you may not be able to access all course materials and/or complete certain assignments, and you will still be financially responsible for the course.</em></ol></div>';

const ugConfirmHtml = `<div class="scaffold-media-box cbt-content cbt-page-as-agreement"data-canhavechild=true data-caninsertinto=true data-context-menu="delete moveup movedown duplicate insertbefore insertafter insert"><p class=c4><span style=font-weight:400>Please confirm your agreement to the </span><strong>three numbered items above</strong><span style=font-weight:400> (code of conduct, honor code, and tech requirements) by selecting the 'Confirm your agreement' button below. It is mandatory to agree to the honor code before proceeding with this unit.</span><div class="scaffold-media-box cbt-button"data-canhavechild=false data-caninsertinto=true data-context-menu="insert delete"data-editable=true><a href=#>Confirm your agreement</a></div></div>`;

const gradHonorCodeHtml = `<div class="cbt-content scaffold-media-box"data-canhavechild=true data-caninsertinto=true data-context-menu="delete moveup movedown duplicate insertbefore insertafter insert"><h4><strong>By participating in this course, you agree:</strong></h4><ol style=list-style-type:decimal><li><strong>To confirm your intent to remain enrolled in this course.</strong><li><strong>To adhere to the Unity DE Honor Code and Code of Conduct, found in the <a class=inline_disabled href=https://unity.edu/distance-education/student-resources/#catalog-and-handbook rel=noopener target=_blank>Student Handbook</a><span class=external_link_icon role=presentation><span class=screenreader-only>Links to an external site.</span></span> at all times.</strong><p><i><span>Violations are subject to formal review and may result in administrative course withdrawal, or dismissal from Unity Environmental University.</span></i><li><strong>That you have access to the equipment necessary for completing Unity DE courses, as stated on the <a class=inline_disabled href=https://unity.edu/distance-education/get-started/technology-commitment/ rel=noopener target=_blank>Technology for Success</a> webpage.</strong><p><i><span>It is your responsibility to ensure that you have the minimum requirements necessary to fully access and receive support from our staff and faculty. Without the Required Technology Skills for Coursework, you may not be able to access all course materials and/or complete certain assignments, and you will still be financially responsible for the course.</span></i></p><strong></strong><li><strong>To adhere to the Unity DE Graduate Academic Honor Code. You can read the <a class=inline_disabled href="https://unitycollege.policytech.com/docview/?docid=3327&app=pt&source=unspecified&public=true"rel=noopener target=_blank>full policy here</a>.</strong><p><strong>Overview: Graduate Academic Honor Code</strong><p><span>Unity Environmental University expects graduate students to demonstrate professional standards of academic integrity. This means submitting original work, citing sources accurately, and using AI tools responsibly. </span><p><span>Academic dishonesty includes plagiarism, falsifying data or citations, unauthorized collaboration, misrepresenting authorship, or submitting AI-generated content without meaningful review and authorship. </span><p><strong>How violations are addressed:</strong><p>Formal violations accumulate across courses and terms. First time, low-level issues may be treated as a learning opportunity rather than a formal violation.<div style=margin-left:30px><p><strong>Level 1 – Instructional Response (No Formal Violation)</strong> A first low-level issue may be treated as a learning opportunity. The instructor provides feedback and guidance. This does not count as a formal violation, but similar issues afterward may be treated as an academic dishonesty violation.<p><strong>Level 2 – First Formal Violation</strong> The assignment associated with the violation receives a zero and the violation is formally recorded with the Dean.<p><strong>Level 3 – Second Formal Violation or Serious Violation</strong> The student fails the course in which the violation occurred and must meet with an Academic Dean. First formal violations in a capstone course are treated at this level.<p><strong>Level 4 – Third Formal Violation</strong> A third formal report of academic dishonesty indicating a pattern of behavior may result in dismissal from the University.</div><p>Academic integrity violations may be reviewed at any time, including after course or program completion.<p><strong>IMPORTANT NOTE: Formal violations ARE cumulative across terms. Three formal graduate violations may result in dismissal from the University.</strong></ol></div>`;

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

	const honorCodeDivText = "by participating in this course, you agree:";

	// Parse the page
	const parser = new DOMParser();
	const parsedPage = parser.parseFromString(overviewPage.body, "text/html");

	// Find the div containing 'By participating in this course, you agree:'
	const divs = Array.from(parsedPage.querySelectorAll("div"));
	let honorCodeDiv: HTMLDivElement | undefined;
	let confirmDiv: HTMLDivElement | undefined;
	for (const div of divs) {
		if (div.textContent?.toLowerCase().includes(honorCodeDivText)) {
			honorCodeDiv = div;
		} else if (
			div.textContent?.toLowerCase().includes("confirm your agreement")
		) {
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
  let handbookLink: string = "";
  let success: boolean | undefined = undefined;

  if (courseObj.isUndergrad()) {
    langKeyPhrases = ugLangKeyPhrases;
    htmlKeyPhrases = ugHtmlKeyPhrases;
    confirmKeyPhrase = ugConfirmKeyPhrase;
    handbookLink = `https://unity.edu/distance-education/student-resources/#catalog-and-handbook`;
  }

  if (courseObj.isGrad()) {
    langKeyPhrases = gradLangKeyPhrases;
    confirmKeyPhrase = gradConfirmKeyPhrase;
  }

  const rawPageBody = overviewPage.body.toLowerCase();

  success =
    langKeyPhrases.every((phrase) => honorCodeTextContent.includes(phrase)) &&
    htmlKeyPhrases.every((phrase) => rawPageBody.includes(phrase)) &&
    confirmTextContent.includes(confirmKeyPhrase) &&
    (!courseObj.isUndergrad() || rawPageBody.includes(handbookLink));

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
  const { overviewPage, courseObj } = result.userData;

  if (!courseObj.isUndergrad() && !courseObj.isGrad()) {
    return testResult("not run", { notFailureMessage: "Fix not run because course isn't Grad or Undergrad." });
  }

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

  // Re-fetch and re-parse the page — stored DOM elements in userData don't survive
  // serialization through the UI state layer and lose their methods/properties.
  const pages = await course.getPages({ queryParams: { include: ["body"] } });
  const freshPage = pages.find((p) => p.rawData.page_id === overviewPage.page_id);
  if (!freshPage) return testResult("not run", { notFailureMessage: "Couldn't re-fetch overview page for fix." });

  const parser = new DOMParser();
  const parsedPage = parser.parseFromString(freshPage.body, "text/html");
  const divs = Array.from(parsedPage.querySelectorAll("div"));

  let honorCodeDiv: HTMLDivElement | undefined;
  let confirmDiv: HTMLDivElement | undefined;
  for (const div of divs) {
    if (div.textContent?.toLowerCase().includes("by participating in this course, you agree:")) {
      honorCodeDiv = div;
    } else if (div.textContent?.toLowerCase().includes("confirm your agreement")) {
      confirmDiv = div;
    }
    if (honorCodeDiv && confirmDiv) break;
  }

  if (!honorCodeDiv || !confirmDiv)
    return testResult("not run", { notFailureMessage: "Couldn't find honor code divs in overview page." });

  const updatePageLocal = freshPage.body
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
