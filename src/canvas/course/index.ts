import {ICourseData} from "../canvasDataDefs";
import {
    deepObjectMerge,
    formDataify,
    ICanvasCallConfig,
    IQueryParams
} from "../canvasUtils";
import {Term} from "../index";

import {overrideConfig} from "../../publish/fixesAndUpdates/validations";
import {IGradingStandardData} from "./courseTypes";
import {Course} from "./Course";
import {fetchJson, getPagedData, getPagedDataGenerator, mergePagedDataGenerators} from "../fetch";


export async function getGradingStandards(contextId: number, contextType: 'account' | 'course', config?: ICanvasCallConfig) {
    const url = `/api/v1/${contextType}s/${contextId}/grading_standards`
    return await getPagedData<IGradingStandardData>(url, config)
}



async function* generatorMap<T, MapOutput>(
    generator: AsyncGenerator<T>,
    nextMapFunc: (value: T, index: number, generator: AsyncGenerator<T>) => MapOutput,
) {

    let i = 0;
    for await(let value of generator) {
        yield nextMapFunc(value, i, generator);
        i++;
    }
}

export function getCourseData(id:number, config?: ICanvasCallConfig) {
    const url = `/api/v1/courses/${id}`;
    return fetchJson(url, config) as Promise<ICourseData>;
}

export function getCourseGenerator(queryString: string, accountIds: number[] | number, term?: Term, config?: ICanvasCallConfig) {
    if (!Array.isArray(accountIds)) accountIds = [accountIds];

    interface IGetCourseQueryParams extends IQueryParams {
        enrollment_term_id?: number,
    }

    const defaultConfig: ICanvasCallConfig<IGetCourseQueryParams> = {
        queryParams: {
            search_term: queryString,
        }
    }
    if (term && defaultConfig.queryParams) defaultConfig.queryParams.enrollment_term_id = term.id;
    config = overrideConfig(defaultConfig, config);
    const generators = accountIds.map(accountId => {
        let url = `/api/v1/accounts/${accountId}/courses`;
        return getPagedDataGenerator<ICourseData>(url, config);
    })
    return generatorMap(mergePagedDataGenerators(generators), courseData => new Course(courseData));
}

export async function createNewCourse(courseCode: string, accountId:number, name?: string, config?: ICanvasCallConfig) {
    name ??= courseCode;
    const createUrl = `/api/v1/accounts/${accountId}/courses/`
    let createConfig: ICanvasCallConfig = {
        fetchInit: {
            method: 'POST',
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

export function getCourseIdFromUrl(url: string) {
    let match = /courses\/(\d+)/.exec(url);
    if (match) {
        return parseInt(match[1]);
    }
    return null;
}

export class CourseNotFoundException extends Error {}
