import {
    aiPolicyInSyllabusTest,
    bottomOfSyllabusLanguageTest,
    communication24HoursTest,
    courseCreditsInSyllabusTest,
    finalNotInGradingPolicyParaTest
} from "./syllabusTests";
import {ICanvasCallConfig, range} from '../../../canvas/canvasUtils'
import {BaseContentItem, Page} from "../../../canvas/content/index";
import {IGradingStandardData, IGradingStandardsHaver, IModulesHaver, IPagesHaver} from "../../../canvas/course/index"
import {
    courseProjectOutlineTest,
    weeklyObjectivesTest
} from "./courseContent";
import {
    badGradingPolicyTest,
    latePolicyTest,
    noEvaluationTest
} from "./courseSettings";
import {
    capitalize,
    matchHighlights,
    preserveCapsReplace,
} from "./index";
import {dummyPageData} from "../../../../tests/dummyData/dummyContentData";
import proxyServerLinkValidation from "./proxyServerLinkValidation";
import capstoneProjectValidations
    from "./courseSpecific/capstoneProjectValidations";
import {
    badContentTextValidationFixTest,
    badContentTextValidationTest,
    dummyPagesHaver,
    getDummyLatePolicyHaver,
    syllabusTestTest
} from "../index";
import {IModuleData} from "../../../canvas/canvasDataDefs";
import {dummyGradModules, dummyUgModules} from "../../../../tests/dummyData/dummyModuleData";
import {getModulesByWeekNumber} from "../../../canvas/course/modules";


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


describe("Bad Link Tests and Fixes", () => {
    const proxiedUrl = encodeURI('https://unity.instructure.com')
    const badProxyLinkPageHtml = `<div><a href="https://login.proxy1.unity.edu/login?auth=shibboleth&amp;url=${proxiedUrl}">PROXY LINK</a></div>`;
    const goodProxyLinkPageHtml = `<div><a href="https://login.unity.idm.oclc.org/login?url=${proxiedUrl}">PROXY LINK</a></div>`;
    test("Old Proxy Server link exists in course test works", badContentTextValidationTest(proxyServerLinkValidation, badProxyLinkPageHtml, goodProxyLinkPageHtml));
    test("Old Proxy Server link replace fix works.", badContentTextValidationFixTest(proxyServerLinkValidation, badProxyLinkPageHtml, goodProxyLinkPageHtml));

});

describe("Capstone content tests", () => {
    for (let validation of capstoneProjectValidations) {
        for (const [badExample, goodExample] of validation.negativeExemplars) {
            test(`Find ${validation.name} test: ${badExample}`, badContentTextValidationTest(validation, badExample, goodExample));
            test(`Fix ${validation.name} test: ${badExample}`, badContentTextValidationFixTest(validation, badExample, goodExample));
        }
    }

})

const gradingPolicyDummyData:IGradingStandardData = {
    context_type: 'Course', grading_scheme: [], id: 0, title: ""
}



const dummyGradingPolicies:IGradingStandardData[] = [
    {...gradingPolicyDummyData, id:1, title: "DE Undergraduate Programs"},
    {...gradingPolicyDummyData, id:2, title: "DE Graduate Programs"},
    {...gradingPolicyDummyData, id:3, title: "REVISED DE Undergraduate Programs"},
]


async function getDummyModuleGradingPolicyHaver(gradingPolicy:IGradingStandardData, modules:IModuleData[]) {
    const out:IModulesHaver & IGradingStandardsHaver = {
        id: 0,
        getCurrentGradingStandard: async (config?) => gradingPolicy,
        getAvailableGradingStandards: async (config) => dummyGradingPolicies,
        getModules: async (config?) => modules,
        getModulesByWeekNumber: async (config?: ICanvasCallConfig) => (await getModulesByWeekNumber(modules))
    }
    return out;
};

describe('Grading policy validation correct test', () => {



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


