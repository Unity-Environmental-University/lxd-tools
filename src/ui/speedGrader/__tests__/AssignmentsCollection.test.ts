import { AssignmentsCollection } from "../AssignmentsCollection";
import { CanvasData, IModuleItemData } from "@ueu/ueu-canvas";
import { mockAssignmentData, mockDiscussionData } from "@ueu/ueu-canvas";
import { mockModuleItemData } from "@ueu/ueu-canvas";

import { IAssignmentData } from "@ueu/ueu-canvas";

describe("AssignmentsCollection", () => {
  const mockAssignments = [
    { id: 1, quiz_id: 101, submission_types: [] },
    { id: 2, submission_types: ["external_tool"] },
    { id: 3, submission_types: [], discussion_topic: { ...mockDiscussionData, id: 301 } },
  ].map((a) => ({ ...mockAssignmentData, ...a })) as IAssignmentData[];

  const assignmentsCollection = new AssignmentsCollection(mockAssignments);

  test("constructor initializes assignmentsById correctly", () => {
    expect(assignmentsCollection.assignmentsById).toEqual({
      1: mockAssignments[0],
      2: mockAssignments[1],
      3: mockAssignments[2],
    });
  });

  test("constructor initializes discussions and discussionsById correctly", () => {
    const discussion = { ...mockAssignments[2].discussion_topic, assignment: mockAssignments[2] };
    expect(assignmentsCollection.discussions).toEqual([discussion]);
    expect(assignmentsCollection.discussionsById).toEqual({
      301: discussion,
    });
  });

  test("constructor initializes assignmentsByDiscussionId and assignmentsByQuizId correctly", () => {
    expect(assignmentsCollection.assignmentsByDiscussionId).toEqual({
      301: mockAssignments[2],
    });
    expect(assignmentsCollection.assignmentsByQuizId).toEqual({
      101: mockAssignments[0],
    });
  });

  test("getContentById returns the correct content", () => {
    expect(assignmentsCollection.getContentById(1)).toBe(mockAssignments[0]);
    expect(assignmentsCollection.getContentById(301)).toBe(mockAssignments[2]);
    expect(assignmentsCollection.getContentById(101)).toBe(mockAssignments[0]);
  });

  test("getContentById returns undefined for non-existent content", () => {
    expect(assignmentsCollection.getContentById(999)).toBeUndefined();
  });

  test("getAssignmentContentType returns the correct type for content items", () => {
    const externalToolContent = { id: 2, submission_types: ["external_tool"] } as CanvasData;
    const discussionContent = { id: 3, discussion_topic: { id: 301 }, assignment: mockAssignmentData } as CanvasData;
    const quizContent = { id: 1, quiz_id: 101 } as CanvasData;
    const assignmentContent = { id: 4 } as CanvasData;

    expect(assignmentsCollection.getAssignmentContentType(externalToolContent)).toBe("ExternalTool");
    expect(assignmentsCollection.getAssignmentContentType(discussionContent)).toBe("Discussion");
    expect(assignmentsCollection.getAssignmentContentType(quizContent)).toBe("Quiz");
    expect(assignmentsCollection.getAssignmentContentType(assignmentContent)).toBe("Assignment");
  });

  test("getModuleItemType returns the correct type for module items", () => {
    const mockModuleItemAssignment = { ...mockModuleItemData, type: "Assignment", content_id: 1 } as IModuleItemData;
    const mockModuleItemDiscussion = { ...mockModuleItemData, type: "Discussion", content_id: 301 } as IModuleItemData;
    const mockModuleItemQuiz = { ...mockModuleItemData, type: "Quiz", content_id: 101 } as IModuleItemData;

    expect(assignmentsCollection.getModuleItemType(mockModuleItemAssignment)).toBe("Quiz");
    expect(assignmentsCollection.getModuleItemType(mockModuleItemDiscussion)).toBe("Discussion");
    expect(assignmentsCollection.getModuleItemType(mockModuleItemQuiz)).toBe("Quiz");
  });
});
