import { fetchJson, getCourseById, IContentHaver, PageKind } from "@ueu/ueu-canvas";
import { courseEvalTest } from "@publish/fixesAndUpdates/validations/courseContent/courseEvalTest";

jest.mock("@ueu/ueu-canvas", () => {
    const actual = jest.requireActual("@ueu/ueu-canvas");
    return {
        ...actual,
        getCourseById: jest.fn(),
        fetchJson: jest.fn(),
        // return the payload untouched so tests can inspect it
        formDataify: jest.fn((data) => data),
        PageKind: { ...actual.PageKind, post: jest.fn() },
    };
});

type CourseType = "undergrad" | "grad" | "ci" | "unknown";

function makeCourseObj({
    type = "undergrad",
    modules = [{ id: 5, name: "Module 5: Wrap Up" }],
}: { type?: CourseType; modules?: { id: number; name: string }[] } = {}) {
    return {
        isUndergrad: () => type === "undergrad",
        isGrad: () => type === "grad",
        isCareerInstitute: () => type === "ci",
        getModules: jest.fn().mockResolvedValue(modules),
    };
}

const course = { id: 123, getPages: jest.fn() } as unknown as IContentHaver;

const page = (name: string) => ({ name }) as any;
const resultWith = (count: number) =>
    ({ success: false, messages: [], userData: { evalPage: Array(count).fill(page("Course Evaluation")) } }) as any;

const lines = (result: any) => result.messages[0].bodyLines;

beforeEach(() => {
    jest.clearAllMocks();
    (PageKind.post as jest.Mock).mockResolvedValue({ title: "Course Evaluation", url: "course-evaluation" });
    (fetchJson as jest.Mock).mockResolvedValue({ id: 999 });
    (getCourseById as jest.Mock).mockResolvedValue(makeCourseObj());
});

describe("courseEvalTest.run", () => {
    it("succeeds when exactly one eval page exists", async () => {
        (course.getPages as jest.Mock).mockResolvedValue([page("Syllabus"), page("Course Evaluation")]);

        const result = await courseEvalTest.run(course);

        expect(result.success).toBe(true);
        expect(lines(result)).toEqual(["Course Evaluation page exists."]);
        expect(result.userData?.evalPage).toHaveLength(1);
    });

    it("matches the page name case-insensitively", async () => {
        (course.getPages as jest.Mock).mockResolvedValue([page("course evaluation")]);

        const result = await courseEvalTest.run(course);

        expect(result.success).toBe(true);
    });

    it("fails when there is no eval page", async () => {
        (course.getPages as jest.Mock).mockResolvedValue([page("Syllabus")]);

        const result = await courseEvalTest.run(course);

        expect(result.success).toBe(false);
        expect(lines(result)).toEqual(["No course evaluation page."]);
    });

    it("fails when there is more than one eval page", async () => {
        (course.getPages as jest.Mock).mockResolvedValue([page("Course Evaluation"), page("COURSE EVALUATION")]);

        const result = await courseEvalTest.run(course);

        expect(result.success).toBe(false);
        expect(lines(result)).toEqual(["More than one Course Evaluation page found. Attention needed."]);
    });
});

