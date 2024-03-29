import "./speedGrader.scss"
import {Modal, Col, Row, Card, Button} from "react-bootstrap";
import {Assignment, Course, Term} from "../../canvas/index";
import React, {useEffect, useState} from "react";
import DatePicker from "react-datepicker"

import assert from "assert";
import {
    IAssignmentData,
    ICanvasData,
    ICourseData, IDiscussionData,
    IEnrollmentData,
    IModuleData, IModuleItemData, IRubricCriterion, ITermData,
    IUserData, LookUpTable, ModuleItemType
} from "../../canvas/canvasDataDefs";
import {text} from "node:stream/consumers";


const MAX_SECTION_SLICE_SIZE = 5; //The number of sections to query data for at once.

let fileHeader = [
    'Term', 'Instructor', 'Class', 'Section', 'Student Name', 'Student Id', 'Enrollment State',
    'Week Number', 'Module', 'Assignment Type', 'Assignment Number', 'Assignment Id', 'Assignment Title',
    'Submission Status', 'Rubric Id', 'Rubric Line', 'Line Name', 'Score', 'Max Score',
].join(',');
fileHeader += '\n';


function ExportApp() {
    const urlParams = new URLSearchParams(window.location.search);
    const assignmentId = urlParams.get('assignment_id');

    const [course, setCourse] = useState<Course | null>();
    const [assignment, setAssignment] = useState<Assignment | null>()
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [canClose, setCanClose] = useState<boolean>(false);
    const [message, setMessage] = useState<string>('Error');
    const [header, setHeader] = useState<string>('Alert');
    const [multiTermModal, setMultiTermModal] = useState<boolean>(false);

    useEffect(() => {
        async function getCourseAndAssignment() {
            if (!course) {
                const course = await Course.getFromUrl();
                setCourse(course);
            }
            if (!assignment) {
                assert(course);
                const assignment = assignmentId ? (await Assignment.getById(parseInt(assignmentId), course)) as Assignment : null;
                setAssignment(assignment);
            }
        }

        getCourseAndAssignment().then();
    }, [course]);

    function popUp(text: string, header: string = "Alert", closeButton: boolean = false) {
        setMessage(text);
        setHeader(header);
        setCanClose(closeButton);
        setModalOpen(true)
    }

    function popClose() {
        setModalOpen(false);
    }

    function showError(event: ErrorEvent) {
        popUp(event.message, "Error", true);
        window.removeEventListener("error", showError);
    }

    async function exportData(course: Course, assignment: Assignment | null = null) {

        try {
            window.addEventListener("error", showError);
            let csvRows = await csvRowsForCourse(course, assignment)
            let filename = assignment ? assignment?.name : course.fullCourseCode;
            filename ??= "COURSE CODE NOT FOUND"
            saveDataGenFunc()(csvRows, `Rubric Scores ${filename.replace(/[^a-zA-Z 0-9]+/g, '')}.csv`);
            window.removeEventListener("error", showError);

        } catch (e) {
            popClose();
            popUp(`ERROR ${e} while retrieving assignment data from Canvas. Please refresh and try again.`, "OK");
            window.removeEventListener("error", showError);
            throw (e);
        }
    }

    return (course && (<>
        <button id="export_one_btn" onClick={async (event) => {
            event.preventDefault();
            if (!course) return;
            console.log(`Export ${assignment?.name}`)
            popUp("Exporting scores, please wait...", "Exporting");

            await exportData(course, assignment);
            popClose();
            return false;
        }}>Rubrics:Assignment
        </button>
        <button id="export_all_btn" disabled={!course} onClick={async (event) => {
            if (!course) return;
            popUp("Exporting scores, please wait...", "Exporting");
            event.preventDefault();
            await exportData(course);
            popClose();
        }}>Rubrics:Section
        </button>
        <button id="all_sections" onClick={async (event) => {
            event.preventDefault();
            popUp("Exporting scores, please wait...", "Exporting");
            await exportSectionsInTerm(course);
            popClose();

        }}>Rubrics:Term
        </button>
        <button onClick={(event) => {
            setMultiTermModal(true);
            event.preventDefault();
            return false
        }}>...
        </button>

        <ModalDialog canClose={canClose} show={modalOpen} header={header} message={message}>
        </ModalDialog>
        <DateRangeExportDialog
            show={multiTermModal}
            course={course}
            handleHide={() => setMultiTermModal(false)}
            handleShow={() => setMultiTermModal(true)}
            onExporting={() => {
                popUp("Exporting")
            }}
            onFinishedExporting={() => {
                console.log("Finished Exporting")
                popClose();
            }}
        ></DateRangeExportDialog>
    </>))
}

interface IDateRangeExportProps {
    course: Course,
    show: boolean,
    handleShow: () => void,
    handleHide: () => void,
    onExporting: () => void,
    onFinishedExporting: () => void
}

