import {
    deepObjectMerge,
    formDataify,
    ICanvasCallConfig
} from "../../canvasUtils";
import {createNewCourse, getCourseData} from "../index";
import {Course} from "../Course";

import { storage} from "webextension-polyfill";
import {getPagedDataGenerator} from "@/canvas/fetch/getPagedDataGenerator";

import {fetchJson} from "@/canvas/fetch/fetchJson";
import {GetCourseOptions} from "@/canvas/course/courseTypes";
import {sleep} from "@/utils/toolbox";
export type WorkflowState = 'queued' | 'running' | 'completed' | 'failed';


export interface IMigrationData {
    migration_type: string;
    migration_type_title: string;
    pre_attachment: { upload_params: {}; upload_url: string; message: string };
    attachment: { url: string };
    finished_at: string;
    user_id: number;
    progress_url: string;
    started_at: string;
    workflow_state: WorkflowState;
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
    workflow_state: WorkflowState;
    id: number;
    tag: string;
    message: string;
    results: { id: string };
    url: string
}


export function migrationsForCourseGen(courseId:number, config?:ICanvasCallConfig) {
    const url = `/api/v1/courses/${courseId}/content_migrations`
    return getPagedDataGenerator<IMigrationData>(url, config);

}

export async function getMigration(courseId:number,migrationId:number, config?:ICanvasCallConfig) {
    const data = await fetchJson(
        `/api/v1/courses/${courseId}/content_migrations/${migrationId}`,
        config,
    );
    if(data) return data as IMigrationData;
    return null;
}


export async function* courseMigrationGenerator(
    sourceCourseId: number,
    destCourseId: number,
    pollDelay: number = 500, //in ms
    migrationConfig?: ICanvasCallConfig,
    pollConfig?: ICanvasCallConfig
) {

    const migrationData = await startMigration(sourceCourseId, destCourseId, migrationConfig);
    for await (const result of genCourseMigrationProgress(migrationData, pollDelay, pollConfig)) {
        yield result;
    }
}

export async function startMigration(sourceCourseId:number, destCourseId: number, config?:ICanvasCallConfig) {
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

    config = deepObjectMerge(config, {fetchInit: migrationInit}, true);
    return await fetchJson<IMigrationData>(copyUrl, config);
}

export async function* genCourseMigrationProgress(migration:IMigrationData, pollDelay: number = 500, pollConfig?: ICanvasCallConfig) {
    const {progress_url: progressUrl} = migration;
    while (true) {
        await sleep(pollDelay);
        const progress = await fetchJson<IProgressData>(progressUrl, pollConfig);
        yield progress;
        if (progress.workflow_state === 'completed') return
        if (progress.workflow_state === 'failed') {
            throw new Error(`Migration Error: ${progress.message}`);
        }
    }
}

export async function* copyToNewCourseGenerator(
    sourceCourse: Course,
    newCode: string,
    pollDelay: number = 500,
    newName?: string,
    courseConfig?: ICanvasCallConfig<GetCourseOptions>,
    migrationConfig?: ICanvasCallConfig,
    pollConfig?: ICanvasCallConfig,
    returnCourseConfig?: ICanvasCallConfig<GetCourseOptions>,
) {
    if (!newName && sourceCourse.parsedCourseCode) {
        newName = sourceCourse.name.replace(sourceCourse.parsedCourseCode, newCode);
    }

    returnCourseConfig ??= courseConfig;
    newName ??= sourceCourse.name + "_COPY";
    const {destId} = await createNewCourse(newCode, sourceCourse.accountId, newName, courseConfig);
    const migration = courseMigrationGenerator(sourceCourse.id, destId, pollDelay, migrationConfig, pollConfig);

    for await (const progress of migration) {
        yield progress;
    }
    return await getCourseData(destId, returnCourseConfig);

}