import {testResult} from "@publish/fixesAndUpdates/validations/utils";
import PageKind from "@ueu/ueu-canvas";
import {renderAsyncGen} from "@ueu/ueu-canvas";
import {Course} from "@ueu/ueu-canvas";
import {IPageData} from "@ueu/ueu-canvas";
import assert from "assert";
import {CourseFixValidation} from "@publish/fixesAndUpdates/validations/types";

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
    const brokenPage = result.userData;

    if (result.success || !brokenPage ) {
         return testResult('not run', { notFailureMessage: "Test not run; no broken pages" });
     }

    const body = document.createElement('div');
    body.innerHTML = brokenPage.body;

    const footer = findFooter(body);
    footer?.remove();

    const footerCheck = findFooter(body);
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