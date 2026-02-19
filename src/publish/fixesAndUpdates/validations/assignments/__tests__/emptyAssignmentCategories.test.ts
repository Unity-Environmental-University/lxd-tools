
import genAssignmentGroups from "@ueu/ueu-canvas/content/assignments/genAssignmentGroups";
import deleteAssignmentGroup from "@ueu/ueu-canvas/content/assignments/deleteAssignmentGroup";
import {Course} from "@ueu/ueu-canvas/course/Course";
import emptyAssignmentCategories from "@publish/fixesAndUpdates/validations/assignments/emptyAssignmentCategories";
import {mockAsyncGen} from "@/__mocks__/utils";
import {AssignmentGroup, IAssignmentData} from "@ueu/ueu-canvas/content/types";

// Mock data
const mockCourse = { id: 1 } as Course;
const mockEmptyGroup = { id: 1, name: "Empty Group", assignments: [] as IAssignmentData[] } as AssignmentGroup;
const mockNonEmptyGroup = { id: 2, name: "Non-Empty Group", assignments: [{}] } as AssignmentGroup;

jest.mock("@canvas/content/assignments/genAssignmentGroups", () => jest.fn());
jest.mock("@canvas/content/assignments/deleteAssignmentGroup", () => jest.fn());

describe("emptyAssignmentCategories", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should identify empty assignment groups", async () => {
        // Mock the generator to return an empty group and a non-empty group
        (genAssignmentGroups as jest.Mock).mockImplementationOnce(async function* () {
            yield mockEmptyGroup;
            yield mockNonEmptyGroup;
        });

        const result = await emptyAssignmentCategories.run(mockCourse);

        expect(result.success).toBe(false);
        expect(result.userData).toEqual([mockEmptyGroup]);
    });

    it("should return a success result when there are no empty groups", async () => {
        // Mock the generator to return only non-empty groups
        (genAssignmentGroups as jest.Mock).mockImplementationOnce(async function* () {
            yield mockNonEmptyGroup;
        });

        const result = await emptyAssignmentCategories.run(mockCourse);

        expect(result.success).toBe(true);
        expect(result.userData).toEqual([]);
    });

    it("should delete empty assignment groups", async () => {
        // Mock the generator to return an empty group
        (genAssignmentGroups as jest.Mock).mockReturnValueOnce(mockAsyncGen([]));

        const result = await emptyAssignmentCategories.fix(mockCourse, {
            success: false,
            userData: [mockEmptyGroup],
            messages: [],
        });

        expect(deleteAssignmentGroup).toHaveBeenCalledWith(mockCourse.id, mockEmptyGroup.id);
        expect(result.success).toBe(true);
    });

    it("should handle errors during the deletion of empty assignment groups", async () => {
        // Mock the generator to return an empty group
        (genAssignmentGroups as jest.Mock).mockImplementationOnce(async function* () {
            yield mockEmptyGroup;
        });

        // Mock deleteAssignmentGroup to throw an error
        (deleteAssignmentGroup as jest.Mock).mockImplementationOnce(() => {
            throw new Error("Failed to delete group");
        });

        const result = await emptyAssignmentCategories.fix(mockCourse, {
            success: false,
            userData: [mockEmptyGroup],
            messages: [],
        });

        expect(result.success).toBe(false);
        expect(result.messages[0].bodyLines).toContain("Failed to delete group");
    });
});
