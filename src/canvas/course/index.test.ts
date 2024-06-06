import {range} from "../canvasUtils";
import {Course, createNewCourse, getCourseGenerator} from "./index";
import {dummyCourseData} from "./__mocks__/dummyCourseData";
import {ICourseData} from "../canvasDataDefs";
import assert from "assert";
import fetchMock from "jest-fetch-mock";

test('Create new course', async () => {
    const courseCode = 'DEV_ABC1234';
    const name = 'DEV_ABC134: Test Course';

    const courseData: ICourseData = {...dummyCourseData, name, course_code: courseCode};
    fetchMock.mockResponseOnce(JSON.stringify(courseData))
    const createdCourse = await createNewCourse(courseCode, name)
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

        for (let enrollment_term_id of accountIds) {
            const codes = ['TEST000', 'ANIM123', 'CHEM897']
            const courseDatas: ICourseData[] = codes.map(course_code => {
                return {
                    ...dummyCourseData,
                    enrollment_term_id,
                    course_code,
                }
            });

            fetchMock.mockResponseOnce(JSON.stringify(courseDatas));
            for (let code of codes) {
                let {done, value: course} = await courseGenerator.next();
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
