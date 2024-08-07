import {Assignment, AssignmentKindInfo} from "@/canvas/content/Assignment";
import {getContentClassFromUrl, getContentItemFromUrl, getContentKindFromUrl} from "@/canvas/content/contentFromUrl";
import assert from "assert";
import {mockAssignmentData} from "@/canvas/content/__mocks__/mockContentData";
import {fetchJson} from "@/canvas/fetch/fetchJson";
import {Quiz, QuizKindInfo} from "@/canvas/content/Quiz";
import {Page, PageKindInfo} from "@/canvas/content/Page";
import {Discussion, DiscussionKindInfo} from "@/canvas/content/Discussion";

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
    const getContentApi = require('../contentFromUrl');
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


describe('getContentKindFromUrl', () => {
    it('Finds Assignments', () => {
        console.log(getContentKindFromUrl('/api/v1/courses/1/assignments/5'));
        expect(getContentKindFromUrl('/api/v1/courses/1/assignments/5')).toEqual(AssignmentKindInfo)
    })
    it('Finds Discussions', () => {
        expect(getContentKindFromUrl('/api/v1/courses/1/discussion_topics/5')).toEqual(DiscussionKindInfo)
    })
    it('Finds Quizzes', () => {
        expect(getContentKindFromUrl('/api/v1/courses/1/quizzes/5')).toEqual(QuizKindInfo)
    })
    it('Finds Pages', () => {
        expect(getContentKindFromUrl('/api/v1/courses/1/pages/5')).toEqual(PageKindInfo)
    })

})