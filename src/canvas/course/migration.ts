import {deepObjectMerge, fetchJson, formDataify, ICanvasCallConfig} from "../canvasUtils";
import {sleep} from "../../index";
import {ICourseData} from "../canvasDataDefs";
import {Course, getCourseData} from "./index";


export interface IMigrationData {
    migration_type: string;
    migration_type_title: string;
    pre_attachment: { upload_params: {}; upload_url: string; message: string };
    attachment: { url: string };
    finished_at: string;
    user_id: number;
    progress_url: string;
    started_at: string;
    workflow_state: string;
    id: number;
    migration_issues_url: string
}

export interface IProgressData {
    completion: number;
    updated_at: string;
    user_id: number;
    context_type: string;
    created_at: string;
    context_id: number;
    workflow_state: 'queued' | 'running' | 'completed' | 'failed';
    id: number;
    tag: string;
    message: string;
    results: { id: string };
    url: string
}

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

export async function* courseMigrationGenerator(
    sourceCourseId: number,
    destCourseId: number,
    pollDelay: number = 500, //in ms
    migrationConfig?: ICanvasCallConfig,
    pollConfig?: ICanvasCallConfig
) {
    const copyUrl = `/api/v1/courses/${destCourseId}/content_migrations`;

    const migrationInit: RequestInit = {
        method: 'POST',
        body: formDataify({
            migration_type: 'course_copy_importer',
            settings: {
                source_course_id: sourceCourseId,
            }
        })
    }

    migrationConfig = deepObjectMerge(migrationConfig, {fetchInit: migrationInit}, true);
    let migrationData = await fetchJson<IMigrationData>(copyUrl, migrationConfig);


    let {progress_url: progressUrl} = migrationData;

    while (true) {
        await sleep(pollDelay);
        const progress = await fetchJson<IProgressData>(progressUrl, pollConfig);
        yield progress;
        if (progress.workflow_state === 'completed') return
        if (progress.workflow_state === 'failed') throw new Error(`Migration of ${sourceCourseId} to ${destCourseId} failed`);
    }
}

export async function* copyToNewCourseGenerator(
    sourceCourse: Course,
    newCode: string,
    pollDelay: number = 500,
    newName?: string,
    courseConfig?: ICanvasCallConfig,
    migrationConfig?: ICanvasCallConfig,
    pollConfig?: ICanvasCallConfig,
    returnCourseConfig?: ICanvasCallConfig,
) {
    if (!newName && sourceCourse.parsedCourseCode) {
        newName = sourceCourse.name.replace(sourceCourse.parsedCourseCode, newCode);
    }

    returnCourseConfig ??= courseConfig;
    newName ??= sourceCourse.name + "_COPY";
    const {destId} = await createNewCourse(newCode, newName, courseConfig);
    const migration = courseMigrationGenerator(sourceCourse.id, destId, pollDelay, migrationConfig, pollConfig);

    for await (let progress of migration) {
        yield progress;
    }
    return await getCourseData(destId, returnCourseConfig);

}