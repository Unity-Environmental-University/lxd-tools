// This implementation modified from https://github.com/UCBoulder/canvas-userscripts

import {
    Dict,
    IAssignmentData,
    ICanvasData,
    IRubricCriterion,
    ICourseData,
    IModuleData,
    LookUpTable,
    ModuleItemType, IEnrollmentData, IUserData, ITermData, IDiscussionData, IModuleItemData
} from "../../canvas/canvasDataDefs";
import assert from "assert";
import React from "react";
import {createRoot} from "react-dom/client";



let header = [
    'Term', 'Instructor', 'Class', 'Section', 'Student Name', 'Student Id', 'Enrollment State',
    'Week Number', 'Module', 'Assignment Type', 'Assignment Number', 'Assignment Id', 'Assignment Title',
    'Submission Status', 'Rubric Id', 'Rubric Line', 'Line Name', 'Score', 'Max Score',
].join(',');
header += '\n';





let modalDialog = createModalDialog();
function main() {
    'use strict';
    // utility function for downloading a file
    let exportButtonContainer = document.querySelector('#gradebook_header div.statsMetric');
    if (!exportButtonContainer) return;

    let exportOneButton = document.createElement('button');
    exportOneButton.innerText = "Export Assignment";
    exportOneButton.id = "export_one_rubric_btn";
    exportOneButton.addEventListener('click', async (event: MouseEvent) => {
        event.preventDefault();
        await exportData(true);
        return false;

    });
    exportButtonContainer?.append(exportOneButton);

    let exportAllButton = document.createElement('button');
    exportAllButton.innerText = "Export All Assignments";
    exportAllButton.id = "export_all_rubric_btn";
    exportAllButton.addEventListener('click', async (event: MouseEvent) => {
        event.preventDefault();
        await exportData(true);
        return false;

    });
    exportButtonContainer?.append(exportAllButton);
}

function createModalDialog() {
    let body = document.querySelector('body');
    assert(body);
    let infoDialog = document.createElement('dialog');
    infoDialog.innerHTML = '<p>Hello There</p>'
    body.appendChild(infoDialog);
    return infoDialog;

}

function saveTestGenFunc() {
    let a = document.createElement("a");
    document.body.appendChild(a);
    a.setAttribute('display', 'none');
    return function (textArray: string[], fileName: string, type = 'text') {
        let blob = new Blob(textArray, {type: type}),
            url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
    };
}

async function exportData(singleAssignment = false) {

    try {
        popUp("Exporting scores, please wait...");
        window.addEventListener("error", showError);


        // Get some initial data from the current URL
        const urlParams = window.location.href.split('?')[1].split('&');
        const courseId = window.location.href.split('/')[4];

        let courseResponse = await fetch(`/api/v1/courses/${courseId}?include=term`)
        let course = await courseResponse.json()

        let accounts = await getAllPagesAsync(`/api/v1/accounts/${course.account_id}`);
        let account = accounts[0];
        let rootAccountId = account.root_account_id;
        const assignId = urlParams.find(i => i.split('=')[0] === "assignment_id")?.split('=')[1];
        let assignRequest = await fetch(`/api/v1/courses/${courseId}/assignments/${assignId}`);
        let assignment = await assignRequest.json() as IAssignmentData;
        let assignments = await getAllPagesAsync(`/api/v1/courses/${courseId}/assignments`) as IAssignmentData[];
        let baseSubmissionsUrl = singleAssignment ? `/api/v1/courses/${courseId}/assignments/${assignId}/submissions` : `/api/v1/courses/${courseId}/students/submissions`;
        let userSubmissions = await getAllPagesAsync(`${baseSubmissionsUrl}?student_ids=all&per_page=100&include[]=rubric_assessment&include[]=assignment&include[]=user&grouped=true`);

        let instructors = await getAllPagesAsync(`/api/v1/courses/${courseId}/users?enrollment_type=teacher`) as IUserData[];
        let modules = await getAllPagesAsync(`/api/v1/courses/${courseId}/modules?include[]=items&include[]=content_details`) as IModuleData[];
        let enrollments = await getAllPagesAsync(`/api/v1/courses/${courseId}/enrollments?per_page=100`) as IEnrollmentData[];

        let response = await fetch(`/api/v1/accounts/${rootAccountId}/terms/${course.enrollment_term_id}`);
        let term = await response.json();

        let assignmentsCollection = new AssignmentsCollection(assignments);

        let csvRows = [header];
        for (let enrollment of enrollments) {
            let out_rows = await getRows({
                enrollment,
                modules,
                userSubmissions,
                term,
                course,
                instructors,
                assignmentsCollection,
            });

            csvRows = csvRows.concat(out_rows);
        }
        popClose();
        let filename = singleAssignment ? assignment.name : course.course_code;
        saveTestGenFunc()(csvRows, `Rubric Scores ${filename.replace(/[^a-zA-Z 0-9]+/g, '')}.csv`);
        saveTestGenFunc()([JSON.stringify(userSubmissions, null, 2)], `User Submissions ${filename.replace(/[^a-zA-Z 0-9]+/g, '')}.json`);

        window.removeEventListener("error", showError);

    } catch (e) {
        popClose();
        popUp(`ERROR ${e} while retrieving assignment data from Canvas. Please refresh and try again.`);
        window.removeEventListener("error", showError);
        throw (e);
    }
}

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

