import {mockAssignmentData} from "@/canvas/content/__mocks__/mockContentData";
import {mockCourseData} from "@/canvas/course/__mocks__/mockCourseData";
import {Assignment} from "@/canvas/content/assignments/Assignment";

export const getContentClassFromUrl = jest.fn((url: string | null = null) => {
    return Assignment;
});

export const getContentItemFromUrl = jest.fn(
    async (url: string | null = null)  =>
        new Assignment(mockAssignmentData, mockCourseData.id))