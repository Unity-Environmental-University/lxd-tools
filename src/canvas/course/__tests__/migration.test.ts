import fetchMock, {FetchMock} from "jest-fetch-mock";
import {ICourseData, IUserData} from "../../canvasDataDefs";
import {mockCourseData} from "../__mocks__/mockCourseData";
import {
    copyToNewCourseGenerator,
    courseMigrationGenerator, getMigration, getMigrationsForCourse,
    IMigrationData,
    IProgressData
} from "../migration";
import {createNewCourse} from "../index";
import {mockProgressData} from "../__mocks__/mockProgressData";
import {ICanvasCallConfig, range} from "../../canvasUtils";
import {mockMigrationData} from "../__mocks__/mockMigrationData";
import * as canvasUtils from "../../canvasUtils";
import * as CourseModule from "../index";
import {Course} from "../Course";
import {config} from "dotenv";
import {fetchJson, getPagedDataGenerator} from "../../fetch";


beforeEach(() => {
    jest.clearAllMocks();
});


describe('Getting migrations', ()=> {

    it('gets migrations from course', async ()=> {
        const id = 123;
        const config = { fetchInit: {}};
        fetchMock.once(JSON.stringify([mockMigrationData, {...mockMigrationData, id: 321}]));
        const generator = getMigrationsForCourse(id, config);
        let result = await generator.next();
        let migration = result.done? null : result.value;
        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(fetchMock).toHaveBeenCalledWith(`/api/v1/courses/${id}/content_migrations`, config.fetchInit);
        expect(migration).toEqual(mockMigrationData);
        result = await generator.next();
        migration = result.done? null : result.value;
        expect(migration?.id).toEqual(321);
    })

    it('gets a single mock by id', async ()=> {
        const courseId = 123;
        const migrationId = 321;
        const config = { fetchInit: {} };
        fetchMock.once(JSON.stringify(mockMigrationData));
        const migration = await getMigration(courseId, migrationId, config);
        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(fetchMock).toHaveBeenCalledWith(
            `/api/v1/courses/${courseId}/content_migrations/${migrationId}`,
            config.fetchInit
        );
        expect(migration).toEqual(mockMigrationData);

    })
})


describe('Course migration', () => {
    fetchMock.enableMocks();
    afterEach(() => {
        jest.clearAllMocks();
    })
    it('Yields values while still polling', async () => {

        const workflowStates = [
            ...[...range(0, 2)].map(_ => 'queued'),
            ...[...range(0, 2)].map(_ => 'running'),
            'completed'
        ]

        fetchMock.mockResponseOnce(JSON.stringify(<IMigrationData>{
            ...mockMigrationData, workflow_state: 'queued'
        }))
        const migrationGenerator = courseMigrationGenerator(0, 1, 20);

        for (let state of workflowStates) {
            fetchMock.mockResponseOnce(JSON.stringify(<IProgressData>{
                ...mockProgressData, workflow_state: state
            }))
        }
        const workflowIterator = workflowStates.values();
        for await (let progress of migrationGenerator) {
            expect(progress.workflow_state).toBe(workflowIterator.next().value)
        }
    })

    it('Throws an error on a failed migration', async () => {
        const workflowStates: IMigrationData["workflow_state"][] = [
            'queued',
            'running',
            'failed'
        ]

        fetchMock.mockResponseOnce(JSON.stringify(<IMigrationData>{
            ...mockMigrationData, workflow_state: 'queued'
        }))
        for (let state of workflowStates) {
            fetchMock.mockResponseOnce(JSON.stringify(<IProgressData>{
                ...mockProgressData, workflow_state: state
            }))
        }
        const migrationGenerator = courseMigrationGenerator(0, 1, 0);

        await expect(async () => {
            for await (let progress of migrationGenerator) {
                expect(progress.id).toBe(mockProgressData.id)
            }
        }).rejects.toThrow(/Migration Error/)

    })

})

describe('Course Copying', () => {
    test('Copy course wholesale', async () => {
        fetchMock.enableMocks();

        const fetch = (global.fetch as FetchMock);
        const courseName = 'Test course the testing course';
        const courseCode = "TEST000";
        const sourceCourseData = {
            ...mockCourseData,
            name: `DEV_${courseCode}: ${courseName}`,
            course_code: `DEV_${courseCode}`
        };
        const sourceCourse = new Course(sourceCourseData);
        const newCode = 'BP_TEST000';
        const newName = `BP_TEST000: ${courseName}`;

        const workflowStates = [
            ...[...range(0, 2)].map(_ => 'queued'),
            ...[...range(0, 2)].map(_ => 'running'),
            'completed',

        ]
        const workflowIterator = workflowStates.values();
        fetchMock.mockClear();
        fetchMock.mockResponses(...[
            sourceCourseData,
            {...mockMigrationData, workflow_state: 'queued'},

            ...workflowStates.map((state, i) => ({
                ...mockProgressData,
                workflow_state: state,
                message: i.toString(),
            } as IProgressData)),

            {...sourceCourse.rawData, name: newName, course_code: newCode} as ICourseData,
        ].map(value => JSON.stringify(value)))
        const migrationGenerator = copyToNewCourseGenerator(sourceCourse, newCode, 20);

        async function testCourseMigration() {
            let result;
            while (true) {
                result = await migrationGenerator.next();
                const {value} = workflowIterator.next();
                if (result.done) return result.value;
                expect(result.value.workflow_state).toBe(value)
            }
        }

        const course: ICourseData = await testCourseMigration();
        expect(course.name).toBe(newName);
        expect(course.course_code).toBe(newCode);
    })

})