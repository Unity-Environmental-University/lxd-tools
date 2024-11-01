import {formDataify, ICanvasCallConfig, range} from "../../canvasUtils";
import {createNewCourse, getCourseGenerator, getCourseName, setGradingStandardForCourse} from "../index";
import {mockCourseData} from "../__mocks__/mockCourseData";
import assert from "assert";
import fetchMock from "jest-fetch-mock";
import {Course} from "../Course";

import {ICourseData} from "@/canvas/courseTypes";
import {fetchJson} from "@/canvas/fetch/fetchJson";

jest.mock('@/canvas/fetch/fetchJson', () => ({
    fetchJson: jest.fn(),
}))


test('Create new course', async () => {
    const courseCode = 'DEV_ABC1234';
    const name = 'DEV_ABC134: Test Course';
    const accountId = 0;

    const courseData: ICourseData = {...mockCourseData, name, course_code: courseCode};
    (fetchJson as jest.Mock).mockResolvedValue(courseData)
    const createdCourse = await createNewCourse(courseCode, accountId, name)
    expect(createdCourse).toStrictEqual(courseData);
});

describe('Course Generators', () => {

    fetchMock.enableMocks();

    test('Course generator generates courses', async () => {

        const accountIds = [...range(0, 10)]
        const courseGenerator = getCourseGenerator(
            'x',
            accountIds,
        );

        for (const enrollment_term_id of accountIds) {
            const codes = ['TEST000', 'ANIM123', 'CHEM897']
            const courseDatas: ICourseData[] = codes.map(course_code => {
                return {
                    ...mockCourseData,
                    enrollment_term_id,
                    course_code,
                }
            });

            fetchMock.mockResponseOnce(JSON.stringify(courseDatas));
            for (const code of codes) {
                const {done, value: course} = await courseGenerator.next();
                assert(course instanceof Course);
                expect(done).toBe(false);
                expect(course.termId).toBe(enrollment_term_id);
                expect(course.parsedCourseCode).toBe(code);
            }

        }
        const {done, value} = await courseGenerator.next();
        expect(done).toBe(true);
        expect(value).toBe(undefined);
    });


})



function testSave<SaveValue>(
    func:(courseId:number, saveValue:SaveValue, config?:ICanvasCallConfig)=>Promise<ICourseData>,
    rawDataKey: string,
    testSubmitValue: SaveValue)
{
    const fetchJsonMock = fetchJson as jest.Mock;
    fetchJsonMock.mockResolvedValue({...mockCourseData, [rawDataKey]: testSubmitValue})
    const newCourseData = func(0, testSubmitValue);
    const [url, config] = fetchJsonMock.mock.lastCall as [string, ICanvasCallConfig];
    const {body} = config.fetchInit as RequestInit & { body: FormData };
    expect(url).toEqual(`/api/v1/courses/0`)
    expect([...body.entries()]).toStrictEqual([...formDataify({course: {[rawDataKey]: testSubmitValue}}).entries()])

}

describe('saving data tests', () => {
    const fetchJsonMock = fetchJson as jest.Mock;
    it('saves grading standard id', () => testSave(
        setGradingStandardForCourse,
        'grading_standard_id', 5)
    )
})



describe('getCourseName', () => {
    it('works for BP and various term codes', () => {
        expect(getCourseName({...mockCourseData, name: 'BP_BIOL203: The Biology of Today'})).toEqual('The Biology of Today')
        expect(getCourseName({...mockCourseData, name: 'DEV_BIOL203: The Biology of Today'})).toEqual('The Biology of Today')
        expect(getCourseName({...mockCourseData, name: 'DE08W01.01.24_BIOL203: The Biology of Today-01'})).toEqual('The Biology of Today-01')
    })
    it('returns full name if there are no colons', () => {
        expect(getCourseName({...mockCourseData, name: 'The Biology of Today'})).toEqual('The Biology of Today')
        expect(getCourseName({...mockCourseData, name: 'DEV_BIOL203'})).toEqual('DEV_BIOL203')
    })
})