function DateRangeExportDialog({
                                   course, show,
                                   handleShow, handleHide,
                                   onExporting, onFinishedExporting
                               }: IDateRangeExportProps) {

    const [exportStart, setExportStart] = useState<Date | null>(new Date());
    const [exportEnd, setExportEnd] = useState<Date | null>(new Date);
    const colWidth = 'sm-6';

    return (<Modal show={show} onHide={handleHide} onShow={handleShow}>
        <Modal.Title>Export Range of Sections</Modal.Title>
        <Modal.Body>
            <Row>
                <Col className={colWidth}>
                    <Card>
                        <Card.Title>Start Date</Card.Title>
                        <Card.Body>
                            <DatePicker selected={exportStart} onChange={(date) => setExportStart(date)}></DatePicker>
                        </Card.Body>
                    </Card>
                </Col>
                <Col className={colWidth}>
                    <Card>
                        <Card.Title>End Date</Card.Title>
                        <Card.Body>
                            <DatePicker selected={exportEnd} onChange={(date) => setExportEnd(date)}></DatePicker>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Modal.Body>
        <Modal.Footer>
            <Button onClick={async (e) => {
                e.stopPropagation();
                console.log("Exporting courses...")
                onExporting();
                handleHide();
                let sections = await Course.getAllByCode(course.baseCode, null, {
                    queryParams: {
                        starts_before: exportEnd,
                        ends_after: exportStart,
                        published: true,
                        by_subaccounts: [course.termId],
                        with_enrollments: true,
                    }
                });

                sections ??= [];
                sections.sort((a: Course, b: Course) => {
                    return b.start.getTime() - a.start.getTime();
                })
                const allSectionRows: string[] = sections ? await getRowsForSections(sections) : [];

                console.log("Writing Final Output Document...")
                saveDataGenFunc()(allSectionRows,
                    `${course.baseCode}-${exportStart?.toUTCString()}-${exportEnd?.toUTCString()}.csv`);
                onFinishedExporting();
                return allSectionRows;
            }}>Export Date Range</Button>
        </Modal.Footer>
    </Modal>)
}

function ModalDialog(props: {
    show: boolean,
    canClose: boolean,
    header: string,
    message: string
}) {
    const {show, canClose, message, header} = props;

    return (<>
        <Modal show={show}>
            <Modal.Header closeButton={canClose}>
                <Modal.Title>{header}</Modal.Title>
            </Modal.Header>
            <Modal.Body>{message}</Modal.Body>
        </Modal>
    </>)
}



function saveDataGenFunc() {
    let a = document.createElement("a");
    document.body.appendChild(a);
    a.setAttribute('display', 'none');
    return function (textArray: string[], fileName: string, type = 'text') {
        textArray = [...textArray];
        textArray.unshift(fileHeader)
        let blob = new Blob(textArray, {type: type}),
            url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
    };
}

async function exportSectionsInTerm(course: Course | null = null, term: Term | number | null = null) {

    course ??= await Course.getFromUrl();
    assert(course)
    if (typeof term === "number") {
        term = await Term.getTermById(term);
    } else {
        term ??= await course?.getTerm();
    }

    assert(term);
    assert(course);

    let sections = await Course.getAllByCode(course.baseCode, term);
    const allSectionRows: string[] = sections ? await getRowsForSections(sections) : [];

    console.log("Writing Final Output Document...")
    saveDataGenFunc()(allSectionRows, `${term.name} ${course.baseCode} All Sections.csv`);
    return allSectionRows;
}

async function getRowsForSections(sections: Course[], sectionsAtATime = MAX_SECTION_SLICE_SIZE) {
    const allSectionRows: string[] = [];
    let sectionsLeftToProcess = sections.slice(0);
    while (sectionsLeftToProcess.length > 0) {
        const sliceToProcessNow = sectionsLeftToProcess.slice(0, sectionsAtATime);
        sectionsLeftToProcess = sectionsLeftToProcess.slice(sectionsAtATime);
        const rowsOfRows = await Promise.all(sliceToProcessNow.map(async (section) => {
            const sectionRows = await csvRowsForCourse(section);
            saveDataGenFunc()(sectionRows, `Rubric Scores ${section.fullCourseCode}.csv`);
            return sectionRows;
        }))
        for (let rowSet of rowsOfRows) {
            for (let row of rowSet) {
                allSectionRows.push(row);
            }
        }
    }
    return allSectionRows;
}

