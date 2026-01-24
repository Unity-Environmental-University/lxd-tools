import clearAllMocks = jest.clearAllMocks;

// TODO again, this is very similar to updateSupportPage test
const badUrl = "https://community.canvaslms.com/docs/DOC-1285";
const goodUrl = "https://community.instructure.com/en/kb/articles/662765-what-are-profile-settings";


jest.mock("@ueu/ueu-canvas", () => {
    return { DiscussionKind: {
        dataIsThisKind: jest.fn(),
        dataGenerator: jest.fn(),
        put: jest.fn(),
    }};
});
import { DiscussionKind } from "@ueu/ueu-canvas";
import { discussionTests } from "../discussionTests";
import {testResult} from "@publish/fixesAndUpdates/validations/utils";
import {mockDiscussionData} from "@ueu/ueu-canvas/src/content/__mocks__/mockContentData";
import {mockAsyncGen} from "@/__mocks__/utils";

const discussionKindMock = DiscussionKind as jest.Mocked<typeof DiscussionKind>;

describe('discussionTests', () => {
    beforeEach(() => {
        clearAllMocks();
    });

    it('should return failure when Introductions discussion is not found', async () => {
        (discussionKindMock.dataGenerator as jest.Mock).mockReturnValueOnce(mockAsyncGen([])); // TODO we repeat this code a lot...
        (discussionKindMock.dataIsThisKind as jest.Mock).mockReturnValue(false);

        const result = await discussionTests.run({id: 1});

        expect(result).toEqual(testResult('unknown', {
            notFailureMessage: "Introductions Discussion not found. ",
        }));
    });

    it('should return fail when Introductions Discussion has bad url', async () => {
        const _mockDiscussionData = {
            ...mockDiscussionData,
            message: `<div><a href="${badUrl}">Old profile guide link</a></div>`,
        };

        (discussionKindMock.dataGenerator as jest.Mock).mockReturnValueOnce(mockAsyncGen([_mockDiscussionData]));
        (discussionKindMock.dataIsThisKind as jest.Mock).mockReturnValue(true);

        const result = await discussionTests.run({id: 1});

        expect(result).toEqual(testResult(false, {
            failureMessage: `Discussion contains outdated link: ${badUrl}`, // TODO should this str be defined and exported in discussionTests to reduce magic stringness?
            userData: _mockDiscussionData
        }));

    });

    it('should return success when Introductions Discussion has good url', async () => {
        const _mockDiscussionData = {
            ...mockDiscussionData,
            message: `<div><a href="${goodUrl}">Old profile guide link</a></div>`,
        };

        (discussionKindMock.dataGenerator as jest.Mock).mockReturnValueOnce(mockAsyncGen([_mockDiscussionData]));
        (discussionKindMock.dataIsThisKind as jest.Mock).mockReturnValue(true);

        const result = await discussionTests.run({id: 1});

        expect(result).toEqual(testResult(true, {
            notFailureMessage: "Profile settings link is up to date.",
            userData: _mockDiscussionData
        }));
    });

    it('should correct bad url to good url', async () => {
        const _mockDiscussionData = {
            ...mockDiscussionData,
            message: `<div><a href="${badUrl}">Old profile guide link</a></div>`,
        };

        (discussionKindMock.dataGenerator as jest.Mock).mockReturnValueOnce(mockAsyncGen([_mockDiscussionData]));
        (discussionKindMock.dataIsThisKind as jest.Mock).mockReturnValue(true);

        const result = await discussionTests.run({id: 1});

        (discussionKindMock.put as jest.Mock).mockResolvedValue({
            ..._mockDiscussionData,
            body: `<div><a href="${goodUrl}">New profile guide link</a></div>`,
        });

        const fixResult = await discussionTests.fix({id: 1}, result);

        expect(fixResult).toEqual(testResult(true, {
            notFailureMessage: "profile guide link updated successfully.",
            userData: {
                ..._mockDiscussionData,
                body: `<div><a href="${goodUrl}">New profile guide link</a></div>`,
            }
        }));
    });


});

describe("discussionTests.run", () => {
    const course = {id: 42};

    beforeEach(() => {
        jest.resetAllMocks();
    });

    it("returns failure when the support page has no links", async () => {
        const _mockDiscussionData = {
            ...mockDiscussionData,
            message: `<div>no links waaaaa</div>`,
        };

        // TODO spyOn just seems like another way to do what we do with jest.Mock above?
        // Also hasn't it already been replaced by a mock becuase of jest.mock at the top of the file?
        jest.spyOn(DiscussionKind, "dataGenerator").mockReturnValueOnce(mockAsyncGen([_mockDiscussionData]));

        jest.spyOn(DiscussionKind, "dataIsThisKind").mockReturnValue(true);

        const result = await discussionTests.run(course);

        expect(result).toEqual(
            testResult(false, {
                failureMessage: "Discussion does not contain profile settings link.",
                userData: _mockDiscussionData
            })
        );
    });
});

// TODO I think more tests are needed to cover all paths thru discussionTests
// but this is a copy of updateSupportPage tests so maybe ok for now
// updateSupportPage tests have some strange stylistic choices I should probably address, here and there