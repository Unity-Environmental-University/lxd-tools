import {
    badGradingPolicyTest,
    extensionsInstalledTest,
    extensionsToTest,
    latePolicyTest,
    noEvaluationTest
} from "../courseSettings";
import {getDummyLatePolicyHaver} from "./index.test";
import {ICanvasCallConfig, range} from "../../../../canvas/canvasUtils";
import {Page} from "../../../../canvas/content";
import {mockPageData} from "../../../../canvas/content/__mocks__/mockContentData";
import {mockGradModules, mockUgModules} from "../../../../canvas/course/__mocks__/mockModuleData";
import {IModuleData, ITabData} from "../../../../canvas/canvasDataDefs";
import {getModulesByWeekNumber} from "../../../../canvas/course/modules";
import {
    IGradingStandardData,
    IGradingStandardsHaver,
    IModulesHaver,
    IPagesHaver
} from "../../../../canvas/course/courseTypes";
import {CourseValidation} from "../index";
import {mockCourseData} from "../../../../canvas/course/__mocks__/mockCourseData";
import {Course} from "../../../../canvas/course/Course";
import mockTabData from "../../../../canvas/__mocks__/mockTabData";

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


const dummyGradingPolicies: IGradingStandardData[] = [
    {...gradingPolicyDummyData, id: 1, title: "DE Undergraduate Programs"},
    {...gradingPolicyDummyData, id: 2, title: "DE Graduate Programs"},
    {...gradingPolicyDummyData, id: 3, title: "REVISED DE Undergraduate Programs"},
]


describe('Grading policy validation correct test', () => {


    async function getDummyModuleGradingPolicyHaver(gradingPolicy: IGradingStandardData, modules: IModuleData[]) {
        const out: IModulesHaver & IGradingStandardsHaver = {
            id: 0,
            getCurrentGradingStandard: async (config?) => gradingPolicy,
            getAvailableGradingStandards: async (config) => dummyGradingPolicies,
            getModules: async (config?) => modules,
            getModulesByWeekNumber: async (config?: ICanvasCallConfig) => (await getModulesByWeekNumber(modules))
        }
        return out;
    };

    test("Works for correctly set standards", async () => {
        const newUgSchemeCourse = await getDummyModuleGradingPolicyHaver(dummyGradingPolicies[2], [...mockUgModules]);
        let result = await badGradingPolicyTest.run(newUgSchemeCourse);
        expect(result.success).toBe(true);

        const goodGradSchemeCourse = await getDummyModuleGradingPolicyHaver(dummyGradingPolicies[1], [...mockGradModules]);
        result = await badGradingPolicyTest.run(goodGradSchemeCourse);
        expect(result.success).toBe(true);
    })

    test("Flags old UG standard", async () => {
        const oldUgSchemeCourse = await getDummyModuleGradingPolicyHaver(dummyGradingPolicies[0], [...mockUgModules]);
        let result = await badGradingPolicyTest.run(oldUgSchemeCourse);
        expect(result.success).toBe(false);
    })

    test("Flags ug scheme in new course old UG standard", async () => {
        const badGradSchemeCourse = await getDummyModuleGradingPolicyHaver(dummyGradingPolicies[0], [...mockGradModules]);
        let result = await badGradingPolicyTest.run(badGradSchemeCourse);
        expect(result.success).toBe(false);
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