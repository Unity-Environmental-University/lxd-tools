import {BaseCanvasObject} from "./baseCanvasObject";
import {CanvasData} from "./canvasDataDefs";
import {deepObjectMerge, ICanvasCallConfig} from "./canvasUtils";
import {fetchJson, getPagedDataGenerator} from "./fetch";


export interface IRubricCriterionData {
    id: string,
    description?: string | null,
    long_description?: string | null,
    points: number,
    criterion_use_range: boolean,
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

export interface IRubricAssociationData {
    id: number,
    rubric_id: number,
    association_id: number,
    association_type: string,
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

export function rubricsForCourseGen(courseId: number, options?: GetRubricsForCourseOptions, config?: ICanvasCallConfig) {
    const url = `/api/v1/courses/${courseId}/rubrics`;
    if (options?.include) {
        config ??= {};
        config.queryParams = deepObjectMerge(config?.queryParams, {include: options.include})
    }
    return getPagedDataGenerator<IRubricData>(url, config);
}

export async function getRubric(courseId: number, rubricId: number, options?: GetRubricsForCourseOptions, config?: ICanvasCallConfig) {
    const url = `/api/v1/courses/${courseId}/rubrics/${rubricId}`;
    if (options?.include) {
        config ??= {};
        config.queryParams = deepObjectMerge(config?.queryParams, {include: options.include})
    }
    return await fetchJson(url, config) as IRubricData
}


class RubricAssociation extends BaseCanvasObject<CanvasData> {
    static contentUrlTemplate = "/api/v1/courses/{course_id}/rubric_associations/{content_id}";
    static allContentUrlTemplate = "/api/v1/courses/{course_id}/rubric_associations";
    courseId: number;

    constructor(data: CanvasData, courseId: number) {
        super(data);
        this.courseId = courseId;
    }

    get useForGrading() {
        return this.canvasData['use_for_grading'];
    }

    async setUseForGrading(value: boolean, config?: ICanvasCallConfig) {
        this.canvasData['use_for_grading'] = value;
        return await this.saveData({'rubric_association[use_for_grading]': value}, config);
    }
}