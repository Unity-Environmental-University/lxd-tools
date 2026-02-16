import {
  badGradingPolicyTest,
  createSettingsValidation,
  extensionsInstalledTest,
  extensionsToTest,
  latePolicyTest,
  noEvaluationTest,
} from "../courseSettings";
import { deFormDataify, ICanvasCallConfig, range } from "@ueu/ueu-canvas";
import { mockPageData } from "@ueu/ueu-canvas";
import { mockGradModules, mockUgModules } from "@ueu/ueu-canvas";
import { IModuleData } from "@ueu/ueu-canvas";
import { getModulesByWeekNumber } from "@ueu/ueu-canvas";
import { IGradingStandardData, IPagesHaver } from "@ueu/ueu-canvas";
import { mockCourseData } from "@ueu/ueu-canvas";
import { Course } from "@ueu/ueu-canvas";
import mockTabData from "@ueu/ueu-canvas";
import { getDummyLatePolicyHaver } from "../__mocks__/validations";
import assert from "assert";

import { ICourseData, ITabData } from "@ueu/ueu-canvas";
import { fetchJson } from "@ueu/ueu-canvas";
import { Page } from "@ueu/ueu-canvas";

import { CourseFixValidation } from "@publish/fixesAndUpdates/validations/types";

jest.mock("@/canvas/fetch/fetchJson");

test("Late policy test works", async () => {
  const gallant = getDummyLatePolicyHaver({ missing_submission_deduction_enabled: true });
  const goofus = getDummyLatePolicyHaver({ missing_submission_deduction_enabled: false });

  const gallantResult = await latePolicyTest.run(gallant);
  const goofusResult = await latePolicyTest.run(goofus);
  expect(goofusResult).toHaveProperty("success", false);
  expect(gallantResult).toHaveProperty("success", true);
});

test("Evaluation not present in course test works", async () => {
  const dummyPages = Array.from(range(1, 20)).map(
    (a: number) =>
      new Page(
        {
          ...mockPageData,
          title: a.toString(),
        },
        0
      )
  );
  const goofus: IPagesHaver = {
    id: 0,
    getPages: async (_config?) => {
      return [new Page({ ...mockPageData, title: "Course Evaluation" }, 0), ...dummyPages];
    },
  };
  const gallant: IPagesHaver = {
    id: 0,
    getPages: async (_config?) => {
      return dummyPages;
    },
  };

  const goofusResult = await noEvaluationTest.run(goofus);
  expect(goofusResult.success).toBe(false);
  expect(goofusResult.links?.length).toBe(1);

  const gallantResult = await noEvaluationTest.run(gallant);
  expect(gallantResult.success).toBe(true);
});

const gradingPolicyDummyData: IGradingStandardData = {
  context_type: "Course",
  grading_scheme: [],
  id: 0,
  title: "",
};

const mockGradingPolicies: IGradingStandardData[] = [
  { ...gradingPolicyDummyData, id: 1, title: "DE Undergraduate Programs" },
  { ...gradingPolicyDummyData, id: 2, title: "DE Graduate Programs" },
  { ...gradingPolicyDummyData, id: 3, title: "REVISED DE Undergraduate Programs" },
];

type MockModGradPolHavOpts = {
  overrides: Partial<Course>;
};
async function mockModuleGradingPolicyHaver(
  gradingPolicy: IGradingStandardData | null,
  modules: IModuleData[],
  options?: MockModGradPolHavOpts
) {
  const additions: Partial<Course> = Object.assign(
    <Partial<Course>>{
      getCurrentGradingStandard: async (_?) => gradingPolicy,
      getAvailableGradingStandards: async (_?) => mockGradingPolicies,
      getModules: async (_?) => modules,
      getModulesByWeekNumber: async (_?: ICanvasCallConfig) => await getModulesByWeekNumber(modules),
    },
    options?.overrides
  );

  const out: Course = Object.assign(new Course({ ...mockCourseData, id: 0 }), additions);
  return out;
}

