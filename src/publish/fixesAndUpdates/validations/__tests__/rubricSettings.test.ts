import {Course} from "@/canvas/course/Course";
import {mockCourseData} from "@/canvas/course/__mocks__/mockCourseData";
import {ICanvasCallConfig} from "@/canvas/canvasUtils";
import {CourseValidation, ValidationResult} from "../index";
import {rubricsTiedToGradesTest} from "../rubricSettings";
import mockRubricData, {mockRubricAssociation} from "@/canvas/__mocks__/mockRubricData";
import {returnMockAsyncGen} from "@/__mocks__/utils";
import {mockAssignmentData} from "@/canvas/content/__mocks__/mockContentData";

import * as rubricApi from "@/canvas/rubrics";
import * as assignmentApi from "@/canvas/content/assignments";
import {IRubricData} from "@/canvas/rubrics";
import assert from "assert";
import requireActual = jest.requireActual;
import {updateAssignmentData} from "@/canvas/content/assignments";


jest.mock('@/canvas/rubrics', () => {
    return {
        __esModule: true,
        rubricsForCourseGen: jest.fn(),
        updateRubricAssociation: jest.fn(),

    }
})

jest.mock('@/canvas/content/assignments', () => {
    return {
        __esModule: true,
        ...jest.requireActual('@/canvas/content/assignments'),
        assignmentDataGen: jest.fn(),
        getAssignmentData: jest.fn(),
        updateAssignmentData: jest.fn(),
    }
})



const rubricsForCourseGen = jest.spyOn(rubricApi, 'rubricsForCourseGen')
const updateRubricAssociation = jest.spyOn(rubricApi, 'updateRubricAssociation')
const assignmentDataGen = jest.spyOn(assignmentApi, 'assignmentDataGen')
const getAssignmentData = jest.spyOn(assignmentApi, 'getAssignmentData')

describe('rubrics are set to grade assignments', () => {
    let config: ICanvasCallConfig = {};

    it('passes when all rubrics are linked to grade their assignments', async () => {
        let validation = rubricsTiedToGradesTest;

        let course = new Course({...mockCourseData});
        rubricsForCourseGen.mockImplementation(
            returnMockAsyncGen<IRubricData>([{
                ...mockRubricData,
                associations: [
                    {...mockRubricAssociation, use_for_grading: true, association_id: 1},
                    {...mockRubricAssociation, use_for_grading: true, association_id: 2}
                ]
            }]));

        assignmentDataGen.mockImplementation(returnMockAsyncGen([mockAssignmentData]))

        let results = await validation.run(course);
        expect(results.success).toBe(true);
    })
    it('fails when at least one association is not used for grading', async () => {
        let validation = rubricsTiedToGradesTest;
        const assignmentData = {...mockAssignmentData, html_url: 'localhost:1234'}

        let course = new Course({...mockCourseData});
        rubricsForCourseGen.mockImplementation(
            returnMockAsyncGen<IRubricData>([{
                ...mockRubricData,
                associations: [
                    {...mockRubricAssociation, use_for_grading: true, association_id: 1},
                    {...mockRubricAssociation, use_for_grading: false, association_id: 2}
                ]
            }]));

        assignmentDataGen.mockImplementation(returnMockAsyncGen([assignmentData]))
        getAssignmentData.mockResolvedValue(assignmentData)

        let results = await validation.run(course);
        expect(results.success).toBe(false);
        const links = results.messages.reduce((links, message) => [...links, ...message.links ?? []], [] as string[])
        expect(links).toContain(assignmentData.html_url);
    })

    function runMockValidation<T, UserDataType>(course: T, validation: CourseValidation<T, UserDataType>) {
        rubricsForCourseGen.mockImplementation(
            returnMockAsyncGen<IRubricData>([{
                ...mockRubricData,
                associations: [
                    {...mockRubricAssociation, use_for_grading: true, association_id: 1},
                    {...mockRubricAssociation, use_for_grading: false, association_id: 2}
                ]
            }]));
        assignmentDataGen.mockImplementation(returnMockAsyncGen([mockAssignmentData]))
        getAssignmentData.mockResolvedValue(mockAssignmentData);
        return validation.run(course);

    }

    it('attempts fix', async () => {
        let validation = rubricsTiedToGradesTest;
        let course = new Course({...mockCourseData});
        let validationResult = await runMockValidation(course, validation);
        expect(validationResult.success).toBe(false);
        const {badAssociations} = validationResult.userData ?? {};
        expect(badAssociations).toHaveLength(1);
        assert(badAssociations && badAssociations.length > 0);
        assert(validation.fix);
        const updateRubricResolution = {...mockRubricAssociation};
        updateRubricAssociation.mockResolvedValue(updateRubricResolution);
        let fixResult = await validation.fix(course, validationResult);

        expect(fixResult.success).toBe(true);

        expect(updateRubricAssociation).toHaveBeenCalledWith(mockCourseData.id, mockRubricAssociation.id, {
            id: mockRubricAssociation.id,
            rubric_association: {
                use_for_grading: true
            }
        });

        expect(updateAssignmentData).toHaveBeenCalledWith(mockCourseData.id, mockAssignmentData.id, {
            assignment: {
                points_possible: mockRubricData.points_possible,
            }
        })
    })

})