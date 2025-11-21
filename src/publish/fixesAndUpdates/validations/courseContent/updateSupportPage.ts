import {CourseFixValidation} from "@publish/fixesAndUpdates/validations/types";
import {testResult} from "@publish/fixesAndUpdates/validations/utils";
import pageKind from "@canvas/content/pages/PageKind";
import {renderAsyncGen} from "@canvas/canvasUtils";


type CourseInterface = {
    id: number;
}

const badUrl = "https://online.unity.edu/support/";
const goodUrl = "https://unity.edu/distance-education/student-resources/";

const run: CourseFixValidation<CourseInterface>['run'] = async ({id}) => {

    let page = await pageKind.getByString(id, "student-support-resources");
    if (!page || !pageKind.dataIsThisKind(page)) {

        //try to get the page by search
        const pageGen = pageKind.dataGenerator(id, {queryParams: {search_term: "Student Support Resources"}});
        const {done, value} = await pageGen.next();

        if (pageKind.dataIsThisKind(value)) {
            page = value;
        } else {
            return testResult("unknown", {
                notFailureMessage: "Support page not found. ",
            });
        }
    }

    const pageEl = document.createElement("div");
    pageEl.innerHTML = (page.body);

    const links = pageEl.querySelectorAll("a");
    let success = true;
    let errorMessage = "";

    if (links.length === 0) {
        success = false;
        errorMessage += "No links found on support page, needs attention. ";
    }

    links.forEach(link => {
        if (link.href.toLocaleLowerCase() === badUrl.toLocaleLowerCase()) {
            success = false;
            errorMessage += `Support page has link ${badUrl}. `;
        }
    });

    if (page.body.toLocaleLowerCase().includes("college")) {
        success = false
        errorMessage += "Support page mentions 'college.' ";
    }

    return testResult(success, {
        notFailureMessage: "Support page link is up to date.",
        failureMessage: errorMessage,
        userData: page,
    });
}

const fix: CourseFixValidation<CourseInterface>['fix'] = async (course, result) => {

    result ??= await run(course);

    const {userData: page} = result;
    if (result.success) {
        return testResult('not run', {notFailureMessage: "No fix needed."});
    }
    if (!page || !pageKind.dataIsThisKind(page)) {
        return testResult(false, {
            failureMessage: "Unable to find support page. Failed to fix.",
            userData: null,
        });
    }
    const newPageBody = page.body.replace(badUrl, goodUrl).replace(/college/gi, "university");
    try {
        const result = await pageKind.put(course.id, page.page_id, {
            wiki_page: {
                body: newPageBody,
            },
        });
        if (result) {
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
    description: "Checks for errors on the support page and fixes them.",
    run,
    fix,
}


