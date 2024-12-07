import {testResult} from "@publish/fixesAndUpdates/validations/utils";
import {IPagesHaver} from "@canvas/course/courseTypes";
import {decodeHtml} from "@publish/fixesAndUpdates/validations/courseContent/decodeHtml";
import {CourseValidation} from "@publish/fixesAndUpdates/validations/types";

export const weeklyObjectivesTest: CourseValidation<IPagesHaver> = {
    name: "Learning Objectives -> Weekly Objectives",
    description: 'Make sure weekly objectives are called "Weekly Objectives" and not "Learning Objectives" throughout',
    run: async (course, config) => {
        let overviews = await course.getPages({
            ...config,
            queryParams: {...config?.queryParams, search_term: 'Overview', include: ['body']}
        });
        overviews = overviews.filter(overview => /week \d overview/ig.test(overview.name));

        const badOverviews = overviews.filter(overview => {
            const el = document.createElement('div');
            el.innerHTML = overview.body;
            const headerTexts = [...el.querySelectorAll('h2')].map(h2 => decodeHtml(h2.textContent ?? h2.innerText ?? ''));
            const weeklyObjectivesHeaders = headerTexts.filter(
                text => /Weekly\sObjectives/i.test(text))
            return weeklyObjectivesHeaders.length === 0;

        })
        const success = badOverviews.length === 0;
        const failureMessage = badOverviews.map(page => ({
            bodyLines: [page.name],
            links: [page.htmlContentUrl]
        }));

        const result = testResult(badOverviews.length === 0, {failureMessage})
        if (!success) result.links = badOverviews.map(page => page.htmlContentUrl)
        return result;
    }
}

export default  weeklyObjectivesTest;