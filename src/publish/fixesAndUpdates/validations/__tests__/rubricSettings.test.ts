import {Course} from "../../../../canvas/course/Course";
import {mockCourseData} from "../../../../canvas/course/__mocks__/mockCourseData";
import {ICanvasCallConfig} from "../../../../canvas/canvasUtils";
import {CourseValidation} from "../index";
import {rubricsTiedToGradesTest} from "../rubricSettings";
import mockRubricData, {mockRubricAssociation} from "../../../../canvas/__mocks__/mockRubricData";
import {mockAsyncGenerator} from "../../../../__mocks__/utils";
import {mockAssignmentData} from "../../../../canvas/content/__mocks__/mockContentData";


jest.mock('../../../../canvas/rubrics', () => {
    return {
        __esModule: true,
        rubricsForCourseGen: jest.fn(),
    }
})

jest.mock('../../../../canvas/content', () => {
    return {
        __esModule: true,
        assignmentDataGen: jest.fn(),
        getAssignmentData: jest.fn(),
    }
})

import * as rubricApi  from "../../../../canvas/rubrics";
import * as contentApi from "../../../../canvas/content";
import {IRubricData} from "../../../../canvas/rubrics";
import mock = jest.mock;


const rubricsForCourseGen = jest.spyOn(rubricApi, 'rubricsForCourseGen')
const assignmentDataGen = jest.spyOn(contentApi, 'assignmentDataGen')
const getAssignmentData = jest.spyOn(contentApi, 'getAssignmentData')

describe('rubrics are set to grade assignments', () => {
    let config:ICanvasCallConfig = {};

    it('passes when all rubrics are linked to grade their assignments', async () => {
        let validation:CourseValidation = rubricsTiedToGradesTest;

        let course = new Course({...mockCourseData});
        rubricsForCourseGen.mockImplementation(
            mockAsyncGenerator<IRubricData>([{
            ...mockRubricData,
            associations: [
                {...mockRubricAssociation, use_for_grading: true, association_id: 1},
                {...mockRubricAssociation, use_for_grading: true, association_id: 2}
            ]
        }]));

        assignmentDataGen.mockImplementation(mockAsyncGenerator([mockAssignmentData]))

        let results = await validation.run(course);
        expect(results.success).toBe(true);
    })
    it('fails when at least one association is not used for grading', async () => {
        let validation:CourseValidation = rubricsTiedToGradesTest;
        const assignmentData = {...mockAssignmentData, html_url: 'localhost:1234'}

        let course = new Course({...mockCourseData});
        rubricsForCourseGen.mockImplementation(
            mockAsyncGenerator<IRubricData>([{
            ...mockRubricData,
            associations: [
                {...mockRubricAssociation, use_for_grading: true, association_id: 1},
                {...mockRubricAssociation, use_for_grading: false, association_id: 2}
            ]
        }]));

        assignmentDataGen.mockImplementation(mockAsyncGenerator([assignmentData]))
        getAssignmentData.mockResolvedValue(assignmentData)

        let results = await validation.run(course);
        expect(results.success).toBe(false);
        const links = results.messages.reduce((links, message) => [...links, ...message.links ?? []], [] as string[])
        expect(links).toContain(assignmentData.html_url);
    })

})