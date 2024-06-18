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
        }
    };

    fetchMock.mockResponses(...[...range(0, 10)].map(id => JSON.stringify({...mockAssignmentData, id})))
    let i = range(0, 10);
    for await (let assignment of assignmentDataGen(id, config)) {
        expect(assignment.id).toEqual(i.next().value);
    }
})