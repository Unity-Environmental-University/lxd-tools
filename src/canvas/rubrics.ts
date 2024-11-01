import {BaseCanvasObject} from "./baseCanvasObject";
import {CanvasData} from "./canvasDataDefs";
import {deepObjectMerge, formDataify, ICanvasCallConfig} from "./canvasUtils";
import {getPagedDataGenerator} from "@/canvas/fetch/getPagedDataGenerator";

import {fetchJson} from "@/canvas/fetch/fetchJson";


export interface IRubricCriterionData {
    id: string,
    description?: string | null,
    long_description?: string | null,
    points: number,
    criterion_use_range?: boolean,
    ratings: IRubricRatingData[]
}

export interface IRubricRatingData {
    id: string,
    description?: string | null,
    long_description?: string | null,
    points: number,
}


export interface IRubricAssessmentData {
    id: number,
    rubric_id: number,
    rubric_association_id: number,
    score: number,
    artifact_type: string,
    artifact_id: number,
    artifact_attempt: number,
    assessment_type: 'grading' | 'peer_review' | 'provisional_grade',
    assessor_id: number,
    data?: any,
    comments?: string,
}

export type RubricAssessment = Record<string, {
    points: number,
    rating_id: string,
    comments?: string,
}>

export interface IRubricAssociationData {
    id: number,
    rubric_id: number,
    association_id: number,
    association_type: "Assignment" | "Course" | "Account",
    use_for_grading: boolean,
    summary_data?: string,
    purpose: 'grading' | 'bookmark',
    hide_score_total: boolean,
    hide_points: boolean,
    hide_outcome_results: boolean,
}


export interface IRubricData {
    id: number,
    title: string,
    context_id: number,
    context_type: string,
    points_possible: number,
    reusable: boolean,
    read_only: boolean,
    free_form_criterion_comments: boolean,
    hide_score_total: boolean,
    data: null,
    assessments?: IRubricAssessmentData[],
    associations?: IRubricAssociationData[],
}


type RubricCallIncludeTypes = 'assessments' | 'graded_assessments' | 'peer_assessments' |
    'associations' | 'assignment_associations' | 'course_associations' | 'account_associations'

type GetRubricsForCourseOptions = {
    include?: RubricCallIncludeTypes[]
}

type RubricAssociationUpdateOptions = {
    id: number,
    rubric_association: Partial<Pick<IRubricAssociationData,
        'rubric_id'|
        'association_id'|
        'association_type' |
        'use_for_grading' |
        'hide_score_total' |
        'purpose'>> & {
        title?: string
        bookmarked?: boolean
    }
}

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
