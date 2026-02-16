import { testResult } from "@publish/fixesAndUpdates/validations/utils";
import PageKind from "@ueu/ueu-canvas";
import { renderAsyncGen } from "@ueu/ueu-canvas";
import { Course } from "@ueu/ueu-canvas";
import { IPageData } from "@ueu/ueu-canvas";
import { CourseFixValidation } from "@publish/fixesAndUpdates/validations/types";

type OverviewFix = CourseFixValidation<Course, IPageData[], IPageData[]>;
export const removeGradeTable: OverviewFix = {
  name: "Graded Activities Table",
  description: "Remove Graded activities table section from Course Overview",
  async run(course) {
    const pages = await getContent(course.id);

    const brokenPages = pages.filter((a) => findActivitySection(a.body));
    const success = brokenPages.length === 0;

    return testResult(success, {
      failureMessage: "Oveview page not fixed",
      userData: brokenPages,
      links: brokenPages.map((a) => a.htmlContentUrl),
    });
  },
  async fix(course, result?) {
    let success = false;
    result ??= await this.run(course);
    const brokenPages = result.userData;

    if (result.success || !brokenPages || brokenPages.length === 0) {
      return testResult("not run", { notFailureMessage: "Test not run; no broken pages" });
    }

    const fixedPages = [] as IPageData[];
    for (const page of brokenPages) {
      const body = document.createElement("div");
      body.innerHTML = page.body;

      // Debugging: check initial body content
      console.log("Initial body content:", body.innerHTML);

      let section = findActivitySection(body);
      section?.remove();

      // Debugging: check modified body content
      console.log("Modified body content:", body.innerHTML);

      // Recheck after removal, throw error if still present
      section = findActivitySection(body);
      if (section) throw new Error("Failed to remove section");

      console.log(PageKind);
      await PageKind.put(course.id, page.page_id, {
        wiki_page: {
          body: body.innerHTML,
        },
      });
      fixedPages.push(page);
    }

    success = fixedPages.length == brokenPages.length;
    return testResult(success, {
      userData: fixedPages,
    });
  },
};

function findActivitySection(body: string | HTMLElement) {
  let el: HTMLElement;
  if (typeof body === "string") {
    el = document.createElement("div");
    el.innerHTML = body;
  } else {
    el = body;
  }

  // Look specifically for h2 elements that contain "Graded Activities"
  const h2s = [...el.querySelectorAll("h2")];
  const gradedActivityHeader = h2s.filter((a) => {
    return (a.innerText ?? a.textContent).toLocaleLowerCase().includes("graded activities");
  });
  const gradedActivitySection = gradedActivityHeader[0]?.closest(".scaffold-media-box");

  return gradedActivitySection;
}

async function getContent(courseId: number) {
  const pageGen = PageKind.dataGenerator(courseId, {
    queryParams: {
      search_term: "course overview",
      include: ["body"],
    },
  });
  const pageDatas = await renderAsyncGen(pageGen);
  return pageDatas;
}

export default removeGradeTable;
