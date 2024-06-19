import {mockCourseData} from "../../course/__mocks__/mockCourseData";
import {ICanvasCallConfig, range} from "../../canvasUtils";
import {assignmentDataGen} from "../index";
import {mockAssignmentData} from "../__mocks__/mockContentData";
import fetchMock from "jest-fetch-mock";


fetchMock.enableMocks();



test('gets assignments from course id', async () => {
    const {id} = mockCourseData;
    const config:ICanvasCallConfig = {
        queryParams: {
            bunnies: true,
        },
        fetchInit: {}
    };

    fetchMock.mockResponses(...[...range(0, 10)].map(id => JSON.stringify({...mockAssignmentData, id})))
    let i = range(0, 10);
    for await (let assignment of assignmentDataGen({courseId: id}, config)) {
        expect(fetchMock).toHaveBeenCalledWith(`/api/v1/course/${id}/assignments`, config.fetchInit)
        expect(assignment.id).toEqual(i.next().value);
    }
})