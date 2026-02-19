import {mockCourseData} from "../../../course/__mocks__/mockCourseData";
import {ICanvasCallConfig, range} from "../../../canvasUtils";
import {updateAssignmentData} from "@ueu/ueu-canvas/content/assignments";
import {mockAssignmentData} from "../../__mocks__/mockContentData";
import fetchMock from "jest-fetch-mock";
import {assignmentDataGen} from "@ueu/ueu-canvas/content/assignments";
import {returnMockAsyncGen} from "@/__mocks__/utils";

import * as canvasUtils from '@ueu/ueu-canvas/canvasUtils';
import {getPagedDataGenerator} from "@ueu/ueu-canvas/fetch/getPagedDataGenerator";
import {fetchJson} from "@ueu/ueu-canvas/fetch/fetchJson";
import {putContentConfig} from "@ueu/ueu-canvas/content/BaseContentItem";
import AssignmentKind from "@ueu/ueu-canvas/content/assignments/AssignmentKind";
import {UpdateAssignmentDataOptions} from "@ueu/ueu-canvas/content/types";

fetchMock.enableMocks();

jest.mock('@/canvas/fetch/getPagedDataGenerator', () => ({
    getPagedDataGenerator: jest.fn(),

}));

jest.mock('@/canvas/fetch/fetchJson', () => ({
    fetchJson: jest.fn(),
}))


it('gets assignments from course id', async () => {
    const {id} = mockCourseData;
    const config: ICanvasCallConfig = {
        queryParams: {
            bunnies: true,
        },
        fetchInit: {}
    };


    const responseDatas = [...range(0, 10)].map(id => ({...mockAssignmentData, id}));
    (getPagedDataGenerator as jest.Mock).mockImplementation(returnMockAsyncGen(responseDatas));
    const i = range(0, 10);
    for await (const assignment of assignmentDataGen(id, config)) {
        expect(assignment.id).toEqual(i.next().value);
    }
})

it('gets assignment HTML url', () => {
    expect(AssignmentKind.getHtmlUrl(1, 2)).toEqual('/courses/1/assignments/2');
})

it('updates assignment data', async () => {
    const mockData = {...mockAssignmentData, name: "X"};
    const updateData: UpdateAssignmentDataOptions = {
        assignment: {
            name: "Y"
        }
    };
    const formData = {
        data: "FormData"
    }
    const config = {};
    const formDataify = jest.spyOn(canvasUtils, 'formDataify');
    (fetchJson as jest.Mock).mockResolvedValue(mockData);
    (formDataify as jest.Mock).mockReturnValue(formData)
    const result = await updateAssignmentData(0, 0, updateData);
    expect(formDataify).toHaveBeenCalledWith((updateData));
    expect(fetchJson).toHaveBeenCalledWith('/api/v1/courses/0/assignments/0', putContentConfig(formData, config));

    expect(result).toEqual(mockData);


})

