import {
    addAiGenerativeLanguageTest,
    addApaNoteToGradingPoliciesTest,
    aiPolicyInSyllabusTest,
    bottomOfSyllabusLanguageTest,
    classInclusiveNoDateHeaderTest,
    communication24HoursTest,
    courseCreditsInSyllabusTest,
    finalNotInGradingPolicyParaTest, 
    fixSupportEmailTest,
    gradeTableHeadersCorrectTest,
    removeSameDayPostRestrictionTest,
    honorCodeLanguageText
} from "../syllabusTests";
import {ISyllabusHaver} from "@/canvas/course/courseTypes";
import assert from "assert";
import {CourseValidation, TextReplaceValidation} from "@publish/fixesAndUpdates/validations/types";
import {mockSyllabusHaver} from "@publish/fixesAndUpdates/validations/__mocks__/validations";

import  gallantSyllabusHtml from '@canvas/course/__mocks__/syllabus.gallant.html'
import  goofusSyllabusHtml from '@canvas/course/__mocks__/syllabus.goofus.html'

describe('Syllabus validation', () => {
    test('AI policy present test correct', syllabusTestTest(aiPolicyInSyllabusTest))
    test('Bottom of Syllabus language test correct', syllabusTestTest(bottomOfSyllabusLanguageTest))
    test('Course credits displayed in syllabus test correct', syllabusTestTest(courseCreditsInSyllabusTest))
    test('Communication policy current test correct', syllabusTestTest(communication24HoursTest))
    test('Grading policy language in syllabus text is correct', syllabusTestTest(finalNotInGradingPolicyParaTest))
    test('Grade table headers correct', syllabusTestTest(gradeTableHeadersCorrectTest))
    test('Class Inclusive Dates Test', syllabusTestTest(classInclusiveNoDateHeaderTest))
    test('Remove same day post restriction test', syllabusTestTest(removeSameDayPostRestrictionTest))
    
    test('Add apa language to grading policy test', syllabusTestTest(addApaNoteToGradingPoliciesTest))
    test('Add generative ai language', syllabusTestTest(addAiGenerativeLanguageTest))
    test('Fix support email', syllabusTestTest(fixSupportEmailTest))
    test('Fix Honor Code langauge', syllabusTestTest(honorCodeLanguageText));
});

export function syllabusTestTest(test: CourseValidation<ISyllabusHaver> | TextReplaceValidation<ISyllabusHaver>) {
    return async () => {


        const beforeAndAfters = 'beforeAndAfters' in test? test.beforeAndAfters : [[goofusSyllabusHtml, gallantSyllabusHtml]];

        for (const [goofusHtml, gallantHtml] of beforeAndAfters) {
            const gallantCourse: ISyllabusHaver = mockSyllabusHaver(gallantHtml);
            const gallantResult = await test.run(gallantCourse)
            expect(gallantResult).toHaveProperty('success', true);

            const goofusCourse: ISyllabusHaver = mockSyllabusHaver(goofusHtml);
            const goofusResult = await test.run(goofusCourse);
            assert(!goofusResult.success, JSON.stringify(goofusResult.messages))

        }

        if ('beforeAndAfters' in test && test.fix) {
            for (const [goofus, gallant] of test.beforeAndAfters) {
                const goofusCourse: ISyllabusHaver = mockSyllabusHaver(goofus);
                await test.fix(goofusCourse);
                const syllabus = await goofusCourse.getSyllabus();
                expect(syllabus).toBe(gallant);
            }
        }
    }
}
