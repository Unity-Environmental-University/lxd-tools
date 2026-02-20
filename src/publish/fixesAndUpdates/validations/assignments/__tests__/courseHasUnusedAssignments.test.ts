import {SubmissionType} from "@ueu/ueu-canvas";

jest.mock("@ueu/ueu-canvas/canvasUtils");
jest.mock("@ueu/ueu-canvas/course/modules");
jest.mock("@ueu/ueu-canvas/content/assignments");
jest.mock("@publish/fixesAndUpdates/validations/utils");

import { courseHasUnusedAssignments } from "../courseHasUnusedAssignments"; // Adjust the import path
import { renderAsyncGen } from "@ueu/ueu-canvas/canvasUtils";
import { moduleGenerator } from "@ueu/ueu-canvas/course/modules";
import { assignmentDataGen } from "@ueu/ueu-canvas/content/assignments";
import { testResult } from "@publish/fixesAndUpdates/validations/utils";
import {mockAsyncGen} from "@/__mocks__/utils";



describe("courseHasUnusedAssignments", () => {
  const mockCourse = {
    rootAccountId: 1,
    id: 123,
  };

  const mockModules = [
    {
      id: 1,
      items: [
        { type: "Assignment", content_id: 101 },
        { type: "Assignment", content_id: 102 },
        { type: "Discussion", content_id: 2201 },
        { type: "Quiz", content_id: 3301 },
      ],
    },
  ];

  type MockAssignmentType = {
    id: number;
    name: string;
    html_url: string;
    quiz_id?: number;
    discussion_topic?: { id: number };
    submission_types: SubmissionType[];
  };

  const mockAssignments:MockAssignmentType[] = [
    { id: 101, name: "Assignment 1", html_url: "url1", submission_types: ["online_text_entry"] },
    { id: 102, name: "Assignment 2", html_url: "url2", submission_types: ["online_text_entry"] },
    { id: 201, discussion_topic: { id: 2201 }, name: "Discussion 1", html_url: "url3", submission_types: ["discussion_topic"] },
    { id: 301, quiz_id: 3301, name: "Quiz 1", html_url: "url4", submission_types: ['online_quiz'] },
    { id: 401, name: "External Tool", html_url: "url2", submission_types: ["external_tool"] },
  ];


  beforeEach(() => {
    jest.resetAllMocks();
    (renderAsyncGen as jest.Mock).mockResolvedValue(mockModules);
    (moduleGenerator as jest.Mock).mockReturnValue(Promise.resolve());
    (assignmentDataGen as jest.Mock).mockImplementation(() => mockAsyncGen(mockAssignments));
    (testResult as jest.Mock).mockImplementation((condition, data) => ({
      success: condition,
      data,
    }));
  });

  it("returns success when all assignments are in modules", async () => {
    const result = await courseHasUnusedAssignments.run(mockCourse);

    expect(renderAsyncGen).toHaveBeenCalledWith(moduleGenerator(mockCourse.id));
    expect(assignmentDataGen).toHaveBeenCalledWith(mockCourse.id);

    expect(testResult).toHaveBeenCalledWith(true, expect.any(Object));

    expect(result.success).toBe(true);
  });

  it("returns failure when there are unlisted assignments", async () => {
    // Add an unlisted assignment
    mockAssignments.push({ id: 999, name: "Unlisted Assignment", html_url: "url5", submission_types: ["online_text_entry"] });

    const result = await courseHasUnusedAssignments.run(mockCourse);

    expect(testResult).toHaveBeenCalledWith(false, expect.any(Object));

    expect(result.success).toBe(false);
  });
});
