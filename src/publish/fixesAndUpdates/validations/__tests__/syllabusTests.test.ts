import {
  addAiGenerativeLanguageTest,
  latePolicyTableTest,
  aiPolicyInSyllabusTest,
  bottomOfSyllabusLanguageTest,
  classInclusiveNoDateHeaderTest,
  courseCreditsInSyllabusTest,
  fixSupportEmailTest,
  gradeTableHeadersCorrectTest,
  removeSameDayPostRestrictionTest,
  honorCodeCheck,
  addApaNoteToGradingPoliciesTest,
  titleIXPolicyTest,
  gradingDeadlineLanguageTest,
  aiPolicyMediaTest,
  supportPhoneNumberFix,
} from "../syllabusTests";
import { ISyllabusHaver, ICourseDataHaver } from "@ueu/ueu-canvas/course/courseTypes";
import assert from "assert";
import { CourseValidation, TextReplaceValidation } from "@publish/fixesAndUpdates/validations/types";
import { mockSyllabusHaver } from "@publish/fixesAndUpdates/validations/__mocks__/validations";
import { mockCourseData } from "@ueu/ueu-canvas";

import gallantSyllabusHtml from "@/__mocks__/syllabus.gallant.html";
import goofusSyllabusHtml from "@/__mocks__/syllabus.goofus.html";

describe("Syllabus validation", () => {
  test("AI policy present test correct", syllabusTestTest(aiPolicyInSyllabusTest));
  test("Bottom of Syllabus language test correct", syllabusTestTest(bottomOfSyllabusLanguageTest));
  test("Course credits displayed in syllabus test correct", syllabusTestTest(courseCreditsInSyllabusTest));
  test("Grade table headers correct", syllabusTestTest(gradeTableHeadersCorrectTest));
  test("Class Inclusive Dates Test", syllabusTestTest(classInclusiveNoDateHeaderTest));
  test("Remove same day post restriction test", syllabusTestTest(removeSameDayPostRestrictionTest));

  test("Add apa language to grading policy test", syllabusTestTest(addApaNoteToGradingPoliciesTest));
  test("Add generative ai language", syllabusTestTest(addAiGenerativeLanguageTest));
  test("Fix support email", syllabusTestTest(fixSupportEmailTest));
  describe("honorCodeCheck", () => {
    test("passes when old language is gone and correct link is present", syllabusTestTest(honorCodeCheck));

    test("fails when old language is gone but link URL is wrong", async () => {
      const brokenLinkHtml = gallantSyllabusHtml.replace("?docid=3341", "?docid=9999");
      const course: ISyllabusHaver & ICourseDataHaver = {
        ...mockSyllabusHaver(brokenLinkHtml),
        rawData: mockCourseData,
      };
      const result = await honorCodeCheck.run(course);
      expect(result.success).toBe(false);
    });

    test("fails when old link (3323) is present and fix replaces it with new link (3341)", async () => {
      const oldLinkHtml = gallantSyllabusHtml.replace("?docid=3341", "?docid=3323");
      const course: ISyllabusHaver & ICourseDataHaver = {
        ...mockSyllabusHaver(oldLinkHtml),
        rawData: mockCourseData,
      };

      const runResult = await honorCodeCheck.run(course);
      expect(runResult.success).toBe(false);

      if (!honorCodeCheck.fix) throw new Error("honorCodeCheck.fix is not defined");
      const fixResult = await honorCodeCheck.fix(course, runResult);
      expect(fixResult.success).toBe(true);

      const syllabus = await course.getSyllabus();
      expect(syllabus).toContain("?docid=3341");
      expect(syllabus).not.toContain("?docid=3323");
    });
  });
  test("Late policy text replace", syllabusTestTest(latePolicyTableTest));
  test("Title IX policy update", syllabusTestTest(titleIXPolicyTest));
  test("Grading Deadline Language", syllabusTestTest(gradingDeadlineLanguageTest));
  test("AI Policy Media", syllabusTestTest(aiPolicyMediaTest));
  test("Support Phone Number Fix", syllabusTestTest(supportPhoneNumberFix));
});

export function syllabusTestTest(
  test:
    | CourseValidation<ISyllabusHaver>
    | TextReplaceValidation<ISyllabusHaver>
    | CourseValidation<ISyllabusHaver & ICourseDataHaver>
) {
  return async () => {
    const beforeAndAfters =
      "beforeAndAfters" in test ? test.beforeAndAfters : [[goofusSyllabusHtml, gallantSyllabusHtml]];
    console.log(beforeAndAfters);

    for (const [goofusHtml, gallantHtml] of beforeAndAfters) {
      const gallantCourse: ISyllabusHaver & ICourseDataHaver = {
        ...mockSyllabusHaver(gallantHtml),
        rawData: mockCourseData,
      };
      const gallantResult = await test.run(gallantCourse);
      expect(gallantResult).toHaveProperty("success", true);

      const goofusCourse: ISyllabusHaver & ICourseDataHaver = {
        ...mockSyllabusHaver(goofusHtml),
        rawData: mockCourseData,
      };
      const goofusResult = await test.run(goofusCourse);
      assert(!goofusResult.success, JSON.stringify(goofusResult.messages));
    }

    if ("beforeAndAfters" in test && test.fix) {
      for (const [goofus, gallant] of test.beforeAndAfters) {
        const goofusCourse: ISyllabusHaver = mockSyllabusHaver(goofus);
        await test.fix(goofusCourse);
        const syllabus = await goofusCourse.getSyllabus();
        expect(syllabus).toBe(gallant);
      }
    }
  };
}
