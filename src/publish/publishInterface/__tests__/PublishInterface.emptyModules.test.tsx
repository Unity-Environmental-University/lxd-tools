import { mockCourseData } from "@ueu/ueu-canvas/course/__mocks__/mockCourseData";

// eslint-disable-next-line @typescript-eslint/no-require-imports
global.TextEncoder = require("util").TextEncoder;

import React, { act } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import fetchMock from "jest-fetch-mock";
import { PublishInterface } from "../PublishInterface";
import { IUserData } from "@ueu/ueu-canvas/canvasDataDefs";
import { Course } from "@ueu/ueu-canvas/course/Course";
import { SectionData } from "@ueu/ueu-canvas/courseTypes";
import { NoOverviewModuleFoundError, getStartDateAssignments } from "@ueu/ueu-canvas/course/changeStartDate";
import { mockAsyncGen } from "@/__mocks__/utils";

fetchMock.enableMocks();

jest.mock("@ueu/ueu-canvas/course/blueprint", () => ({
  ...jest.requireActual("@ueu/ueu-canvas/course/blueprint"),
  sectionDataGenerator: jest.fn(() => mockAsyncGen([{ id: 2 }] as SectionData[])),
}));

jest.mock("@ueu/ueu-canvas/course", () => ({
  ...jest.requireActual("@ueu/ueu-canvas/course"),
  getCourseData: jest.fn(async (id: number) => ({ ...mockCourseData, id })),
}));

jest.mock("@ueu/ueu-canvas/course/changeStartDate", () => ({
  ...jest.requireActual("@ueu/ueu-canvas/course/changeStartDate"),
  getStartDateAssignments: jest.fn(),
}));

jest.mock("@/publish/publishInterface/EmailLink", () => ({ EmailLink: () => null }));

const bp = new Course({ ...mockCourseData, id: 1, name: "BP_TEST000: Test", course_code: "BP_TEST", blueprint: true });
const user = { id: 1, name: "Test User", email: "test@example.com" } as IUserData;

describe("PublishInterface section load with no modules", () => {
  beforeEach(() => {
    fetchMock.mockResponse(JSON.stringify([]));
    jest.spyOn(Course.prototype, "getFrontPageProfile").mockResolvedValue(null as never);
    jest.spyOn(Course.prototype, "getInstructors").mockResolvedValue([]);
    jest.spyOn(Course.prototype, "getPotentialInstructorProfiles").mockResolvedValue([] as never);
    jest.spyOn(Course.prototype, "getTerm").mockResolvedValue(null as never);
    jest
      .spyOn(Course.prototype, "getStartDateFromModules")
      .mockRejectedValue(new NoOverviewModuleFoundError());
    (getStartDateAssignments as jest.Mock).mockResolvedValue(null);
  });

  afterEach(() => jest.restoreAllMocks());

  it("falls back to assignments instead of failing when a section has no modules", async () => {
    await act(async () => {
      render(<PublishInterface course={bp} user={user} />);
    });
    await waitFor(() => expect(getStartDateAssignments).toHaveBeenCalledWith(2));
  });

  it("shows an error message when a section fails to load for an unexpected reason", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    jest
      .spyOn(Course.prototype, "getStartDateFromModules")
      .mockRejectedValue(new Error("Canvas went away"));

    await act(async () => {
      render(<PublishInterface course={bp} user={user} />);
    });
    fireEvent.click(screen.getByRole("button", { name: "Manage Sections" }));
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Couldn't finish loading sections. Reload the page to try again.",
      ),
    );
  });
});
