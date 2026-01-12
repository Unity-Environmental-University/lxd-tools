import { Page } from "@/canvas/content/pages/Page";
import { IContentHaver } from "@canvas/course/courseTypes";
import { getCourseById } from "@canvas/course/index";
import { CourseFixValidation } from "@publish/fixesAndUpdates/validations/types";
import {
  testResult,
  ValidationResult,
} from "@publish/fixesAndUpdates/validations/utils";
import PageKind from "@canvas/content/pages/PageKind";

type UserData = {
  overviewPage: Page;
  expectedHtml: string;
  honorCodeDiv: HTMLDivElement;
};

export const courseOverviewLanguageTest: CourseFixValidation<
  IContentHaver,
  UserData
> = {
  name: "Course Overview Language",
  description: "Boilerplate text for the overview page matches expected",
  run,
  fix,
};

async function run(course: IContentHaver): Promise<ValidationResult<UserData>> {
  //Find the course overview page
  const courseObj = await getCourseById(course.id);
  if (!courseObj.isUndergrad())
    return testResult("not run", {
      notFailureMessage: "Course is not undergraduate",
    });

  //Check the content against expected
  //TODO; Replace the _______ with the full policy link
  const expectedHtml =
    '<p class="c8"><strong><span class="c11">By participating in this course, you agree:</span></strong></p><ol class="c2 lst-kix_no0h5pq6o19m-0 start" start="1"><li class="c4 c7 li-bullet-0"><span>To adhere to the Code of Conduct, found in the </span><span class="c10"><a class="c13" href="https://www.google.com/url?q=https://nam11.safelinks.protection.outlook.com/?url%3Dhttps%253A%252F%252Funity.edu%252Fwp-content%252Fuploads%252F2025%252F06%252FDistance-Education-Student-Handbook-v.5-2-28-25.pdf%26data%3D05%257C02%257CHLarsson%2540unity.edu%257C445b0329ad954bcfb97f08de3f265dbd%257Ca5df695b72854f398c84d1c50676d682%257C0%257C0%257C639017631178060818%257CUnknown%257CTWFpbGZsb3d8eyJFbXB0eU1hcGkiOnRydWUsIlYiOiIwLjAuMDAwMCIsIlAiOiJXaW4zMiIsIkFOIjoiTWFpbCIsIldUIjoyfQ%253D%253D%257C0%257C%257C%257C%26sdata%3DF492mPozOhmiWU8v2thCwQFF0oY4YZMCFe8uCooz%252Bko%253D%26reserved%3D0&amp;sa=D&amp;source=editors&amp;ust=1767801604939379&amp;usg=AOvVaw1gRAZ1nfKD-y2gD-dDMK6j">Unity DE Student Handbook</a></span><span class="c0">&nbsp;at all times.<br /></span></li></ol><p style="padding-left: 40px;"><em><span class="c9 c1">Violations are subject to formal academic review and may result in administrative course withdrawal or dismissal from Unity Environmental University.</span></em></p><ol class="c2 lst-kix_no0h5pq6o19m-0 start" start="2"><li class="c4 c7 li-bullet-0"><span class="c0">To adhere to the Unity DE Honor Code (You can read the full policy here: ________)</span></li></ol><p class="c4" style="padding-left: 40px;"><strong><span class="c11">Overview: Honor Code &amp; Academic Integrity</span></strong></p><p class="c4" style="padding-left: 40px;"><span class="c0">Unity Environmental University expects all students to demonstrate academic integrity. This means doing your own work, using sources ethically, providing proper citations, and using AI tools responsibly and transparently.</span></p><p class="c4" style="padding-left: 40px;"><span class="c0">Academic dishonesty includes plagiarism, falsified or fabricated citations, unauthorized collaboration, falsifying data, misrepresenting your work, or submitting AI-generated work that you did not verify.</span></p><p class="c4" style="padding-left: 40px;"><span class="c0">If academic dishonesty occurs, the Honor Code supersedes the grading rubric. Repeated instances have increasingly serious consequences and may result in a zero on the assignment, failing a course, and possible dismissal.</span></p><p class="c4" style="padding-left: 40px;"><span class="c0">In all terms:</span></p><ul><li style="list-style-type: none;"><ul><li style="list-style-type: none;"><ul class="c2 lst-kix_rvuoj7p3q2oq-1 start"><li class="c5 li-bullet-0"><span class="c0">You will receive feedback about the issue<br /></span></li><li class="c5 li-bullet-0"><span class="c0">You will receive a zero on the assignment<br /></span></li><li class="c5 li-bullet-0"><span class="c0">The instructor will report the incident to the Academic Dean<br /></span></li></ul></li></ul></li></ul><p class="c4" style="padding-left: 40px;"><span class="c0">What Happens if This Occurs More Than Once?</span></p><p class="c4" style="padding-left: 40px;"><span class="c1"><em>First term:</em><br /></span><span class="c0">You may be offered a chance to complete a learning module, discuss with your instructor, and redo your work.</span></p><p class="c4" style="padding-left: 40px;"><span class="c1"><em>Second term:</em><br /></span><span class="c0">You may be invited to meet with the Academic Dean. Resubmission (if permitted) is limited to 50%.</span></p><p class="c4" style="padding-left: 40px;"><span class="c1"><em>Third term:</em><br /></span><span class="c0">A meeting with the Academic Dean is required, and repeated dishonesty after that meeting may result in dismissal from the University.</span></p><p class="c4" style="padding-left: 40px;"><span class="c0">Why We Do This</span></p><p class="c4" style="padding-left: 40px;"><span class="c0">The process is designed to help you learn proper academic practices, ensure fairness, and support your development as a scholar and professional.</span></p><ol class="c2 lst-kix_50gj9gk8xv4y-0" start="3"><li class="c4 c7 li-bullet-0"><span>That you have access to the equipment, skills and time necessary for completing Unity DE courses, as stated on the </span><span class="c10"><a class="c13" href="https://www.google.com/url?q=https://nam11.safelinks.protection.outlook.com/?url%3Dhttps%253A%252F%252Funity.edu%252Fdistance-education%252Fget-started%252Ftechnology-commitment%252F%26data%3D05%257C02%257CHLarsson%2540unity.edu%257C445b0329ad954bcfb97f08de3f265dbd%257Ca5df695b72854f398c84d1c50676d682%257C0%257C0%257C639017631178093707%257CUnknown%257CTWFpbGZsb3d8eyJFbXB0eU1hcGkiOnRydWUsIlYiOiIwLjAuMDAwMCIsIlAiOiJXaW4zMiIsIkFOIjoiTWFpbCIsIldUIjoyfQ%253D%253D%257C0%257C%257C%257C%26sdata%3Dn8dD8X1dRnuI3wCIZlEvNh4gJd8%252BKSTnSYGPBhPg8JU%253D%26reserved%3D0&amp;sa=D&amp;source=editors&amp;ust=1767801604943006&amp;usg=AOvVaw38OFYk5a9Fak39M8tpUmsf">Technology for Success</a></span><span class="c0">&nbsp;webpage. </span></li></ol><p class="c4" style="padding-left: 40px;"><em><span class="c1 c9">It is your responsibility to ensure that you have the minimum requirements necessary to fully access and receive support from our staff and faculty. Without the Required Technology Skills for Coursework, you may not be able to access all course materials and/or complete certain assignments, and you will still be financially responsible for the course.</span></em></p><p class="c4"><span class="c0">Please confirm your agreement to the three numbered items above (code of conduct, honor code, and tech requirements) by selecting the \'Confirm your agreement\' button below. It is mandatory to agree to the honor code before proceeding with this unit.</span></p><p class="c12">&nbsp;</p>';

  const pages = await course.getPages({
    queryParams: { include: ["body"] },
  });
  console.log("pages: ", pages);

  if (!pages.length)
    return testResult(false, {
      failureMessage: "Course Overview page not found",
    });
  let overviewPage: Page | undefined;
  for (const page of pages) {
    console.log("Page title: ", page.title);
    if (page.title.toLocaleLowerCase().includes("course overview")) {
      overviewPage = page;
    }
  }
  if (!overviewPage)
    return testResult("not run", {
      notFailureMessage: "Can't find the course overview page.",
    });

  console.log("Overview Page: ", overviewPage);
  //Parse the page

  const parser = new DOMParser();

  const parsedPage = parser.parseFromString(overviewPage.body, "text/html");
  // Find the div containing 'By participating in this course, you agree:'
  const divs = Array.from(parsedPage.querySelectorAll("div"));
  let honorCodeDiv: HTMLDivElement | undefined;
  for (const div of divs) {
    if (
      div.textContent?.includes("By participating in this course, you agree:")
    ) {
      honorCodeDiv = div;
      break;
    }
  }
  if (!honorCodeDiv)
    return testResult(false, { failureMessage: "Honor code div not found" });

  // TODO; innerHTML will throw a false fail when compared against expectedHtml after being fixed
  // This is likely a whitespace problem and I'm going to try to fix it by getting rid of any whitespace from innerHTML before the comparison

  //Hand off a result
  return testResult(honorCodeDiv.innerHTML === expectedHtml, {
    failureMessage: "Honor code div does not match expected",
    links: [`/courses/${course.id}/pages/${overviewPage.rawData.url}`],
    notFailureMessage: "Honor code div matches expected",
    userData: {
      overviewPage,
      expectedHtml,
      honorCodeDiv,
    },
  });
}

async function fix(
  course: IContentHaver,
  result: ValidationResult<UserData> | undefined,
): Promise<ValidationResult<UserData>> {

  if (!result || !result.userData)
    return testResult("not run", {
      notFailureMessage:
        "Fix didn't run because of an error passing test results to fix.",
    });

  if (result.success) {
    return testResult("not run", {
      notFailureMessage: "Fix not run because test was a success",
    });
  }

  const { overviewPage, expectedHtml, honorCodeDiv } = result.userData;
  //Attempt to fix
  const updateDiv = honorCodeDiv.innerHTML;
  const updatePageLocal = overviewPage.body.replace(updateDiv, expectedHtml);

   
  const updatePage = await PageKind.put(
    course.id,
    overviewPage.rawData.page_id,
    { wiki_page: { body: updatePageLocal } }
  );

  let success: boolean = false;

  if(updatePage && updatePage.page_id) {
    success = true;
  }

  // TODO; Test doesn't dissapear after being fixed.

  //Hand off a response
  return testResult(success, {
    notFailureMessage: "Course overview updated successfully.",
    failureMessage: success
      ? []
      : [{ bodyLines: ["Failed to update course overview"] }],
  });
}
