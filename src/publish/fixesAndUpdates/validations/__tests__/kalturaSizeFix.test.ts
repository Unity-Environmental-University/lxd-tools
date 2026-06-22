jest.mock('@ueu/ueu-canvas/fetch/getPagedDataGenerator', () => ({
    getPagedDataGenerator: jest.fn(),
}));
jest.mock('@ueu/ueu-canvas/fetch/fetchJson');
jest.mock('@ueu/ueu-canvas/canvasUtils', () => ({
    formDataify: jest.fn((data) => data),
}));

import { kalturaSizeTests } from "../kalturaSizeFix";
import { getPagedDataGenerator } from "@ueu/ueu-canvas/fetch/getPagedDataGenerator";
import { fetchJson } from "@ueu/ueu-canvas/fetch/fetchJson";
import { formDataify } from "@ueu/ueu-canvas/canvasUtils";
import { mockAsyncGen } from "@/__mocks__/utils";

const mockGetPagedDataGenerator = getPagedDataGenerator as jest.Mock;
const mockFetchJson = fetchJson as jest.Mock;
const mockFormDataify = formDataify as jest.Mock;

const BASE = 'https://unity-canvas.kaf.kaltura.com/browseandembed/index/media/entryid/1_abc123/showDescription/false/';
const badKalturaUrl  = `${BASE}playerSize/608x342/playerSkin/53829012/`;
const goodKalturaUrl = `${BASE}playerSize/960x540/playerSkin/53829012/`;

const badItem  = { id: 101, url: badKalturaUrl };
const goodItem = { id: 102, url: goodKalturaUrl };
const nonKalturaItem = { id: 103, url: 'https://other-lti.example.com/tool/playerSize/608x342/embed' };

const course = { id: 42 };

beforeEach(() => {
    jest.resetAllMocks();
    mockFetchJson.mockResolvedValue({ id: 0 });
    mockFormDataify.mockImplementation((data) => data);
});

describe('kalturaSizeTests.run', () => {
    it('returns success when no LTI items have the old Kaltura size', async () => {
        mockGetPagedDataGenerator.mockReturnValue(mockAsyncGen([goodItem]));
        const result = await kalturaSizeTests.run(course);
        expect(result.success).toBe(true);
    });

    it('returns failure and userData when a Kaltura item has the old size', async () => {
        mockGetPagedDataGenerator.mockReturnValue(mockAsyncGen([badItem]));
        const result = await kalturaSizeTests.run(course);
        expect(result.success).toBe(false);
        expect(result.userData).toEqual([badItem]);
    });

    it('returns success when there are no LTI items', async () => {
        mockGetPagedDataGenerator.mockReturnValue(mockAsyncGen([]));
        const result = await kalturaSizeTests.run(course);
        expect(result.success).toBe(true);
    });

    it('does not flag non-Kaltura items that match the size pattern', async () => {
        mockGetPagedDataGenerator.mockReturnValue(mockAsyncGen([nonKalturaItem]));
        const result = await kalturaSizeTests.run(course);
        expect(result.success).toBe(true);
    });

    it('handles mixed items, flagging only bad Kaltura ones', async () => {
        mockGetPagedDataGenerator.mockReturnValue(mockAsyncGen([badItem, goodItem, nonKalturaItem]));
        const result = await kalturaSizeTests.run(course);
        expect(result.success).toBe(false);
        expect(result.userData).toEqual([badItem]);
    });

    it('calls getPagedDataGenerator with the correct endpoint', async () => {
        mockGetPagedDataGenerator.mockReturnValue(mockAsyncGen([]));
        await kalturaSizeTests.run(course);
        expect(mockGetPagedDataGenerator).toHaveBeenCalledWith(`/api/v1/courses/${course.id}/lti_resource_links`);
    });

    it('returns unknown when the generator throws', async () => {
        mockGetPagedDataGenerator.mockImplementation(() => { throw new Error('Network error'); });
        const result = await kalturaSizeTests.run(course);
        expect(result.success).toBe('unknown');
    });
});

describe('kalturaSizeTests.fix', () => {
    it('returns success when there are no bad items in the result', async () => {
        const result = await kalturaSizeTests.fix(course, { success: true, messages: [], userData: undefined });
        expect(result.success).toBe(true);
        expect(mockFetchJson).not.toHaveBeenCalled();
    });

    it('rewrites playerSize segment and calls PUT on the correct endpoint', async () => {
        await kalturaSizeTests.fix(course, { success: false, messages: [], userData: [badItem] });
        expect(mockFetchJson).toHaveBeenCalledWith(
            `/api/v1/courses/${course.id}/lti_resource_links/${badItem.id}`,
            expect.objectContaining({ fetchInit: expect.objectContaining({ method: 'PUT' }) })
        );
        expect(mockFormDataify).toHaveBeenCalledWith({ url: goodKalturaUrl });
    });

    it('returns success when all updates succeed', async () => {
        const result = await kalturaSizeTests.fix(course, { success: false, messages: [], userData: [badItem] });
        expect(result.success).toBe(true);
    });

    it('returns failure with missed count when an update throws', async () => {
        mockFetchJson.mockRejectedValue(new Error('API error'));
        const result = await kalturaSizeTests.fix(course, { success: false, messages: [], userData: [badItem] });
        expect(result.success).toBe(false);
    });

    it('returns failure when the API response contains errors', async () => {
        mockFetchJson.mockResolvedValue({ errors: [{ message: 'Not found' }] });
        const result = await kalturaSizeTests.fix(course, { success: false, messages: [], userData: [badItem] });
        expect(result.success).toBe(false);
    });

    it('counts partial success correctly across multiple items', async () => {
        const badItem2 = { id: 202, url: badKalturaUrl };
        mockFetchJson
            .mockResolvedValueOnce({ id: 0 })
            .mockRejectedValueOnce(new Error('API error'));
        const result = await kalturaSizeTests.fix(course, {
            success: false, messages: [], userData: [badItem, badItem2],
        });
        expect(result.success).toBe(false);
    });

    it('skips items whose URL cannot be split and counts them as missed', async () => {
        const malformedItem = { id: 999, url: 'https://unity-canvas.kaf.kaltura.com/playerSize-608x342-embed' };
        const result = await kalturaSizeTests.fix(course, { success: false, messages: [], userData: [malformedItem] });
        expect(result.success).toBe(false);
        expect(mockFetchJson).not.toHaveBeenCalled();
    });

    it('re-runs validation when no result is provided', async () => {
        mockGetPagedDataGenerator.mockReturnValue(mockAsyncGen([]));
        await kalturaSizeTests.fix(course);
        expect(mockGetPagedDataGenerator).toHaveBeenCalled();
    });
});
