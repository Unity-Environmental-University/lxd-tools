import {CourseFixValidation} from "@publish/fixesAndUpdates/validations/types";
import {testResult} from "@publish/fixesAndUpdates/validations/utils";
import pageKind from "@canvas/content/pages/PageKind";
import {renderAsyncGen} from "@canvas/canvasUtils";


type CourseInterface = {
    id: number;
}

const badUrl = "https://online.unity.edu/support";
const goodUrl = "https://unity.edu/distance-education/academic-and-career-support/";

const run: CourseFixValidation<CourseInterface>['run'] = async ({id}) => {

    const success = false;
    let page = await pageKind.getByString(id, "student-support-resources");
    if (!page) {
        return testResult('unknown', {
            notFailureMessage: "Support page not found.",
            userData: null,
        });
    }
    if(!pageKind.dataIsThisKind(page)) {

        //try to get the page by search
        const pages = await renderAsyncGen(
            pageKind.dataGenerator(id, { queryParams: {search_term: "Student Support Resources" }}));
        if(pages.length > 1) {
            return testResult('unknown', {
                notFailureMessage: "Multiple support pages found.",
                userData: pages,
            })
        }
        if(pages.length  == 0) {
            return testResult('unknown', {
                notFailureMessage: "Page not found: " + page.message,
                userData: pages,
            })
        }
        page = pages[0];

    }

    const pageEl = document.createElement("div");
    pageEl.innerHTML = (page.body);

    const links = pageEl.querySelectorAll("a");
    let foundBadUrl = false;
    links.forEach(link => {
        if (link.href.toLocaleLowerCase() === badUrl.toLocaleLowerCase()) {
            foundBadUrl = true;
        }
    });


    return testResult(!foundBadUrl, {
        failureMessage: `Support page has link ${badUrl}`,
        userData: page,
    });
}

const fix: CourseFixValidation<CourseInterface>['fix'] = async (course, result) => {

    result ??= await run(course);

    const { userData: page } = result;
    if (result.success) {
        return testResult('not run', { notFailureMessage: "No fix needed." });
    }
if (!page || !pageKind.dataIsThisKind(page)) {
        return testResult(false, {
            failureMessage: "Unable to find support page. Failed to fix.",
            userData: null,
        });
    }
    const newPageBody = page.body.replace(badUrl, goodUrl);
    try {
        const result = await pageKind.put(course.id, page.page_id, {
            wiki_page: {
                body: newPageBody,
            },
        });
        if(result) {
            return testResult(true, {
                notFailureMessage: "Support page updated successfully.",
                userData: result,
            });
        } else {
            return testResult(false, {
                failureMessage: "Failed to update support page.",
                userData: null,
            });
        }

    } catch (e) {
        const failureMessage = e instanceof Error ? e.message : "Failed due to unknown error.";
        return testResult(false, {
            failureMessage,
            userData: null,
        });
    }
}


export const updateSupportPage: CourseFixValidation<CourseInterface> = {
    name: "Update Support Page",
    description: "Updates the support page for the course.",
    run,
    fix,
}


