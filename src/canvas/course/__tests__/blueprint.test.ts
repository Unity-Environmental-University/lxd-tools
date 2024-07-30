//We should really write integration tests for these eventually rather than just unit tests


import {deFormDataify, ICanvasCallConfig, range} from "../../canvasUtils";
import {
    getSections,
    getTermNameFromSections,
    IBlueprintCourse,
    retireBlueprint,
    getBlueprintsFromCode, setAsBlueprint, unSetAsBlueprint, lockBlueprint, genBlueprintDataForCode, NotABlueprintError
} from "../blueprint";
import {mockCourseData} from "../__mocks__/mockCourseData";
import fetchMock, {FetchMock} from "jest-fetch-mock";
import {IAccountData, IModuleData} from "../../canvasDataDefs";
import {mockTermData} from "../../__mocks__/mockTermData";
import {mockAccountData} from "../../__mocks__/mockAccountData";
import assert from "assert";
import mockModuleData, {mockModuleItemData} from "../__mocks__/mockModuleData";
import {Course} from "../Course";
import {GetCoursesFromAccountOptions} from "@/canvas/course/courseTypes";
import * as courseApi from '@/canvas/course/index';
import * as fetchApi from '@/canvas/fetch'
import {ICourseData} from "@/canvas/courseTypes";
import {getPagedDataGenerator} from "@/canvas/fetch/getPagedDataGenerator";
import {mockAsyncGen, returnMockAsyncGen} from "@/__mocks__/utils";
import {baseCourseCode, MalformedCourseCodeError} from "@/canvas/course/code";
import {fetchJson} from "@/canvas/fetch/fetchJson";


jest.mock('@/canvas/fetch/fetchJson');
jest.mock('@/canvas/fetch/getPagedDataGenerator');
fetchMock.enableMocks();

const getCourseGenerator = jest.spyOn(courseApi, 'getCourseGenerator')
const getCourseDataGenerator = jest.spyOn(courseApi, 'getCourseDataGenerator')
const fetchGetConfig = jest.spyOn(fetchApi, 'fetchGetConfig')


function getDummyBlueprintCourse(blueprint: boolean, id: number = 0) {
    let out: IBlueprintCourse;
    out = new Course({
        ...mockCourseData,
        id,
        name: 'BP_TEST000',
        courseCode: 'BP_TEST000',
        blueprint,
        getAssociatedCourses: () => getSections(out.id)
    })
    return out;
}

test("Testing get associated courses logic", async () => {
    const mockData = [...range(0, 9)].map(i => {
        return {...mockCourseData, id: i}
    });

    (getPagedDataGenerator as jest.Mock).mockImplementation(returnMockAsyncGen(mockData.map(a => new Course(a))));
    const courses = await getSections(getDummyBlueprintCourse(true, 0).id)
    const courseIds = courses.map(course => course.id).toSorted();
    expect(courseIds).toStrictEqual([...range(0, 9)]);

})


describe("Testing blueprint retirement", () => {
    it('throws an error when course is not named as the base blueprint', async () => {
        const course = new Course({...mockCourseData, course_code:"BP-xxx-TEST104" , blueprint: false});
        await expect(async () => await retireBlueprint(course, 'XXXXXXX')).rejects.toThrow(NotABlueprintError)
    })
    it('throws an error when course code is malformed', async () => {
        const course = new Course({...mockCourseData, course_code: "X12375"});
        await expect(async () => await retireBlueprint(course, 'XXXXXXX')).rejects.toThrow(MalformedCourseCodeError)
    })
    it('goes successfully through process',  async() => {
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
        const mockBlueprint = new Course(mockBpData);
        const notBpMockBlueprint: Course = new Course(notBpMockBpData);
        const badNameMockBlueprint: Course = new Course(badNameMockBpData);
        await expect(retireBlueprint(badNameMockBlueprint, termName)).rejects.toThrow("This blueprint is not named BP_")

        const mockAssociatedCourseData: ICourseData[] = [{
            ...mockCourseData,
            id: 1,
            course_code: `${termName}_TEST000-01`,
            enrollment_term_id: [10],
        }];

        (getPagedDataGenerator as jest.Mock).mockImplementationOnce(returnMockAsyncGen(mockAssociatedCourseData))
        const sections = await mockBlueprint.getAssociatedCourses();
        (getPagedDataGenerator as jest.Mock).mockImplementationOnce(returnMockAsyncGen([{
            ...mockAccountData,
            id: 2,
            root_account_id: null
        }]));
        sections.forEach(section => section.getTerm = jest.fn(async () => (new Term({
            ...mockTermData,
            id: 10,
            name: termName
        }))))
        let derivedTermName = await getTermNameFromSections(sections);
        expect(derivedTermName).toBe(termName);


        mockBlueprint.saveData = jest.fn();
        const config: ICanvasCallConfig = {};
        await retireBlueprint(mockBlueprint, derivedTermName, config);


        expect(mockBlueprint.saveData).toHaveBeenCalledWith({
            course: {
                course_code: `BP-${termName}_TEST000`,
                name: `BP-${termName}_TEST000: Testing with Tests`
            }
        }, config)
    })
})