describe("courseEvalTest.fix", () => {
    it("does not run without a result", async () => {
        const result = await courseEvalTest.fix!(course, undefined);

        expect(result.success).toBe("not run");
        expect(PageKind.post).not.toHaveBeenCalled();
    });

    it("does not run when the result has no user data", async () => {
        const result = await courseEvalTest.fix!(course, { success: false, messages: [] } as any);

        expect(result.success).toBe("not run");
        expect(PageKind.post).not.toHaveBeenCalled();
    });

    it("does not run when an eval page already exists", async () => {
        const result = await courseEvalTest.fix!(course, resultWith(1));

        expect(result.success).toBe("not run");
        expect(PageKind.post).not.toHaveBeenCalled();
    });

    it("does not run when there is more than one eval page", async () => {
        const result = await courseEvalTest.fix!(course, resultWith(2));

        expect(result.success).toBe("not run");
        expect(lines(result)[0]).toContain("more than one evaluation page");
        expect(PageKind.post).not.toHaveBeenCalled();
    });

    it("does not run when the course type can't be determined", async () => {
        (getCourseById as jest.Mock).mockResolvedValue(makeCourseObj({ type: "unknown" }));

        const result = await courseEvalTest.fix!(course, resultWith(0));

        expect(result.success).toBe("not run");
        expect(PageKind.post).not.toHaveBeenCalled();
    });

    it("does not create a page when the final module is missing", async () => {
        (getCourseById as jest.Mock).mockResolvedValue(
            makeCourseObj({ modules: [{ id: 1, name: "Module 1" }] }),
        );

        const result = await courseEvalTest.fix!(course, resultWith(0));

        expect(result.success).toBe("not run");
        expect(lines(result)).toEqual(["No finalModule found."]);
        expect(PageKind.post).not.toHaveBeenCalled();
    });

    it("does not create a page when more than one module matches", async () => {
        (getCourseById as jest.Mock).mockResolvedValue(
            makeCourseObj({
                modules: [
                    { id: 5, name: "Module 5" },
                    { id: 6, name: "Module 5 Extras" },
                ],
            }),
        );

        const result = await courseEvalTest.fix!(course, resultWith(0));

        expect(result.success).toBe("not run");
        expect(lines(result)).toEqual(["More than 1 final module found"]);
        expect(PageKind.post).not.toHaveBeenCalled();
    });

    it("creates a published page and adds it to Module 5 for undergrad courses", async () => {
        const result = await courseEvalTest.fix!(course, resultWith(0));

        expect(PageKind.post).toHaveBeenCalledWith(
            123,
            expect.objectContaining({
                wiki_page: expect.objectContaining({ title: "Course Evaluation", published: true }),
            }),
        );
        expect(fetchJson).toHaveBeenCalledWith(
            "/api/v1/courses/123/modules/5/items",
            expect.objectContaining({
                fetchInit: expect.objectContaining({
                    method: "POST",
                    body: {
                        module_item: expect.objectContaining({
                            title: "Course Evaluation",
                            type: "Page",
                            page_url: "course-evaluation",
                        }),
                    },
                }),
            }),
        );
        expect(result.success).toBe(true);
        expect(lines(result)).toEqual(["Course Evaluation page created successfully."]);
    });

    it("uses Module 5 for career institute courses", async () => {
        (getCourseById as jest.Mock).mockResolvedValue(
            makeCourseObj({ type: "ci", modules: [{ id: 5, name: "Module 5" }, { id: 8, name: "Module 8" }] }),
        );

        await courseEvalTest.fix!(course, resultWith(0));

        expect((fetchJson as jest.Mock).mock.calls[0][0]).toBe("/api/v1/courses/123/modules/5/items");
    });

    it("uses Module 8 for grad courses", async () => {
        (getCourseById as jest.Mock).mockResolvedValue(
            makeCourseObj({ type: "grad", modules: [{ id: 5, name: "Module 5" }, { id: 8, name: "Module 8" }] }),
        );

        await courseEvalTest.fix!(course, resultWith(0));

        expect((fetchJson as jest.Mock).mock.calls[0][0]).toBe("/api/v1/courses/123/modules/8/items");
    });

    it("matches the module name case-insensitively", async () => {
        (getCourseById as jest.Mock).mockResolvedValue(
            makeCourseObj({ modules: [{ id: 7, name: "MODULE 5 - Final" }] }),
        );

        await courseEvalTest.fix!(course, resultWith(0));

        expect((fetchJson as jest.Mock).mock.calls[0][0]).toBe("/api/v1/courses/123/modules/7/items");
    });

    it("reports failure and skips the module call when page creation fails", async () => {
        (PageKind.post as jest.Mock).mockRejectedValue(new Error("Request failed with 400"));

        const result = await courseEvalTest.fix!(course, resultWith(0));

        expect(result.success).toBe(false);
        expect(lines(result)[0]).toContain("Failed to create Course Evaluation page");
        expect(lines(result)[0]).toContain("Request failed with 400");
        expect(fetchJson).not.toHaveBeenCalled();
    });

    it("tells the user to add the page manually when the module call fails", async () => {
        (fetchJson as jest.Mock).mockRejectedValue(new Error("Request failed with 500"));

        const result = await courseEvalTest.fix!(course, resultWith(0));

        expect(result.success).toBe(false);
        expect(lines(result)[0]).toContain("could not be added to Module 5: Wrap Up");
        expect(lines(result)[0]).toContain("Add it manually");
        expect(lines(result)[0]).toContain("Request failed with 500");
    });

    it("reports failure when the module response has no id", async () => {
        (fetchJson as jest.Mock).mockResolvedValue({});

        const result = await courseEvalTest.fix!(course, resultWith(0));

        expect(result.success).toBe(false);
    });
});
