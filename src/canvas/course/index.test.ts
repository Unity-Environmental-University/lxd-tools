import {formDataify, range} from "../canvasUtils";
import {copyToNewCourse, Course, createNewCourse, getCourseGenerator} from "./index";
import {dummyCourseData} from "../../../tests/dummyData/dummyCourseData";
import {ICourseData} from "../canvasDataDefs";
import assert from "assert";
import fetchMock from "jest-fetch-mock";
import {IMigrationData} from "./courseTypes";


/**
 * From canvas api docs
 */
export const dummyMigration: IMigrationData = {
    // the unique identifier for the migration
    "id": 370663,
    // the type of content migration
    "migration_type": "course_copy_importer",
    // the name of the content migration type
    "migration_type_title": "Canvas Cartridge Importer",
    // API url to the content migration's issues
    "migration_issues_url": "https://example.com/api/v1/courses/1/content_migrations/1/migration_issues",
    // attachment api object for the uploaded file may not be present for all
    // migrations
    "attachment": {"url": "https://example.com/api/v1/courses/1/content_migrations/1/download_archive"},
    // The api endpoint for polling the current progress
    "progress_url": "https://example.com/api/v1/progress/4",
    // The user who started the migration
    "user_id": 4,
    // Current state of the content migration: pre_processing, pre_processed,
    // running, waiting_for_select, completed, failed
    "workflow_state": "running",
    // timestamp
    "started_at": "2012-06-01T00:00:00-06:00",
    // timestamp
    "finished_at": "2012-06-01T00:00:00-06:00",
    // file uploading data, see {file:file_uploads.html File Upload Documentation}
    // for file upload workflow This works a little differently in that all the file
    // data is in the pre_attachment hash if there is no upload_url then there was
    // an attachment pre-processing error, the error message will be in the message
    // key This data will only be here after a create or update call
    "pre_attachment": {
        upload_url: '',
        "message": "file exceeded quota",
        "upload_params": {}
    }
}

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

describe("Copying and migration", () => {

    fetchMock.enableMocks();

    test('Create new course', async () => {
        const courseCode = 'DEV_ABC1234';
        const name = 'DEV_ABC134: Test Course';

        const courseData: ICourseData = {...dummyCourseData, name, course_code: courseCode};
        fetchMock.mockResponseOnce(JSON.stringify(courseData))

        const createdCourse = await createNewCourse(courseCode, name)

        expect(createdCourse).toStrictEqual(courseData);
    });

    

    test('Copy course wholesale', async () => {
        const courseName = 'Test course the testing course';
        const courseCode = "TEST000";
        const sourceCourse = new Course({
            ...dummyCourseData,
            name: `DEV_${courseCode}: ${courseName}`,
            course_code: `DEV_${courseCode}`
        });
        const newCode = 'BP_TEST000';
        const newCourse = await copyToNewCourse(sourceCourse, newCode);
        //expect(newCourse.name).toBe(`${newCode}: ${courseName}`)
    })
})

