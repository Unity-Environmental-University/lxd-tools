import {range} from "../../../canvas/canvasUtils";
import {Page} from "../../../canvas/content/index";
import {dummyPageData} from "../../../../tests/dummyData/dummyContentData";
import {IPagesHaver} from "../../../canvas/course/index";
import {courseProjectOutlineTest, weeklyObjectivesTest} from "./courseContent";
import {dummyPagesHaver} from "./index.test";

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
        getPages: async (_config?) => goofusPages,
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
        getPages: async (_config?) => gallantPages,
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