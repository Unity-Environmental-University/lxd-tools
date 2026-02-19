import {deepObjectMerge, formDataify, ICanvasCallConfig} from "./canvasUtils";
import {getPagedDataGenerator} from "@ueu/ueu-canvas/fetch/getPagedDataGenerator";

import {fetchJson} from "@ueu/ueu-canvas/fetch/fetchJson";

import {GetRubricsForCourseOptions, RubricAssociationUpdateOptions} from "@ueu/ueu-canvas/rubricTypes";
// TODO: This is currently in the canvas folder and needs to either be found in ueu-canvas, imported into ueu-canvas, or kept local.
import {IRubricData} from "@/canvas/rubricTypes";


export function getRubricsFetchUrl(courseId:number) { return `/api/v1/courses/${courseId}/rubrics`}
export function rubricApiUrl(courseId:number, rubricId:number) { return `/api/v1/courses/${courseId}/rubrics/${rubricId}` }

export function rubricsForCourseGen(courseId: number, options?: GetRubricsForCourseOptions, config?: ICanvasCallConfig) {
    const url = getRubricsFetchUrl(courseId);
    const dataGenerator = getPagedDataGenerator<IRubricData>(url, config);
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
    return await fetchJson(url, config) as IRubricData
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
