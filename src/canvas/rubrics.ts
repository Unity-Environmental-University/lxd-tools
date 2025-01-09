import {deepObjectMerge, formDataify, ICanvasCallConfig} from "./canvasUtils";
import {getPagedDataGenerator} from "@/canvas/fetch/getPagedDataGenerator";

import {fetchJson} from "@/canvas/fetch/fetchJson";

import {GetRubricsForCourseOptions, RubricTypes, RubricAssociationUpdateOptions} from "@canvas/rubricTypes";


export function getRubricsFetchUrl(courseId:number) { return `/api/v1/courses/${courseId}/rubrics`}
export function rubricApiUrl(courseId:number, rubricId:number) { return `/api/v1/courses/${courseId}/rubrics/${rubricId}` }

export function rubricsForCourseGen(courseId: number, options?: GetRubricsForCourseOptions, config?: ICanvasCallConfig) {
    const url = getRubricsFetchUrl(courseId);
    const dataGenerator = getPagedDataGenerator<RubricTypes>(url, config);
    if (options?.include) {
        return async function* () {
            for await(const rubric of dataGenerator) {

                yield await getRubric(rubric.context_id, rubric.id, options, config)
            }
        }();
    }
    return dataGenerator;

}

export async function getRubric(courseId: number, rubricId: number, options?: GetRubricsForCourseOptions, config?: ICanvasCallConfig) {
    const url = rubricApiUrl(courseId, rubricId);
    if (options?.include) {
        config ??= {};
        config.queryParams = deepObjectMerge(config?.queryParams, {include: options.include})
    }
    return await fetchJson(url, config) as RubricTypes
}

export function rubricAssociationUrl(courseId:number, rubricAssociationId:number) {
    return `/api/v1/courses/${courseId}/rubric_associations/${rubricAssociationId}`;
}

export async function updateRubricAssociation(courseId: number, rubricAssociationId: number, data: RubricAssociationUpdateOptions, config?:ICanvasCallConfig) {
    const url = rubricAssociationUrl(courseId, rubricAssociationId);
    return await fetchJson(url, deepObjectMerge(config, {
        fetchInit: {
            method: 'PUT',
            body: formDataify(data)
        },
    }, true));
}
