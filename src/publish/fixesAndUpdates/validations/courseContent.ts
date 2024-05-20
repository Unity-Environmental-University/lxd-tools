import {IPagesHaver} from "../../../canvas/course/index";
import {CourseValidationTest, testResult, ValidationTestResult} from "./index";

export const weeklyObjectivesTest: CourseValidationTest<IPagesHaver> = {
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
            const h2s = el.querySelectorAll('h2');
            const weeklyObjectivesHeaders = Array.from(h2s).filter(h2 => /Weekly Objectives/i.test(h2.textContent || ''))
            return weeklyObjectivesHeaders.length === 0;

        })
        const success = badOverviews.length === 0;
        const result = testResult(
            badOverviews.length === 0,
             badOverviews.map(page => page.name).sort())
        if (!success) result.links = badOverviews.map(page => page.htmlContentUrl)
        return result;
    }
}
export const courseProjectOutlineTest: CourseValidationTest<IPagesHaver> = {
    name: "Project outline -> Course Project Outline",
    description: "On the Course Project Overview page, make sure the heading reads \"Course Project Outline\" and not \"Project outline\"",
    run: async (course, config) => {
        const pages = await course.getPages({
            ...config,
            queryParams: {...config?.queryParams, search_term: 'Course Project', include: ['body']}
        });
        const projectOverviewPages = pages.filter(page => /Course Project Overview/.test(page.name));
        if (projectOverviewPages.length === 0) {
            return <ValidationTestResult>{
                success: 'unknown',
                message: "No 'Course Project Overview' page found for this course. This might be fine."
            }
        }

        if (projectOverviewPages.length > 1) {
            return <ValidationTestResult>{
                success: 'unknown',
                message: "Multiple course overview page matches found, unable to check.",
                links: projectOverviewPages.map(page => page.htmlContentUrl)
            }
        }

        const projectOverview = projectOverviewPages[0];
        const pageHtml = projectOverview.body;
        const el = document.createElement('div');
        el.innerHTML = pageHtml;
        const h2s = Array.from(el.querySelectorAll('h2'));
        const projectHeadings = h2s.filter(h2 => h2.textContent === 'Project outline')

        const response = testResult(
            projectHeadings.length < 1,
            ["Course project page has 'Project outline' as a header"],
        )
        if (!response.success) response.links = [projectOverview.htmlContentUrl];
        return response;
    }
}

export default [
    courseProjectOutlineTest,
    weeklyObjectivesTest
]