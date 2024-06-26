//We should really write integration tests for these eventually rather than just unit tests


import {deFormDataify, range} from "../../canvasUtils";
import {
    getSections,
    getTermNameFromSections,
    IBlueprintCourse,
    retireBlueprint,
    getBlueprintsFromCode, setAsBlueprint, unSetAsBlueprint, lockBlueprint
} from "../blueprint";
import {mockCourseData} from "../__mocks__/mockCourseData";
import fetchMock, {FetchMock} from "jest-fetch-mock";
import {IAccountData, ICourseData, IModuleData, ITermData} from "../../canvasDataDefs";
import {mockTermData} from "../../__mocks__/mockTermData";
import {mockAccountData} from "../../__mocks__/mockAccountData";
import assert from "assert";
import mockModuleData, { mockModuleItemData } from "../__mocks__/mockModuleData";
import {Course} from "../Course";


fetchMock.enableMocks();

function getDummyBlueprintCourse(blueprint: boolean, id: number = 0) {
    let out: IBlueprintCourse;
    out = new Course({
        ...mockCourseData,
        id,
        name: 'BP_TEST000',
        courseCode: 'BP_TEST000',
        blueprint,
        getAssociatedCourses: () => getSections(out)
    })
    return out;
}

test("Testing get associated courses logic", async () => {
    const mockData = [...range(0, 9)].map(i => {
        return {...mockCourseData, id: i}
    })
    fetchMock.mockResponseOnce(JSON.stringify(mockData));
    for (let data of mockData) {
        fetchMock.mockResponseOnce(JSON.stringify(data));
    }
    const courses = await getSections(getDummyBlueprintCourse(true, 0))
    const courseIds = courses.map(course => course.id).toSorted();
    expect(courseIds).toStrictEqual([...range(0, 9)]);

})


