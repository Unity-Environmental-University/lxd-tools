import {badGradingPolicyTest, latePolicyTest, noEvaluationTest} from "./courseSettings";
import {getDummyLatePolicyHaver} from "./index.test";
import {ICanvasCallConfig, range} from "../../../canvas/canvasUtils";
import {Page} from "../../../canvas/content/index";
import {dummyPageData} from "../../../../tests/dummyData/dummyContentData";
import {dummyGradModules, dummyUgModules} from "../../../../tests/dummyData/dummyModuleData";
import {IModuleData} from "../../../canvas/canvasDataDefs";
import {getModulesByWeekNumber} from "../../../canvas/course/modules";
import {
    IGradingStandardData,
    IGradingStandardsHaver,
    IModulesHaver,
    IPagesHaver
} from "../../../canvas/course/courseTypes";

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
        getPages: async (_config?) => {
            return [new Page({...dummyPageData, title: 'Course Evaluation'}, 0), ...dummyPages];
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



const gradingPolicyDummyData:IGradingStandardData = {
    context_type: 'Course', grading_scheme: [], id: 0, title: ""
}


const dummyGradingPolicies:IGradingStandardData[] = [
    {...gradingPolicyDummyData, id:1, title: "DE Undergraduate Programs"},
    {...gradingPolicyDummyData, id:2, title: "DE Graduate Programs"},
    {...gradingPolicyDummyData, id:3, title: "REVISED DE Undergraduate Programs"},
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
        const newUgSchemeCourse = await getDummyModuleGradingPolicyHaver(dummyGradingPolicies[2], [...dummyUgModules]);
        let result = await badGradingPolicyTest.run(newUgSchemeCourse);
        expect(result.success).toBe(true);

        const goodGradSchemeCourse = await getDummyModuleGradingPolicyHaver(dummyGradingPolicies[1], [...dummyGradModules]);
        result = await badGradingPolicyTest.run(goodGradSchemeCourse);
        expect(result.success).toBe(true);
    })

    test("Flags old UG standard", async () => {
        const oldUgSchemeCourse = await getDummyModuleGradingPolicyHaver(dummyGradingPolicies[0], [...dummyUgModules]);
        let result = await badGradingPolicyTest.run(oldUgSchemeCourse);
        expect(result.success).toBe(false);
    })

    test("Flags ug scheme in new course old UG standard", async () => {
        const badGradSchemeCourse = await getDummyModuleGradingPolicyHaver(dummyGradingPolicies[0], [...dummyGradModules]);
        let result = await badGradingPolicyTest.run(badGradSchemeCourse);
        expect(result.success).toBe(false);
    })

})


