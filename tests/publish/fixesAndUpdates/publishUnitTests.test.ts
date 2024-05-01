import {ICanvasCallConfig} from "../../../src/canvas/canvasUtils"
import {Course, ISyllabusHaver} from "../../../src/canvas/index";
import * as fs from "fs";
import path from "path";
import publishUnitTests, {
    aiPolicyInSyllabusTest,
    bottomOfSyllabusLanguageTest, communication24HoursTest, courseCreditsInSyllabusTest, finalNotInGradingPolicyParaTest
} from "../../../src/publish/fixesAndUpdates/publishValidation";
import {CourseValidationTest} from "../../../src/publish/fixesAndUpdates/CourseValidator";
import exp from "node:constants";


const goofusSyllabusHtml = fs.readFileSync('./tests/files/syllabus.goofus.html').toString()
const gallantSyllabusHtml = fs.readFileSync('./tests/files/syllabus.gallant.html').toString()


function GetDummySyllabusHaver(syllabus: string): ISyllabusHaver {
    return {
        getSyllabus: async function (config) {
            return syllabus;
        },
        changeSyllabus: async function (newHtml, config) {
            syllabus = newHtml;
        }
    }
}

function syllabusTestTest(test: CourseValidationTest<ISyllabusHaver>) {
    return async () => {
        const gallantCourse: ISyllabusHaver = GetDummySyllabusHaver(gallantSyllabusHtml);
        const gallantResult = await test.run(gallantCourse)
        expect(gallantResult.success).toBe(true);

        const goofusCourse: ISyllabusHaver = GetDummySyllabusHaver(goofusSyllabusHtml);
        const goofusResult = await test.run(goofusCourse);
        expect(goofusResult.success).toBe(false);
    }
}

describe('Syllabus validation', () => {
    test('AI policy present test correct', syllabusTestTest(aiPolicyInSyllabusTest))
    test('Bottom of Syllabus language test correct', syllabusTestTest(bottomOfSyllabusLanguageTest))
    test('Course credits displayed in syllabus test correct', syllabusTestTest(courseCreditsInSyllabusTest))
    test('Communication policy current test correct', syllabusTestTest(communication24HoursTest))
    test('Grading policy language in syllabus text is correct', syllabusTestTest(finalNotInGradingPolicyParaTest))
});