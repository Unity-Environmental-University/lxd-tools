import {mockCourseData} from "../../course/__mocks__/mockCourseData";
import {formDataify, ICanvasCallConfig, range} from "../../canvasUtils";
import {getAssignmentHtmlUrl, updateAssignmentData, UpdateAssignmentDataOptions} from "../assignments";
import {mockAssignmentData} from "../__mocks__/mockContentData";
import fetchMock from "jest-fetch-mock";
import {assignmentDataGen} from "@/canvas/content/assignments";
import {fetchJson, getPagedDataGenerator} from "@/canvas/fetch";
import {putContentConfig} from "@/canvas/content";
import {mockAsyncGenerator} from "@/__mocks__/utils";

import * as canvasUtils from '@/canvas/canvasUtils';

fetchMock.enableMocks();

jest.mock('@/canvas/fetch', () => ({
    ...jest.requireActual('@/canvas/fetch'),
    getPagedDataGenerator: jest.fn(),
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


    fetchMock.enableMocks();
    const responseDatas = [...range(0, 10)].map(id => JSON.stringify({...mockAssignmentData, id}));
    fetchMock.mockResponses( ...responseDatas);
    (getPagedDataGenerator as jest.Mock).mockImplementation(mockAsyncGenerator(responseDatas));
    let i = range(0, 10);
    for await (let assignment of assignmentDataGen({courseId: id}, config)) {
        expect(fetchMock).toHaveBeenCalledWith(`/api/v1/course/${id}/assignments`, config.fetchInit)
        expect(assignment.id).toEqual(i.next().value);
    }
})

it('gets assignment HTML url', () => {
    expect(getAssignmentHtmlUrl(1, 2)).toEqual('/courses/1/assignments/2');
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
    let formDataify = jest.spyOn(canvasUtils, 'formDataify');
    (fetchJson as jest.Mock).mockResolvedValue(mockData);
    (formDataify as jest.Mock).mockReturnValue(formData)
    const result = await updateAssignmentData(0, 0, updateData);
    expect(formDataify).toHaveBeenCalledWith((updateData));
    expect(fetchJson).toHaveBeenCalledWith('/api/v1/courses/0/assignments/0', putContentConfig(formData, config));

    expect(result).toEqual(mockData);


})