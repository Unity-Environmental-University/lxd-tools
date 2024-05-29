//We should really write integration tests for these eventually rather than just unit tests


import {range} from "../../../src/canvas/canvasUtils";
import {
    getSections,
    getTermNameFromSections,
    IBlueprintCourse,
    isBlueprint,
    retireBlueprint
} from "../../../src/canvas/course/blueprint";
import {dummyCourseData} from "../../dummyData/dummyCourseData";
import fetchMock, {FetchMock} from "jest-fetch-mock";
import {Course} from "../../../src/canvas/course/index";
import {IAccountData, ICourseData, ITermData} from "../../../src/canvas/canvasDataDefs";
import {dummyTermData} from "../../dummyData/dummyTermData";
import {dummyAccountData} from "../../dummyData/dummyAccountData";
import assert from "assert";
import mock = jest.mock;

fetchMock.enableMocks();

function getDummyBlueprintCourse(blueprint: boolean, id: number = 0) {
    let out: IBlueprintCourse;
    out = {
        id,
        isBlueprint: () => isBlueprint({blueprint}),
        getAssociatedCourses: () => getSections(out)
    }
    return out;
}

test("Testing get associated courses logic", async () => {
    const mockData = [...range(0, 9)].map(i => {
        return {...dummyCourseData, id: i}
    })
    fetchMock.mockResponseOnce(JSON.stringify(mockData));
    for(let data of mockData) {
        fetchMock.mockResponseOnce(JSON.stringify(data));
    }
    const courses = await getSections(getDummyBlueprintCourse(true, 0))
    const courseIds = courses.map(course => course.id).toSorted();
    expect(courseIds).toStrictEqual([...range(0, 9)]);

})


test("Testing blueprint retirement", async () => {
    const termName = 'DE8W03.11.24';
    const mockBpData = {
        ...dummyCourseData,
        id: 0,
        blueprint: true,
        course_code: 'BP_TEST000',
        name: 'BP_TEST000: Testing with Tests'
    };
    const notBpMockBpData = {...mockBpData, blueprint: false};
    const badNameMockBpData = {...mockBpData, course_code: `BP-${termName}_TEST000`}
    fetchMock.once(JSON.stringify(mockBpData))
        .once(JSON.stringify(notBpMockBpData))
        .once(JSON.stringify(badNameMockBpData))
    const mockBlueprint: Course = await Course.getCourseById(0);
    const notBpMockBlueprint: Course = await Course.getCourseById(0);
    const badNameMockBlueprint: Course = await Course.getCourseById(0);
    await expect(retireBlueprint(notBpMockBlueprint, termName)).rejects.toThrow("Trying to retire a blueprint that's not a blueprint")
    await expect(retireBlueprint(badNameMockBlueprint, termName)).rejects.toThrow("This blueprint is not named BP_")

    const mockAssociatedCourseData: ICourseData[] = [{
        ...dummyCourseData,
        id: 1,
        course_code: `${termName}_TEST000-01`,
        enrollment_term_id: [10]
    }]
    fetchMock.once(JSON.stringify(mockAssociatedCourseData));
    for(let data of mockAssociatedCourseData) {
        fetchMock.once(JSON.stringify(data));
    }
    const sections = await mockBlueprint.getAssociatedCourses();

    fetchMock.once(JSON.stringify(<IAccountData[]>[{...dummyAccountData, id: 2, root_account_id: null}]))
    fetchMock.once(JSON.stringify(<ITermData>{...dummyTermData, id: 10, name: termName}))
    let derivedTermName = await getTermNameFromSections(sections);
    expect(derivedTermName).toBe(termName);

    await fetchMock.withImplementation(async (requestUrl, requestInit) => {
        const out: Record<string, any> = {};
        assert(requestInit)
        assert('body' in requestInit);
        const formData = requestInit.body;
        assert(formData instanceof  FormData)
        const entries = Object.fromEntries(formData.entries());

        return new Response(JSON.stringify(entries))

    }, async () => {
        await retireBlueprint(mockBlueprint, derivedTermName);
    })

    expect(mockBlueprint.courseCode).toBe(`BP-${termName}_TEST000`)
    expect(mockBlueprint.name).toContain(`BP-${termName}_TEST000`)
})