describe('getBlueprintFromCode', () => {
    let dummyDev: Course;

    beforeEach(() => {
        dummyDev = new Course({...mockCourseData, name: 'DEV_TEST000', course_code: 'DEV_TEST000'})
    })

    test("Returns null when there's no BP", async () => {
        (getCourseGenerator as jest.Mock).mockReturnValue(mockAsyncGen([]))
        const bp = dummyDev.parsedCourseCode && await getBlueprintsFromCode(dummyDev.parsedCourseCode, [0]);
        expect(bp).toStrictEqual([]);
    })

    test("Searches for BP from a dev course", async () => {
        (getCourseGenerator as jest.Mock).mockImplementation((url: string) => {
            const bpCode = `BP_${baseCourseCode(url)}`;
            return mockAsyncGen([
                {...mockCourseData, name: bpCode, course_code: bpCode, blueprint: true}
            ].map(a => new Course(a)))
        })

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
    const payload = {
        course: {
            blueprint: true,
            use_blueprint_restrictions_by_object_type: 0,
            blueprint_restrictions: {
                content: 1,
                points: 1,
                due_dates: 1,
                availability_dates: 1,
            }
        }
    }


    const config: ICanvasCallConfig = {};
    responseData = await setAsBlueprint(0, config)
    expect(fetchJson).toHaveBeenCalledWith(`/api/v1/courses/0`, apiWriteConfig('PUT', payload, config))
})

test("unSetAsBlueprint", async () => {
    const payload = {
        course: {
            blueprint: false
        }
    };
    const config = {
        queryParams: {
            include: ['a']
        }
    };
    await unSetAsBlueprint(0, config);
    expect(fetchJson).toHaveBeenCalledWith(`/api/v1/courses/0`, apiWriteConfig('PUT', payload, config))
})


test('lock blueprint', async () => {
    (fetchJson as jest.Mock).mockClear()
    const modules: IModuleData[] = [];
    const moduleCount = 10;
    const itemCount = 6;
    for (let i = 0; i < moduleCount; i++) {
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
    (fetchJson as jest.Mock).mockResolvedValue({})
    await lockBlueprint(0, modules);
    const contentIds: number[] = [];
    modules.forEach(module => module.items.forEach(item => contentIds.push(item.content_id)))

    for (let call of (fetchJson as jest.Mock).mock.calls) {
        expect(call[0]).toBe('/api/v1/courses/0/blueprint_templates/default/restrict_item')
    }
    expect(fetchJson).toHaveBeenCalledTimes(itemCount * moduleCount);
    fetchMock.mockClear();
})

async function mockBpResponse(mockRequest: Request, numberToMock = 1) {
    const dummyBpData: ICourseData = {...mockCourseData, blueprint: true};
    const [_, requestCode] = mockRequest.url.match(/=[^=]*(\w{4}\d{3})/i) || [];
    const outCourseData: ICourseData[] = [...range(1, numberToMock)].map((number) => ({
        ...dummyBpData, name: `BP_${requestCode}${number > 1 ? number : ''}`,
        course_code: `BP_${requestCode}${number > 1 ? number : ''}`
    }))
    return JSON.stringify(outCourseData);
}


import {ITermData, Term} from "@/canvas/Term";
import {apiWriteConfig} from "@/canvas";


describe("genBlueprintsForCode", () => {
    const mockCourseDataGenerator = mockAsyncGen([]);
    const courseCode = "BP_TEST123";
    const accountIds = [1, 2, 3];
    const config: ICanvasCallConfig<GetCoursesFromAccountOptions> = {queryParams: {search_term: "x"}}; // replace with actual config type

    afterEach(() => {
        jest.clearAllMocks();
    });

    let consoleWarnSpy = jest.spyOn(console, 'warn');



    it("should return null for invalid course code", async () => {
        (getCourseDataGenerator as jest.Mock).mockReturnValue(mockCourseDataGenerator);
        const courseCode = 'BP_ST123'
        const result = genBlueprintDataForCode("BP_ST123", accountIds);
        expect(result).toBeNull();
        expect(consoleWarnSpy).toHaveBeenCalledWith(`Code ${courseCode} invalid`);
    });

    it("should generate blueprints for a valid course code", async () => {
        (fetchGetConfig as jest.Mock).mockReturnValue({blueprint: true});
        (getCourseDataGenerator as jest.Mock).mockReturnValue(mockCourseDataGenerator);
        const result = genBlueprintDataForCode(courseCode, accountIds, config.queryParams);
        expect(fetchGetConfig).toHaveBeenCalled();

        expect(result).toBe(mockCourseDataGenerator);
        expect(getCourseDataGenerator).toHaveBeenCalledWith(
            baseCourseCode(courseCode),
            accountIds,
            undefined,
            {blueprint: true}
        );
        expect(fetchGetConfig).toHaveBeenCalledWith({blueprint: true, include: ['concluded']}, config);
    });
});
