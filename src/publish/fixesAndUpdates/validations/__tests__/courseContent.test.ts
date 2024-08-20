import {range} from "@/canvas/canvasUtils";
import {mockPageData} from "@/canvas/content/__mocks__/mockContentData";
import {
    codeAndCodeOfCodeTest,
    courseProjectOutlineTest, overviewDiscMornToNightTest,

    weeklyObjectivesTest
} from "../courseContent";
import {IContentHaver, IPagesHaver} from "@/canvas/course/courseTypes";
import {
    badContentTextValidationFixTest,
    badContentTextValidationTest,
    mockContentHaver,
    mockPagesHaver
} from "../__mocks__";
import * as fetchApi from "../../../../canvas/fetch";
import {badContentRunFunc, ContentTextReplaceFix} from "../index";
import {BaseContentItem} from "@/canvas/content/BaseContentItem";
import {Page} from "@/canvas/content/assignments/pages/Page";
import {classInclusiveNoDateHeaderTest} from "@/publish/fixesAndUpdates/validations/syllabusTests";
import {mockCourseData} from "@/canvas/course/__mocks__/mockCourseData";
import {Course} from "@/canvas/course/Course";

jest.mock('@/canvas/fetch/fetchJson', () => ({
    fetchJson: jest.fn(),
}));

jest.mock('@/canvas/fetch/getPagedDataGenerator', () => ({
    getPagedDataGenerator: jest.fn(),
}));

describe('Weekly Objectives test', () => {

    it('Fails on "Learning objectives"', async () => {
        const goofusPages = Array.from(range(1, 5)).map(weekNum => new Page({
            ...mockPageData,
            title: `Week ${weekNum} Overview`,
            body: '<h2>Learning objectives</h2>'
        }, 0));
        const goofus: IPagesHaver = {
            id: 0,
            getPages: async (_config?) => goofusPages,
        }
        const goofusResult = await weeklyObjectivesTest.run(goofus);
        expect(goofusResult.success).toBe(false);
        expect(goofusResult.links?.length).toBe(5)
    });


    it('Passes on "Weekly&nbsp;Objectives"', async () => {
        const pages = Array.from(range(1, 5)).map(weekNum => new Page({
            ...mockPageData,
            title: `Week ${weekNum} Overview`,
            body: '<h2>Weekly&nbsp;Objectives</h2>'
        }, 0));
        const goofus: IPagesHaver = {
            id: 0,
            getPages: async (_config?) => pages,
        }
        const goofusResult = await weeklyObjectivesTest.run(goofus);
        expect(goofusResult.success).toBe(true);
    })

    it('Passes on "Weekly Objectives"', async () => {
        const gallantPages = Array.from(range(1, 5)).map(weekNum => new Page({
            ...mockPageData,
            title: `Week ${weekNum} Overview`,
            body: '<h2>Weekly Objectives</h2>'
        }, 0));

        const gallant: IPagesHaver = {
            id: 0,
            getPages: async (_config?) => gallantPages,
        }
        const gallantResult = await weeklyObjectivesTest.run(gallant);
        expect(gallantResult.success).toBe(true);

    })
})

test('Course project outline header not "Project outline" test works', async () => {
    const goofusPages = [new Page({
        ...mockPageData,
        title: 'Course Project Overview',
        body: '<h2>Project outline</h2>'
    }, 0)]
    const noCourseProjectPages = [new Page({
        ...mockPageData,
        title: 'Not Me',
        body: '<h2>I\'m a Page</h2>'
    }, 0)]
    const tooManyCourseProjectPages = [
        new Page({
            ...mockPageData,
            title: 'Course Project Overview',
            body: '<h2>Course Project Outline</h2>'
        }, 0),
        new Page({
            ...mockPageData,
            title: 'Course Project Overview',
            body: '<h2>Project outline</h2>'
        }, 0)
    ]
    const gallantPages = [new Page({
        ...mockPageData,
        title: 'Course Project Overview',
        body: '<h2>Course Project Overview</h2>'
    }, 0)]

    const goofus = mockPagesHaver(goofusPages)
    const goofusResult = await courseProjectOutlineTest.run(goofus);
    expect(goofusResult.success).toBe(false)

    const noCourseProjectPagesCourse: IPagesHaver = mockPagesHaver(noCourseProjectPages)
    const noCourseProjectPagesResult = await courseProjectOutlineTest.run(noCourseProjectPagesCourse);
    expect(noCourseProjectPagesResult.success).toBe('unknown')

    const tooManyProjectPagesCourse: IPagesHaver = mockPagesHaver(tooManyCourseProjectPages)
    const tooManyProjectPagesResult = await courseProjectOutlineTest.run(tooManyProjectPagesCourse);
    expect(tooManyProjectPagesResult.success).toBe('unknown')

    const gallant = mockPagesHaver(gallantPages)
    const gallantResult = await courseProjectOutlineTest.run(gallant);
    expect(gallantResult.success).toBe(true)


})

describe("Code of code of conduct", () => {
    for (let [bad, good] of codeAndCodeOfCodeTest.beforeAndAfters) {
        test(`Text works ${bad}, ${good}`, badContentTextValidationTest(codeAndCodeOfCodeTest, bad, good));
    }

    test('Fix Works', badContentTextValidationFixTest(
        codeAndCodeOfCodeTest,
        (badText: string, goodText: string) => [
            mockContentHaver(goodText, [new Page({
                ...mockPageData,
                name: 'Course Overview',
                body: badText,
            }, 0)], 'Course Overview Haver')
        ]
    ))
})

describe("Overview Discussion 3AM night -> morning", () => {
    for (let [bad, good] of overviewDiscMornToNightTest.beforeAndAfters) {
        test(`Text works ${bad}, ${good}`, badContentTextValidationTest(overviewDiscMornToNightTest, bad, good));
    }

    test('Fix Works', badContentTextValidationFixTest(
        overviewDiscMornToNightTest,
        (badText: string, goodText: string) => [
            mockContentHaver(goodText, [new Page({
                ...mockPageData,
                name: 'Course Overview',
                body: badText,
            }, 0)], 'Course Overview Haver')
        ]
    ))
})




export function badContentTest(test: ContentTextReplaceFix<IContentHaver, BaseContentItem>) {
    describe(test.name, () => {
        it("Works", badContentTextValidationFixTest(test))
    })
}


