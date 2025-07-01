import {IContentHaver} from "@canvas/course/courseTypes";
import {Page} from "@canvas/content/pages/Page";
import PageKind from "@canvas/content/pages/PageKind";
import {renderAsyncGen} from "@canvas/canvasUtils";
import badContentReplaceFuncs from "@publish/fixesAndUpdates/validations/courseContent/badContentReplaceFuncs";
import {ContentTextReplaceFix} from "@publish/fixesAndUpdates/validations/types";

const badHandbookLink = 'https://unity.edu/wp-content/uploads/2023/01/Unity-College-DE-Student-Handbook-01132023.pdf';
const goodHandbookLink = 'https://unity.edu/wp-content/uploads/2025/06/Distance-Education-Student-Handbook-v.5-2-28-25.pdf';

const badHandbookRegex = /https:[^<>]*Unity-College-DE-Student-Handbook-01132023\.pdf/ig;

export const studentHandbookTest: ContentTextReplaceFix<IContentHaver, Page> = {
    name: "Replace Broken Student Handbook link",
    description: "Checks for broken student handbook link in the Course Overview page and replaces it with the new link.",
    beforeAndAfters: [
        [badHandbookLink, goodHandbookLink],
        [
        `<a href="${badHandbookLink}">Student Handbook</a> and <a href="${badHandbookLink}">Student Handbook</a>`,
        `<a href="${goodHandbookLink}">Student Handbook</a> and <a href="${goodHandbookLink}">Student Handbook</a>`
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
    ...badContentReplaceFuncs(badHandbookRegex, goodHandbookLink)
}

export default studentHandbookTest;