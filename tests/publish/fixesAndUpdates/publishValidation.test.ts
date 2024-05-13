import * as fs from "fs";
import publishUnitTests, {
    aiPolicyInSyllabusTest,
    bottomOfSyllabusLanguageTest,
    communication24HoursTest,
    courseCreditsInSyllabusTest, finalNotInGradingPolicyParaTest
} from "../../../src/publish/fixesAndUpdates/validations/syllabusTests";
import {ILatePolicyUpdate} from "../../../src/canvas/canvasDataDefs";
import dummyLatePolicy from "./dummyLatePolicy";
import {ICanvasCallConfig, range} from '../../../src/canvas/canvasUtils'
import {Assignment, BaseContentItem, Discussion, Page} from "../../../src/canvas/content/index";
import {
    IAssignmentsHaver, IDiscussionsHaver,
    ILatePolicyHaver,
    IPagesHaver,
    ISyllabusHaver
} from "@src/canvas/course/index";
import {courseProjectOutlineTest, weeklyObjectivesTest} from "../../../src/publish/fixesAndUpdates/validations/courseContent";
import {latePolicyTest, noEvaluationTest} from "../../../src/publish/fixesAndUpdates/validations/courseSettings";
import {CourseValidationTest} from "../../../src/publish/fixesAndUpdates/validations/index";
import GenericMediaMetadata = chrome.cast.media.GenericMediaMetadata;
import assert from "assert";
import {dummyAssignmentData, dummyDiscussionData, dummyPageData} from "./dummyContentData";
import proxyServerLinkTest from "../../../src/publish/fixesAndUpdates/validations/proxyServerLinkTest";

const goofusSyllabusHtml = fs.readFileSync('./tests/files/syllabus.goofus.html').toString()
const gallantSyllabusHtml = fs.readFileSync('./tests/files/syllabus.gallant.html').toString()

describe('Syllabus validation', () => {
    test('AI policy present test correct', syllabusTestTest(aiPolicyInSyllabusTest))
    test('Bottom of Syllabus language test correct', syllabusTestTest(bottomOfSyllabusLanguageTest))
    test('Course credits displayed in syllabus test correct', syllabusTestTest(courseCreditsInSyllabusTest))
    test('Communication policy current test correct', syllabusTestTest(communication24HoursTest))
    test('Grading policy language in syllabus text is correct', syllabusTestTest(finalNotInGradingPolicyParaTest))
});

test('Late policy test works', async () => {
    const gallant = getDummyLatePolicyHaver({missing_submission_deduction_enabled: true});
    const goofus = getDummyLatePolicyHaver({missing_submission_deduction_enabled: false});

    const gallantResult = await latePolicyTest.run(gallant);
    const goofusResult = await latePolicyTest.run(goofus);
    expect(goofusResult).toHaveProperty('success', false)
    expect(gallantResult).toHaveProperty('success', true)
})

test('Evaluation not present in course test works', async () => {
    const dummyPages = Array.from(range(1, 20)).map((a: number) => (new Page({
        ...dummyPageData,
        title: a.toString()
    }, 0)))
    const goofus: IPagesHaver = {
        id: 0,
        getPages: async (config?) => {
            return [new Page({...dummyPageData, title: 'Course Evaluation'}, 0), ...dummyPages];
        }
    };
    const gallant: IPagesHaver = {
        id: 0,
        getPages: async (config?) => {
            return dummyPages;
        }
    };

    const goofusResult = await noEvaluationTest.run(goofus)
    expect(goofusResult.success).toBe(false);
    expect(goofusResult.links?.length).toBe(1);

    const gallantResult = await noEvaluationTest.run(gallant)
    expect(gallantResult.success).toBe(true);

})

test('Weekly Objectives headers not present test works', async () => {
    const goofusPages = Array.from(range(1, 5)).map(weekNum => new Page({
        ...dummyPageData,
        title: `Week ${weekNum} Overview`,
        body: '<h2>Learning objectives</h2>'
    }, 0));
    console.log(goofusPages[0])
    console.log(goofusPages[0].name);
    const goofus: IPagesHaver = {
        id: 0,
        getPages: async (config?) => goofusPages,
    }
    const goofusResult = await weeklyObjectivesTest.run(goofus);
    expect(goofusResult.success).toBe(false);
    expect(goofusResult.links?.length).toBe(5)


    const gallantPages = Array.from(range(1, 5)).map(weekNum => new Page({
        ...dummyPageData,
        title: `Week ${weekNum} Overview`,
        body: '<h2>Weekly Objectives</h2>'
    }, 0));

    const gallant: IPagesHaver = {
        id: 0,
        getPages: async (config?) => gallantPages,
    }
    const gallantResult = await weeklyObjectivesTest.run(gallant);
    expect(gallantResult.success).toBe(true);

})

