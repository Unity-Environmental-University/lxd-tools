
import {fetchJson} from "@/canvas/fetch/fetchJson";
import {getPagedDataGenerator} from "@/canvas/fetch/getPagedDataGenerator";
import {IPageData} from "@/canvas/content/pages/types";
import {mockDiscussionData, mockPageData} from "@/canvas/content/__mocks__/mockContentData";
import PageKind, {GetPageOptions, SavePageOptions} from "@/canvas/content/pages/PageKind";

// Mock dependencies
jest.mock("@/canvas/fetch/fetchJson");
jest.mock("@/canvas/fetch/getPagedDataGenerator");

describe("PageKind", () => {
    const courseId = 123;
    const pageId = 456;
    const contentId = "sample-page";
    const mockConfig: GetPageOptions | SavePageOptions = {};

    const localMockPageData: IPageData = {
        ...mockPageData,
        id: pageId,
        title: "Sample Page",
        body: "This is a sample page.",
        page_id: pageId,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return true for dataIsThisKind when data contains page_id", () => {
        expect(PageKind.dataIsThisKind(localMockPageData)).toBe(true);
    });

    it("should return false for dataIsThisKind when data does not contain page_id", () => {
        const data = { name: "Sample Page", body: "No ID here", ...mockDiscussionData };
        expect(PageKind.dataIsThisKind(data)).toBe(false);
    });

    it("should return the correct name of the page", () => {
        expect(PageKind.getName(localMockPageData)).toBe(localMockPageData.title);
    });

    it("should return the correct body of the page", () => {
        expect(PageKind.getBody(localMockPageData)).toBe(localMockPageData.body);
    });

    it("should return the correct id of the page", () => {
        expect(PageKind.getId(localMockPageData)).toBe(localMockPageData.id);
    });

    it("should fetch page data using get function", async () => {
        (fetchJson as jest.Mock).mockResolvedValue(localMockPageData);

        const result = await PageKind.get(pageId, courseId, mockConfig);

        expect(fetchJson).toHaveBeenCalledWith(PageKind.getApiUrl(courseId, pageId), mockConfig);
        expect(result).toBe(localMockPageData);
    });

    it("should fetch page data using getByString function", async () => {
        (fetchJson as jest.Mock).mockResolvedValue(localMockPageData);

        const result = await PageKind.getByString(courseId, contentId, mockConfig);
        expect(result).toBe(localMockPageData);
    });

    it("should generate paged data using dataGenerator function", async () => {
        const mockGenerator = jest.fn();
        (getPagedDataGenerator as jest.Mock).mockReturnValue(mockGenerator);

        const result = PageKind.dataGenerator(courseId, mockConfig);

        expect(getPagedDataGenerator).toHaveBeenCalledWith(PageKind.getAllApiUrl(courseId), mockConfig);
        expect(result).toBe(mockGenerator);
    });

    it("should call putContentFunc when put is called", async () => {
        const mockPutResponse = { success: true };
        (fetchJson as jest.Mock).mockResolvedValue(mockPutResponse);

        const result = await PageKind.put(courseId, pageId, localMockPageData);


        expect(result).toBe(mockPutResponse);
    });
});
