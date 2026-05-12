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
  secondDiscussionParaOff,
  gradDiscussionExpectationsTest,
  communication24HoursTest,
  gradingPolicyTest,
  gradLearningAccommodationsTest,
  gradAIPolicyTest,
  gradTechnicalSupportTest,
  gradStatementOnFairPracticesTest,
} from "../syllabusTests";
import { ISyllabusHaver, ICourseDataHaver } from "@ueu/ueu-canvas/course/courseTypes";
import assert from "assert";
import { CourseValidation, TextReplaceValidation } from "@publish/fixesAndUpdates/validations/types";
import { mockSyllabusHaver } from "@publish/fixesAndUpdates/validations/__mocks__/validations";
import { mockCourseData } from "@ueu/ueu-canvas";

import gallantSyllabusHtml from "@/__mocks__/syllabus.gallant.html";
import goofusSyllabusHtml from "@/__mocks__/syllabus.goofus.html";
import gradSyllabusHtml from "@/__mocks__/syllabus.grad.html";

const mockGradCourseData = { ...mockCourseData, course_code: "TEST505" };

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

  describe("communication24HoursTest", () => {
    test("passes for correct UG syllabus, fails for goofus", syllabusTestTest(communication24HoursTest));

    test("fix replaces bad UG communication with correct language", async () => {
      const course: ISyllabusHaver & ICourseDataHaver = {
        ...mockSyllabusHaver(goofusSyllabusHtml),
        rawData: mockCourseData,
      };
      expect((await communication24HoursTest.run(course)).success).toBe(false);
      await communication24HoursTest.fix(course);
      const result = await communication24HoursTest.run(course);
      expect(result.success).toBe(true);
    });

    test("fix replaces bad grad communication with correct grad language", async () => {
      // Use goofus (UG-style communication) as the starting point for a grad course
      const course: ISyllabusHaver & ICourseDataHaver = {
        ...mockSyllabusHaver(goofusSyllabusHtml),
        rawData: mockGradCourseData,
      };
      expect((await communication24HoursTest.run(course)).success).toBe(false);
      await communication24HoursTest.fix(course);
      const result = await communication24HoursTest.run(course);
      expect(result.success).toBe(true);
    });
  });

  describe("gradingPolicyTest", () => {
    test("passes for correct UG syllabus, fails for goofus", syllabusTestTest(gradingPolicyTest));

    test("fix corrects bad UG extenuating circumstances sentence", async () => {
      const course: ISyllabusHaver & ICourseDataHaver = {
        ...mockSyllabusHaver(goofusSyllabusHtml),
        rawData: mockCourseData,
      };
      expect((await gradingPolicyTest.run(course)).success).toBe(false);
      await gradingPolicyTest.fix(course);
      expect((await gradingPolicyTest.run(course)).success).toBe(true);
    });

    test("fix corrects bad grad extenuating circumstances sentence", async () => {
      const course: ISyllabusHaver & ICourseDataHaver = {
        ...mockSyllabusHaver(goofusSyllabusHtml),
        rawData: mockGradCourseData,
      };
      expect((await gradingPolicyTest.run(course)).success).toBe(false);
      await gradingPolicyTest.fix(course);
      expect((await gradingPolicyTest.run(course)).success).toBe(true);
    });
  });
});

export function syllabusTestTest(
  test:
    | CourseValidation<ISyllabusHaver>
    | TextReplaceValidation<ISyllabusHaver>
    | CourseValidation<ISyllabusHaver & ICourseDataHaver>
    | TextReplaceValidation<ISyllabusHaver & ICourseDataHaver>
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
        const goofusCourse: ISyllabusHaver & ICourseDataHaver = {
          ...mockSyllabusHaver(goofus),
          rawData: mockCourseData,
        };
        await test.fix(goofusCourse);
        const syllabus = await goofusCourse.getSyllabus();
        expect(syllabus).toBe(gallant);
      }
    }
  };
}

