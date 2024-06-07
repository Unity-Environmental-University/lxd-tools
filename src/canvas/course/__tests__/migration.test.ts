import fetchMock from "jest-fetch-mock";
import {ICourseData} from "../../canvasDataDefs";
import {mockCourseData} from "../__mocks__/mockCourseData";
import {
    copyToNewCourseGenerator,
    courseMigrationGenerator,
    IMigrationData,
    IProgressData
} from "../migration";
import {Course, createNewCourse} from "../index";
import {dummyMigrationData, dummyProgressData} from "../__mocks__/migrations";
import {range} from "../../canvasUtils";

fetchMock.enableMocks();

describe('Course migration', () => {
    it('Yields values while still polling', async () => {

        const workflowStates = [
            ...[...range(0, 5)].map(_ => 'queued'),
            ...[...range(0, 5)].map(_ => 'running'),
            'completed'
        ]

        fetchMock.mockResponseOnce(JSON.stringify(<IMigrationData>{
            ...dummyMigrationData, workflow_state: 'queued'
        }))
        const migrationGenerator = courseMigrationGenerator(0, 1, 20);

        for (let state of workflowStates) {
            fetchMock.mockResponseOnce(JSON.stringify(<IProgressData>{
                ...dummyProgressData, workflow_state: state
            }))
        }
        const workflowIterator = workflowStates.values();
        for await (let progress of migrationGenerator) {
            expect(progress.workflow_state).toBe(workflowIterator.next().value)
        }
    })
})


test('Copy course wholesale', async () => {
    fetchMock.mockClear();
    const courseName = 'Test course the testing course';
    const courseCode = "TEST000";
    const sourceCourse = new Course({
        ...mockCourseData,
        name: `DEV_${courseCode}: ${courseName}`,
        course_code: `DEV_${courseCode}`
    });
    const newCode = 'BP_TEST000';
    const newName = `BP_TEST000: ${courseName}`;

    fetchMock.mockResponseOnce(JSON.stringify({...sourceCourse, name:newName, course_code:newCode}))
    fetchMock.mockResponseOnce(JSON.stringify(<IMigrationData>{
        ...dummyMigrationData, workflow_state: 'queued'
    }))
    const migrationGenerator = copyToNewCourseGenerator(sourceCourse, newCode, 20);


    const workflowStates = [
        ...[...range(0, 5)].map(_ => 'queued'),
        ...[...range(0, 5)].map(_ => 'running'),
        'completed'
    ]
    const workflowIterator = workflowStates.values();

    let i = 0;
    for (let state of workflowStates) {
        fetchMock.mockResponseOnce(JSON.stringify(<IProgressData>{
            ...dummyProgressData, workflow_state: state, message: i.toString(),
        }))
        i++
    }
    fetchMock.mockResponseOnce(JSON.stringify({...sourceCourse, name:newName, course_code:newCode}))

    async function testCourseMigration() {
        let result;
        for (result = await migrationGenerator.next(); !result?.done; result = await migrationGenerator.next()) {
            const {value} = workflowIterator.next();
            expect(result.value.workflow_state).toBe(value)
        }
        return result.value;
    }


    const course: ICourseData = await testCourseMigration();
    expect(course.name).toBe(newName);
    expect(course.course_code).toBe(newCode);
})