test("Testing blueprint retirement", async () => {
    const termName = 'DE8W03.11.24';
    const mockBpData = {
        ...mockCourseData,
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
    //await expect(retireBlueprint(notBpMockBlueprint, termName)).rejects.toThrow("Trying to retire a blueprint that's not a blueprint")
    await expect(retireBlueprint(badNameMockBlueprint, termName)).rejects.toThrow("This blueprint is not named BP_")

    const mockAssociatedCourseData: ICourseData[] = [{
        ...mockCourseData,
        id: 1,
        course_code: `${termName}_TEST000-01`,
        enrollment_term_id: [10]
    }]
    fetchMock.once(JSON.stringify(mockAssociatedCourseData));
    for (let data of mockAssociatedCourseData) {
        fetchMock.once(JSON.stringify(data));
    }
    const sections = await mockBlueprint.getAssociatedCourses();

    fetchMock.once(JSON.stringify(<IAccountData[]>[{...mockAccountData, id: 2, root_account_id: null}]))
    fetchMock.once(JSON.stringify(<ITermData>{...mockTermData, id: 10, name: termName}))
    let derivedTermName = await getTermNameFromSections(sections);
    expect(derivedTermName).toBe(termName);

    await fetchMock.withImplementation(async (requestUrl, requestInit) => {
        assert(requestInit)
        assert('body' in requestInit);
        const formData = requestInit.body;
        assert(formData instanceof FormData)
        const data = deFormDataify(formData);
        return new Response(JSON.stringify(data.course))

    }, async () => {
        await retireBlueprint(mockBlueprint, derivedTermName);
    })

    expect(mockBlueprint.parsedCourseCode).toBe(`BP-${termName}_TEST000`)
    expect(mockBlueprint.name).toContain(`BP-${termName}_TEST000`)
})

describe('getBlueprintFromCode', () => {
    let dummyDev: Course;

    beforeEach(() => {
        dummyDev = new Course({...mockCourseData, name: 'DEV_TEST000', course_code: 'DEV_TEST000'})
    })

    test("Returns null when there's no BP", async () => {
        fetchMock.once('[]');
        const bp = dummyDev.parsedCourseCode && await getBlueprintsFromCode(dummyDev.parsedCourseCode, [0]);
        expect(bp).toStrictEqual([]);
    })

    test("Searches for BP from a dev course", async () => {
        fetchMock.once(mockBpResponse)
        const [bp] = dummyDev.parsedCourseCode && await getBlueprintsFromCode(dummyDev.parsedCourseCode, [0]) || [];
        expect(bp).toBeInstanceOf(Course);
        assert(typeof bp === 'object');
        expect(bp?.isBlueprint()).toBe(true);
        expect(bp?.courseCode).toBe('BP_TEST000');

    })

    test("Searches for BP from a section", async () => {
        fetchMock.once(mockBpResponse)
        const dummyCourse = new Course({
            ...mockCourseData,
            name: 'DE8W12.4.26_TEST000',
            course_code: 'DE8W12.4.26_DEV_TEST000'
        })
        const [bp] = dummyCourse.parsedCourseCode && await getBlueprintsFromCode(dummyCourse.parsedCourseCode, [0]) || [];
        expect(bp).toBeInstanceOf(Course);
        assert(typeof bp === 'object');
        expect(bp?.isBlueprint()).toBe(true);
        expect(bp?.courseCode).toBe('BP_TEST000');

    })

})

test("setAsBlueprint", async () => {
    let responseData: ICourseData;
    await fetchMock.withImplementation(async (requestUrl, requestInit) => {
        assert(requestInit)
        assert('body' in requestInit);
        const formData = requestInit.body;
        assert(formData instanceof FormData)
        return new Response(JSON.stringify(deFormDataify(formData)))

    }, async () => {
        responseData = await setAsBlueprint(0)
        expect(responseData.course.blueprint).toBe("true");
    })
})

test("unSetAsBlueprint", async () => {
    let responseData: ICourseData;
    await fetchMock.withImplementation(async (requestUrl, requestInit) => {
        assert(requestInit)
        assert('body' in requestInit);
        const formData = requestInit.body;
        assert(formData instanceof FormData)
        return new Response(JSON.stringify(deFormDataify(formData)))

    }, async () => {
        responseData = await setAsBlueprint(0);
        expect(responseData.course.blueprint).toBe('true');
        responseData = await unSetAsBlueprint(0);
        expect(responseData.course.blueprint).toBe('false');
    })
})


test('lock blueprint', async () => {
    fetchMock.mockClear();
    const modules:IModuleData[] = [];
    const moduleCount = 10;
    const itemCount = 6;
    for(let i = 0; i < moduleCount; i++) {
        modules.push({
            ...mockModuleData,
            name: `Week ${i}`,
            items: [...range(0, itemCount - 1)].map(j => ({
                ...mockModuleItemData,
                content_id: i * 100 + j,
                name: `Week ${i} Assignment ${j}`
            }))
        })
    }
    fetchMock.mockResponse('{}')
    await lockBlueprint(0, modules);
    const contentIds:number[] = [];
    modules.forEach(module => module.items.forEach(item => contentIds.push(item.content_id)))

    for(let call of fetchMock.mock.calls) {
        expect(call[0]).toBe('/api/v1/courses/0/blueprint_templates/default/restrict_item')
        const fetchInit = call[1];
        assert(fetchInit);
        assert(fetchInit.body instanceof FormData)
        const body = deFormDataify(fetchInit.body);
    }
    expect(fetchMock).toHaveBeenCalledTimes(itemCount * moduleCount);
    fetchMock.mockClear();
})

async function mockBpResponse(mockRequest: Request, numberToMock = 1) {
    const dummyBpData: ICourseData = {...mockCourseData, blueprint: true};
    const [_, requestCode] = mockRequest.url.match(/=[^=]*(\w{4}\d{3})/i) || [];
    const outCourseData: ICourseData[] = [...range(1, numberToMock)].map((number) => ({
        ...dummyBpData,
        name: `BP_${requestCode}${number > 1 ? number : ''}`,
        course_code: `BP_${requestCode}${number > 1 ? number : ''}`
    }))
    return JSON.stringify(outCourseData);
}

