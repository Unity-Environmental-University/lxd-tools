import {ICourseData, SectionData} from "@/canvas/courseTypes";
import {CanvasData, IEnrollmentData, IModuleData, IUserData, LookUpTable} from "@/canvas/canvasDataDefs";
import {AssignmentsCollection} from "@/ui/speedGrader/AssignmentsCollection";
import {ITermData} from "@/canvas/term/Term";
import {IRubricAssessmentData, IRubricCriterionData, RubricAssessment} from "@/canvas/rubrics";
import {getModuleInfo} from "@/ui/speedGrader/modules";
import assert from "assert";

import {csvEncode} from "@/ui/speedGrader/exportAndRender/csvRowsForCourse";

import {IAssignmentData, IAssignmentSubmission} from "@canvas/content/types";



export type CriteriaAssessment = {
    id: any,
    points: any,
    rating: any
}


export interface IGetRowsConfig {
    course: SectionData | ICourseData,
    enrollment: IEnrollmentData,
    modules: IModuleData[],
    userSubmissions: IAssignmentSubmission[],
    assignmentsCollection: AssignmentsCollection,
    instructors: IUserData[],
    term: ITermData
}


export async function getRows(args: IGetRowsConfig) {

    const {
        course,
        enrollment,
        modules,
        userSubmissions,
        assignmentsCollection,
        instructors,
        term
    } = args;
    const {user} = enrollment;

    const {course_code} = course;
    const sectionMatch = course_code.match(/-\s*(\d+)$/);
    const baseCodeMatch = course_code.match(/([a-zA-Z]{4}\d{3})/);
    const section: number | null = sectionMatch ? parseInt(sectionMatch[1]) : null;
    const baseCode = baseCodeMatch ? baseCodeMatch[1] : null;

    const instructorName = getInstructorName(instructors);
    // Let's not actually do this if we can't find the user's submissions.

    const baseRow = [
        term.name,
        instructorName,
        baseCode,
        section,
    ]
    const rows = parseSubmissions(user, userSubmissions).reduce((rows, submission) => {
        if (!user) return rows;

        const {assignment} = submission;
        let rubricSettings;
        if(!assignment) {
            console.warn('No assignment associated with submission')
            return [];
        }
        if (assignment.hasOwnProperty('rubric_settings')) {
            rubricSettings = assignment.rubric_settings;
        }
        const criteriaInfo = getCriteriaInfo(assignment);

        course_code.replace(/^(.*)_?(\[A-Za-z]{4}\d{3}).*$/, '$1$2')

        const {rubric_assessment: rubricAssessment} = submission;
        const rubricId = typeof (rubricSettings) !== 'undefined' && rubricSettings.hasOwnProperty('id') ?
            rubricSettings.id : 'No Rubric Settings';

        const submissionBaseRow = getSubmissionBaseRow({
            ...args,
            baseRow,
            submission,
        });

        const out = [
            ...rows,
            submissionHeader(submissionBaseRow, submission, assignment, rubricId),
            ...criteriaAssessmentRows(rubricAssessment, criteriaInfo, submissionBaseRow)
        ]
        return out;

    }, [] as Array<string|number|undefined|null>[]);

    return rows.map( row => row.map(csvEncode).join(',') + '\n' )
}

export function criteriaAssessmentRows(rubricAssessment:RubricAssessment | null | undefined, criteriaInfo: CriteriaInfo | null,  submissionBaseRow: Array<string|number|null|undefined>) {
    let [critIds, critAssessments] = getCritIdsAndAssessments(rubricAssessment, criteriaInfo);
    critAssessments = fillEmptyCriteria(critAssessments, criteriaInfo, critIds);
    sortCritAssessments(critAssessments, criteriaInfo);
    return critAssessments.map((critAssessment, critIndex) => {
        const criterion = criteriaInfo?.critsById[critAssessment.id];
        return [...submissionBaseRow,
            criterion ? criterion.id : critAssessment.id,
            Number(critIndex) + 1,
            criterion ? criterion.description : "-REMOVED-",
            critAssessment.points,
            criterion?.points
        ]
    })
}

export function sortCritAssessments(critAssessments: CriteriaAssessment[], criteriaInfo?: CriteriaInfo | null) {
    const critOrder = criteriaInfo?.order;
    if (critOrder) {
        critAssessments.sort(function (a, b) {
            assert(critOrder);
            return critOrder[a.id] - critOrder[b.id];
        });
    }
}

