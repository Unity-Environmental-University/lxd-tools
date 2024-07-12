/**
 *
 * @param {object} course
 * The course
 * @param {object} enrollment
 * The enrollment of the user to generate rows for
 * @param {array} modules
 * All modules in the course
 * @param {int} assignmentId
 * The ID of the assignment to retrieve data for, if any
 * @param {array} instructors
 * The instructors of the course
 * @param {array} userSubmissions
 * an object containing an array of user submissions { user_id, submissions: []}
 * OR just an array of all users submissions for a single assignment, if assignmentId is specified
 * @param {object} term
 * The term
 * @param {AssignmentsCollection} assignmentsCollection
 * The assignmentsCollection for assignments in this course
 * @returns {Promise<string[]>}
 */
import {ICourseData} from "@/canvas/courseTypes";
import {CanvasData, IEnrollmentData, IModuleData, IUserData, LookUpTable} from "@/canvas/canvasDataDefs";
import {AssignmentsCollection} from "@/ui/speedGrader/AssignmentsCollection";
import {ITermData} from "@/canvas/Term";
import {IRubricCriterionData} from "@/canvas/rubrics";
import {getModuleInfo} from "@/ui/speedGrader/modules";
import assert from "assert";

import {csvEncode} from "@/ui/speedGrader/exportAndRender/csvRowsForCourse";
import createUtilityClassName from "react-bootstrap/createUtilityClasses";
import {IAssignmentData} from "@/canvas/content/types";

interface IGetRowsConfig {
    course: ICourseData,
    enrollment: IEnrollmentData,
    modules: IModuleData[],
    userSubmissions: CanvasData[],
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
    const section: string | null = sectionMatch ? sectionMatch[1] : null;
    const baseCode = baseCodeMatch ? baseCodeMatch[1] : null;

    let instructorName = getInstructorName(instructors);
    const cachedInstructorName = instructorName;

    // Let's not actually do this if we can't find the user's submissions.

    const rows: (string | null | undefined)[][] = [];
    const baseRow = [
        term.name,
        cachedInstructorName,
        baseCode,
        section,

    ]
    const submissions = parseSubmissions(user, userSubmissions);
    for (let submission of submissions) {
        let {assignment} = submission;
        let rubricSettings;

        if (assignment.hasOwnProperty('rubric_settings')) {
            rubricSettings = assignment.rubric_settings;
        }
        let criteriaInfo = getCriteriaInfo(assignment);

        course_code.replace(/^(.*)_?(\[A-Za-z]{4}\d{3}).*$/, '$1$2')

        let {rubric_assessment: rubricAssessment} = submission;
        let rubricId = typeof (rubricSettings) !== 'undefined' && rubricSettings.hasOwnProperty('id') ?
            rubricSettings.id : 'No Rubric Settings';

        if (!user) continue;

        const [critIds, critAssessments] = getCritIdsAndAssessments(rubricAssessment, criteriaInfo);


        const submissionBaseRow = getSubmissionBaseRow({
            ...args,
            baseRow,
            submission,
        });

        rows.push(submissionHeader(submissionBaseRow, submission, assignment, rubricId));


        // Check for any criteria entries that might be missing; set them to null
        for (let critKey in criteriaInfo?.order) {
            if (!critIds.includes(critKey)) {
                critAssessments.push({'id': critKey, 'points': null, 'rating': null});
            }
        }
        // Sort into same order as column order
        let critOrder = criteriaInfo?.order;
        if (critOrder) {
            critAssessments.sort(function (a, b) {
                assert(critOrder);
                return critOrder[a.id] - critOrder[b.id];
            });
        }
        for (let critIndex in critAssessments) {
            let critAssessment = critAssessments[critIndex];
            let criterion = criteriaInfo?.critsById[critAssessment.id];

            rows.push(submissionBaseRow.concat([
                criterion ? criterion.id : critAssessment.id,
                Number(critIndex) + 1,
                criterion ? criterion.description : "-REMOVED-",
                critAssessment.points,
                criterion?.points
            ]));
        }

    }

    let out = [];
    for (let row of rows) {
        let row_string = row.map(item => csvEncode(item)).join(',') + '\n';
        out.push(row_string);
    }
    return out;
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
    let rubricCriteria = assignment.rubric;

    let order: LookUpTable<number> = {};
    let ratingDescriptions: Record<string, Record<string, any>> = {};
    let critsById: LookUpTable<IRubricCriterionData> = {};
    for (let critIndex in rubricCriteria) {
        let rubricCriterion: IRubricCriterionData = rubricCriteria[critIndex];
        order[rubricCriterion.id] = parseInt(critIndex);
        ratingDescriptions[rubricCriterion.id] = {};
        critsById[rubricCriterion.id] = rubricCriterion;

        for (let rating of rubricCriterion.ratings) {
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

export function getCritIdsAndAssessments(rubricAssessment: any, criteriaInfo?: CriteriaInfo | null) {
    let critAssessments = []
    let critIds = []
    if (rubricAssessment !== null) {
        for (let critKey in rubricAssessment) {
            let critValue = rubricAssessment[critKey];
            let crit = {
                'id': critKey,
                'points': critValue.points,
                'rating': null
            }
            if (critValue.rating_id) {
                if (criteriaInfo?.ratingDescriptions && critKey in criteriaInfo.ratingDescriptions) {
                    crit.rating = criteriaInfo.ratingDescriptions[critKey][critValue.rating_id];
                } else {
                    console.log('critKey not found ', critKey, criteriaInfo, rubricAssessment)
                }
            }
            critAssessments.push(crit);
            critIds.push(critKey);
        }
    }
    return [critIds, critAssessments] as [typeof critIds, typeof critAssessments]
}



type GetSubmissionBaseRowProps = {
    baseRow: Array<any>,
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
    ];


}

export function submissionHeader(submissionBaseRow: Array<any>, submission: any, assignment: IAssignmentData, rubricId: string) {
    return [...submissionBaseRow,
        rubricId,
        'Total',
        'Total',
        submission.grade,
        assignment.points_possible

    ]
}

export function parseSubmissions(user: IUserData, userSubmissions: CanvasData[]) {
    const singleUserSubmissions = userSubmissions.filter(a => a.user_id === user.id);
    if (singleUserSubmissions.length === 0) return [];
    let submissions;
    let entry = singleUserSubmissions[0];
    if (entry.hasOwnProperty('submissions')) {
        return entry.submissions;
    } else {
        return [entry];
    }

}
