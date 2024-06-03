import {Assignment, BaseContentItem, Discussion, Page, Quiz} from "../../../src/canvas/content/index";
import {
    IAssignmentsHaver,
    IContentHaver,
    IDiscussionsHaver,
    ILatePolicyHaver,
    IPagesHaver,
    IQuizzesHaver,
    ISyllabusHaver
} from "../../../src/canvas/course/index";
import fs from "fs";
import {dummyAssignmentData, dummyDiscussionData, dummyPageData, dummyQuizData} from "../../dummyData/dummyContentData";
import {CourseValidation, TextReplaceValidation} from "../../../src/publish/fixesAndUpdates/validations/index";
import {ILatePolicyUpdate} from "../../../src/canvas/canvasDataDefs";
import dummyLatePolicy from "../../dummyData/dummyLatePolicy";
import assert from "assert";

const goofusSyllabusHtml = fs.readFileSync('./tests/files/syllabus.goofus.html').toString()
const gallantSyllabusHtml = fs.readFileSync('./tests/files/syllabus.gallant.html').toString()

export function badContentTextValidationTest(test: CourseValidation<IContentHaver>, badHtml: string, goodHtml: string) {
    return async () => {
        const goofuses: IContentHaver[] = contentGoofuses(badHtml, goodHtml);

        for (let goofus of goofuses) {
            const result = await test.run(goofus);
            expect(result.success).toBe(false);
        }


        const gallant = contentGallant(badHtml, goodHtml);
        console.log(await gallant.getSyllabus())
        const result = await test.run(gallant);
        expect(result.success).toBe(true);
    };
}

export function badContentTextValidationFixTest(test: CourseValidation<IContentHaver>, badHtml: string, goodHtml: string) {
    return async () => {
        assert(test.fix);
        const goofuses: IContentHaver[] = contentGoofuses(badHtml, goodHtml);


        for (let goofus of goofuses) {
            let testResult = await test.run(goofus);
            expect(testResult.success).toBe(false);
            const fixResult = await test.fix(goofus);
            console.log(goofus.name);
            testResult = await test.run(goofus);
            expect(testResult.success).toBe(true);
        }
        const gallant = contentGallant(badHtml, goodHtml);
        const result = await test.run(gallant);
        expect(result.success).toBe(true);
    }
}

function contentGoofuses(badHtml: string, goodHtml: string) {


    return [
        dummyContentHaver(badHtml, [], "Syllabus"),
        dummyContentHaver(goodHtml, [new Quiz({...dummyQuizData, description: badHtml}, 0)], "Quiz"),
        dummyContentHaver(goodHtml, [new Assignment({...dummyAssignmentData, description: badHtml}, 0)], "Assignment"),
        dummyContentHaver(goodHtml, [new Discussion({...dummyDiscussionData, message: badHtml}, 0)], "Discussion"),
        dummyContentHaver(goodHtml, [new Page({...dummyPageData, body: badHtml}, 0)], "Page"),
    ]

}

function contentGallant(badHtml: string, goodHtml: string) {
    return dummyContentHaver(goodHtml,
        [
            new Page({...dummyPageData, body: goodHtml}, 0),
            new Assignment({...dummyAssignmentData, description: goodHtml}, 0),
            new Discussion({...dummyDiscussionData, message: goodHtml}, 0),
            new Quiz({...dummyQuizData, body: goodHtml}, 0),
        ], "Gallant");
}

export function dummyPagesHaver(pages: Page[]): IPagesHaver {

    return {
        id: 0,
        getPages: async (_config?) => pages
    }
}

function dummyAssignmentsHaver(assignments: Assignment[]): IAssignmentsHaver {
    return {
        id: 0,
        getAssignments: async (_config?) => assignments

    }
}

function dummyDiscussionsHaver(discussions: Discussion[]): IDiscussionsHaver {
    return {
        id: 0,
        getDiscussions: async (_config?) => discussions

    }
}

export function dummyQuizzesHaver(quizzes: Quiz[]): IQuizzesHaver {
    return {
        id: 0,
        getQuizzes: async (_config?) => quizzes

    }
}

export function dummyContentHaver(syllabus: string, content: BaseContentItem[], name: string): IContentHaver {
    const discussions = content.filter(item => item instanceof Discussion) as Discussion[];
    const quizzes = content.filter(item => item instanceof Quiz) as Discussion[];
    const assignments = content.filter(item => item instanceof Assignment) as Assignment[];
    const pages = content.filter(item => item instanceof Page) as Page[];


    return {
        ...dummySyllabusHaver(syllabus),
        ...dummyQuizzesHaver(quizzes),
        ...dummyDiscussionsHaver(discussions),
        ...dummyAssignmentsHaver(assignments),
        ...dummyPagesHaver(pages),
        async getContent() {
            return [...discussions, ...quizzes, ...assignments, ...quizzes, ...pages]
        },
        name,
    }
}

export function syllabusTestTest(test: CourseValidation<ISyllabusHaver> | TextReplaceValidation<ISyllabusHaver>) {
    return async () => {
        const gallantCourse: ISyllabusHaver = dummySyllabusHaver(gallantSyllabusHtml);
        const gallantResult = await test.run(gallantCourse)
        expect(gallantResult).toHaveProperty('success', true);

        const goofusCourse: ISyllabusHaver = dummySyllabusHaver(goofusSyllabusHtml);
        const goofusResult = await test.run(goofusCourse);
        expect(goofusResult).toHaveProperty('success', false);

        if ('negativeExemplars' in test && test.fix) {
            for (let [goofus, gallant] of test.negativeExemplars) {
                const goofusCourse: ISyllabusHaver = dummySyllabusHaver(goofus);
                await test.fix(goofusCourse);
                const syllabus = await goofusCourse.getSyllabus();
                expect(syllabus).toBe(gallant);
            }
        }
    }
}

export function getDummyLatePolicyHaver(policyDetails: ILatePolicyUpdate): ILatePolicyHaver {
    const policy = dummyLatePolicy;
    return {
        id: 1,
        getLatePolicy: async function (_config) {
            return {...policy, ...policyDetails};
        }
    }
}

function dummySyllabusHaver(syllabus: string): ISyllabusHaver {
    return {
        id: 1,
        getSyllabus: async function (_config) {
            return syllabus;
        },
        changeSyllabus: async function (newHtml, _config) {
            syllabus = newHtml;
        }
    }
}