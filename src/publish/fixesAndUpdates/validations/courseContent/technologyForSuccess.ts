import {IContentHaver} from "@canvas/course/courseTypes";
import {Page} from "@canvas/content/pages/Page";
import PageKind from "@canvas/content/pages/PageKind";
import {renderAsyncGen} from "@canvas/canvasUtils";
import badContentReplaceFuncs from "@publish/fixesAndUpdates/validations/courseContent/badContentReplaceFuncs";
import {ContentTextReplaceFix} from "@publish/fixesAndUpdates/validations/types";

const badTechnologyLink = 'https://unity.edu/distance-education/admissions-costs-aid/how-to-be-successful-at-unity-college/technology-for-success/';
const goodTechnologyLink = 'https://unity.edu/distance-education/get-started/technology-commitment/';

const badTechnologyRegex = /https:[^<>]*technology-for-success\//ig;

export const technologyLinkTest: ContentTextReplaceFix<IContentHaver, Page> = {
    name: "Replace Broken Technology link",
    description: "Checks for broken technology link in the Course Overview page and replaces it with the new link.",
    beforeAndAfters: [
        [badTechnologyLink, goodTechnologyLink],
        [
            `<a href="${badTechnologyLink}">Technology for Success</a> and <a href="${badTechnologyLink}">Technology for Success</a>`,
            `<a href="${goodTechnologyLink}">Technology for Success</a> and <a href="${goodTechnologyLink}">Technology for Success</a>`
        ],
    ],
    async getContent(course) {
        const pageGen = PageKind.dataGenerator(course.id, {
            queryParams: {
                search_term: 'course overview'
            }
        })
        const pageDatas = await renderAsyncGen(pageGen);
        return pageDatas.map(a => new Page(a, course.id))
    },
    ...badContentReplaceFuncs(badTechnologyRegex, goodTechnologyLink)
}

export default technologyLinkTest;