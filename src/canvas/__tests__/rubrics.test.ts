
import {getRubric, getRubricFetchUrl, getRubricsFetchUrl, IRubricData, rubricsForCourseGen} from "../rubrics";
import {mockAsyncGenerator} from "../../__mocks__/utils";
import mockRubric, {mockRubricsForAssignments} from "../__mocks__/mockRubricData";

import {fetchJson, getPagedDataGenerator, renderAsyncGen} from "../fetch";
import {deepObjectMerge} from "../canvasUtils";


jest.mock('../fetch', () => ({
    ...jest.requireActual('../fetch'),
    getPagedDataGenerator: jest.fn(),
    fetchJson: jest.fn(),
}))

const pagedDataGenMock = getPagedDataGenerator as jest.Mock;
const fetchJsonMock = fetchJson as jest.Mock;

describe('rubricsForCourseGen', () => {
    beforeEach(() => {
        pagedDataGenMock.mockClear();
    })
    it('gets rubrics for a course', async () => {
        const mockRubrics = [{...mockRubric, id: 1}, {...mockRubric, id: 2}];
        const config = { fetchInit: {} };
        pagedDataGenMock.mockImplementation(mockAsyncGenerator(mockRubrics))
        const rubricGen = rubricsForCourseGen(0, {}, config);
        expect(await renderAsyncGen(rubricGen)).toEqual(mockRubrics);
        expect(pagedDataGenMock).toHaveBeenCalledWith(getRubricsFetchUrl(0), config);
    })

    it('passes include options on to fetch', async () => {
        const mockRubrics = mockRubricsForAssignments([0, 1, 2, 3]);
        const config = { fetchInit: {} };
        (getPagedDataGenerator as jest.Mock).mockImplementation(mockAsyncGenerator(mockRubrics))
        const rubricGen = rubricsForCourseGen(0, {include: ['associations']}, config);
        expect(pagedDataGenMock.mock.lastCall).toEqual([
            getRubricsFetchUrl(0),
            { fetchInit: {}, queryParams: {include: ['associations']}}
        ]);

        expect(await renderAsyncGen(rubricGen)).toEqual(mockRubrics);
    })
})

describe('getRubric', ()=> {
    beforeEach(() => {
        fetchJsonMock.mockClear();
    })

    it('calls with the correct parameters, returnValue', async() => {
        const [courseId, rubricId] = [1,2];
        const expectedUrl = getRubricFetchUrl(courseId, rubricId);
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
