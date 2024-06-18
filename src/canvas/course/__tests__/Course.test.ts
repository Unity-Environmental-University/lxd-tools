import {assignmentDataGen} from "../../content";
import {mockAssignmentData} from "../../content/__mocks__/mockContentData";
import {mockAsyncGenerator} from "../../../__mocks__/utils";
import {mockCourseData} from "../__mocks__/mockCourseData";
import {Course} from "../Course";



jest.mock('../../content', () => ({
    ...jest.requireActual('../../content'),
    assignmentDataGen: jest.fn(),
}))

describe('get content', () => {
    const config = {};
    test('Gets assignments', async() => {
        const id = Math.floor(Math.random() * 1000);
        const assignmentDatas = [{...mockAssignmentData, id}];
        const course = new Course(mockCourseData);
        (assignmentDataGen as jest.Mock).mockImplementation(mockAsyncGenerator(assignmentDatas))

        const extractedAssignments = await course.getAssignments(config);
        expect(extractedAssignments.length).toEqual(assignmentDatas.length);
        expect(extractedAssignments[0].rawData).toEqual(assignmentDatas[0])
    })


})