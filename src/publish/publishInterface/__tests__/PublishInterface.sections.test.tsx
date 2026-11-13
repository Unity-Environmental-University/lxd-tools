import { mockCourseData } from "@ueu/ueu-canvas/course/__mocks__/mockCourseData";

// eslint-disable-next-line @typescript-eslint/no-require-imports
global.TextEncoder = require("util").TextEncoder;

import React, { act } from "react";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import fetchMock from "jest-fetch-mock";
import { PublishInterface, selectedOnly, splitByValidId } from "../PublishInterface";
import { IUserData } from "@ueu/ueu-canvas/canvasDataDefs";
import { Course } from "@ueu/ueu-canvas/course/Course";
import { SectionData } from "@ueu/ueu-canvas/courseTypes";
import { getCourseData } from "@ueu/ueu-canvas/course";
import { mockAsyncGen } from "@/__mocks__/utils";
import { sectionDataGenerator } from "@ueu/ueu-canvas/course/blueprint";
import { findProfilePageSlug, getProfilePage } from "@publish/fixesAndUpdates/courseDataStore";
import { renderProfileVerified } from "@publish/fixesAndUpdates/profileRenderer";

fetchMock.enableMocks();
// Each test renders the full interface and loads three sections.
jest.setTimeout(20000);

const SECTION_IDS = [2, 3, 4];

jest.mock("@ueu/ueu-canvas/course/blueprint", () => ({
  ...jest.requireActual("@ueu/ueu-canvas/course/blueprint"),
  sectionDataGenerator: jest.fn(() => mockAsyncGen(SECTION_IDS.map((id) => ({ id })) as SectionData[])),
}));

jest.mock("@ueu/ueu-canvas/course", () => ({
  ...jest.requireActual("@ueu/ueu-canvas/course"),
  getCourseData: jest.fn(),
}));

jest.mock("@ueu/ueu-canvas/course/changeStartDate", () => ({
  ...jest.requireActual("@ueu/ueu-canvas/course/changeStartDate"),
  getStartDateAssignments: jest.fn(async () => null),
}));

jest.mock("@publish/fixesAndUpdates/courseDataStore", () => ({
  ...jest.requireActual("@publish/fixesAndUpdates/courseDataStore"),
  findProfilePageSlug: jest.fn(),
  getProfilePage: jest.fn(),
  restrictBlueprintPage: jest.fn(async () => undefined),
}));

jest.mock("@publish/fixesAndUpdates/profileRenderer", () => ({
  ...jest.requireActual("@publish/fixesAndUpdates/profileRenderer"),
  readProfileFromPage: jest.fn(() => null),
  renderProfileVerified: jest.fn(() => ({ ok: true, html: "<p>rendered</p>" })),
}));

jest.mock("@/publish/publishInterface/EmailLink", () => ({ EmailLink: () => null }));

const user = { id: 1, name: "Test User", email: "test@example.com" } as IUserData;

function makeCourse(overrides: Record<string, unknown>) {
  return new Course({ ...mockCourseData, account_id: 10, ...overrides });
}

const bp = makeCourse({ id: 1, name: "BP_TEST000: Test", course_code: "BP_TEST", blueprint: true });

const updateContentById: Record<string, jest.Mock> = {};

function profileFor(id: number) {
  return { displayName: `Prof ${id}`, user: { id } } as never;
}

async function openInterface(course: Course = bp) {
  await act(async () => {
    render(<PublishInterface course={course} user={user} />);
  });
  await act(async () => fireEvent.click(screen.getByRole("button", { name: "Manage Sections" })));
  // Wait for every section row to load.
  await waitFor(() => expect(screen.getAllByRole("checkbox")).toHaveLength(SECTION_IDS.length));
  // Loading reads each section's profile page too; only count what the
  // button clicks do from here on.
  (getProfilePage as jest.Mock).mockClear();
  for (const key of Object.keys(updateContentById)) delete updateContentById[key];
}

function rowFor(name: string) {
  return screen.getByRole("link", { name }).closest(".course-row") as HTMLElement;
}

async function uncheck(name: string) {
  await act(async () => fireEvent.click(within(rowFor(name)).getByRole("checkbox")));
}

