import { aiLiteracySetup } from "@/publish/publishInterface/aiLiteracySetup";
import { waitForMigrationCompletion } from "@/publish/publishInterface/MakeBp";
import { fetchJson } from "@ueu/ueu-canvas/fetch/fetchJson";
import { getAssignmentData } from "@ueu/ueu-canvas/content/assignments/legacy";
import { startMigration } from "@ueu/ueu-canvas/course/migration";
import { IAssignmentGroup } from "@ueu/ueu-canvas/content/types";
import { IModuleData } from "@ueu/ueu-canvas/canvasDataDefs";

jest.mock("@ueu/ueu-canvas/fetch/fetchJson");
jest.mock("@ueu/ueu-canvas/canvasUtils", () => ({
  formDataify: jest.fn((data) => data),
}));
jest.mock("@ueu/ueu-canvas/content/assignments/legacy", () => ({
  getAssignmentData: jest.fn(),
}));
jest.mock("@ueu/ueu-canvas/course/migration");
jest.mock("@/publish/publishInterface/MakeBp", () => ({
  waitForMigrationCompletion: jest.fn(),
}));

const mockGetAssignmentData = getAssignmentData as jest.Mock;
const mockStartMigration = startMigration as jest.Mock;
const mockWaitForMigrationCompletion = waitForMigrationCompletion as jest.Mock;
const mockFetchJson = fetchJson as jest.Mock;

const mockBpId = 123;
const aiLiteracyCourseId = 8019281;
const aiLiteracyAssignmentId = 55291320;
const module1Id = 222;
const destinationModuleId = 333;
const assignmentGroupId = 444;
const importedGroupId = 555;
const moduleItemId = 777;
const sourceDueDate = new Date("2026-05-14T12:00:00.000Z");

const baseAssignmentGroup: IAssignmentGroup = {
  id: assignmentGroupId,
  name: "Assignments",
} as IAssignmentGroup;

const importedAssignmentGroup: IAssignmentGroup = {
  id: importedGroupId,
  name: "Imported Assignments",
} as IAssignmentGroup;

const module1: IModuleData = {
  id: module1Id,
  name: "Module 1",
  items: [{ content_id: 999 }],
} as IModuleData;

const destinationModule: IModuleData = {
  id: destinationModuleId,
  name: "Week 1 Module",
  items: [{ content_id: 888 }, { id: moduleItemId, content_id: moduleItemId }],
} as IModuleData;

const mockBp = {
  id: mockBpId,
  getAssignmentGroups: jest.fn(),
  getModules: jest.fn(),
  updateModules: jest.fn(),
} as any;

function mockSuccessfulMigration() {
  mockBp.getAssignmentGroups.mockResolvedValue([baseAssignmentGroup]);
  mockBp.getModules.mockResolvedValue([module1, destinationModule]);
  mockBp.updateModules.mockResolvedValue([module1, destinationModule]);
  mockGetAssignmentData.mockResolvedValue({ due_at: sourceDueDate.toISOString() });
  mockStartMigration.mockResolvedValue({ id: 9999 });
  mockWaitForMigrationCompletion.mockResolvedValue({ workflow_state: "completed" });
  mockFetchJson.mockImplementation(async (url: string) => {
    if (url.includes(`/modules/${destinationModuleId}/items/${moduleItemId}`) && url.includes("/api/v1/courses/")) {
      return {};
    }

    if (url.includes(`/assignment_groups/${importedGroupId}`)) {
      return {};
    }

    return {};
  });
}

