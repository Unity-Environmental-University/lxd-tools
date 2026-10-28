import { Course, PageKind } from "@ueu/ueu-canvas";
import { homepageButtonsTest } from "@publish/fixesAndUpdates/validations/courseContent/homepageButtonsTest";

jest.mock("@ueu/ueu-canvas", () => {
    const actual = jest.requireActual("@ueu/ueu-canvas");
    return {
        ...actual,
        PageKind: { ...actual.PageKind, put: jest.fn() },
    };
});

const BEGIN_BUTTON = '<div class="scaffold-media-box cbt-button"><a href="#">Begin Course</a></div>';
const INSTRUCTOR_BUTTON = '<div class="scaffold-media-box cbt-button"><a href="#">Contact Your Instructor</a></div>';

const BANNER = '<div class="scaffold-media-box cbt-banner cbt-image-banner cbt-home-banner"><div class="cbt-banner-inner"><h1>Ecoliteracy</h1></div></div>';
const INSTRUCTOR_SECTION = '<div class="scaffold-media-box cbt-content"><h2>Meet Your Instructor!</h2></div>';

function homepageBody({ buttons = true }: { buttons?: boolean } = {}) {
    return [BANNER, buttons ? `<div>${BEGIN_BUTTON}${INSTRUCTOR_BUTTON}</div>` : "", INSTRUCTOR_SECTION]
        .filter(Boolean)
        .join("\n");
}

function makeCourse({
    undergrad = true,
    pages = [],
    id = 123,
}: { undergrad?: boolean; pages?: { id: number; title: string; body: string }[]; id?: number } = {}) {
    return {
        id,
        isUndergrad: () => undergrad,
        getPages: jest.fn().mockResolvedValue(pages),
    } as unknown as Course;
}

const homePage = (body: string) => ({ id: 42, title: "Home", body });

beforeEach(() => {
    jest.clearAllMocks();
});

describe("homepageButtonsTest.run", () => {
    it("requests page bodies so the homepage body is available", async () => {
        const course = makeCourse({ pages: [homePage(homepageBody())] });

        await homepageButtonsTest.run(course);

        expect(course.getPages).toHaveBeenCalledWith({ queryParams: { include: ["body"] } });
    });

    it("does not run for non-undergrad courses", async () => {
        const course = makeCourse({ undergrad: false, pages: [homePage(homepageBody())] });

        const result = await homepageButtonsTest.run(course);

        expect(result.success).toBe("not run");
        expect(course.getPages).not.toHaveBeenCalled();
    });

    it("succeeds when both buttons are on the homepage", async () => {
        const course = makeCourse({ pages: [homePage(homepageBody())] });

        const result = await homepageButtonsTest.run(course);

        expect(result.success).toBe(true);
        expect(result.messages[0].bodyLines).toEqual(["Buttons found on homepage."]);
    });

    it("fails when both buttons are missing", async () => {
        const course = makeCourse({ pages: [homePage(homepageBody({ buttons: false }))] });

        const result = await homepageButtonsTest.run(course);

        expect(result.success).toBe(false);
        expect(result.messages[0].bodyLines).toEqual(["Buttons don't exist on homepage."]);
    });

    it("fails when only the Begin Course button is present", async () => {
        const body = `${BANNER}<div>${BEGIN_BUTTON}</div>`;
        const course = makeCourse({ pages: [homePage(body)] });

        const result = await homepageButtonsTest.run(course);

        expect(result.success).toBe(false);
    });

    it("fails when only the Contact Your Instructor button is present", async () => {
        const body = `${BANNER}<div>${INSTRUCTOR_BUTTON}</div>`;
        const course = makeCourse({ pages: [homePage(body)] });

        const result = await homepageButtonsTest.run(course);

        expect(result.success).toBe(false);
    });

    it("looks at the Home page and ignores other pages", async () => {
        const course = makeCourse({
            pages: [
                { id: 1, title: "Syllabus", body: homepageBody() },
                homePage(homepageBody({ buttons: false })),
            ],
        });

        const result = await homepageButtonsTest.run(course);

        expect(result.success).toBe(false);
        expect(result.userData?.homepage.id).toBe(42);
    });

    it("returns the homepage and its body as userData", async () => {
        const body = homepageBody();
        const course = makeCourse({ pages: [homePage(body)] });

        const result = await homepageButtonsTest.run(course);

        expect(result.userData).toEqual({ homepage: homePage(body), homepageBody: body });
    });
});

