import {deepObjectMerge, fetchJson, formDataify, ICanvasCallConfig} from "../canvasUtils";
import {IMigrationData, IProgressData} from "./courseTypes";
import {sleep} from "../../index";
import {ICourseData} from "../canvasDataDefs";
import {Course} from "./index";

export async function createNewCourse(courseCode: string, name?: string, config?: ICanvasCallConfig) {
    name ??= courseCode;
    const createUrl = `/api/v1/courses/`
    let createConfig: ICanvasCallConfig = {
        fetchInit: {
            method: 'PUT',
            body: formDataify({
                course: {
                    name,
                    course_code: courseCode
                }
            })
        }
    }
    return await fetchJson(createUrl, deepObjectMerge(createConfig, config, true)) as ICourseData;
}

export async function* migrateCourse(
    sourceCourseId: number,
    destCourseId: number,
    migrationConfig?: ICanvasCallConfig,
    pollConfig?: ICanvasCallConfig
) {
    const copyUrl = `/api/v1/courses/${destCourseId}/content_migrations`;

    const migrationInit: RequestInit = {
        body: formDataify({
            migration_type: 'course_copy_importer',
            settings: {
                source_course_id: sourceCourseId,
            }
        })
    }

    migrationConfig = deepObjectMerge(migrationConfig, {fetchInit: migrationInit}, true);
    let migrationData = await fetchJson<IMigrationData>(copyUrl, migrationConfig);

    let {
        id: migrationId,
        progress_url: progressUrl
    } = migrationData;

    while (true) {
        await sleep(2000);
        const progress = await fetchJson<IProgressData>(progressUrl, pollConfig);
        yield progress;
        if (progress.workflow_state === 'completed') return

    }
}

export async function* copyToNewCourse(
    sourceCourse: Course,
    newCode: string,
    newName?: string,
    config?: ICanvasCallConfig) {
    if (!newName && sourceCourse.parsedCourseCode) {
        newName = sourceCourse.name.replace(sourceCourse.parsedCourseCode, newCode);
    }
    newName ??= sourceCourse.name + "_COPY";
    const destCourseData = await createNewCourse(newCode, newName);


}