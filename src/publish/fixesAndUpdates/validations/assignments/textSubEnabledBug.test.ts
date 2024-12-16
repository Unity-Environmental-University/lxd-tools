import {Course} from "@canvas/course/Course";
import {IAssignmentData, SubmissionType} from "@canvas/content/types";
import {textSubEnabledBug} from "@publish/fixesAndUpdates/validations/assignments/textSubEnabledBug"; // Import the validation itself
import AssignmentKind from "@canvas/content/assignments/AssignmentKind";
import {mockCourseData} from "@canvas/course/__mocks__/mockCourseData";
import {mockAssignmentData, mockDiscussionData} from "@canvas/content/__mocks__/mockContentData";
import {mockAsyncGen} from "@/__mocks__/utils";
import {testResult} from "@publish/fixesAndUpdates/validations/utils";

// Mock course data (use your existing mockCourseData as a template)
const localMockCourseData = {
    ...mockCourseData,
    id: 123,
    courseCode: "TEST123",
};




describe("textSubEnabledBug Validation", () => {
    it("should correctly identify assignments with metadata issues for discussions and quizzes", async () => {
        // Use the mockCourseData to create the mock course
        const mockCourse = new Course(localMockCourseData);

        // Mock assignments (mimicking the pattern from previous tests)
        const mockAssignments: IAssignmentData[] = [
            {
                id: 1,
                course_id: 123,
                submission_types: ["discussion_topic", "online_text_entry"],
                discussion_topic: undefined,
                html_url: "url1",
                name: "Assignment 1",
            },
            {
                id: 2,
                course_id: 123,
                submission_types: ["online_quiz"],
                discussion_topic: {...mockDiscussionData},
                html_url: "url2",
                name: "Assignment 2",
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
        ].map(a => ({
            ...mockAssignmentData,
            ...a,
            submission_types: a.submission_types as SubmissionType[]
        }));

        // Mock the data generator for assignments (fitting the pattern)
        jest.spyOn(AssignmentKind, "dataGenerator").mockReturnValue(mockAsyncGen(mockAssignments));

        // Run the validation
        const result = await textSubEnabledBug.run(mockCourse);

        // Assert the result (keeping the pattern similar to the previous test)
        expect(result.success).toBe(false); // Expecting failure due to metadata issues
        expect(getMessages(result)).toEqual(expect.arrayContaining([
            expect.stringContaining("Assignment 1 has metadata issues."),
            expect.stringContaining("Assignment 3 has metadata issues."),
        ]));
        expect(result.links).toEqual(["url1", "url3"]);

        expect(result.userData)
            .toHaveLength(2);
        expect(result.userData)
            .toEqual(mockAssignments.filter((a) => typeof a.discussion_topic === 'undefined'));
    });
});


function getMessages<UD = unknown>(testResultResult: ReturnType<typeof testResult<UD>>) {
    return testResultResult.messages.flatMap(m => m.bodyLines)
}