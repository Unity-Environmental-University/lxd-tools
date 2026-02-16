import {
  AddPosition,
  addSyllabusSectionFix,
  inSyllabusSectionFunc,
  InSyllabusSectionFuncUserData,
  testResult,
  ValidationResult,
} from "@publish/fixesAndUpdates/validations/utils";
import { ICourseDataHaver, ISyllabusHaver } from "@ueu/ueu-canvas";
import { mockCourseData } from "@ueu/ueu-canvas";

/**
 * Normalizes indentation in a string by collapsing all newline and whitespace sequences
 * into a single newline character.
 *
 * This ensures consistent formatting when comparing multi-line strings.
 *
 * @param input - The input string to normalize.
 * @returns The normalized string with consistent indentation.
 */
export function normalizeIndent(input: string): string {
  return input.replace(/\n\s+/g, "\n").trim();
}

describe("syllabus fix and validations functions", () => {
  let mockCourse: ISyllabusHaver & ICourseDataHaver;
  const defaultMockCourseData = { ...mockCourseData };
  const mockSyllabusHtml = normalizeIndent(`<div>
            <div>
                <h3>Section Name</h3>
                <p>Line 1</p>
                <p>Line 2</p>
            </div>
        </div>`);

  function elsAndSpys(mockHtml = mockSyllabusHtml, course = mockCourse) {
    const syllabusEl = document.createElement("div");
    syllabusEl.innerHTML = mockHtml;
    const headerEl = syllabusEl.querySelector("h3");
    const sectionEl = headerEl!.parentElement;
    const userData = {
      syllabusEl,
      sectionEl,
      headerEl,
    };

    return {
      getSpy: jest.spyOn(course, "getSyllabus").mockResolvedValue(mockSyllabusHtml),
      changeSpy: jest.spyOn(course, "changeSyllabus"),
      syllabusEl,
      sectionEl,
      userData,
    };
  }

  let matchTest: (
    sectionName: string | RegExp,
    sectionText: string | RegExp,
    expectedResult?: Partial<ValidationResult<InSyllabusSectionFuncUserData>>
  ) => () => Promise<void>;

  beforeEach(() => {
    jest.resetAllMocks();
    mockCourse = {
      rawData: mockCourseData,
      id: defaultMockCourseData.id,
      changeSyllabus: jest.fn(),
      getSyllabus: jest.fn(),
    } as ISyllabusHaver & ICourseDataHaver;
    matchTest = (sectionName, sectionText, expectedResult = { success: true }) => {
      elsAndSpys(mockSyllabusHtml, mockCourse).getSpy.mockResolvedValueOnce(mockSyllabusHtml);
      return async () =>
        expect(await inSyllabusSectionFunc(sectionName, sectionText)(mockCourse)).toEqual(
          expect.objectContaining(expectedResult)
        );
    };
  });

  describe("section in syllabus", () => {
    test("Finds a present section by string", async () => matchTest("Section Name", "Line 1")());
    test("Finds a present section by regex", async () => matchTest("Section Name", /line 1/i)());
    test("Finds a present section by TITLE regex", async () => matchTest(/Sec.*ame/, /line 1/i)());
    test("Fails on unknown sections", async () => matchTest(/Not Your Section Name/, /line 1/i, { success: false })());
    test("Fails on bad caps if needed", async () => matchTest(/Section Name/, /line 1/, { success: false })());
    test("Fails on on unknown section string", async () => matchTest("Nacho tuesday", /line 1/, { success: false })());
    test("Fails on empty section name", async () => {
      await expect(await matchTest("", "", { success: true })).rejects.toThrowError();
    });
    test("Fails on regex with no match in section", async () =>
      matchTest(/Section XYZ/, /line 1/i, { success: false })());
  });

  describe("addSyllabusSectionFix", () => {
    test("adds to end", async () => {
      const { changeSpy, userData } = elsAndSpys(mockSyllabusHtml, mockCourse);
      const run = jest.fn().mockResolvedValueOnce(testResult(false, { userData }));
      const fix = addSyllabusSectionFix(run, `<p>Added Section</p>`);
      changeSpy.mockResolvedValueOnce({ ...mockCourse });
      const result = await fix(mockCourse, {
        success: false,
        messages: [],
        userData,
      });
      expect(result.success).toBeTruthy();
      expect(changeSpy).toHaveBeenCalledWith(
        normalizeIndent(`<div>
                <div>
                    <h3>Section Name</h3>
                    <p>Line 1</p>
                    <p>Line 2</p>
                    <p>Added Section</p></div>
            </div>`)
      );
    });

    test("adds to beginning", async () => {
      const { changeSpy, userData } = elsAndSpys(mockSyllabusHtml, mockCourse);
      const run = jest.fn().mockResolvedValueOnce(testResult(false, { userData }));
      const fix = addSyllabusSectionFix(run, `<p>Added Section</p>`, AddPosition.AtBeginning);
      changeSpy.mockResolvedValueOnce({ ...mockCourse });
      const result = await fix(mockCourse, {
        success: false,
        messages: [],
        userData,
      });
      expect(result.success).toBeTruthy();
      expect(changeSpy).toHaveBeenCalledWith(
        normalizeIndent(`<div>
                <div>
                    <h3>Section Name</h3><p>Added Section</p>
                    <p>Line 1</p>
                    <p>Line 2</p>
                </div>
            </div>`)
      );
    });
  });
});
