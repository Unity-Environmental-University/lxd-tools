
import { Course } from "@/canvas/course/Course";
import PageKind from "@/canvas/content/pages/PageKind";
import { REFERENCES_PAGE_URL_NAME } from "@/publish/consts";
import getReferencesTemplate, { ReferenceExportType } from "@/canvas/course/references/getReferencesTemplate";
import assert from "assert";
import { testResult } from "@publish/fixesAndUpdates/validations/utils";
import {mockCourseData} from "@/canvas/course/__mocks__/mockCourseData";
import referencePageExistsValidation from "@/publish/fixesAndUpdates/validations/references/referencesPageExistsValidation";
import {mockPageData} from "@/canvas/content/__mocks__/mockContentData";

// Mock dependencies
jest.mock("@/canvas/content/pages/PageKind");
jest.mock("@/canvas/course/references/getReferencesTemplate");
jest.mock("assert");

describe("referencePageExistsValidation", () => {
    let courseMock: Course;

    beforeEach(() => {
        courseMock = new Course({ ...mockCourseData, id: 123})
        jest.clearAllMocks();
    });

    describe("run", () => {
        it("should return a successful test result when the references page exists", async () => {
            const pageDataMock = { ...mockPageData, id: "page1", title: "Learning Materials References" };
            (PageKind.getByString as jest.Mock).mockResolvedValueOnce(pageDataMock);

            const result = await referencePageExistsValidation.run(courseMock);

            expect(result.success).toBe(true);
            expect(result.userData).toBe(pageDataMock);
            expect(PageKind.getByString).toHaveBeenCalledWith(courseMock.id, REFERENCES_PAGE_URL_NAME);
        });

        it("should return a failure test result when the references page is not found", async () => {
            (PageKind.getByString as jest.Mock).mockResolvedValueOnce({message: 'page not found'});
            (PageKind.dataGenerator as jest.Mock).mockReturnValueOnce({
                next: jest.fn().mockResolvedValueOnce({ done: true }),
            });

            const result = await referencePageExistsValidation.run(courseMock);

            expect(result.success).toBe(false);
            expect(result.userData?.message).toBe('page not found');
            expect(result.messages.reduce((agg, current) => [...agg, ...current.bodyLines], [] as string[])).toContain("Learning Materials Page not found");
        });
    });

    describe("fix", () => {
        it("should return a 'not run' test result if the page already exists", async () => {
            const existingPageMock = { ...mockPageData, id: "page1", title: "Learning Materials References" };
            const previousResult = testResult(true, { userData: existingPageMock });

            const result = await referencePageExistsValidation.fix(courseMock, previousResult);

            expect(result.success).toBe("not run");
            expect(result.userData).toBe(existingPageMock);
            expect(PageKind.post).not.toHaveBeenCalled();
        });

        it("should create a new references page if it does not exist", async () => {
            const templateMock = { title: "Learning Materials References", body: "<p>References content</p>" };
            const newPageMock = { id: "page1", title: "Learning Materials References" };
            (getReferencesTemplate as jest.Mock).mockResolvedValueOnce(templateMock);
            (PageKind.post as jest.Mock).mockResolvedValueOnce(newPageMock);
            const refPageExistsRunSpy = jest.spyOn(referencePageExistsValidation, 'run');
            (refPageExistsRunSpy as jest.Mock).mockResolvedValueOnce(testResult(true, { userData: newPageMock }));

            const result = await referencePageExistsValidation.fix(courseMock);

            expect(getReferencesTemplate).toHaveBeenCalledWith(ReferenceExportType.pageData);
            expect(PageKind.post).toHaveBeenCalledWith(courseMock.id, {
                wiki_page: {
                    title: templateMock.title,
                    body: templateMock.body,
                    published: true,
                }
            });
            expect(result.success).toBe(true);
            expect(result.userData).toBe(newPageMock);
        });

        it("should throw an error if the page creation fails", async () => {
            const templateMock = { title: "Learning Materials References", body: "<p>References content</p>" };
            (getReferencesTemplate as jest.Mock).mockResolvedValueOnce(templateMock);
            (PageKind.post as jest.Mock).mockResolvedValueOnce(undefined);  // Simulate failure

            await expect(referencePageExistsValidation.fix(courseMock)).rejects.toThrow();

            expect(getReferencesTemplate).toHaveBeenCalledWith(ReferenceExportType.pageData);
            expect(PageKind.post).toHaveBeenCalledWith(courseMock.id, {
                wiki_page: {
                    title: templateMock.title,
                    body: templateMock.body,
                    published: true,
                }
            });
        });
    });
});

