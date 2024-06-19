import {assignmentDataGen} from "../../content";
import {mockAssignmentData} from "../../content/__mocks__/mockContentData";
import {mockAsyncGenerator} from "../../../__mocks__/utils";
import {mockCourseData} from "../__mocks__/mockCourseData";
import {Course} from "../Course";
import mockTabData from "../../__mocks__/mockTabData";


jest.mock('../../fetch', () =>( {
    ...jest.requireActual('../../fetch'),
    fetchJson: jest.fn()
}));


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


import {fetchJson} from "../../fetch";


test('get tabs', async () => {
    const mockCourse = new Course({...mockCourseData, id: 1});
    const config = {};
    const fetchJsonMock = fetchJson as jest.Mock;
    const mockTabsData = [{...mockTabData, label: 'a'}];
    fetchJsonMock.mockResolvedValue(mockTabsData);
    const tabs = await mockCourse.getTabs(config);
    expect(fetchJsonMock).toHaveBeenCalledWith(`/api/v1/courses/${mockCourse.id}/tabs`, config);
    expect(tabs).toEqual(mockTabsData);

})