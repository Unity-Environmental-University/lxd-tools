import {AssignmentKind, assignmentUrlFuncs} from "@/canvas/content/assignments/AssignmentKind";
import {mockAssignmentData, mockDiscussionData} from "@/canvas/content/__mocks__/mockContentData";
import {getDataTests, kindUrlTests} from "@/canvas/content/__testingUtils__/utils";
import {DiscussionKind, discussionUrlFuncs} from "@/canvas/content/discussions/DiscussionKind";

jest.mock('@/canvas/fetch/fetchJson')
jest.mock('@/canvas/fetch/getPagedDataGenerator')
describe('DiscussionKind', () => {
    it('getId works', () => expect(DiscussionKind.getId({...mockDiscussionData, id: 100})).toEqual(100))
    it('getName works', () => expect(DiscussionKind.getName({
        ...mockDiscussionData,
        title: "Discussion"
    })).toEqual('Discussion'))
    it('getBody works', () => expect(DiscussionKind.getBody({
        ...mockDiscussionData,
        message: "<p>Instructions</p>"
    })).toEqual("<p>Instructions</p>"))

    describe('get Data Tests', getDataTests(DiscussionKind, [
        {...mockDiscussionData, id: 1},
    ], { title: "x" }));

})


describe('DiscussionUrlFuncs', kindUrlTests(discussionUrlFuncs,
    1, 3,
    '/api/v1/courses/1/discussion_topics/3',
    '/courses/1/discussion_topics/3',
    '/api/v1/courses/1/discussion_topics'
))
