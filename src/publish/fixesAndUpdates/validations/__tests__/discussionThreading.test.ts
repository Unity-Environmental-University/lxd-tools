import {projectRegex} from "@/publish/fixesAndUpdates/validations/courseSpecific/capstoneProjectValidations";
import {Course} from "@/canvas/course/Course";
import {IDiscussionData} from "@/canvas/content/discussions/types";
import DiscussionKind from "@/canvas/content/discussions/DiscussionKind";
import {discussionThreadingValidation} from "../discussionThreading";
import {mockAsyncGen} from "@/__mocks__/utils";
import {CourseFixValidation} from "@publish/fixesAndUpdates/validations/types";

jest.mock("@/canvas/content/discussions/DiscussionKind", () => ({
        dataGenerator: jest.fn(),
        put: jest.fn(),
        getHtmlUrl: jest.fn(),
}));

describe("discussionThreadingValidation", () => {
    const mockCourse = {id: 1} as Course;
    const mockDiscussions: IDiscussionData[] = [
        {id: 3, title: "Discussion 0", discussion_type: "side_comment"} as IDiscussionData,
        {id: 1, title: "Discussion 1", discussion_type: "not_threaded"} as IDiscussionData,
        {id: 2, title: "Discussion 2", discussion_type: "threaded"} as IDiscussionData,
    ];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("run method should identify non-threaded discussions", async () => {
        (DiscussionKind.dataGenerator as jest.Mock).mockReturnValue(mockAsyncGen(mockDiscussions));

        const result = await discussionThreadingValidation.run(mockCourse);

        const resultLines = [...result.messages.reduce((previousValue, currentValue) => {
            return [...previousValue, ...currentValue.bodyLines]
        }, [] as string[])]
        expect(result.success).toBe(false);
        expect(result.userData).toEqual([mockDiscussions[0], mockDiscussions[1]]);
        expect(resultLines).toContain("Non Threaded Discussions Found: ");
        expect(resultLines).toContain("Discussion 1");
        expect(resultLines).toContain("Discussion 0");
    });

    test("fix method should convert non-threaded discussions to threaded", async () => {
        const mockResult = {
            messages: [],
            success: false,
            userData: [mockDiscussions[0]],
        };

        (DiscussionKind.put as jest.Mock).mockImplementation(async (courseId, discussionId, data) => ({
            id: discussionId,
            title: `Discussion ${discussionId}`,
            discussion_type: data.discussion_type,
        }));

        const result = await discussionThreadingValidation.fix(mockCourse, mockResult);

        expect(DiscussionKind.put).toHaveBeenCalledWith(mockCourse.id, mockDiscussions[0].id, {discussion_type: "threaded"});
        expect(result.success).toBe(true);
    });

    test("fix method should not run if no non-threaded discussions are found", async () => {
        const mockResult = {
            messages: [],
            success: true,
            userData: [],
        };

        const result = await discussionThreadingValidation.fix(mockCourse, mockResult);

        expect(result.success).toBe("not run");
    });

    test("run method should generate correct failure messages and links", async () => {
        (DiscussionKind.dataGenerator as jest.Mock).mockReturnValue(mockDiscussions);
        (DiscussionKind.getHtmlUrl as jest.Mock).mockImplementation((courseId, discussionId) => `url/${courseId}/${discussionId}`);

        const result = await discussionThreadingValidation.run(mockCourse);

        expect(result.links).toEqual([`url/${mockCourse.id}/3`, `url/${mockCourse.id}/1`]);
    });

    test("fix method should handle failure to fix non-threaded discussions", async () => {
        const mockResult = {
            messages: [],
            success: false,
            userData: [mockDiscussions[0]],
        };

        (DiscussionKind.put as jest.Mock).mockImplementation(async (courseId, discussionId, data) => ({
            id: discussionId,
            title: `Discussion ${discussionId}`,
            discussion_type: "not_threaded",
        }));

        const result = await discussionThreadingValidation.fix(mockCourse, mockResult);

        expect(result.success).toBe(false);
    });
});