test('Course project outline header not "Project outline" test works', async () => {
    const goofusPages = [new Page({
        ...dummyPageData,
        title: 'Course Project Overview',
        body: '<h2>Project outline</h2>'
    }, 0)]
    const noCourseProjectPages = [new Page({
        ...dummyPageData,
        title: 'Not Me',
        body: '<h2>I\'m a Page</h2>'
    }, 0)]
    const tooManyCourseProjectPages = [
        new Page({
            ...dummyPageData,
            title: 'Course Project Overview',
            body: '<h2>Course Project Outline</h2>'
        }, 0),
        new Page({
            ...dummyPageData,
            title: 'Course Project Overview',
            body: '<h2>Project outline</h2>'
        }, 0)
    ]
    const gallantPages = [new Page({
        ...dummyPageData,
        title: 'Course Project Overview',
        body: '<h2>Course Project Overview</h2>'
    }, 0)]

    const goofus = dummyPagesHaver(goofusPages)
    const goofusResult = await courseProjectOutlineTest.run(goofus);
    expect(goofusResult.success).toBe(false)

    const noCourseProjectPagesCourse: IPagesHaver = dummyPagesHaver(noCourseProjectPages)
    const noCourseProjectPagesResult = await courseProjectOutlineTest.run(noCourseProjectPagesCourse);
    expect(noCourseProjectPagesResult.success).toBe('unknown')

    const tooManyProjectPagesCourse: IPagesHaver = dummyPagesHaver(tooManyCourseProjectPages)
    const tooManyProjectPagesResult = await courseProjectOutlineTest.run(tooManyProjectPagesCourse);
    expect(tooManyProjectPagesResult.success).toBe('unknown')

    const gallant = dummyPagesHaver(gallantPages)
    const gallantResult = await courseProjectOutlineTest.run(gallant);
    expect(gallantResult.success).toBe(true)


})


describe("Bad Link Tests and Fixes", () => {
    const proxiedUrl = encodeURI('https://unity.instructure.com')
    const badProxyLinkPageHtml = `<div><a href="https://login.proxy1.unity.edu/login?auth=shibboleth&url=${proxiedUrl}">PROXY LINK</a></div>`;
    const goodProxyLinkPageHtml = `<div><a href="https://login.unity.idm.oclc.org/login?url=${proxiedUrl}">PROXY LINK</a></div>`;

    async function getContent(course: IPagesHaver & IAssignmentsHaver & IDiscussionsHaver) {
        let promises = [course.getDiscussions, course.getAssignments, course.getPages];
        const contentItems = await Promise.all((promises.map(a => a())));
        return contentItems.reduce(((accumulator: BaseContentItem[], currentValue) => {
            return [...accumulator, ...currentValue]
        }), [])
    }

    test("Old Proxy Server link exists in course test works", async () => {
        const goofuses = [
            dummyPagesHaver([new Page({...dummyPageData, body: badProxyLinkPageHtml}, 0)]),
            dummyAssignmentsHaver([new Assignment({...dummyAssignmentData, description: badProxyLinkPageHtml}, 0)]),
            dummyDiscussionsHaver([new Discussion({...dummyDiscussionData, message: badProxyLinkPageHtml}, 0)])
        ]
        const gallant = {
            ...getDummySyllabusHaver(gallantSyllabusHtml),
            ...dummyPagesHaver([new Page({...dummyPageData, body: goodProxyLinkPageHtml}, 0)]),
            ...dummyAssignmentsHaver([new Assignment({...dummyAssignmentData, description: goodProxyLinkPageHtml}, 0)]),
            ...dummyDiscussionsHaver([new Discussion({...dummyDiscussionData, message: goodProxyLinkPageHtml}, 0)])
        }

        await Promise.all(goofuses.map(async (goofus) => {
            const result = await proxyServerLinkTest.run({...gallant, ...goofus});
            expect(result.success).toBe(false);
        }))
        const result = await proxyServerLinkTest.run(gallant);
        expect(result.success).toBe(true);
    });
});


function dummyPagesHaver(pages: Page[]): IPagesHaver {
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


function syllabusTestTest(test: CourseValidationTest<ISyllabusHaver>) {
    return async () => {
        const gallantCourse: ISyllabusHaver = getDummySyllabusHaver(gallantSyllabusHtml);
        const gallantResult = await test.run(gallantCourse)
        expect(gallantResult).toHaveProperty('success', true);

        const goofusCourse: ISyllabusHaver = getDummySyllabusHaver(goofusSyllabusHtml);
        const goofusResult = await test.run(goofusCourse);
        expect(goofusResult).toHaveProperty('success', false);
    }
}

function getDummyLatePolicyHaver(policyDetails: ILatePolicyUpdate): ILatePolicyHaver {
    const policy = dummyLatePolicy;
    return {
        id: 1,
        getLatePolicy: async function (config) {
            return {...policy, ...policyDetails};
        }
    }
}

function getDummySyllabusHaver(syllabus: string): ISyllabusHaver {
    return {
        id: 1,
        getSyllabus: async function (config) {
            return syllabus;
        },
        changeSyllabus: async function (newHtml, config) {
            syllabus = newHtml;
        }
    }
}


