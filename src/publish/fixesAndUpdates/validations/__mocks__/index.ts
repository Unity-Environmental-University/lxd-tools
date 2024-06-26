import {CourseValidation} from "../index";
import {
    IAssignmentsHaver,
    IContentHaver,
    IDiscussionsHaver,
    ILatePolicyHaver,
    IPagesHaver,
    IQuizzesHaver,
    ISyllabusHaver
} from "../../../../canvas/course/courseTypes";
import assert from "assert";
import {Assignment, BaseContentItem, Discussion, Page, Quiz} from "../../../../canvas/content";
import {
    mockAssignmentData,
    mockDiscussionData,
    mockPageData,
    mockQuizData
} from "../../../../canvas/content/__mocks__/mockContentData";
import {ILatePolicyUpdate} from "../../../../canvas/canvasDataDefs";
import mockLatePolicy from "../../../../canvas/course/__mocks__/mockLatePolicy";

export function badContentTextValidationTest(test: CourseValidation<IContentHaver>, badHtml: string, goodHtml: string) {

    return async () => {
        const goofuses: IContentHaver[] = contentGoofuses(badHtml, goodHtml);

        for (let goofus of goofuses) {
            const result = await test.run(goofus);
            expect(result.success).toBe(false);
        }


        const gallant = contentGallant(badHtml, goodHtml);
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
            expect (fixResult.success).toBe(true);
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
        mockContentHaver(badHtml, [], "Syllabus"),
        mockContentHaver(goodHtml, [new Quiz({...mockQuizData, description: badHtml}, 0)], "Quiz"),
        mockContentHaver(goodHtml, [new Assignment({...mockAssignmentData, description: badHtml}, 0)], "Assignment"),
        mockContentHaver(goodHtml, [new Discussion({...mockDiscussionData, message: badHtml}, 0)], "Discussion"),
        mockContentHaver(goodHtml, [new Page({...mockPageData, body: badHtml}, 0)], "Page"),
    ]

}

function contentGallant(badHtml: string, goodHtml: string) {
    return mockContentHaver(goodHtml,
        [
            new Page({...mockPageData, body: goodHtml}, 0),
            new Assignment({...mockAssignmentData, description: goodHtml}, 0),
            new Discussion({...mockDiscussionData, message: goodHtml}, 0),
            new Quiz({...mockQuizData, body: goodHtml}, 0),
        ], "Gallant");
}

export function mockPagesHaver(pages: Page[]): IPagesHaver {

    return {
        id: 0,
        getPages: async (_config?) => pages
    }
}

export function mockAssignmentsHaver(assignments: Assignment[]): IAssignmentsHaver {
    return {
        id: 0,
        getAssignments: async (_config?) => assignments

    }
}

export function mockDocumentsHaver(discussions: Discussion[]): IDiscussionsHaver {
    return {
        id: 0,
        getDiscussions: async (_config?) => discussions

    }
}

export function mockQuizzesHaver(quizzes: Quiz[]): IQuizzesHaver {
    return {
        id: 0,
        getQuizzes: async (_config?) => quizzes

    }
}

export function mockSyllabusHaver(syllabus: string): ISyllabusHaver {
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

export function mockContentHaver(syllabus: string, content: BaseContentItem[], name: string): IContentHaver {
    const discussions = content.filter(item => item instanceof Discussion) as Discussion[];
    const quizzes = content.filter(item => item instanceof Quiz) as Discussion[];
    const assignments = content.filter(item => item instanceof Assignment) as Assignment[];
    const pages = content.filter(item => item instanceof Page) as Page[];


    return {
        ...mockSyllabusHaver(syllabus),
        ...mockQuizzesHaver(quizzes),
        ...mockDocumentsHaver(discussions),
        ...mockAssignmentsHaver(assignments),
        ...mockPagesHaver(pages),
        async getContent() {
            return [...discussions, ...quizzes, ...assignments, ...quizzes, ...pages]
        },
        name,
    }
}

export function getDummyLatePolicyHaver(policyDetails: ILatePolicyUpdate): ILatePolicyHaver {
    const policy = mockLatePolicy;
    return {
        id: 1,
        getLatePolicy: async function (_config) {
            return {...policy, ...policyDetails};
        }
    }
}