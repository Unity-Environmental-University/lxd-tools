import {mockAssignmentData} from "@/canvas/content/__mocks__/mockContentData";
import {mockCourseData} from "@/canvas/course/__mocks__/mockCourseData";
import {Assignment} from "@/canvas/content/assignments/Assignment";
import {ContentData} from "@/canvas/content/types";
import {ICanvasCallConfig} from "@/canvas/canvasUtils";
import {CONTENT_KINDS} from "@/canvas/content/determineContent";

import {AssignmentKind} from "@/canvas/content/assignments/AssignmentKind";

export const getContentClassFromUrl = jest.fn((url: string | null = null) => {
    return Assignment;
});

export const getContentItemFromUrl = jest.fn(
    async (url: string | null = null)  =>
        new Assignment(mockAssignmentData, mockCourseData.id))

export function getContentKindFromUrl(url:string) {
    return AssignmentKind;
}

export function getContentKindFromContent(contentData:ContentData) {
    return AssignmentKind;
}

export async function getContentDataFromUrl(url:string, config:ICanvasCallConfig) {
    return {...mockAssignmentData}
}