export function fillEmptyCriteria(critAssessments: CriteriaAssessment[], criteriaInfo: any, critIds: any) {
    for (const critKey in criteriaInfo?.order) {
        if (!critIds.includes(critKey)) {
            critAssessments.push({'id': critKey, 'points': null, 'rating': null});
        }
    }
    return critAssessments;
}

export interface CriteriaInfo {
    order: LookUpTable<number>,
    ratingDescriptions: Record<string, Record<string, any>>,
    critsById: LookUpTable<IRubricCriterionData>
}

/**
 * Fill out the csv header and map criterion ids to sort index
 * Also create an object that maps criterion ids to an object mapping rating ids to descriptions
 * @param assignment
 * The assignment from canvas api
 * @returns {{critRatingDescs: *[], critsById: *[], critOrder: *[]}}
 */
export function getCriteriaInfo(assignment: IAssignmentData): CriteriaInfo | null {
    if (!assignment || !assignment.rubric) {
        return null;
    }
    const rubricCriteria = assignment.rubric;

    const order: LookUpTable<number> = {};
    const ratingDescriptions: Record<string, Record<string, any>> = {};
    const critsById: LookUpTable<IRubricCriterionData> = {};
    for (const critIndex in rubricCriteria) {
        const rubricCriterion: IRubricCriterionData = rubricCriteria[critIndex];
        order[rubricCriterion.id] = parseInt(critIndex);
        ratingDescriptions[rubricCriterion.id] = {};
        critsById[rubricCriterion.id] = rubricCriterion;

        for (const rating of rubricCriterion.ratings) {
            ratingDescriptions[rubricCriterion.id][rating.id] = rating.description;
        }
    }
    return {order, ratingDescriptions, critsById}
}

export function getInstructorName(instructors: IUserData[]) {
    if (instructors.length > 1) {
        return instructors.map((a: IUserData) => a.name).join(',');
    } else if (instructors.length === 0) {
        return 'No Instructor Found';
    } else {
        return instructors[0].name;
    }
}

export function getCritIdsAndAssessments(rubricAssessment: RubricAssessment | undefined | null, criteriaInfo?: CriteriaInfo | null) {
    const critAssessments = []
    const critIds = []
    if (rubricAssessment) {
        for (const [critKey, critValue] of Object.entries(rubricAssessment)) {
            const crit = {
                'id': critKey,
                'points': critValue.points,
                'rating': null
            }
            if (critValue.rating_id) {
                if (criteriaInfo?.ratingDescriptions && critKey in criteriaInfo.ratingDescriptions) {
                    crit.rating = criteriaInfo.ratingDescriptions[critKey][critValue.rating_id];
                } else {
                    console.warn('critKey not found ', critKey, criteriaInfo, rubricAssessment)
                }
            }
            critAssessments.push(crit);
            critIds.push(critKey);
        }
    }
    return [critIds, critAssessments] as [typeof critIds, typeof critAssessments]
}


type GetSubmissionBaseRowProps = {
    baseRow: Array<string|number|null|undefined>,
    enrollment: IEnrollmentData,
    modules: IModuleData[],
    assignmentsCollection: AssignmentsCollection,
    submission: CanvasData,
} & Partial<IGetRowsConfig>

export function getSubmissionBaseRow({
    baseRow,
    enrollment,
    assignmentsCollection,
    modules,
    submission
}: GetSubmissionBaseRowProps) {
    const {assignment} = submission;
    const {
        weekNumber,
        moduleName,
        numberInModule,
        type
    } = getModuleInfo(assignment, modules, assignmentsCollection);

    const {user} = enrollment;
    return [...baseRow,
        user.name,
        user.sis_user_id,
        enrollment.enrollment_state,
        weekNumber,
        moduleName,
        type,
        numberInModule,
        assignment.id,
        assignment.name,
        submission.workflow_state,
    ] as Array<string|number|null|undefined>;


}

export function submissionHeader(submissionBaseRow: Array<any>, submission: any, assignment: IAssignmentData, rubricId: string) {
    return [...submissionBaseRow,
        rubricId,
        'Total',
        'Total',
        submission.grade,
        assignment.points_possible

    ] as Array<string|number|null|undefined>
}


export function parseSubmissions(user: IUserData, userSubmissions: (IAssignmentSubmission[])  | { user_id: number, submissions: IAssignmentSubmission[] }[] ) {
    const singleUserSubmissions = userSubmissions.filter(a => a.user_id === user.id);
    if (singleUserSubmissions.length === 0) return [];

    const entry = singleUserSubmissions[0];
    if ('submissions' in entry) {
        return entry.submissions;
    } else {
        return [entry];
    }

}
