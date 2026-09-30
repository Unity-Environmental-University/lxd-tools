import { useCourseDataStore, findProfilePageSlug, getProfilePage } from "../courseDataStore";
import { Page } from "@ueu/ueu-canvas/content/pages/Page";
import { Course } from "@ueu/ueu-canvas/course/Course";
import { getCourseData } from "@ueu/ueu-canvas/course";
import { IPageData } from "@ueu/ueu-canvas/content/pages/types";

jest.mock("@ueu/ueu-canvas/course", () => ({
  getCourseData: jest.fn(),
}));

const mockGetCourseData = getCourseData as jest.MockedFunction<typeof getCourseData>;

function makePage(opts: { url: string; title: string; body?: string; front_page?: boolean; page_id?: number }): IPageData {
  return {
    page_id: opts.page_id ?? Math.floor(Math.random() * 100000),
    url: opts.url,
    title: opts.title,
    body: opts.body ?? "",
    updated_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    front_page: opts.front_page ?? false,
  } as IPageData;
}

function mockCourseWithPages(courseId: number, pages: IPageData[]) {
  const mockCourse = {
    id: courseId,
    name: `Test Course ${courseId}`,
    getPages: jest.fn().mockResolvedValue(
      pages.map((p) => new Page(p, courseId))
    ),
    getFrontPage: jest.fn().mockResolvedValue(
      (() => {
        const fp = pages.find((p) => p.front_page);
        return fp ? new Page(fp, courseId) : null;
      })()
    ),
    getSyllabus: jest.fn().mockResolvedValue("<p>Test syllabus</p>"),
  };

  mockGetCourseData.mockResolvedValue({ id: courseId, name: `Test Course ${courseId}` } as any);
  jest.spyOn(Course.prototype, "getPages").mockImplementation(mockCourse.getPages);
  jest.spyOn(Course.prototype, "getFrontPage").mockImplementation(mockCourse.getFrontPage);
  jest.spyOn(Course.prototype, "getSyllabus").mockImplementation(mockCourse.getSyllabus);

  return mockCourse;
}

beforeEach(() => {
  useCourseDataStore.getState().clear();
  jest.restoreAllMocks();
});

describe("useCourseDataStore", () => {
  it("caches pages after first fetch", async () => {
    const pages = [makePage({ url: "front", title: "Front", front_page: true })];
    const mock = mockCourseWithPages(1001, pages);

    const first = await useCourseDataStore.getState().getPages(1001);
    const second = await useCourseDataStore.getState().getPages(1001);

    expect(first).toHaveLength(1);
    expect(second).toHaveLength(1);
    expect(mock.getPages).toHaveBeenCalledTimes(1);
  });

  it("caches syllabus after first fetch", async () => {
    const mock = mockCourseWithPages(1002, []);

    const first = await useCourseDataStore.getState().getSyllabus(1002);
    const second = await useCourseDataStore.getState().getSyllabus(1002);

    expect(first).toBe("<p>Test syllabus</p>");
    expect(mock.getSyllabus).toHaveBeenCalledTimes(1);
  });

  it("keys by instance so two instances of same courseId stay separate", async () => {
    const pagesA = [makePage({ url: "home-a", title: "Home A", front_page: true, body: "Instance A" })];
    const pagesB = [makePage({ url: "home-b", title: "Home B", front_page: true, body: "Instance B" })];

    mockCourseWithPages(1003, pagesA);
    const resultA = await useCourseDataStore.getState().getPages(1003, "instance-a");

    mockCourseWithPages(1003, pagesB);
    const resultB = await useCourseDataStore.getState().getPages(1003, "instance-b");

    expect(resultA[0].body).toBe("Instance A");
    expect(resultB[0].body).toBe("Instance B");
  });

  it("invalidate clears one course", async () => {
    mockCourseWithPages(1004, [makePage({ url: "p", title: "P" })]);
    await useCourseDataStore.getState().getPages(1004);

    expect(useCourseDataStore.getState().cache["default:1004"]).toBeDefined();
    useCourseDataStore.getState().invalidate(1004);
    expect(useCourseDataStore.getState().cache["default:1004"]).toBeUndefined();
  });

  it("getPageBySlug finds a page by its Canvas slug", async () => {
    const pages = [
      makePage({ url: "instructor-profile", title: "Instructor", body: "<div data-profile-name>Hi</div>" }),
      makePage({ url: "front", title: "Front Page", front_page: true }),
    ];
    mockCourseWithPages(1005, pages);

    const found = await useCourseDataStore.getState().getPageBySlug(1005, "instructor-profile");
    expect(found).not.toBeNull();
    expect(found!.title).toBe("Instructor");

    const missing = await useCourseDataStore.getState().getPageBySlug(1005, "nonexistent");
    expect(missing).toBeNull();
  });
});

describe("findProfilePageSlug", () => {
  it("finds a page with data-profile attributes", async () => {
    const pages = [
      makePage({ url: "front", title: "Front Page", front_page: true }),
      makePage({
        url: "meet-your-instructor",
        title: "Meet Your Instructor",
        page_id: 555,
        body: '<div data-profile-name>Name</div><div data-profile-bio>Bio</div>',
      }),
    ];
    mockCourseWithPages(2001, pages);

    const result = await findProfilePageSlug(2001);
    expect(result).toEqual({ status: "found", slug: "meet-your-instructor", blueprintPageId: 555 });
  });

  it("reports \"none\" when no page has data-profile attributes, without falling back to the front page", async () => {
    const pages = [
      makePage({ url: "front", title: "Front Page", front_page: true, body: "<h2>Welcome</h2>" }),
      makePage({ url: "other", title: "Other Page", body: "<p>Nothing here</p>" }),
    ];
    mockCourseWithPages(2002, pages);

    const result = await findProfilePageSlug(2002);
    expect(result).toEqual({ status: "none" });
  });

  it("reports \"ambiguous\" when more than one page has data-profile attributes", async () => {
    const pages = [
      makePage({ url: "meet-your-instructor", title: "A", body: "<div data-profile-name>Name</div>" }),
      makePage({ url: "team", title: "B", body: "<div data-profile-bio>Bio</div>" }),
    ];
    mockCourseWithPages(2004, pages);

    const result = await findProfilePageSlug(2004);
    expect(result).toEqual({ status: "ambiguous", candidates: ["meet-your-instructor", "team"] });
  });

  it("reports \"none\" when there are no pages at all", async () => {
    mockCourseWithPages(2003, []);
    const result = await findProfilePageSlug(2003);
    expect(result).toEqual({ status: "none" });
  });
});

describe("getProfilePage", () => {
  it("returns the page matching the slug", async () => {
    const pages = [
      makePage({ url: "instructor-bio", title: "Bio Page", body: "<div data-profile-bio>Hello</div>" }),
      makePage({ url: "front", title: "Front", front_page: true }),
    ];
    mockCourseWithPages(3001, pages);

    const page = await getProfilePage(3001, "instructor-bio");
    expect(page).not.toBeNull();
    expect(page!.title).toBe("Bio Page");
  });
});
