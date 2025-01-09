
import {
    getRubric,
    rubricApiUrl,
    getRubricsFetchUrl,
    rubricsForCourseGen,
    rubricAssociationUrl, updateRubricAssociation
} from "../rubrics";
import {returnMockAsyncGen} from "../../__mocks__/utils";
import mockRubric, {mockRubricAssociation, mockRubricsForAssignments} from "../__mocks__/mockRubricData";

import {deepObjectMerge, formDataify, renderAsyncGen} from "../canvasUtils";
import {getPagedDataGenerator} from "@/canvas/fetch/getPagedDataGenerator";
import {fetchJson} from "@/canvas/fetch/fetchJson";

import {RubricTypes} from "@/canvas";


jest.mock('../fetch/fetchJson', () => ({
    fetchJson: jest.fn(),
}))

jest.mock('../fetch/getPagedDataGenerator', () => ({
    getPagedDataGenerator: jest.fn(),
}))

jest.mock('../canvasUtils', () => ({
    ...jest.requireActual('../canvasUtils'),
    formDataify: jest.fn(),
}));

const pagedDataGenMock = getPagedDataGenerator as jest.Mock;
const fetchJsonMock = fetchJson as jest.Mock;

describe('rubricsForCourseGen', () => {
    beforeEach(() => {
        pagedDataGenMock.mockClear();
    })
    it('gets rubrics for a course', async () => {
        const mockRubrics = [{...mockRubric, id: 1}, {...mockRubric, id: 2}];
        const config = { fetchInit: {} };
        pagedDataGenMock.mockImplementation(returnMockAsyncGen(mockRubrics))
        const rubricGen = rubricsForCourseGen(0, {}, config);
        expect(await renderAsyncGen(rubricGen)).toEqual(mockRubrics);
        expect(pagedDataGenMock).toHaveBeenCalledWith(getRubricsFetchUrl(0), config);
    })

    it('includes associations when needed', async () => {
        const mockRubrics = mockRubricsForAssignments([0, 1, 2, 3], undefined, {});
        const mockWithAssociations = mockRubricsForAssignments([0, 1, 2, 3])
        const mockAssociations = mockWithAssociations.map(rubric => rubric.associations);
        const config = { fetchInit: {} };
        (getPagedDataGenerator as jest.Mock).mockImplementation(returnMockAsyncGen(mockRubrics))
        const rubricGen = rubricsForCourseGen(0, {include: ['associations']}, config);
        expect(pagedDataGenMock.mock.lastCall).toEqual([
            getRubricsFetchUrl(0), config
        ]);
        const mockRubricIterator = mockRubrics.values();
        const mockAssocIterator = mockAssociations.values();

        fetchJsonMock.mockImplementation(async(url, config) => {
            const rubric = mockRubricIterator.next().value;
            return {...rubric, associations: mockAssocIterator.next().value }
        })

        expect(await renderAsyncGen(rubricGen)).toEqual(mockWithAssociations);
    })
})

describe('getRubric', ()=> {
    beforeEach(() => {
        fetchJsonMock.mockClear();
    })

    it('calls with the correct parameters, returnValue', async() => {
        const [courseId, rubricId] = [1,2];
        const expectedUrl = rubricApiUrl(courseId, rubricId);
        fetchJsonMock.mockResolvedValue(mockRubric);
        const rubric = await getRubric(courseId, rubricId, {include: ["associations"]}, {fetchInit: {}});

        expect(fetchJsonMock.mock.lastCall).toEqual([
            expectedUrl,
            {
                fetchInit: {},
                queryParams: { include: ['associations']}
            }
        ])
        expect(rubric).toEqual(mockRubric);
    })
})



describe('rubricAssociationUrl', () => {
    it('should return the correct URL for given courseId and rubricAssociationId', () => {
        const courseId = 123;
        const rubricAssociationId = 456;
        const expectedUrl = `/api/v1/courses/${courseId}/rubric_associations/${rubricAssociationId}`;

        expect(rubricAssociationUrl(courseId, rubricAssociationId)).toBe(expectedUrl);
    });
});
// Mock dependencies

describe('updateRubricAssociation', () => {
    const courseId = 123;
    const rubricAssociationId = 456;
    const data = { id: 1, rubric_association: {} };
    const config = { fetchInit: {} };

    beforeEach(() => {
        fetchJsonMock.mockClear();
    });

    it('should call fetchJson with the correct URL and merged config', async () => {
        const mergedConfig = {
            fetchInit: {
                method: 'PUT',
                body: 'someFormData'
            }
        };

        (formDataify as jest.Mock).mockReturnValue('someFormData');
        fetchJsonMock.mockResolvedValue('response');

        const result = await updateRubricAssociation(courseId, rubricAssociationId, data, config);

        expect(formDataify).toHaveBeenCalledWith(data);
        expect(fetchJson).toHaveBeenCalledWith(`/api/v1/courses/${courseId}/rubric_associations/${rubricAssociationId}`, mergedConfig);
        expect(result).toBe('response');
    });
});