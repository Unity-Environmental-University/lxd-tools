import {CourseValidation, MessageResult, testResult} from "@publish/fixesAndUpdates/validations/utils";
import {IPagesHaver} from "@canvas/course/courseTypes";

export const courseProjectOutlineTest: CourseValidation<IPagesHaver> = {
    name: "Project outline -> Course Project Outline",
    description: "On the Course Project Overview page, make sure the heading reads \"Course Project Outline\" and not \"Project outline\"",
    run: async (course, config) => {
        const pages = await course.getPages({
            ...config,
            queryParams: {...config?.queryParams, search_term: 'Course Project', include: ['body']}
        });
        const projectOverviewPages = pages.filter(page => /Course Project Overview/.test(page.name));

        if (projectOverviewPages.length != 1) {
            const noOverviewMessage = "No 'Course Project Overview' page found for this course. This might be fine.";
            const tooManyOverviewsMessage = 'Too many course overview pages';
            const notFailureMessage: MessageResult = {
                bodyLines: [projectOverviewPages.length === 0 ? noOverviewMessage : tooManyOverviewsMessage]
            }
            if (projectOverviewPages.length > 1) notFailureMessage.links = projectOverviewPages.map(page => page.htmlContentUrl)
            return testResult('unknown', {notFailureMessage})
        }

        const projectOverview = projectOverviewPages[0];
        const pageHtml = projectOverview.body;
        const el = document.createElement('div');
        el.innerHTML = pageHtml;
        const h2s = Array.from(el.querySelectorAll('h2'));
        const projectHeadings = h2s.filter(h2 => h2.textContent === 'Project outline')
        const failureMessage = ["Course project page has 'Project outline' as a header"];

        const response = testResult(projectHeadings.length < 1, {failureMessage})
        if (!response.success) response.links = [projectOverview.htmlContentUrl];
        return response;
    }
}

export default courseProjectOutlineTest;