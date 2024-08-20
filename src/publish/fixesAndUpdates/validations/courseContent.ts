import {
    badContentFixFunc,
    badContentRunFunc, ContentTextReplaceFix,
    CourseFixValidation,
    CourseValidation,
    MessageResult,
    stringsToMessageResult,
    testResult, TextReplaceValidation,
    ValidationResult
} from "./validations";
import {IContentHaver, IPagesHaver} from "../../../canvas/course/courseTypes";
import {Course} from "../../../canvas/course/Course";
import {deepObjectMerge, ICanvasCallConfig} from "../../../canvas/canvasUtils";
import {BaseContentItem} from "@/canvas/content/BaseContentItem";
import {Page} from "@/canvas/content/assignments/pages/Page";


function decodeHtml(html:string) {
    let text = document.createElement("textarea");
    text.innerHTML = html;
    return text.value;
}

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
        const failureMessage =  badOverviews.map(page => ({
            bodyLines: [page.name],
            links: [page.htmlContentUrl]
        }));

        const result = testResult(badOverviews.length === 0, {failureMessage})
        if (!success) result.links = badOverviews.map(page => page.htmlContentUrl)
        return result;
    }
}

export const courseProjectOutlineTest: CourseValidation<IPagesHaver> = {
    name: "Project outline -> Course Project Outline",
    description: "On the Course Project Overview page, make sure the heading reads \"Course Project Outline\" and not \"Project outline\"",
    run: async (course, config) => {
        const pages = await course.getPages({
            ...config,
            queryParams: {...config?.queryParams, search_term: 'Course Project', include: ['body']}
        });
        const projectOverviewPages = pages.filter(page => /Course Project Overview/.test(page.name));

        if(projectOverviewPages.length != 1) {
            const noOverviewMessage = "No 'Course Project Overview' page found for this course. This might be fine.";
            const tooManyOverviewsMessage = 'Too many course overview pages';
            const notFailureMessage:MessageResult = {
                bodyLines: [projectOverviewPages.length === 0? noOverviewMessage : tooManyOverviewsMessage]
            }
            if(projectOverviewPages.length > 1) notFailureMessage.links = projectOverviewPages.map(page => page.htmlContentUrl)
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


async function getOverview(course:IContentHaver, config? :ICanvasCallConfig){
    const overview = await course.getPages({
       queryParams: {
           search_string: 'course overview',
           'include[]' : 'body'
       }
   })
   return overview;
}

export const codeAndCodeOfCodeTest: ContentTextReplaceFix<IContentHaver, Page> = {
    name: "Code and Code of Code",
    beforeAndAfters: [
        ['<p>Honor Code and Code of Code of Conduct</p>', '<p>Honor Code and Code of Conduct</p>']
    ],
    description: 'First bullet of course overview should read ... Unity DE Honor Code and Code of Conduct ..., not ',
    ...badContentReplaceFuncs(/Code and Code of Code of Conduct/ig, 'Code and Code of Conduct')
}


function badContentReplaceFuncs<
    CourseType extends IContentHaver,
    ContentType extends BaseContentItem,
>(
    badTest: RegExp,
    replace: string,
    getContentFunc?: (course:CourseType) => Promise<ContentType[]>
) {

    return {
        run: badContentRunFunc<CourseType, ContentType>(badTest, getContentFunc),
        fix: badContentFixFunc<CourseType, ContentType>(badTest, replace, getContentFunc)
    }
}


export default [
    courseProjectOutlineTest,
    weeklyObjectivesTest,
    codeAndCodeOfCodeTest,
]