async function csvRowsForCourse(course: Course, assignment: Assignment | null = null) {
    let csvRows: string[] = [];
    const courseId = course.id;
    const courseData = course.rawData as ICourseData;

    const accounts = await getAllPagesAsync(`/api/v1/accounts/${courseData.account_id}`);
    const account = accounts[0];
    const rootAccountId = account.root_account_id;

    const baseSubmissionsUrl = assignment ? `/api/v1/courses/${courseId}/assignments/${assignment.id}/submissions` : `/api/v1/courses/${courseId}/students/submissions`;
    const userSubmissions = await getAllPagesAsync(`${baseSubmissionsUrl}?student_ids=all&per_page=5&include[]=rubric_assessment&include[]=assignment&include[]=user&grouped=true`) as IUserData[];
    const assignments = await course.getAssignments();
    const instructors = await getAllPagesAsync(`/api/v1/courses/${courseId}/users?enrollment_type=teacher`) as IUserData[];
    const modules = await getAllPagesAsync(`/api/v1/courses/${courseId}/modules?include[]=items&include[]=content_details`) as IModuleData[];
    const enrollments = await getAllPagesAsync(`/api/v1/courses/${courseId}/enrollments?per_page=5`) as IEnrollmentData[];

    const termsResponse = await fetch(`/api/v1/accounts/${rootAccountId}/terms/${courseData.enrollment_term_id}`);
    const term = await termsResponse.json();
    const assignmentsCollection = new AssignmentsCollection(
        assignments.map(assignment => assignment.rawData as IAssignmentData));


    for (let enrollment of enrollments) {
        let out_rows = await getRows({
            enrollment,
            modules,
            userSubmissions,
            term,
            course: courseData,
            instructors,
            assignmentsCollection,
        });

        csvRows = csvRows.concat(out_rows);
    }
    return csvRows;
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
                           term
                       }: IGetRowsConfig) {
    const {user} = enrollment;
    const singleUserSubmissions = userSubmissions.filter(a => a.user_id === user.id);
    const {course_code} = course;
    const sectionMatch = course_code.match(/-\s*(\d+)$/);
    const baseCodeMatch = course_code.match(/([a-zA-Z]{4}\d{3})/);
    const section: string | null = sectionMatch ? sectionMatch[1] : null;
    const baseCode = baseCodeMatch ? baseCodeMatch[1] : null;

    let instructorName
    if (instructors.length > 1) {
        instructorName = instructors.map((a: IUserData) => a.name).join(',');
    } else if (instructors.length === 0) {
        instructorName = 'No Instructor Found';
    } else {
        instructorName = instructors[0].name;
    }
    const cachedInstructorName = instructorName;
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

    const rows: (string | null | undefined)[][] = [];
    const baseRow = [
        term.name,
        cachedInstructorName,
        baseCode,
        section,

    ]

    for (let submission of submissions) {
        let {assignment} = submission;
        let rubricSettings;

        if (assignment.hasOwnProperty('rubric_settings')) {
            rubricSettings = assignment.rubric_settings;
        }
        let criteriaInfo = getCriteriaInfo(assignment);


        course_code.replace(/^(.*)_?(\[A-Za-z]{4}\d{3}).*$/, '$1$2')
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
                            console.log('critKey not found ', critKey, criteriaInfo, rubricAssessment)
                        }
                    }
                    critAssessments.push(crit);
                    critIds.push(critKey);
                }
            }
            const submissionBaseRow = baseRow.concat([
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
    }

    let out = [];
    for (let row of rows) {
        let row_string = row.map(item => csvEncode(item)).join(',') + '\n';
        out.push(row_string);
    }
    return out;
}

// escape commas and quotes for CSV formatting
function csvEncode(string: | null | undefined | string) {

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
        let weekNumber = !match ? null : parseInt(match[1]);
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
            weekNumber: weekNumber == null ? '-' : weekNumber,
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
        if (assignmentsCollection.getModuleItemType(moduleItem) !== type) {
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

        if (type === 'Discussion' && !moduleItemAssignment?.hasOwnProperty('rubric')) {
            continue;
        }

        count++;
    }
}


interface CriteriaInfo {
    order: LookUpTable<number>,
    ratingDescriptions: Record<string, Record<string, any>>,
    critsById: LookUpTable<IRubricCriterion>
}

/**
 * Fill out the csv header and map criterion ids to sort index
 * Also create an object that maps criterion ids to an object mapping rating ids to descriptions
 * @param assignment
 * The assignment from canvas api
 * @returns {{critRatingDescs: *[], critsById: *[], critOrder: *[]}}
 */
function getCriteriaInfo(assignment: IAssignmentData): CriteriaInfo | null {
    if (!assignment || !assignment.hasOwnProperty('rubric')) {
        return null;
    }
    let rubricCriteria = assignment.rubric;

    let order: LookUpTable<number> = {};
    let ratingDescriptions: Record<string, Record<string, any>> = {};
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


async function getAllPagesAsync(url: string) {
    return getRemainingPagesAsync(url, []);
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
        if (contentItem.hasOwnProperty('submission_types')) {
            if (contentItem.submission_types.includes('external_tool')) {
                return 'ExternalTool'
            }
        }
        if (contentItem.hasOwnProperty('discussion_topic')) {
            return 'Discussion'
        }
        if (contentItem.hasOwnProperty('quiz_id')) {
            return 'Quiz'
        }
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

// @ts-ignore
export default ExportApp