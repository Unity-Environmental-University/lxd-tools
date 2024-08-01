import {CourseValidation, TextReplaceValidation} from "../index";
import {
    aiPolicyInSyllabusTest,
    bottomOfSyllabusLanguageTest, classInclusiveNoDateHeaderTest,
    communication24HoursTest,
    courseCreditsInSyllabusTest, finalNotInGradingPolicyParaTest, gradeTableHeadersCorrectTest
} from "../syllabusTests";
import fs from "fs";
import {ISyllabusHaver} from "@/canvas/course/courseTypes";
import {badContentTextValidationFixTest, badContentTextValidationTest, mockSyllabusHaver} from "../__mocks__";
import {Course} from "@/canvas/course/Course";
import {mockCourseData} from "@/canvas/course/__mocks__/mockCourseData";
import assert from "assert";

const goofusSyllabusHtml = fs.readFileSync('./src/canvas/course/__mocks__/syllabus.goofus.html').toString()
const gallantSyllabusHtml = fs.readFileSync('./src/canvas/course/__mocks__/syllabus.gallant.html').toString()

describe('Syllabus validation', () => {
    test('AI policy present test correct', syllabusTestTest(aiPolicyInSyllabusTest))
    test('Bottom of Syllabus language test correct', syllabusTestTest(bottomOfSyllabusLanguageTest))
    test('Course credits displayed in syllabus test correct', syllabusTestTest(courseCreditsInSyllabusTest))
    test('Communication policy current test correct', syllabusTestTest(communication24HoursTest))
    test('Grading policy language in syllabus text is correct', syllabusTestTest(finalNotInGradingPolicyParaTest))
    test('Grade table headers correct', syllabusTestTest(gradeTableHeadersCorrectTest))
    test('Class Inclusive Dates Test', syllabusTestTest(classInclusiveNoDateHeaderTest))
});

export function syllabusTestTest(test: CourseValidation<ISyllabusHaver> | TextReplaceValidation<ISyllabusHaver>) {
    return async () => {


        const beforeAndAfters = 'beforeAndAfters' in test? test.beforeAndAfters : [[goofusSyllabusHtml, gallantSyllabusHtml]];

        for (let [goofusHtml, gallantHtml] of beforeAndAfters) {
            const gallantCourse: ISyllabusHaver = mockSyllabusHaver(gallantHtml);
            const gallantResult = await test.run(gallantCourse)
            expect(gallantResult).toHaveProperty('success', true);

            const goofusCourse: ISyllabusHaver = mockSyllabusHaver(goofusHtml);
            const goofusResult = await test.run(goofusCourse);
            assert(!goofusResult.success, JSON.stringify(goofusResult.messages))

        }

        if ('beforeAndAfters' in test && test.fix) {
            for (let [goofus, gallant] of test.beforeAndAfters) {
                const goofusCourse: ISyllabusHaver = mockSyllabusHaver(goofus);
                await test.fix(goofusCourse);
                const syllabus = await goofusCourse.getSyllabus();
                console.log(goofus, gallant)
                expect(syllabus).toBe(gallant);
            }
        }
    }
}
