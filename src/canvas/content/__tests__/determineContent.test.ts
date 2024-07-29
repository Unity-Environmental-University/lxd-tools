import {
    getContentClassFromUrl,
    getContentItemFromUrl,
    getContentKindFromContent,
    getContentKindFromUrl
} from "@/canvas/content/determineContent";
import assert from "assert";
import {
    mockAssignmentData,
    mockDiscussionData,
    mockPageData,
    mockQuizData
} from "@/canvas/content/__mocks__/mockContentData";
import {fetchJson} from "@/canvas/fetch/fetchJson";
import {Quiz} from "@/canvas/content/quizzes/Quiz";
import {Page} from "@/canvas/content/assignments/pages/Page";
import {Discussion} from "@/canvas/content/discussions/Discussion";
import {Assignment} from "@/canvas/content/assignments/Assignment";
import {AssignmentKind} from "@/canvas/content/assignments/AssignmentKind";
import {QuizKind} from "@/canvas/content/quizzes/QuizKind";
import {PageKind} from "@/canvas/content/assignments/pages/PageKind";
import {DiscussionKind} from "@/canvas/content/discussions/DiscussionKind";

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
    const getContentApi = require('../determineContent');
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
        expect(getContentKindFromUrl('/api/v1/courses/1/assignments/5')).toEqual(AssignmentKind)
    })
    it('Finds Discussions', () => {
        expect(getContentKindFromUrl('/api/v1/courses/1/discussion_topics/5')).toEqual(DiscussionKind)
    })
    it('Finds Quizzes', () => {
        expect(getContentKindFromUrl('/api/v1/courses/1/quizzes/5')).toEqual(QuizKind)
    })
    it('Finds Pages', () => {
        expect(getContentKindFromUrl('/api/v1/courses/1/pages/5')).toEqual(PageKind)
    })

})

describe('getContentKindFromContent', () => {
    it('works for pages', () => expect(getContentKindFromContent(mockPageData)).toBe(PageKind))
    it('works for discussions', () => expect(getContentKindFromContent(mockDiscussionData)).toBe(DiscussionKind))
    it('works for assignments', () => expect(getContentKindFromContent(mockAssignmentData)).toBe(AssignmentKind))
    it('works for quizzes', () => expect(getContentKindFromContent(mockQuizData)).toBe(QuizKind))
})