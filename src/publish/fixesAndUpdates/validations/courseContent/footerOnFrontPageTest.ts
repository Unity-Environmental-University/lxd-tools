import {ContentTextReplaceFix, CourseFixValidation, testResult} from "@publish/fixesAndUpdates/validations/utils";
import {IContentHaver} from "@canvas/course/courseTypes";
import {Page} from "@canvas/content/pages/Page";
import PageKind from "@canvas/content/pages/PageKind";
import {renderAsyncGen} from "@canvas/canvasUtils";
import badContentReplaceFuncs from "@publish/fixesAndUpdates/validations/courseContent/badContentReplaceFuncs";
import mockOverviewCategoriesBefore
    from "@publish/fixesAndUpdates/validations/courseContent/data/mockOverviewCategoriesBefore";
import mockOverviewCategoriesAfter
    from "@publish/fixesAndUpdates/validations/courseContent/data/mockOverviewCategoriesAfter";
import {ContentFix} from "@canvas/fixes";
import {Course} from "@canvas/course/Course";
import {IPageData} from "@canvas/content/pages/types";
import assert from "assert";
import {type} from "@testing-library/user-event/dist/type";

type OverviewFix = CourseFixValidation<Course, IPageData|undefined>
export const footerOnFrontPageFix: OverviewFix = {
    name: "Remove Footer",
    description: "Removes footer from front page",
    async run(course) {
        let success = false;

        //Test Logic Here
        const frontPage = await course.getFrontPage();
        assert(frontPage);
        const footer = findFooter(frontPage?.body);
        success = !footer;
        const brokenPage = frontPage;

        return testResult(success, {
            failureMessage: "",
            userData: brokenPage?.data as IPageData,
            links: [ brokenPage?.htmlContentUrl ]
        })

    },
   async fix(course, result?) {
    let success = false;
    result ??= await this.run(course);
    let brokenPage = result.userData;

    if (result.success || !brokenPage ) {
         return testResult('not run', { notFailureMessage: "Test not run; no broken pages" });
     }

    const body = document.createElement('div');
    body.innerHTML = brokenPage.body;

    const footer = findFooter(body);
    footer?.remove();

    let footerCheck = findFooter(body);
    if(footerCheck) return testResult(false, {
       failureMessage: "Failed to remove footer from front page"
    });

    const frontPage = await course.getFrontPage();
    const frontPageData = frontPage?.data;
    if(footerCheck) return testResult(false, {
       failureMessage: "Failed to find front page on fix"
    });

    const fixedPage = await frontPage?.updateContent(body.innerHTML) as IPageData;

    success = typeof (fixedPage.body) === 'undefined'

    // success = fixedPages.length == brokenPages.length;
    return testResult(success, {
        userData: fixedPage,
        links: [fixedPage.url]
    });
}

}

function findFooter(body: string | HTMLElement) {
    let el: HTMLElement;
    if (typeof body === 'string') {
        el = document.createElement('div');
        el.innerHTML = body;
    } else {
        el = body;
    }

    return el.querySelector('div.cbt-footer-container')

}

async function getContent(courseId: number) {
    const pageGen = PageKind.dataGenerator(courseId, {
        queryParams: {
            search_term: 'Home',
            include: ['body']
        }
    })
    const pageDatas = await renderAsyncGen(pageGen);
    return pageDatas;
}


export default footerOnFrontPageFix;