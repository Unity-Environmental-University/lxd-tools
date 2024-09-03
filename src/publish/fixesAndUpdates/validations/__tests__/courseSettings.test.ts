import {
    badGradingPolicyTest,
    extensionsInstalledTest,
    extensionsToTest,
    latePolicyTest,
    noEvaluationTest
} from "../courseSettings";
import {deFormDataify, ICanvasCallConfig, range} from "@/canvas/canvasUtils";
import {mockPageData} from "@/canvas/content/__mocks__/mockContentData";
import {mockGradModules, mockUgModules} from "@/canvas/course/__mocks__/mockModuleData";
import {IModuleData} from "@/canvas/canvasDataDefs";
import {getModulesByWeekNumber} from "@/canvas/course/modules";
import {
    IGradingStandardData,
    IPagesHaver
} from "@/canvas/course/courseTypes";
import {mockCourseData} from "@/canvas/course/__mocks__/mockCourseData";
import {Course} from "@/canvas/course/Course";
import mockTabData from "@/canvas/__mocks__/mockTabData";
import {getDummyLatePolicyHaver} from "../__mocks__/validations";
import assert from "assert";

import {ICourseData, ITabData} from "@/canvas/courseTypes";
import {fetchJson} from "@/canvas/fetch/fetchJson";
import {Page} from "@/canvas/content/pages/Page";

jest.mock('@/canvas/fetch/fetchJson')

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
        ...mockPageData,
        title: a.toString()
    }, 0)))
    const goofus: IPagesHaver = {
        id: 0,
        getPages: async (_config?) => {
            return [new Page({...mockPageData, title: 'Course Evaluation'}, 0), ...dummyPages];
        }
    };
    const gallant: IPagesHaver = {
        id: 0,
        getPages: async (_config?) => {
            return dummyPages;
        }
    };

    const goofusResult = await noEvaluationTest.run(goofus)
    expect(goofusResult.success).toBe(false);
    expect(goofusResult.links?.length).toBe(1);

    const gallantResult = await noEvaluationTest.run(gallant)
    expect(gallantResult.success).toBe(true);

})


const gradingPolicyDummyData: IGradingStandardData = {
    context_type: 'Course', grading_scheme: [], id: 0, title: ""
}


const mockGradingPolicies: IGradingStandardData[] = [
    {...gradingPolicyDummyData, id: 1, title: "DE Undergraduate Programs"},
    {...gradingPolicyDummyData, id: 2, title: "DE Graduate Programs"},
    {...gradingPolicyDummyData, id: 3, title: "REVISED DE Undergraduate Programs"},
]


type MockModGradPolHavOpts = {
    overrides: Partial<Course>
};
    async function mockModuleGradingPolicyHaver(gradingPolicy: IGradingStandardData | null, modules: IModuleData[], options?: MockModGradPolHavOpts) {

        const additions:Partial<Course> = Object.assign(<Partial<Course>>{
            getCurrentGradingStandard: async (config?) => gradingPolicy,
            getAvailableGradingStandards: async (config?) => mockGradingPolicies,
            getModules: async (config?) => modules,
            getModulesByWeekNumber: async (config?: ICanvasCallConfig) => (await getModulesByWeekNumber(modules))
        }, options?.overrides);

        const out:Course = Object.assign(new Course({...mockCourseData, id: 0}), additions)
        return out;
    }

    
describe('Grading policy validation correct test', () => {

    const fetchJsonMock = fetchJson as jest.Mock;

    test("Works for correctly set standards", async () => {
        const newUgSchemeCourse = await mockModuleGradingPolicyHaver(mockGradingPolicies[2], [...mockUgModules]);
        let result = await badGradingPolicyTest.run(newUgSchemeCourse);
        expect(result.success).toBe(true);

        const goodGradSchemeCourse = await mockModuleGradingPolicyHaver(mockGradingPolicies[1], [...mockGradModules]);
        result = await badGradingPolicyTest.run(goodGradSchemeCourse);
        expect(result.success).toBe(true);
    })

    test("Flags old UG standard", async () => {
        const oldUgSchemeCourse = await mockModuleGradingPolicyHaver(mockGradingPolicies[0], [...mockUgModules]);
        let result = await badGradingPolicyTest.run(oldUgSchemeCourse);
        expect(result.success).toBe(false);
    })

    test("Flags ug scheme in new course old UG standard", async () => {
        const badGradSchemeCourse = await mockModuleGradingPolicyHaver(mockGradingPolicies[0], [...mockGradModules]);
        let result = await badGradingPolicyTest.run(badGradSchemeCourse);
        expect(result.success).toBe(false);
    })


    test("Flags ug scheme in new course old UG standard", async () => {
        const badGradSchemeCourse = await mockModuleGradingPolicyHaver(mockGradingPolicies[0], [...mockGradModules]);
        let result = await badGradingPolicyTest.run(badGradSchemeCourse);
        expect(result.success).toBe(false);
    })

    it("Fails gracefully if standards can't be found", async() => {
        const noPermissionsCourse = await mockModuleGradingPolicyHaver(null, [...mockGradModules], {
            overrides: {
                async getAvailableGradingStandards(config?) {
                    return [];
                },
                async getCurrentGradingStandard(config?) {
                    return null;
                }
            }
        })

        let result = await badGradingPolicyTest.run(noPermissionsCourse);
        expect(result.success).toEqual(false);
        expect(result.messages.reduce(
            (aggregator, current, index, array) =>
                aggregator + '\n' + current.bodyLines.join('\n'), '')
        ).toMatch(/grading standard not found/)
    });

    it("Fixes bad ug scheme to correct scheme", async () => {
        fetchJsonMock.mockImplementation(async (url:string, config?: ICanvasCallConfig) => {
            const formData = config?.fetchInit?.body;
            assert(formData instanceof FormData);
            const change:ICourseData = deFormDataify(formData).course as ICourseData;
            return {...mockCourseData, ...change}
        })
        const badGradSchemeCourse = await mockModuleGradingPolicyHaver(mockGradingPolicies[0], [...mockGradModules]);
        let result = await badGradingPolicyTest.fix(badGradSchemeCourse);
        expect(result.success).toBe(true);
        assert(result.userData && 'id' in result.userData)
        expect(result.userData.grading_standard_id).toEqual( "2")
    })
})

describe('Extensions installed', () => {
    const mockGetTabs = (tabs: ITabData[]) => jest.fn(async () => tabs)
    it('succeeds if all extensions are present', async () => {

        const mockCourse = new Course(mockCourseData);
        mockCourse.getTabs = mockGetTabs(extensionsToTest.map(label => ({...mockTabData, label})))
        let result = await extensionsInstalledTest.run(mockCourse);
        expect(result.success).toBe(true);
    })
    it('fails if not all extensions are present', async () => {

        const mockCourse = new Course(mockCourseData);
        mockCourse.getTabs = mockGetTabs([{...mockTabData, label: extensionsToTest[0]}, mockTabData, mockTabData])
        let result = await extensionsInstalledTest.run(mockCourse);
        expect(result.success).toBe(false);
    })
})