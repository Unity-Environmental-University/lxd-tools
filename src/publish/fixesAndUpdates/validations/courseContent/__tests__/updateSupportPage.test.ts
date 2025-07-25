import clearAllMocks = jest.clearAllMocks;


const badUrl = "https://online.unity.edu/support/";
const goodUrl = "https://unity.edu/distance-education/student-resources/";


jest.mock('@canvas/content/pages/PageKind', () => {
    return {
        getByString: jest.fn(),
        dataIsThisKind: jest.fn(),
        dataGenerator: jest.fn(),
        put: jest.fn(),
    };
});
import PageKind from "@canvas/content/pages/PageKind";
import {updateSupportPage} from "../updateSupportPage";
import {testResult} from "@publish/fixesAndUpdates/validations/utils";
import {mockPageData} from "@canvas/content/__mocks__/mockContentData";
import {mockAsyncGen} from "@/__mocks__/utils";
import pageKind from "@canvas/content/pages/PageKind";

const pageKindMock = PageKind as jest.Mocked<typeof PageKind>;

describe('updateSupportPage', () => {
    beforeEach(() => {
        clearAllMocks();
    });
    it('should return failure when support page is not found', async () => {
        pageKindMock.getByString.mockResolvedValue({message: "Support page not found"});
        pageKindMock.dataGenerator.mockReturnValueOnce(mockAsyncGen([]));
        const result = await updateSupportPage.run({ id: 1 });

        expect(result).toEqual(testResult('unknown',{
            notFailureMessage: "Support page not found",
            userData: undefined
        }));
    });

    it('should return fail when support page has bad url', async () => {
        const _mockPageData = {
            id: 1,
            ...mockPageData,
            body: `<div><a href="${badUrl}">Old support message</a></div>`,

        };

        pageKindMock.getByString.mockResolvedValue(_mockPageData);
        pageKindMock.dataIsThisKind.mockReturnValue(true);

        const result = await updateSupportPage.run({ id: 1 });

        expect(result).toEqual(testResult(false, {
            failureMessage: `Support page has link ${badUrl}`,
            userData: _mockPageData
        }));

    })
    it('should return success when support page has good url', async () => {
        const _mockPageData = {
            id: 1,
            ...mockPageData,
            body: `<div><a href="${goodUrl}">Updated support message</a></div>`,
        };

        pageKindMock.getByString.mockResolvedValue(_mockPageData);
        pageKindMock.dataGenerator.mockReturnValueOnce(mockAsyncGen([_mockPageData]));
        pageKindMock.dataIsThisKind.mockReturnValue(true);

        const result = await updateSupportPage.run({ id: 1 });

        expect(result).toEqual(testResult(true, {
            userData: _mockPageData
        }));
    });
    it('should fallback to page generator', async () => {
        const _mockPageData = {
            id: 1,
            ...mockPageData,
            body: `<div><a href="${goodUrl}">Updated support message</a></div>`,
        };

        pageKindMock.getByString.mockResolvedValue(_mockPageData);
        pageKindMock.dataIsThisKind.mockReturnValue(true);

        const result = await updateSupportPage.run({ id: 1 });

        expect(result).toEqual(testResult(true, {
            userData: _mockPageData
        }));
    });

    it('should correct bad url to good url', async () => {
        const _mockPageData = {
            id: 1,
            ...mockPageData,
            body: `<div><a href="${badUrl}">Support message</a></div>`,
        }
        pageKindMock.getByString.mockResolvedValue(_mockPageData);
        pageKindMock.dataIsThisKind.mockReturnValue(true);
        const result = await updateSupportPage.run({ id: 1 });
        pageKindMock.put.mockResolvedValue({
            ..._mockPageData,
            body: `<div><a href="${goodUrl}">Support message</a></div>`,
        });
        const fixResult = await updateSupportPage.fix({ id: 1 }, result);
        expect(fixResult).toEqual(testResult(true, {
            notFailureMessage: "Support page updated successfully.",
            userData: {
                ..._mockPageData,
                body: `<div><a href="${goodUrl}">Support message</a></div>`,
            }
        }));
    });


});

describe("updateSupportPage.run", () => {
  const course = { id: 42 };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("returns unknown when the support page has no links", async () => {
    const fakePage = {
      page_id: 123,
      body: "<div>No links on this page</div>",
    };

    // Mock getByString to return our fake page
    jest.spyOn(pageKind, "getByString").mockResolvedValue(fakePage as any);
    // Pretend that dataIsThisKind always recognizes our fakePage
    jest.spyOn(pageKind, "dataIsThisKind").mockReturnValue(true);

    const result = await updateSupportPage.run(course);

    expect(result).toEqual(
      testResult("unknown", {
        failureMessage: "Support page has no links",
        userData: fakePage,
      })
    );
  });
});