describe("PublishInterface section actions", () => {
  beforeEach(() => {
    fetchMock.resetMocks();
    fetchMock.mockResponse(JSON.stringify([]));
    for (const key of Object.keys(updateContentById)) delete updateContentById[key];

    (sectionDataGenerator as jest.Mock).mockImplementation(() =>
      mockAsyncGen(SECTION_IDS.map((id) => ({ id })) as SectionData[])
    );
    (getCourseData as jest.Mock).mockImplementation(async (id: number) => ({
      ...mockCourseData,
      id,
      name: `Section ${id}`,
      course_code: `SEC${id}`,
      blueprint: false,
    }));
    (findProfilePageSlug as jest.Mock).mockResolvedValue({
      status: "found",
      slug: "faculty-profile",
      blueprintPageId: 99,
    });
    (getProfilePage as jest.Mock).mockImplementation(async (courseId: number) => {
      const updateContent = jest.fn(async () => undefined);
      updateContentById[String(courseId)] = updateContent;
      return { body: "<div data-profile-name></div>", updateContent };
    });
    (renderProfileVerified as jest.Mock).mockReturnValue({ ok: true, html: "<p>rendered</p>" });

    jest.spyOn(Course.prototype, "getFrontPageProfile").mockResolvedValue(null as never);
    jest.spyOn(Course.prototype, "getInstructors").mockResolvedValue([]);
    jest
      .spyOn(Course.prototype, "getPotentialInstructorProfiles")
      .mockImplementation(async function (this: Course) {
        return [profileFor(this.id)];
      });
    jest.spyOn(Course.prototype, "getTerm").mockResolvedValue(null as never);
    jest.spyOn(Course.prototype, "getStartDateFromModules").mockResolvedValue(null as never);
    // The post-publish refresh; the section list itself is covered by the
    // getCourseData mock above.
    jest.spyOn(bp, "getAssociatedCourses").mockResolvedValue([]);
    jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => jest.restoreAllMocks());

  it("Set Selected Bios only writes the sections that are still selected", async () => {
    await openInterface();
    await uncheck("Section 3");

    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Set Selected Bios" })));
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("2 profile(s) updated"));

    const pagesFetched = (getProfilePage as jest.Mock).mock.calls.map(([courseId]) => courseId);
    expect(pagesFetched.sort()).toEqual([2, 4]);
    expect(Object.keys(updateContentById).sort()).toEqual(["2", "4"]);
    expect(updateContentById["2"]).toHaveBeenCalledWith("<p>rendered</p>");
    expect(updateContentById["4"]).toHaveBeenCalledWith("<p>rendered</p>");
  });

  it("Set Bios still writes every section", async () => {
    await openInterface();
    await uncheck("Section 3");

    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Set Bios" })));
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("3 profile(s) updated"));
    expect(Object.keys(updateContentById).sort()).toEqual(["2", "3", "4"]);
  });

  it("shows the error for every failing section, not just the last one", async () => {
    jest
      .spyOn(Course.prototype, "getPotentialInstructorProfiles")
      .mockImplementation(async function (this: Course) {
        if (this.id === 2) return [];
        if (this.id === 3) return [profileFor(3), profileFor(33)];
        return [profileFor(this.id)];
      });
    (renderProfileVerified as jest.Mock).mockReturnValue({ ok: false, problem: "Name did not land" });

    await openInterface();
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Set Bios" })));
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("No profiles updated — see errors below")
    );

    expect(within(rowFor("Section 2")).getByText("No Profiles")).toBeInTheDocument();
    expect(within(rowFor("Section 3")).getByText("Multiple Matches Found")).toBeInTheDocument();
    expect(within(rowFor("Section 4")).getByText("Name did not land")).toBeInTheDocument();
  });

  it("marks every target section when the profile page can't be resolved", async () => {
    (findProfilePageSlug as jest.Mock).mockResolvedValue({ status: "ambiguous", candidates: ["a", "b"] });

    await openInterface();
    await uncheck("Section 3");
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Set Selected Bios" })));

    await waitFor(() => expect(within(rowFor("Section 2")).getByText("Multiple profile pages: a, b")).toBeInTheDocument());
    expect(within(rowFor("Section 4")).getByText("Multiple profile pages: a, b")).toBeInTheDocument();
    expect(within(rowFor("Section 3")).queryByText("Multiple profile pages: a, b")).not.toBeInTheDocument();
    expect(getProfilePage).not.toHaveBeenCalled();
  });

  it("Publish selected sends only the selected section ids, never undefined", async () => {
    const publishAll = jest.spyOn(Course, "publishAll");
    await openInterface();
    await uncheck("Section 3");

    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Publish selected" })));
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Published 2 sections"));

    expect(publishAll).toHaveBeenCalledTimes(1);
    const [courses, accountId] = publishAll.mock.calls[0];
    expect(accountId).toBe(10);
    expect(courses.map((c) => (c as Course).id).sort()).toEqual([2, 4]);

    const publishRequest = fetchMock.mock.calls.find(([url]) => String(url).includes("/api/v1/accounts/10/courses"));
    expect(publishRequest).toBeDefined();
    const body = publishRequest![1]!.body as FormData;
    const sentIds = [...body.entries()]
      .filter(([key]) => key.startsWith("course_ids"))
      .map(([, value]) => String(value));
    expect(sentIds.sort()).toEqual(["2", "4"]);
    expect(sentIds).not.toContain("undefined");
  });

  it("skips and reports a section with no course id instead of calling Canvas with undefined", async () => {
    (getCourseData as jest.Mock).mockImplementation(async (id: number) => ({
      ...mockCourseData,
      id: id === 3 ? undefined : id,
      name: `Section ${id}`,
      course_code: `SEC${id}`,
      blueprint: false,
    }));
    const publishAll = jest.spyOn(Course, "publishAll").mockResolvedValue({} as never);

    await openInterface();
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Set Bios" })));
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        "2 profile(s) updated. Skipped 1 section(s) with no course id: Section 3"
      )
    );
    const pagesFetched = (getProfilePage as jest.Mock).mock.calls.map(([courseId]) => courseId);
    expect(pagesFetched.sort()).toEqual([2, 4]);

    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Publish all" })));
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Published 2 sections. Skipped 1 section(s) with no course id: Section 3"
      )
    );
    const ids = publishAll.mock.calls[0][0].map((c) => (c as Course).id);
    expect(ids.sort()).toEqual([2, 4]);
  });

  it("lists and reports every section with no course id, not just one", async () => {
    (getCourseData as jest.Mock).mockImplementation(async (id: number) => ({
      ...mockCourseData,
      id: id === 2 ? id : undefined,
      name: `Section ${id}`,
      course_code: `SEC${id}`,
      blueprint: false,
    }));

    // openInterface waits for all three rows, so both id-less sections must
    // be listed separately.
    await openInterface();
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Set Bios" })));
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        "1 profile(s) updated. Skipped 2 section(s) with no course id: Section 3, Section 4"
      )
    );
    expect((getProfilePage as jest.Mock).mock.calls.map(([courseId]) => courseId)).toEqual([2]);
  });

  it("shows the error and ends loading when the publish request fails", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(Course, "publishAll").mockRejectedValue(new Error("Canvas said no"));

    await openInterface();
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Publish all" })));

    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Publishing failed: Canvas said no"));
    expect(screen.getByRole("button", { name: "Publish all" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Set Bios" })).toBeEnabled();
  });

  it("shows the error and ends loading when the post-publish refresh fails", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(Course, "publishAll").mockResolvedValue({} as never);
    jest.spyOn(bp, "getAssociatedCourses").mockRejectedValue(new Error("refresh broke"));

    await openInterface();
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Publish all" })));

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Published 3 sections, but the section list could not be refreshed: refresh broke"
      )
    );
    expect(screen.getByRole("button", { name: "Publish all" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Set Bios" })).toBeEnabled();
  });
});