describe("homepageButtonsTest.fix", () => {
    it("does not run for non-undergrad courses", async () => {
        const course = makeCourse({ undergrad: false });

        const result = await homepageButtonsTest.fix(course, {
            success: false,
            messages: [],
            userData: { homepage: homePage(""), homepageBody: "" },
        });

        expect(result.success).toBe("not run");
        expect(PageKind.put).not.toHaveBeenCalled();
    });

    it("does not run when there is no test result", async () => {
        const course = makeCourse();

        const result = await homepageButtonsTest.fix(course, undefined);

        expect(result.success).toBe("not run");
        expect(PageKind.put).not.toHaveBeenCalled();
    });

    it("does not run when the test passed", async () => {
        const course = makeCourse();

        const result = await homepageButtonsTest.fix(course, {
            success: true,
            messages: [],
            userData: { homepage: homePage(""), homepageBody: "" },
        });

        expect(result.success).toBe("not run");
        expect(PageKind.put).not.toHaveBeenCalled();
    });

    it("does not run when the test result has no userData", async () => {
        const course = makeCourse();

        const result = await homepageButtonsTest.fix(course, { success: false, messages: [] });

        expect(result.success).toBe("not run");
        expect(PageKind.put).not.toHaveBeenCalled();
    });

    it("places the buttons directly after the home banner", async () => {
        (PageKind.put as jest.Mock).mockResolvedValue({ page_id: 42 });
        const course = makeCourse({ id: 123 });
        const body = homepageBody({ buttons: false });

        await homepageButtonsTest.fix(course, {
            success: false,
            messages: [],
            userData: { homepage: homePage(body), homepageBody: body },
        });

        const [, , payload] = (PageKind.put as jest.Mock).mock.calls[0];
        const saved: string = payload.wiki_page.body;
        const doc = new DOMParser().parseFromString(saved, "text/html");
        const banner = doc.querySelector(".cbt-home-banner");

        expect(banner?.nextElementSibling?.textContent).toContain("Begin Course");
        expect(banner?.nextElementSibling?.textContent).toContain("Contact Your Instructor");
        expect(saved.indexOf("Begin Course")).toBeGreaterThan(saved.indexOf("cbt-home-banner"));
        expect(saved.indexOf("Meet Your Instructor!")).toBeGreaterThan(saved.indexOf("Contact Your Instructor"));
    });

    it("keeps the rest of the homepage content", async () => {
        (PageKind.put as jest.Mock).mockResolvedValue({ page_id: 42 });
        const course = makeCourse();
        const body = homepageBody({ buttons: false });

        await homepageButtonsTest.fix(course, {
            success: false,
            messages: [],
            userData: { homepage: homePage(body), homepageBody: body },
        });

        const saved: string = (PageKind.put as jest.Mock).mock.calls[0][2].wiki_page.body;
        expect(saved).toContain("Ecoliteracy");
        expect(saved).toContain("Meet Your Instructor!");
    });

    it("writes the course id into the button links", async () => {
        (PageKind.put as jest.Mock).mockResolvedValue({ page_id: 42 });
        const course = makeCourse({ id: 987 });
        const body = homepageBody({ buttons: false });

        await homepageButtonsTest.fix(course, {
            success: false,
            messages: [],
            userData: { homepage: homePage(body), homepageBody: body },
        });

        const saved: string = (PageKind.put as jest.Mock).mock.calls[0][2].wiki_page.body;
        expect(saved).toContain("https://unity.instructure.com/courses/987/pages/course-overview");
    });

    it("saves to the course and homepage ids", async () => {
        (PageKind.put as jest.Mock).mockResolvedValue({ page_id: 42 });
        const course = makeCourse({ id: 123 });
        const body = homepageBody({ buttons: false });

        await homepageButtonsTest.fix(course, {
            success: false,
            messages: [],
            userData: { homepage: homePage(body), homepageBody: body },
        });

        expect(PageKind.put).toHaveBeenCalledWith(123, 42, expect.anything());
    });

    it("reports success when Canvas returns a saved page", async () => {
        (PageKind.put as jest.Mock).mockResolvedValue({ page_id: 42 });
        const course = makeCourse();
        const body = homepageBody({ buttons: false });

        const result = await homepageButtonsTest.fix(course, {
            success: false,
            messages: [],
            userData: { homepage: homePage(body), homepageBody: body },
        });

        expect(result.success).toBe(true);
        expect(result.messages[0].bodyLines).toEqual(["Buttons placed on homepage successfully!"]);
    });

    it("reports failure when Canvas does not return a saved page", async () => {
        (PageKind.put as jest.Mock).mockResolvedValue(undefined);
        const course = makeCourse();
        const body = homepageBody({ buttons: false });

        const result = await homepageButtonsTest.fix(course, {
            success: false,
            messages: [],
            userData: { homepage: homePage(body), homepageBody: body },
        });

        expect(result.success).toBe(false);
        expect(result.messages[0].bodyLines).toEqual(["Couldn't place buttons on homepage"]);
    });

    it("fails without saving when there is no home banner to anchor to", async () => {
        const course = makeCourse();
        const body = `<div>${INSTRUCTOR_SECTION}</div>`;

        const result = await homepageButtonsTest.fix(course, {
            success: false,
            messages: [],
            userData: { homepage: homePage(body), homepageBody: body },
        });

        expect(result.success).toBe(false);
        expect(result.messages[0].bodyLines).toEqual([
            "Couldn't find the home banner to place buttons after.",
        ]);
        expect(PageKind.put).not.toHaveBeenCalled();
    });
});
