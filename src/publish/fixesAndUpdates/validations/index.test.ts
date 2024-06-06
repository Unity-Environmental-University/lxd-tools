import {Assignment, BaseContentItem, Discussion, Page, Quiz} from "../../../canvas/content/index";
import fs from "fs";
import {dummyAssignmentData, dummyDiscussionData, dummyPageData, dummyQuizData} from "../../../../tests/dummyData/dummyContentData";
import {capitalize, CourseValidation, matchHighlights, preserveCapsReplace, TextReplaceValidation} from "./index";
import {ILatePolicyUpdate, IModuleData} from "../../../canvas/canvasDataDefs";
import dummyLatePolicy from "../../../../tests/dummyData/dummyLatePolicy";
import assert from "assert";
import {
    aiPolicyInSyllabusTest,
    bottomOfSyllabusLanguageTest,
    communication24HoursTest,
    courseCreditsInSyllabusTest, finalNotInGradingPolicyParaTest
} from "./syllabusTests";
import {badGradingPolicyTest, latePolicyTest, noEvaluationTest} from "./courseSettings";
import {ICanvasCallConfig, range} from "../../../canvas/canvasUtils";
import {courseProjectOutlineTest, weeklyObjectivesTest} from "./courseContent";
import proxyServerLinkValidation from "./proxyServerLinkValidation";
import capstoneProjectValidations from "./courseSpecific/capstoneProjectValidations";
import {getModulesByWeekNumber} from "../../../canvas/course/modules";
import {dummyGradModules, dummyUgModules} from "../../../../tests/dummyData/dummyModuleData";
import {
    IAssignmentsHaver,
    IContentHaver, IDiscussionsHaver,
    IGradingStandardData,
    IGradingStandardsHaver, ILatePolicyHaver,
    IModulesHaver, IPagesHaver, IQuizzesHaver, ISyllabusHaver
} from "../../../canvas/course/courseTypes";


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



export function getDummyLatePolicyHaver(policyDetails: ILatePolicyUpdate): ILatePolicyHaver {
    const policy = dummyLatePolicy;
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