interface IGetRowsConfig {
    course: ICourseData,
    enrollment: IEnrollmentData,
    modules: IModuleData[],
    userSubmissions: ICanvasData[],
    assignmentsCollection: AssignmentsCollection,
    instructors: IUserData[],
    term: ITermData
}

async function getRows({
    course,
    enrollment,
    modules,
    userSubmissions,
    assignmentsCollection,
    instructors,
    term}: IGetRowsConfig) {
    let {user} = enrollment;
    let singleUserSubmissions = userSubmissions.filter(a => a.user_id === user.id);
    const {course_code} = course;
    let section = course_code.match(/-\s*(\d+)$/);
    let base_code = course_code.match(/([a-zA-Z]{4}\d{3})/);
    if (section) {
        section = section[1];
    }
    if (base_code) {
        base_code = base_code[1]
    }

    let instructorName

    if (instructors.length > 1) {
        instructorName = instructors.map((a: IUserData) => a.name).join(',');
    } else if (instructors.length === 0) {
        instructorName = 'No Instructor Found';
    } else {
        instructorName = instructors[0].name;
    }
    // Let's not actually do this if we can't find the user's submissions.
    if (singleUserSubmissions.length === 0) {
        return [];
    }

    let submissions;
    let entry = singleUserSubmissions[0];
    if (entry.hasOwnProperty('submissions')) {
        submissions = entry.submissions;
    } else {
        submissions = [entry];
    }

    const rows = [];
    let baseRow = [
        term.name,
        instructorName,
        base_code,
        section,

    ]

    for (let submission of submissions) {
        let {assignment} = submission;
        let rubricSettings;

        if (assignment.hasOwnProperty('rubric_settings')) {
            rubricSettings = assignment.rubric_settings;
        }
        let criteriaInfo = getCriteriaInfo(assignment);


        course_code.replace(/^.*_?(\[A-Za-z]{4}\d{3}).*$/, /\1\2/)
        let moduleInfo = getModuleInfo(assignment, modules, assignmentsCollection);
        assert(moduleInfo);
        let {weekNumber, moduleName, numberInModule, type} = moduleInfo;
        let {rubric_assessment: rubricAssessment} = submission;
        let rubricId = typeof (rubricSettings) !== 'undefined' && rubricSettings.hasOwnProperty('id') ?
            rubricSettings.id : 'No Rubric Settings';

        if (user) {
            // Add criteria scores and ratings
            // Need to turn rubric_assessment object into an array
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
                            console.log('critKey not found ', critKey, criteriaInfo)
                        }
                    }
                    critAssessments.push(crit);
                    critIds.push(critKey);
                }
            }
            let submissionBaseRow = baseRow.concat([
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
            ]);

            rows.push(submissionBaseRow.concat([
                rubricId,
                'Total',
                'Total',
                submission.grade,
                assignment.points_possible

            ]))

            // Check for any criteria entries that might be missing; set them to null
            for (let critKey in criteriaInfo?.order) {
                if (!critIds.includes(critKey)) {
                    critAssessments.push({'id': critKey, 'points': null, 'rating': null});
                }
            }
            // Sort into same order as column order
            let critOrder = criteriaInfo?.order;
            if(critOrder) {
                critAssessments.sort(function (a, b) {
                    assert(critOrder);
                    return critOrder[a.id] - critOrder[b.id];
                });
            }
            for (let critIndex in critAssessments) {
                let critAssessment = critAssessments[critIndex];
                let criterion = criteriaInfo?.critsById[critAssessment.id];
                assert(criterion);

                rows.push(submissionBaseRow.concat([
                    criterion.id,
                    Number(critIndex) + 1,
                    criterion.description,
                    critAssessment.points,
                    criterion.points
                ]));
            }
        }
    }

    let out = [];
    for (let row of rows) {
        let row_string = row.map(item => csvEncode(item)).join(',') + '\n';
        out.push(row_string);
    }
    return out;
}