describe("PublishInterface blueprint check", () => {
  beforeEach(() => {
    fetchMock.resetMocks();
    fetchMock.mockResponse(JSON.stringify([]));
    (findProfilePageSlug as jest.Mock).mockResolvedValue({ status: "none" });
    // No associated sections: these tests only look at the blueprint check.
    (sectionDataGenerator as jest.Mock).mockImplementation(() => mockAsyncGen([] as SectionData[]));
    jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => jest.restoreAllMocks());

  it("calls isBlueprint() and enables the section tools for a blueprint", async () => {
    const course = makeCourse({ id: 1, name: "BP_TEST000: Test", course_code: "BP_TEST", blueprint: true });
    const isBlueprint = jest.spyOn(course, "isBlueprint");

    await act(async () => {
      render(<PublishInterface course={course} user={user} />);
    });
    // Called as a method. Passing the method itself to setIsBlueprint only
    // worked because React calls a function argument as an updater, with the
    // previous state as its argument.
    expect(isBlueprint).toHaveBeenCalled();
    expect(isBlueprint.mock.calls.every((args) => args.length === 0)).toBe(true);
    const open = screen.getByRole("button", { name: "Manage Sections" });
    expect(open).toBeEnabled();
    await act(async () => fireEvent.click(open));
    expect(screen.getByRole("button", { name: "Set Bios" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Publish all" })).toBeEnabled();
  });

  it("does not offer section tools for a course that is not a blueprint", async () => {
    const course = makeCourse({ id: 5, name: "TEST000: Live Section", course_code: "TEST000", blueprint: false });

    await act(async () => {
      render(<PublishInterface course={course} user={user} />);
    });
    const open = screen.getByRole("button", { name: "Not BP or DEV" });
    expect(open).toBeDisabled();
    expect(screen.queryByRole("button", { name: "Set Bios" })).not.toBeInTheDocument();
  });
});

describe("selection helpers", () => {
  it("selectedOnly drops unticked (undefined) entries", () => {
    const a = makeCourse({ id: 2 });
    const b = makeCourse({ id: 4 });
    const record = { 2: a, 3: undefined, 4: b } as Record<number, Course | undefined>;
    expect(selectedOnly(record)).toEqual([a, b]);
  });

  it("splitByValidId separates sections without a numeric id", () => {
    const good = makeCourse({ id: 2 });
    const missing = makeCourse({ id: undefined });
    expect(splitByValidId([good, missing])).toEqual({ valid: [good], invalid: [missing] });
  });
});
