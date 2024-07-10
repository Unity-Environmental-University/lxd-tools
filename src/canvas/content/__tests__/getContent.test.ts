import {Discussion, Page, Quiz} from '@/canvas/content/index';
import {Assignment} from "@/canvas/content/assignments";
import {getContentClassFromUrl, getContentItemFromUrl} from "@/canvas/content/getContent";
import assert from "assert";
import {mockAssignmentData} from "@/canvas/content/__mocks__/mockContentData";
import {fetchJson} from "@/canvas/fetch/fetchJson";

jest.mock('@/canvas/fetch/fetchJson', () => ({
    fetchJson: jest.fn(),
}))
describe('getContentClassFromUrl', () => {
    it('should return Assignment class when URL includes assignment', () => {
        const url = 'https://example.com/assignments';
        expect(getContentClassFromUrl(url)).toBe(Assignment);
    });

    it('should return Quiz class when URL includes quiz', () => {
        const url = 'https://example.com/quizzes';
        expect(getContentClassFromUrl(url)).toBe(Quiz);
    });

    it('should return Page class when URL includes page', () => {
        const url = 'https://example.com/pages';
        expect(getContentClassFromUrl(url)).toBe(Page);
    });

    it('should return Discussion class when URL includes discussion', () => {
        const url = 'https://example.com/discussion_topics';
        expect(getContentClassFromUrl(url)).toBe(Discussion);
    });

    it('should return null when URL does not match any class', () => {
        const url = 'https://example.com/unknown';
        expect(getContentClassFromUrl(url)).toBe(null);
    });
});

describe('getContentItemFromUrl', () => {
    const getContentApi = require('../getContent');
    const getContentClassFromUrlSpy = jest.spyOn(getContentApi, 'getContentClassFromUrl');

    it('should return null if getContentClassFromUrl returns null', async () => {
        const result = await getContentItemFromUrl('https://example.com');
        expect(result).toBe(null);
    });

    it('should call getAssignment from an assignment url', async () => {

        const url = 'https://example.com/assignments';
        const contentClass = getContentClassFromUrl(url);
        assert(contentClass !== null)
        const getAssignmentSpy = jest.spyOn(contentClass, 'getFromUrl');
        const assignment = await getContentItemFromUrl(url);
        (fetchJson as jest.Mock).mockResolvedValue(mockAssignmentData);
        expect(getAssignmentSpy).toHaveBeenCalledWith(url);

    });
});
