import { Course } from "@ueu/ueu-canvas";
import { IAssignmentData, UpdateAssignmentDataOptions } from "@ueu/ueu-canvas";
import { textSubEnabledBug } from "@publish/fixesAndUpdates/validations/assignments/textSubEnabledBug"; // Import the validation itself
import AssignmentKind from "@ueu/ueu-canvas";
import { mockCourseData } from "@ueu/ueu-canvas";
import { mockAssignmentData } from "@ueu/ueu-canvas";
import { mockDiscussionData } from "@/publish/fixesAndUpdates/validations/__tests__/discussionTests.test";
import { mockAsyncGen } from "@/__mocks__/utils";
import { testResult } from "@publish/fixesAndUpdates/validations/utils";

// Mock course data (use your existing mockCourseData as a template)
const localMockCourseData = {
  ...mockCourseData,
  id: 123,
  courseCode: "TEST123",
};

describe("textSubEnabledBug Validation", () => {
  let mockAssignments: IAssignmentData[];
  let i = 1;
  let mockCourse: Course;
  const localMockDiscussionData = { ...mockDiscussionData };
  const assignmentfy = (a: Partial<IAssignmentData>) =>
    ({
      ...mockAssignmentData,
      ...a,
    } as IAssignmentData);

  function sequentialIds<T extends { id: number }>(a: T) {
    return { ...a, id: ++i } as T;
  }

  const testAssignmentfy = (assignments: Partial<IAssignmentData>[]) => {
    return assignments.map(assignmentfy).map(sequentialIds) as IAssignmentData[];
  };

  const goodAssignments = testAssignmentfy([
    {
      id: 2,
      course_id: 123,
      submission_types: ["online_quiz"],
      html_url: "url2",
      quiz_id: 100,
      name: "Assignment 2",
    },
    {
      id: 4,
      course_id: 123,
      submission_types: ["online_text_entry"],
      discussion_topic: undefined,
      html_url: "url1",
      name: "Assignment 4",
    },
    {
      id: 5,
      course_id: 123,
      submission_types: ["discussion_topic"],
      discussion_topic: { ...localMockDiscussionData },
      html_url: "url1",
      name: "Assignment 5",
    },
    {
      id: 7,
      course_id: 123,
      submission_types: ["online_text_entry", "online_text_entry"],
      html_url: "url1",
      name: "Assignment 1",
    },
    {
      id: 6,
      course_id: 123,
      submission_types: ["external_tool"],
      html_url: "url1",
      name: "Assignment 1",
    },
  ]);

  const badTypeAssignments = testAssignmentfy([
    {
      id: 1,
      course_id: 123,
      submission_types: ["discussion_topic", "online_text_entry"],
      discussion_topic: undefined,
      html_url: "url1",
      name: "Assignment 1",
    },
    {
      id: 10001,
      course_id: 123,
      submission_types: ["discussion_topic", "online_text_entry"],
      discussion_topic: undefined,
      html_url: "url10001",
      name: "Assignment 10001",
    },
    {
      id: 3,
      course_id: 123,
      submission_types: ["online_quiz", "online_text_entry"],
      discussion_topic: undefined,
      metadata: null,
      html_url: "url3",
      name: "Assignment 3",
    },
    {
      id: 922392,
      course_id: 123,
      submission_types: ["none", "online_text_entry"],
      metadata: null,
      html_url: "url4",
      name: "Assignment 4",
    },
  ]);

  const badMetadataDiscussions = testAssignmentfy([
    {
      id: 50001,
      course_id: 123,
      submission_types: ["discussion_topic"],
      discussion_topic: undefined,
      html_url: "url1",
      name: "Assignment 12",
    },
  ]);

  const badMetadataQuiz = testAssignmentfy([
    {
      id: 50003,
      course_id: 123,
      submission_types: ["online_quiz"],
      quiz_id: undefined,
      html_url: "url1",
      name: "Assignment 5",
    },
  ]);

  beforeEach(() => {
    jest.clearAllMocks();
    mockCourse = new Course(localMockCourseData);
  });
  it("should correctly identify assignments with bad type information", async () => {
    mockAssignments = [...goodAssignments, ...badMetadataDiscussions, ...badMetadataQuiz, ...badTypeAssignments];

    const { discussion } = assignmentfy({ discussion_topic: { ...localMockDiscussionData } } as IAssignmentData);

    jest.spyOn(AssignmentKind, "dataGenerator").mockReturnValue(mockAsyncGen(mockAssignments));
    // Run the validation
    const result = await textSubEnabledBug.run(mockCourse);
    // Assert the result (keeping the pattern similar to the previous test)
    expect(result.success).toBe(false); // Expecting failure due to metadata issues
    expect(result.links).toEqual(expect.arrayContaining(["url1", "url3"])); //spot check on array

    const { affectedAssignments } = result.userData!;
    expect(affectedAssignments.map((a) => ({ id: a.id, submission_type: a.submission_types }))).toHaveLength(
      badTypeAssignments.length
    );
    expect(affectedAssignments.map((a) => a.id)).toEqual(badTypeAssignments.map((a) => a.id));
  });
  it("should correctly identify assignments with badmetadata", async () => {
    mockAssignments = [...goodAssignments, ...badMetadataDiscussions, ...badMetadataQuiz];
    jest.spyOn(AssignmentKind, "dataGenerator").mockReturnValue(mockAsyncGen(mockAssignments));
    // Run the validation
    const result = await textSubEnabledBug.run(mockCourse);
    // Assert the result (keeping the pattern similar to the previous test)
    expect(result.success).toBe(false); // Expecting failure due to metadata issues

    const { potentiallyAffectedDiscussions } = result.userData!;
    expect(potentiallyAffectedDiscussions.map((a) => [a.name, a.submission_types, a.discussion_topic])).toHaveLength(
      badMetadataDiscussions.length
    );
    expect(potentiallyAffectedDiscussions).toEqual(badMetadataDiscussions);
    const { potentiallyAffectedQuizzes } = result.userData!;
    expect(potentiallyAffectedQuizzes).toEqual(badMetadataQuiz);
  });
  it("should pass with good data", async () => {
    mockAssignments = [...goodAssignments];
    jest.spyOn(AssignmentKind, "dataGenerator").mockReturnValue(mockAsyncGen(mockAssignments));
    // Run the validation
    const result = await textSubEnabledBug.run(mockCourse);
    // Assert the result (keeping the pattern similar to the previous test)
    expect(result.success).toBe(true); // Expecting failure due to metadata issues
  });

  it("fixes bad metadata", async () => {
    mockAssignments = [...badTypeAssignments];

    jest.spyOn(AssignmentKind, "dataGenerator").mockReturnValue(mockAsyncGen(mockAssignments));
    jest.spyOn(AssignmentKind, "put").mockImplementation(mockAssignmentPutFunc({ ...mockAssignmentData }));
    const result = (await textSubEnabledBug.fix!(
      mockCourse,
      testResult(false, {
        userData: {
          affectedAssignments: mockAssignments,
          potentiallyAffectedDiscussions: [],
          potentiallyAffectedQuizzes: [],
        },
      })
    ))!;
    expect(result.messages.flatMap((a) => a.bodyLines)).toHaveLength(badTypeAssignments.length);
    expect(result?.success).toBe(true);
  });
});

const mockAssignmentPutFunc =
  (mockAssignmentDefaults: IAssignmentData) =>
  async (_courseId: number, _contentId: number, a: UpdateAssignmentDataOptions) =>
    ({ ...mockAssignmentDefaults, ...a.assignment } as IAssignmentData);
function getMessages<UD = unknown>(testResultResult: ReturnType<typeof testResult<UD>>) {
  return testResultResult.messages.flatMap((m) => m.bodyLines);
}