describe("aiLiteracySetup", () => {
  const setIsRunningAiLiteracySetup = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(window, "alert").mockImplementation(() => {});
    mockSuccessfulMigration();
  });

  afterEach(() => {
    (window.alert as jest.Mock).mockRestore();
  });

  it("runs the migration and updates the imported assignment", async () => {
    await aiLiteracySetup({
      currentBp: mockBp,
      setIsRunningAiLiteracySetup,
    });

    expect(setIsRunningAiLiteracySetup).toHaveBeenCalledWith(true);
    expect(setIsRunningAiLiteracySetup).toHaveBeenCalledWith(false);
    expect(mockGetAssignmentData).toHaveBeenCalledWith(mockBpId, 999);
    expect(mockStartMigration).toHaveBeenCalledWith(
      aiLiteracyCourseId,
      mockBpId,
      expect.objectContaining({
        fetchInit: {
          body: expect.objectContaining({
            migration_type: "course_copy_importer",
            settings: {
              source_course_id: aiLiteracyCourseId,
              move_to_assignment_group_id: assignmentGroupId,
              insert_into_module_id: module1Id,
              insert_into_module_type: "assignment",
              insert_into_module_position: 2,
            },
            date_shift_options: {
              shift_dates: true,
              new_end_date: sourceDueDate,
            },
            select: {
              assignments: [aiLiteracyAssignmentId],
            },
          }),
        },
      })
    );
    expect(mockWaitForMigrationCompletion).toHaveBeenCalledWith(mockBpId, 9999);
    expect(mockFetchJson).toHaveBeenCalledWith(
      `/api/v1/courses/${mockBpId}/modules/${destinationModuleId}/items/${moduleItemId}`,
      expect.objectContaining({
        fetchInit: {
          method: "PUT",
          body: {
            module_item: {
              indent: 1,
              completion_requirement: {
                type: "must_submit",
              },
              published: true,
            },
          },
        },
      })
    );
    expect(window.alert).toHaveBeenCalledWith("AI Literacy Assignment Setup done!");
  });

  it("alerts and stops if no BP is provided", async () => {
    await aiLiteracySetup({
      currentBp: null,
      setIsRunningAiLiteracySetup,
    });

    expect(window.alert).toHaveBeenCalledWith("No BP found.");
    expect(mockStartMigration).not.toHaveBeenCalled();
    expect(setIsRunningAiLiteracySetup).toHaveBeenCalledWith(false);
  });

  it("alerts and stops if Module 1 is missing", async () => {
    mockBp.getModules.mockResolvedValue([]);

    await aiLiteracySetup({
      currentBp: mockBp,
      setIsRunningAiLiteracySetup,
    });

    expect(window.alert).toHaveBeenCalledWith("Module 1 not found.");
    expect(mockStartMigration).not.toHaveBeenCalled();
    expect(setIsRunningAiLiteracySetup).toHaveBeenCalledWith(false);
  });

  it("alerts and stops if the due date cannot be found", async () => {
    mockGetAssignmentData.mockResolvedValue({ due_at: null });

    await aiLiteracySetup({
      currentBp: mockBp,
      setIsRunningAiLiteracySetup,
    });

    expect(window.alert).toHaveBeenCalledWith("Couldn't find due date for Week 1 assignments.");
    expect(mockStartMigration).not.toHaveBeenCalled();
    expect(setIsRunningAiLiteracySetup).toHaveBeenCalledWith(false);
  });

  it("alerts and stops if the migration fails", async () => {
    mockWaitForMigrationCompletion.mockResolvedValue({ workflow_state: "failed" });

    await aiLiteracySetup({
      currentBp: mockBp,
      setIsRunningAiLiteracySetup,
    });

    expect(window.alert).toHaveBeenCalledWith(
      "There was a problem in the migration process. Check the BP to make sure the modules imported correctly."
    );
    expect(mockFetchJson).not.toHaveBeenCalledWith(
      expect.stringContaining(`/modules/${destinationModuleId}/items/${moduleItemId}`),
      expect.anything()
    );
    expect(setIsRunningAiLiteracySetup).toHaveBeenCalledWith(false);
  });

  it("deletes imported assignment groups after a successful migration", async () => {
    mockBp.getAssignmentGroups
      .mockResolvedValueOnce([baseAssignmentGroup])
      .mockResolvedValueOnce([baseAssignmentGroup, importedAssignmentGroup]);

    await aiLiteracySetup({
      currentBp: mockBp,
      setIsRunningAiLiteracySetup,
    });

    expect(mockFetchJson).toHaveBeenCalledWith(
      `/api/v1/courses/${mockBpId}/assignment_groups/${importedGroupId}`,
      expect.objectContaining({
        fetchInit: {
          method: "DELETE",
          body: {},
        },
      })
    );
  });
});
