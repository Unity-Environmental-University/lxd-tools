import {mockAssignmentData} from "@ueu/ueu-canvas/content/__mocks__/mockContentData";
import {mockCourseData} from "@ueu/ueu-canvas/course/__mocks__/mockCourseData";
import {Assignment} from "@ueu/ueu-canvas/content/assignments/Assignment";
import {ContentData} from "@ueu/ueu-canvas/content/types";
import {ICanvasCallConfig} from "@ueu/ueu-canvas/canvasUtils";

import AssignmentKind from "@ueu/ueu-canvas/content/assignments/AssignmentKind";

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