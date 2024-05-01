import {ICanvasCallConfig} from "../../../src/canvas/canvasUtils"
import {Course, ILatePolicyHaver, ISyllabusHaver} from "../../../src/canvas/index";
import * as fs from "fs";
import path from "path";
import publishUnitTests, {
    aiPolicyInSyllabusTest,
    bottomOfSyllabusLanguageTest,
    communication24HoursTest,
    courseCreditsInSyllabusTest,
    finalNotInGradingPolicyParaTest,
    latePolicyTest
} from "../../../src/publish/fixesAndUpdates/publishValidation";
import {CourseValidationTest} from "../../../src/publish/fixesAndUpdates/CourseValidator";
import {ILatePolicyUpdate} from "../../../src/canvas/canvasDataDefs";
import dummyLatePolicy from "./dummyLatePolicy";


const goofusSyllabusHtml = fs.readFileSync('./tests/files/syllabus.goofus.html').toString()
const gallantSyllabusHtml = fs.readFileSync('./tests/files/syllabus.gallant.html').toString()


function GetDummySyllabusHaver(syllabus: string): ISyllabusHaver {
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

function GetDummyLatePolicyHaver(policyDetails:ILatePolicyUpdate): ILatePolicyHaver {
    const policy = dummyLatePolicy;
    return {
        id: 1,
        getLatePolicy: async function(config) {
            return {...policy, ...policyDetails};
        }
    }
}

function syllabusTestTest(test: CourseValidationTest<ISyllabusHaver>) {
    return async () => {
        const gallantCourse: ISyllabusHaver = GetDummySyllabusHaver(gallantSyllabusHtml);
        const gallantResult = await test.run(gallantCourse)
        expect(gallantResult).toHaveProperty('success', true);

        const goofusCourse: ISyllabusHaver = GetDummySyllabusHaver(goofusSyllabusHtml);
        const goofusResult = await test.run(goofusCourse);
        expect(goofusResult).toHaveProperty('success', false);
    }
}

describe('Syllabus validation', () => {
    test('AI policy present test correct', syllabusTestTest(aiPolicyInSyllabusTest))
    test('Bottom of Syllabus language test correct', syllabusTestTest(bottomOfSyllabusLanguageTest))
    test('Course credits displayed in syllabus test correct', syllabusTestTest(courseCreditsInSyllabusTest))
    test('Communication policy current test correct', syllabusTestTest(communication24HoursTest))
    test('Grading policy language in syllabus text is correct', syllabusTestTest(finalNotInGradingPolicyParaTest))
});

test('Late policy test works', async () => {
    const gallant = GetDummyLatePolicyHaver({missing_submission_deduction_enabled: true});
    const goofus = GetDummyLatePolicyHaver({missing_submission_deduction_enabled: false});

    const gallantResult = await latePolicyTest.run(gallant);
    const goofusResult = await latePolicyTest.run(goofus);
    expect(goofusResult).toHaveProperty('success', false)
    expect(gallantResult).toHaveProperty('success', true)
})