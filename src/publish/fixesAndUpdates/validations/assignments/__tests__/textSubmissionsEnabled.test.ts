import AssignmentKind from "@ueu/ueu-canvas";
import textSubmissionEnabled from "@publish/fixesAndUpdates/validations/assignments/textSubmissionEnabled";
import { Course } from "@ueu/ueu-canvas";
import { mockCourseData } from "@ueu/ueu-canvas";
import { testResult } from "@publish/fixesAndUpdates/validations/utils";
import { IAssignmentData } from "@ueu/ueu-canvas";

describe("textSubmissionEnabled", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AssignmentKind.dataGenerator = jest.fn();
    AssignmentKind.put = jest.fn();
  });

  describe("run method", () => {
    const mockCourseId = 105;

    beforeEach(() => {
      jest.clearAllMocks();
    });

    test("should return bad assignments that do not allow online text entry", async () => {
      const mockAssignmentData = [
        { id: "1", name: "Assignment 1", submission_types: ["online_text_entry"], html_url: "url1" },
        { id: "2", name: "Assignment 2", submission_types: [], html_url: "url2" }, // No support for text entry
        { id: "3", name: "Assignment 3", submission_types: ["external_tool"], html_url: "url3" }, // Should be ignored
        { id: "4", name: "Assignment 4", submission_types: ["on_paper"], html_url: "url4" }, // Should be ignored
        { id: "4", name: "Assignment 5", submission_types: ["none"], html_url: "url5" }, // Should be ignored
      ];
      jest.fn().mockResolvedValue(mockAssignmentData);
      (AssignmentKind.dataGenerator as jest.Mock).mockImplementationOnce(async function* () {
        for (const assignment of mockAssignmentData) {
          yield assignment;
        }
      });

      const result = await textSubmissionEnabled.run(new Course({ ...mockCourseData, id: mockCourseId }));

      expect(result).toEqual(
        expect.objectContaining({
          success: false,
          links: expect.arrayContaining(["url2"]),
          userData: expect.arrayContaining([
            expect.objectContaining({
              name: "Assignment 2",
              submission_types: [],
            }),
          ]),
          messages: expect.arrayContaining([
            expect.objectContaining({
              bodyLines: expect.arrayContaining(["Assignment 2 does not allow text entry submission."]),
            }),
          ]),
        })
      );
    });

    test("should handle the case where all assignments support online text entry", async () => {
      const mockAssignmentData = [
        { id: "1", name: "Assignment 1", submission_types: ["online_text_entry"], html_url: "url1" },
        { id: "2", name: "Assignment 2", submission_types: ["online_text_entry"], html_url: "url2" },
      ];

      (AssignmentKind.dataGenerator as jest.Mock).mockImplementationOnce(async function* () {
        for (const assignment of mockAssignmentData) {
          yield assignment;
        }
      });

      const result = await textSubmissionEnabled.run(new Course({ ...mockCourseData, id: mockCourseId }));

      expect(result).toEqual(
        expect.objectContaining({
          success: true,
          userData: expect.arrayContaining([]),
          messages: expect.arrayContaining([]),
        })
      );
    });

    test("should return an empty array if no assignments are present", async () => {
      (AssignmentKind.dataGenerator as jest.Mock).mockImplementationOnce(async function* () {});

      const result = await textSubmissionEnabled.run(new Course({ ...mockCourseData, id: mockCourseId }));

      expect(result).toEqual(
        expect.objectContaining({
          success: true,
          userData: expect.arrayContaining([]),
          messages: expect.arrayContaining([]),
        })
      );
    });

    test("should handle errors gracefully from the data generator", async () => {
      const errorMessage = "Error fetching assignments";
      (AssignmentKind.dataGenerator as jest.Mock).mockImplementationOnce(async function* () {
        throw new Error(errorMessage);
      });

      const result = await textSubmissionEnabled.run(new Course({ ...mockCourseData, id: mockCourseId }));

      expect(result).toEqual(
        expect.objectContaining({
          success: false,
          messages: expect.arrayContaining([
            expect.objectContaining({ bodyLines: expect.arrayContaining([expect.stringContaining(errorMessage)]) }),
          ]),
        })
      );
    });

    test("should ignore assignments with external_tool submission types", async () => {
      const mockAssignmentData = [
        { id: "1", name: "Assignment 1", submission_types: ["external_tool"], html_url: "url1" },
        { id: "2", name: "Assignment 2", submission_types: [], html_url: "url2" },
        { id: "3", name: "Discussion 1", submission_types: ["discussion_topic"], html_url: "url3" },
        { id: "3", name: "Quiz 1", submission_types: ["online_quiz"], html_url: "url4" },
      ];

      (AssignmentKind.dataGenerator as jest.Mock).mockImplementationOnce(async function* () {
        for (const assignment of mockAssignmentData) {
          yield assignment;
        }
      });

      const result = await textSubmissionEnabled.run(new Course({ ...mockCourseData, id: mockCourseId }));
      expect(result.userData).toHaveLength(1);

      expect(result).toEqual(
        expect.objectContaining({
          success: false,
          userData: expect.arrayContaining([expect.objectContaining({ name: "Assignment 2" })]),
          messages: expect.arrayContaining([
            expect.objectContaining({
              bodyLines: expect.arrayContaining(["Assignment 2 does not allow text entry submission."]),
            }),
          ]),
        })
      );
    });
  });

  describe("fix method", () => {
    const mockCourseId = 76;

    beforeEach(() => {
      jest.clearAllMocks();
    });

    test("should update valid assignments to include online text entry", async () => {
      const mockAssignmentData = [
        { id: "1", name: "Assignment 1", submission_types: ["online_text_entry"], html_url: "url1" },
        { id: "2", name: "Assignment 2", submission_types: [], html_url: "url2" }, // Needs update
      ] as unknown as IAssignmentData[];
      const mockRunResult = testResult(false, { userData: [mockAssignmentData[1]] });
      jest.spyOn(textSubmissionEnabled, "run").mockResolvedValue(mockRunResult);

      // Mock the put function to return the expected response
      (AssignmentKind.put as jest.Mock).mockResolvedValueOnce({
        ...mockAssignmentData[1],
        submission_types: ["online_text_entry"],
      });

      const result = await textSubmissionEnabled.fix(
        new Course({
          ...mockCourseData,
          id: mockCourseId,
        }),
        mockRunResult
      );

      expect(result).toEqual(
        expect.objectContaining({
          success: true,
          links: expect.arrayContaining(["url2"]),
          messages: expect.arrayContaining([
            {
              bodyLines: ["Assignment 2 submission types updated to online_text_entry"],
            },
          ]),
          userData: undefined,
        })
      );

      expect(AssignmentKind.put).toHaveBeenCalledWith(mockCourseId, "2", {
        assignment: {
          submission_types: ["online_text_entry"],
        },
      });
    });
  });
});