// escape commas and quotes for CSV formatting
function csvEncode(string: string) {

    if (typeof (string) === 'undefined' || string === null || string === 'null') {
        return '';
    }
    string = String(string);

    if (string) {
        string = string.replace(/(")/g, '"$1');
        string = string.replace(/\s*\n\s*/g, ' ');
    }
    return `"${string}"`;
}

function showError(event: ErrorEvent) {
    popUp(event.message);
    window.removeEventListener("error", showError);
}

interface IModuleInfo {
    weekNumber: number | string,
    moduleName: string,
    numberInModule: number,
    type: string
}

function getModuleInfo(contentItem: ICanvasData, modules: IModuleData[], assignmentsCollection: AssignmentsCollection): IModuleInfo | null {
    const regex = /(week|module) (\d+)/i;

    for (let module of modules) {
        let match = module.name.match(regex);
        let weekNumber = !match? null : parseInt(match[1]);
        if (!weekNumber) {
            for (let moduleItem of module.items) {
                if (!moduleItem.hasOwnProperty('title')) {
                    continue;
                }
                let match = moduleItem.title.match(regex);
                if (match) {
                    weekNumber = parseInt(match[2]);
                }
            }
        }

        let moduleItem = getItemInModule(contentItem, module, assignmentsCollection);
        if (!moduleItem) {
            continue;
        }
        return {
            weekNumber: weekNumber == null? '-' : weekNumber,
            moduleName: module.name,
            type: moduleItem.type,
            numberInModule: moduleItem.numberInModule
        }
    }
    return null
}


function getItemInModule(contentItem: ICanvasData, module: IModuleData, assignmentsCollection: AssignmentsCollection) {

    let contentId;
    let type: ModuleItemType = assignmentsCollection.getAssignmentContentType(contentItem);
    if (type === 'Discussion') {
        contentId = contentItem.discussion_topic.id;
    } else if (type === 'Quiz') {
        contentId = contentItem.quiz_id;
    } else {
        contentId = contentItem.id;
    }

    let count = 1;
    for (let moduleItem of module.items) {

        let moduleItemAssignment = assignmentsCollection.getContentById(moduleItem.content_id);
        if (assignmentsCollection.getModuleItemType(moduleItem) !== type){
          continue;
        }

        if (moduleItem.content_id === contentId) {
            if (type === 'Discussion' && !contentItem.hasOwnProperty('rubric')) {
                moduleItem.numberInModule = '-';
            } else {
                moduleItem.numberInModule = count;
            }
            moduleItem.type = type;
            return moduleItem;
        }

        if (type === 'Discussion' && !moduleItemAssignment?.hasOwnProperty('rubric')){
            continue;
        }

        count++;
    }
}



interface CriteriaInfo {
    order: LookUpTable<number>,
    ratingDescriptions : LookUpTable<Dict>,
    critsById: LookUpTable<IRubricCriterion>
}
/**
 * Fill out the csv header and map criterion ids to sort index
 * Also create an object that maps criterion ids to an object mapping rating ids to descriptions
 * @param assignment
 * The assignment from canvas api
 * @returns {{critRatingDescs: *[], critsById: *[], critOrder: *[]}}
 */
function getCriteriaInfo(assignment:IAssignmentData): CriteriaInfo| null {
    if (!assignment || !assignment.hasOwnProperty('rubric')) {
        return null;
    }
    let rubricCriteria = assignment.rubric;

    let order: LookUpTable<number> = {};
    let ratingDescriptions: LookUpTable<Dict> = {};
    let critsById: LookUpTable<IRubricCriterion> = {};
    for (let critIndex in rubricCriteria) {
        let rubricCriterion: IRubricCriterion = rubricCriteria[critIndex];
        order[rubricCriterion.id] = parseInt(critIndex);
        ratingDescriptions[rubricCriterion.id] = {};
        critsById[rubricCriterion.id] = rubricCriterion;

        for (let rating of rubricCriterion.ratings) {
            ratingDescriptions[rubricCriterion.id][rating.id] = rating.description;
        }
    }
    return {order, ratingDescriptions, critsById}
}

function popUp(text:string) {
    modalDialog.innerHTML = `<p>${text}</p>`;
    modalDialog.showModal();
}

function popClose() {
    modalDialog.close()

}

async function getAllPagesAsync(url: string) {
    return await getRemainingPagesAsync(url, []);
}

async function getRemainingPagesAsync(url: string, listSoFar: ICanvasData[]) {
    let response = await fetch(url);
    let responseList = await response.json();
    let headers = response.headers;

    let nextLink;
    if (headers.has('link')) {
        let linkStr = headers.get('link');
        assert(linkStr);
        let links = linkStr.split(',');
        nextLink = null;
        for (let link of links) {
            if (link.split(';')[1].includes('rel="next"')) {
                nextLink = link.split(';')[0].slice(1, -1);
            }
        }
    }
    if (nextLink == null) {
        return listSoFar.concat(responseList);
    } else {
        return await getRemainingPagesAsync(nextLink, listSoFar.concat(responseList));
    }
}

/**
 * A collection of assignments grabbed from the submissions that returns and finds them in various ways
 */
class AssignmentsCollection {
    public assignmentsById: LookUpTable<IAssignmentData>;
    public discussions: IDiscussionData[];
    public discussionsById: LookUpTable<IDiscussionData>;
    public assignmentsByDiscussionId: LookUpTable<IAssignmentData>;
    public assignmentsByQuizId: LookUpTable<IAssignmentData>;
    constructor(assignments: IAssignmentData[]) {
        this.assignmentsById = {}
        for (let assignment of assignments) {
            this.assignmentsById[assignment.id] = assignment;
        }

        this.discussions = assignments.filter(assignment => assignment.hasOwnProperty('discussion_topic'))
            .map(function (assignment) {
                let discussion = assignment.discussion_topic;
                discussion.assignment = assignment;
                return discussion;
            });

        this.discussionsById = {};
        this.assignmentsByDiscussionId = {};
        for (let discussion of this.discussions) {
            this.discussionsById[discussion.id] = discussion;
            this.assignmentsByDiscussionId[discussion.id] = discussion.assignment;

        }

        this.assignmentsByQuizId = {};
        for (let assignment of assignments.filter(a => a.hasOwnProperty('quiz_id'))) {
            this.assignmentsByQuizId[assignment.quiz_id] = assignment;
        }
    }

    /**
     * Gets content by id
     * @param id the primary id of that content item (not necessarily the assignment Id)
     * The content_id property that it would have were it in a module
     * @returns {*}
     */
    getContentById(id: number): any {
        for (let collection of [
            this.assignmentsByQuizId,
            this.assignmentsByDiscussionId,
            this.assignmentsById
        ]) {
            if (collection.hasOwnProperty(id)) {
                return collection[id];
            }
        }
    }



    /**
     * Returns content type as a string if it is an Assignment, Quiz, or Discussion
     * @param contentItem
     * the content item
     * @returns {string}
     */
    getAssignmentContentType(contentItem: ICanvasData): ModuleItemType {
        if(contentItem.hasOwnProperty('submission_types')) {
            if (contentItem.submission_types.includes('external_tool')) { return 'ExternalTool'}
        }
        if(contentItem.hasOwnProperty('discussion_topic')) { return 'Discussion'}
        if(contentItem.hasOwnProperty('quiz_id')) { return 'Quiz'}
        let id = contentItem?.id;

        if (this.assignmentsByQuizId.hasOwnProperty(id)) {
            return "Quiz";
        } else if (this.assignmentsByDiscussionId.hasOwnProperty(id)) {
            return 'Discussion';
        } else {
            return 'Assignment';
        }
    }

    getModuleItemType(moduleItem: IModuleItemData) {
        if (moduleItem.type !== 'Assignment') return moduleItem.type;
        const assignment = this.assignmentsById[moduleItem.content_id];
        return this.getAssignmentContentType(assignment);
    }
}

main();