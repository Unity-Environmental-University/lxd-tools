import {CourseValidation, TextReplaceValidation} from "../index";
import {
    aiPolicyInSyllabusTest,
    bottomOfSyllabusLanguageTest,
    communication24HoursTest,
    courseCreditsInSyllabusTest, finalNotInGradingPolicyParaTest
} from "../syllabusTests";
import fs from "fs";
import {dummySyllabusHaver} from "./index.test";
import {ISyllabusHaver} from "../../../../canvas/course/courseTypes";

const goofusSyllabusHtml = fs.readFileSync('./src/canvas/course/__mocks__/syllabus.goofus.html').toString()
const gallantSyllabusHtml = fs.readFileSync('./src/canvas/course/__mocks__/syllabus.gallant.html').toString()

describe('Syllabus validation', () => {
    test('AI policy present test correct', syllabusTestTest(aiPolicyInSyllabusTest))
    test('Bottom of Syllabus language test correct', syllabusTestTest(bottomOfSyllabusLanguageTest))
    test('Course credits displayed in syllabus test correct', syllabusTestTest(courseCreditsInSyllabusTest))
    test('Communication policy current test correct', syllabusTestTest(communication24HoursTest))
    test('Grading policy language in syllabus text is correct', syllabusTestTest(finalNotInGradingPolicyParaTest))
});

export function syllabusTestTest(test: CourseValidation<ISyllabusHaver> | TextReplaceValidation<ISyllabusHaver>) {
    return async () => {
        const gallantCourse: ISyllabusHaver = dummySyllabusHaver(gallantSyllabusHtml);
        const gallantResult = await test.run(gallantCourse)
        expect(gallantResult).toHaveProperty('success', true);

        const goofusCourse: ISyllabusHaver = dummySyllabusHaver(goofusSyllabusHtml);
        const goofusResult = await test.run(goofusCourse);
        expect(goofusResult).toHaveProperty('success', false);

        if ('negativeExemplars' in test && test.fix) {
            for (let [goofus, gallant] of test.negativeExemplars) {
                const goofusCourse: ISyllabusHaver = dummySyllabusHaver(goofus);
                await test.fix(goofusCourse);
                const syllabus = await goofusCourse.getSyllabus();
                expect(syllabus).toBe(gallant);
            }
        }
    }
}