function gradSyllabusTestTest(test: CourseValidation<ISyllabusHaver & ICourseDataHaver>) {
  return async () => {
    const gradCourse: ISyllabusHaver & ICourseDataHaver = {
      ...mockSyllabusHaver(gradSyllabusHtml),
      rawData: mockGradCourseData,
    };
    const result = await test.run(gradCourse);
    expect(result).toHaveProperty("success", true);
  };
}

describe("Grad syllabus validations", () => {
  test("Honor code check passes for correct grad syllabus", gradSyllabusTestTest(honorCodeCheck));
  test("Grad discussion expectations check passes for correct grad syllabus", gradSyllabusTestTest(gradDiscussionExpectationsTest));

  test("Grad discussion expectations fix inserts correct content", async () => {
    // Goofus has UG-style discussion expectations (no class="grad", wrong paragraph)
    const course: ISyllabusHaver & ICourseDataHaver = {
      ...mockSyllabusHaver(goofusSyllabusHtml),
      rawData: mockGradCourseData,
    };
    expect((await gradDiscussionExpectationsTest.run(course)).success).toBe(false);
    await gradDiscussionExpectationsTest.fix(course);
    expect((await gradDiscussionExpectationsTest.run(course)).success).toBe(true);
  });
  test("Communication 24-hour check passes for correct grad syllabus", gradSyllabusTestTest(communication24HoursTest));

  test("Second discussion para check returns 'not run' for grad", async () => {
    const gradCourse: ISyllabusHaver & ICourseDataHaver = {
      ...mockSyllabusHaver(gradSyllabusHtml),
      rawData: mockGradCourseData,
    };
    const result = await secondDiscussionParaOff.run(gradCourse);
    expect(result.success).toBe("not run");
  });

  test("Title IX check passes for correct grad syllabus", async () => {
    const gradCourse: ISyllabusHaver & ICourseDataHaver = {
      ...mockSyllabusHaver(gradSyllabusHtml),
      rawData: mockGradCourseData,
    };
    const result = await titleIXPolicyTest.run(gradCourse);
    expect(result.success).toBe(true);
  });

  test("Late policy table check returns 'not run' for grad", async () => {
    const gradCourse: ISyllabusHaver & ICourseDataHaver = {
      ...mockSyllabusHaver(gradSyllabusHtml),
      rawData: mockGradCourseData,
    };
    const result = await latePolicyTableTest.run(gradCourse);
    expect(result.success).toBe("not run");
  });

  test("Grad discussion expectations returns 'not run' for UG", async () => {
    const ugCourse: ISyllabusHaver & ICourseDataHaver = {
      ...mockSyllabusHaver(gallantSyllabusHtml),
      rawData: mockCourseData,
    };
    const result = await gradDiscussionExpectationsTest.run(ugCourse);
    expect(result.success).toBe("not run");
  });

  const gradFixTest = (
    label: string,
    validation: { run: (c: ISyllabusHaver & ICourseDataHaver) => Promise<{ success: boolean | "not run" | "unknown" }>;
                  fix: (c: ISyllabusHaver & ICourseDataHaver, r: any) => Promise<unknown> },
    badHtml = goofusSyllabusHtml
  ) =>
    test(label, async () => {
      const good: ISyllabusHaver & ICourseDataHaver = { ...mockSyllabusHaver(gradSyllabusHtml), rawData: mockGradCourseData };
      expect((await validation.run(good)).success).toBe(true);

      const bad: ISyllabusHaver & ICourseDataHaver = { ...mockSyllabusHaver(badHtml), rawData: mockGradCourseData };
      const runResult = await validation.run(bad);
      expect(runResult.success).toBe(false);
      await validation.fix(bad, runResult);
      expect((await validation.run(bad)).success).toBe(true);
    });

  gradFixTest("Grad Learning Accommodations passes/fixes correctly", gradLearningAccommodationsTest);
  gradFixTest("Grad AI Policy passes/fixes correctly", gradAIPolicyTest, gallantSyllabusHtml);
  gradFixTest("Grad Technical Support passes/fixes correctly", gradTechnicalSupportTest);
  gradFixTest(
    "Grad Statement on Fair Practices passes/fixes correctly",
    gradStatementOnFairPracticesTest,
    gradSyllabusHtml.replace("creed or religion", "religion")
  );
});
