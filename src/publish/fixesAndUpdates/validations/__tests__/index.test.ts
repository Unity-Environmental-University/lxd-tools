import {Assignment, BaseContentItem, Discussion, Page, Quiz} from "../../../../canvas/content";
import {
    mockAssignmentData,
    mockDiscussionData,
    mockPageData,
    mockQuizData
} from "../../../../canvas/content/__mocks__/mockContentData";
import {
    capitalize,
    CourseValidation,
    matchHighlights,
    MessageResult,
    preserveCapsReplace, stringsToMessageResult, testResult,
    ValidationTestResult
} from "../index";
import {ILatePolicyUpdate} from "../../../../canvas/canvasDataDefs";
import mockLatePolicy from "../../../../canvas/course/__mocks__/mockLatePolicy";
import assert from "assert";

import {
    IAssignmentsHaver,
    IContentHaver, IDiscussionsHaver,
    IGradingStandardData,
    IGradingStandardsHaver, ILatePolicyHaver,
    IModulesHaver, IPagesHaver, IQuizzesHaver, ISyllabusHaver
} from "../../../../canvas/course/courseTypes";


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

export function dummyPagesHaver(pages: Page[]): IPagesHaver {

    return {
        id: 0,
        getPages: async (_config?) => pages
    }
}

export function dummyAssignmentsHaver(assignments: Assignment[]): IAssignmentsHaver {
    return {
        id: 0,
        getAssignments: async (_config?) => assignments

    }
}

export function dummyDiscussionsHaver(discussions: Discussion[]): IDiscussionsHaver {
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

export function dummySyllabusHaver(syllabus: string): ISyllabusHaver {
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


export function getDummyLatePolicyHaver(policyDetails: ILatePolicyUpdate): ILatePolicyHaver {
    const policy = mockLatePolicy;
    return {
        id: 1,
        getLatePolicy: async function (_config) {
            return {...policy, ...policyDetails};
        }
    }
}


jest.spyOn(BaseContentItem.prototype, 'saveData')
    .mockImplementation(async (data) => {
        return data
    });


test('caps replace test', () => {

    expect(capitalize("moose munch")).toBe("Moose Munch")
    expect(capitalize("moose Munch")).toBe("Moose Munch")
    expect(capitalize("moose MuncH")).toBe("Moose MuncH")
    expect(capitalize("moose MuncH")).toBe("Moose MuncH")
    let replacement = "Hello hello There".replace(/hello/ig, preserveCapsReplace(/hello/ig, 'goodbye'))
    expect(replacement).toBe('Goodbye goodbye There');

    replacement = "HELLO HELLO THERE".replace(/hello/ig, preserveCapsReplace(/hello/ig, 'goodbye'))
    expect(replacement).toBe('GOODBYE GOODBYE THERE');

    replacement = "Whoopsie".replace(/wh(oops)/ig, preserveCapsReplace(/wh(oops)/ig, '$1'))
    expect(replacement).toBe('Oopsie');
    //Does not currently support capture groups

})

test('match hilights test', () => {
    expect(matchHighlights("bob", /bob/g, 2, 1)).toStrictEqual(['b...b']);
    expect(matchHighlights("bob", /o/g, 3, 1)).toStrictEqual(['bob']);
    expect(matchHighlights("bob", /b/g, 2, 1)).toStrictEqual(['bo', 'ob']);

})

describe('testResult', () => {
    const failure = 'failure';
    const success = 'success';

    const failureMessageBodyLines = [failure, failure];
    const successMessageBodyLines = [success, success];
    const failureMessage = {bodyLines: failureMessageBodyLines}
    const successMessage = {bodyLines: successMessageBodyLines}

    const links = ['http://localhost:8080']

    const validFailResult = {
        success: false,
        messages: [failureMessage],
        links,
    }
    const validSuccessResult = {...validFailResult, success: true, messages:[successMessage]}

    it('returns failureMessage on a failed result', () => {
        expect(testResult(
            false,
            failureMessage,
            links,
            successMessage
        )).toEqual(validFailResult)
    })
    it('returns successMessage on a successful result', () => {
        expect(testResult(true,
            failureMessage,
            links,
            successMessage
        )).toEqual(validSuccessResult)
    })

    it('correctly interprets a single string passed in for success and failure', () => {
        expect(testResult(false, failure, links, success)).toEqual({...validFailResult, messages: [{bodyLines:[failure]}]})
        expect(testResult(true, failure, links, success)).toEqual({...validSuccessResult, messages: [{bodyLines:[success]}]})
    })

    it('correctly interprets a list of strings passed in for success and failure', () => {
        expect(testResult(false, failureMessageBodyLines, links, successMessageBodyLines)).toEqual(validFailResult)
        expect(testResult(true, failureMessageBodyLines, links, successMessageBodyLines)).toEqual(validSuccessResult)
    })

})

// export function testResult(
//     success: boolean | undefined | 'unknown',
//     failureMessage: string | MessageResult[] | MessageResult,
//     links?: string[],
//     successMessage: string | MessageResult[] | MessageResult = [{bodyLines: ['success']}]
// ): ValidationTestResult {
//
//
//     success = success === 'unknown' ? success : !!success;
//
//     failureMessage = typeof failureMessage !== 'string' ? failureMessage : stringsToMessageResult(failureMessage);
//     successMessage = typeof successMessage !== 'string' ? successMessage : stringsToMessageResult(successMessage);
//
//     failureMessage = Array.isArray(failureMessage) ? failureMessage : [failureMessage];
//     successMessage = Array.isArray(successMessage) ? successMessage : [successMessage];
//
//     const response: ValidationTestResult = {
//         success,
//         messages: success ? successMessage : failureMessage
//
//     }
//     if (links) response.links = links;
//     return response;
// }
