import {deepObjectMerge, formDataify, ICanvasCallConfig, IQueryParams} from "../canvasUtils";
import {overrideConfig} from "../index";

import {GetCoursesFromAccountOptions, IGradingStandardData} from "./courseTypes";
import {Course} from "./Course";
import {Term} from "@/canvas/Term";

import {ICourseData} from "@/canvas/courseTypes";
import {getPagedData, getPagedDataGenerator, mergePagedDataGenerators} from "@/canvas/fetch/getPagedDataGenerator";

import {fetchJson} from "@/canvas/fetch/fetchJson";
import {generatorMap} from "@/canvas/fetch";


export async function getGradingStandards(contextId: number, contextType: 'account' | 'course', config?: ICanvasCallConfig) {
    const url = `/api/v1/${contextType}s/${contextId}/grading_standards`
    return await getPagedData<IGradingStandardData>(url, config)
}



export function getCourseData(id:number, config?: ICanvasCallConfig) {
    const url = `/api/v1/courses/${id}`;
    return fetchJson(url, config) as Promise<ICourseData>;
}


export function getCourseDataGenerator(
    queryString: string | undefined | null, accountIds: number[] | number, term?: Term, config?: ICanvasCallConfig<GetCoursesFromAccountOptions>
) {
    if (!Array.isArray(accountIds)) accountIds = [accountIds];

    interface IGetCourseQueryParams extends IQueryParams {
        enrollment_term_id?: number,
    }

    const defaultConfig: ICanvasCallConfig<GetCoursesFromAccountOptions> = queryString ? {
        queryParams: {
            search_term: queryString,
        }
    } : {};

    if (term && defaultConfig.queryParams) defaultConfig.queryParams.enrollment_term_id = term.id;
    config = overrideConfig(defaultConfig, config);
    const generators = accountIds.map(accountId => {
        let url = `/api/v1/accounts/${accountId}/courses`;
        return getPagedDataGenerator<ICourseData>(url, config);
    })
    return mergePagedDataGenerators(generators);
}

export function getCourseGenerator(
    queryString: string | undefined | null, accountIds: number[] | number, term?: Term, config?: ICanvasCallConfig<GetCoursesFromAccountOptions>) {
    return generatorMap(getCourseDataGenerator(queryString, accountIds, term, config), courseData => new Course(courseData));
}

export async function getSingleCourse(queryString:string, accountIds:number[], term?:Term, config?: ICanvasCallConfig<GetCoursesFromAccountOptions>) {
    for (let accountId of accountIds) {
        const courseDatas = await fetchJson<ICourseData[]>(
            `/api/v1/accounts/${accountId}/courses`,
            overrideConfig({ queryParams: { search_term: queryString } },config)
        )

        if(courseDatas.length > 0) return new Course(courseDatas[0]);
    }
    return undefined;
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

export async function saveCourseData(courseId: number, data: Partial<ICourseData>, config?: ICanvasCallConfig) {
    const url = `/api/v1/courses/${courseId}`
    return await fetchJson<ICourseData>(url, overrideConfig(config, {
        fetchInit: {
            method: 'PUT',
            body: formDataify({course: data})
        }
    }))
}

export async function setGradingStandardForCourse(courseId: number, standardId: number, config?: ICanvasCallConfig) {
    return await saveCourseData(courseId, {grading_standard_id: standardId})
}