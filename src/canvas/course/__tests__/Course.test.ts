import {mockAssignmentData} from "../../content/__mocks__/mockContentData";
import {mockAsyncGenerator} from "../../../__mocks__/utils";
import {mockCourseData} from "../__mocks__/mockCourseData";
import {
    Course
} from "../Course";
import mockTabData from "../../__mocks__/mockTabData";
import {assignmentDataGen} from "@/canvas/content/assignments";
import {baseCourseCode, parseCourseCode, stringIsCourseCode} from "@/canvas/course/code";
import {fetchJson} from "@/canvas/fetch/fetchJson";
jest.mock('@/canvas/fetch/fetchJson')

jest.mock('@/canvas/content/assignments', () => ({
    ...jest.requireActual('@/canvas/content/assignments'),
    assignmentDataGen: jest.fn(),
}))


describe('get content', () => {
    const config = {};
    test('Gets assignments', async () => {
        const id = Math.floor(Math.random() * 1000);
        const assignmentDatas = [{...mockAssignmentData, id}];
        const course = new Course(mockCourseData);
        (assignmentDataGen as jest.Mock).mockImplementation(mockAsyncGenerator(assignmentDatas))

        const extractedAssignments = await course.getAssignments(config);
        expect(extractedAssignments.length).toEqual(assignmentDatas.length);
        expect(extractedAssignments[0].rawData).toEqual(assignmentDatas[0])
    })
})




test('get tabs', async () => {
    const fetchJsonMock = fetchJson as jest.Mock;
    const mockCourse = new Course({...mockCourseData, id: 1});
    const config = {};
    const mockTabsData = [{...mockTabData, label: 'a'}];
    fetchJsonMock.mockResolvedValue(mockTabsData);
    const tabs = await mockCourse.getTabs(config);
    expect(fetchJsonMock).toHaveBeenCalledWith(`/api/v1/courses/${mockCourse.id}/tabs`, config);
    expect(tabs).toEqual(mockTabsData);

})



describe('parseCourseCode', () => {
  test('parses course code with prefix', () => {
    expect(parseCourseCode('BP_TEST123')).toBe('BP_TEST123');
    expect(parseCourseCode('BPTEST123')).toBe('BP_TEST123');
  });

  test('parses course code without prefix', () => {
    expect(parseCourseCode('TEST123')).toBe('TEST123');
    expect(parseCourseCode('TEST123')).not.toBe('TEST123_TEST123');
  });

  test('returns null for invalid course codes', () => {
    expect(parseCourseCode('BP')).toBeNull();
    expect(parseCourseCode('_123')).toBeNull();
  });
});

describe('baseCourseCode', () => {
  test('returns base course code without prefix', () => {
    expect(baseCourseCode('DEV_TEST123')).toBe('TEST123');
    expect(baseCourseCode('TEST123')).toBe('TEST123');
  });

  test('returns null for invalid course codes', () => {
    expect(baseCourseCode('BP')).toBeNull();
    expect(baseCourseCode('_123')).toBeNull();
  });
});

describe('stringIsCourseCode', () => {
  test('returns match for valid course codes', () => {
    expect(stringIsCourseCode('BP_TEST123')).toBeTruthy();
    expect(stringIsCourseCode('BPTEST123')).toBeTruthy();
  });

  test('returns null for invalid course codes', () => {
    expect(stringIsCourseCode('BP')).toBeNull();
    expect(stringIsCourseCode('_123')).toBeNull();
  });
});