describe("Grading policy validation correct test", () => {
  const fetchJsonMock = fetchJson as jest.Mock;

  test("Works for correctly set standards", async () => {
    const newUgSchemeCourse = await mockModuleGradingPolicyHaver(mockGradingPolicies[2], [...mockUgModules]);
    let result = await badGradingPolicyTest.run(newUgSchemeCourse);
    expect(result.success).toBe(true);

    const goodGradSchemeCourse = await mockModuleGradingPolicyHaver(mockGradingPolicies[1], [...mockGradModules]);
    result = await badGradingPolicyTest.run(goodGradSchemeCourse);
    expect(result.success).toBe(true);
  });

  test("Flags old UG standard", async () => {
    const oldUgSchemeCourse = await mockModuleGradingPolicyHaver(mockGradingPolicies[0], [...mockUgModules]);
    const result = await badGradingPolicyTest.run(oldUgSchemeCourse);
    expect(result.success).toBe(false);
  });

  test("Flags ug scheme in new course old UG standard", async () => {
    const badGradSchemeCourse = await mockModuleGradingPolicyHaver(mockGradingPolicies[0], [...mockGradModules]);
    const result = await badGradingPolicyTest.run(badGradSchemeCourse);
    expect(result.success).toBe(false);
  });

  test("Flags ug scheme in new course old UG standard", async () => {
    const badGradSchemeCourse = await mockModuleGradingPolicyHaver(mockGradingPolicies[0], [...mockGradModules]);
    const result = await badGradingPolicyTest.run(badGradSchemeCourse);
    expect(result.success).toBe(false);
  });

  it("Fails gracefully if standards can't be found", async () => {
    const noPermissionsCourse = await mockModuleGradingPolicyHaver(null, [...mockGradModules], {
      overrides: {
        async getAvailableGradingStandards(config?) {
          return [];
        },
        async getCurrentGradingStandard(config?) {
          return null;
        },
      },
    });

    const result = await badGradingPolicyTest.run(noPermissionsCourse);
    expect(result.success).toEqual(false);
    expect(
      result.messages.reduce(
        (aggregator, current, index, array) => aggregator + "\n" + current.bodyLines.join("\n"),
        ""
      )
    ).toMatch(/grading standard not found/);
  });

  it("Fixes bad ug scheme to correct scheme", async () => {
    fetchJsonMock.mockImplementation(async (url: string, config?: ICanvasCallConfig) => {
      const formData = config?.fetchInit?.body;
      assert(formData instanceof FormData);
      const change: ICourseData = deFormDataify(formData).course as ICourseData;
      return { ...mockCourseData, ...change };
    });
    const badGradSchemeCourse = await mockModuleGradingPolicyHaver(mockGradingPolicies[0], [...mockGradModules]);
    const result = await badGradingPolicyTest.fix(badGradSchemeCourse);
    expect(result.success).toBe(true);
    assert(result.userData && "id" in result.userData);
    expect(result.userData.grading_standard_id).toEqual("2");
  });
});

describe("Extensions installed", () => {
  const mockGetTabs = (tabs: ITabData[]) => jest.fn(async () => tabs);
  it("succeeds if all extensions are present", async () => {
    const mockCourse = new Course(mockCourseData);
    mockCourse.getTabs = mockGetTabs(extensionsToTest.map((label) => ({ ...mockTabData, label })));
    const result = await extensionsInstalledTest.run(mockCourse);
    expect(result.success).toBe(true);
  });
  it("fails if not all extensions are present", async () => {
    const mockCourse = new Course(mockCourseData);
    mockCourse.getTabs = mockGetTabs([mockTabData, mockTabData, mockTabData]);
    const result = await extensionsInstalledTest.run(mockCourse);
    expect(result.success).toBe(false);
  });
});

describe("createSettingTest", () => {
  let mockCourse: Partial<Course>;
  let testSetting: CourseFixValidation;

  beforeEach(() => {
    // Initialize a mock course object with necessary methods
    mockCourse = {
      getSettings: jest.fn(),
      updateSettings: jest.fn(),
    };
    testSetting = createSettingsValidation("show_announcements_on_home_page", true);
  });

  test("run method should confirm the setting is on", async () => {
    // Arrange
    const settingsResponse = { show_announcements_on_home_page: true };
    (mockCourse.getSettings as jest.Mock).mockResolvedValue(settingsResponse);

    // Act
    const result = await testSetting.run(mockCourse as Course);

    // Assert
    expect(result.success).toBe(true);
    expect(mockCourse.getSettings).toHaveBeenCalled();
  });

  test("run method should indicate when the setting is not on", async () => {
    // Arrange
    const settingsResponse = { show_announcements_on_home_page: false };
    (mockCourse.getSettings as jest.Mock).mockResolvedValue(settingsResponse);

    // Act
    const result = await testSetting.run(mockCourse as Course);

    // Assert
    expect(result.success).toBe(false);
    expect(
      result.messages.reduce((prev, currentValue) => [...prev, ...currentValue.bodyLines], [] as string[])
    ).toContain('Setting "show_announcements_on_home_page" not set to true');
    expect(mockCourse.getSettings).toHaveBeenCalled();
  });

  test("fix method should successfully turn on the setting", async () => {
    // Arrange
    (mockCourse.updateSettings as jest.Mock).mockResolvedValue({ show_announcements_on_home_page: true });

    // Act
    const result = await testSetting.fix(mockCourse as Course);

    // Assert
    expect(result.success).toBe(true);
    expect(mockCourse.updateSettings).toHaveBeenCalledWith({ show_announcements_on_home_page: true });
  });

  test("fix method should provide feedback when failing to turn the setting on", async () => {
    // Arrange
    const errorMessage = "Failed to update settings";
    (mockCourse.updateSettings as jest.Mock).mockRejectedValue(new Error(errorMessage));

    // Act
    const result = await testSetting.fix(mockCourse as Course);

    // Assert
    expect(result.success).toBe(false);
    expect(
      result.messages.reduce((prev, currentValue) => [...prev, ...currentValue.bodyLines], [] as string[])
    ).toContain(`Error: ${errorMessage}`);
  });

  test("fix method should handle non-error throws properly", async () => {
    // Arrange
    (mockCourse.updateSettings as jest.Mock).mockImplementation(() => {
      throw "Unexpected error";
    });

    // Act / Assert
    await expect(testSetting.fix(mockCourse as Course)).rejects.toThrow("Threw a non-error: Unexpected error");
  });

  test("run method should indicate when the setting is set to false", async () => {
    // Arrange
    const settingsResponse = { show_announcements_on_home_page: false };
    (mockCourse.getSettings as jest.Mock).mockResolvedValue(settingsResponse);

    // Act
    const result = await testSetting.run(mockCourse as Course);

    // Assert
    expect(result.success).toBe(false);
    expect(
      result.messages.reduce((prev, currentValue) => [...prev, ...currentValue.bodyLines], [] as string[])
    ).toContain('Setting "show_announcements_on_home_page" not set to true');
    expect(mockCourse.getSettings).toHaveBeenCalled();
  });

  test("run method should indicate when the setting has an unexpected type", async () => {
    // Arrange
    const settingsResponse = { show_announcements_on_home_page: "unexpectedString" }; // Non-boolean value
    (mockCourse.getSettings as jest.Mock).mockResolvedValue(settingsResponse);

    // Act
    const result = await testSetting.run(mockCourse as Course);

    // Assert
    expect(result.success).toBe(false);
    // Check if it captures the unexpected type in the error message.
    expect(
      result.messages.reduce((prev, currentValue) => [...prev, ...currentValue.bodyLines], [] as string[])
    ).toContain('Setting "show_announcements_on_home_page" not set to true');
    expect(mockCourse.getSettings).toHaveBeenCalled();
  });

  test("fix method should attempt to set the setting to false", async () => {
    // Arrange
    (mockCourse.updateSettings as jest.Mock).mockResolvedValue({ show_announcements_on_home_page: false });

    // Act
    const result = await createSettingsValidation("show_announcements_on_home_page", false).fix(mockCourse as Course);

    // Assert
    expect(result.success).toBe(true);
    expect(mockCourse.updateSettings).toHaveBeenCalledWith({ show_announcements_on_home_page: false });
  });
});
