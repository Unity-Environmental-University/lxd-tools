// PublishApp.test.tsx

// eslint-disable-next-line @/no-undef,@typescript-eslint/no-require-imports
global.TextEncoder = require("util").TextEncoder;

import { Course } from "@ueu/ueu-canvas";
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

import PublishApp, { versionCompare } from "../PublishApp";
import { IUserData } from "@ueu/ueu-canvas";
import { PublishInterface } from "../publishInterface/PublishInterface";
import { CourseUpdateInterface } from "../fixesAndUpdates/CourseUpdateInterface";
import { AdminApp } from "../../admin/AdminApp";
import fetchMock from "jest-fetch-mock";

import { fetchJson } from "@ueu/ueu-canvas";

jest.mock("../../canvas/course");
jest.mock("../../canvas/canvasUtils");
jest.mock("../../canvas/fetch/fetchJson");
jest.mock("../publishInterface/PublishInterface");
jest.mock("../fixesAndUpdates/CourseUpdateInterface");
jest.mock("../../admin/AdminApp");
jest.mock("webextension-polyfill", () => ({
  ...jest.requireActual("webextension-polyfill"),
  runtime: {
    getManifest: jest.fn(() => ({ version: "2.0" })),
  },
}));

fetchMock.enableMocks();

const mockCourse: Course = {
  getParentCourse: jest.fn().mockResolvedValue({}),
} as any;

const mockUser: IUserData = {
  id: 1,
  name: "Test User",
} as any;

const mockFetchJson = fetchJson as jest.Mock;
const mockCourseGetFromUrl = jest.spyOn(Course, "getFromUrl");

beforeEach(() => {
  jest.clearAllMocks();
  mockCourseGetFromUrl.mockResolvedValue(mockCourse);
  mockFetchJson.mockResolvedValue(mockUser);
});

test("TextEncoder is globally defined in Jest", () => {
  // eslint-disable-next-line @/no-undef
  expect(global.TextEncoder).toBeDefined();
});

describe("PublishApp Component", () => {
  it("renders subcomponents with correct props", async () => {
    (PublishInterface as jest.Mock).mockImplementation(({ course, user }) => (
      <div>PublishInterface: {course && user && "Loaded"}</div>
    ));
    (CourseUpdateInterface as jest.Mock).mockImplementation(({ course, parentCourse, refreshCourse }) => (
      <div>ContentUpdateInterface: {course && parentCourse && "Loaded"}</div>
    ));
    (AdminApp as jest.Mock).mockImplementation(({ course }) => <div>AdminApp: {course && "Loaded"}</div>);

    render(<PublishApp />);
    await waitFor(() => expect(mockCourseGetFromUrl).toHaveBeenCalled());
    await waitFor(() => expect(mockFetchJson).toHaveBeenCalledWith("/api/v1/users/self"));

    await waitFor(() => expect(screen.getByText(/PublishInterface: Loaded/)).toBeInTheDocument());
    await waitFor(() => expect(screen.getByText(/ContentUpdateInterface: Loaded/)).toBeInTheDocument());
    await waitFor(() => expect(screen.getByText(/AdminApp: Loaded/)).toBeInTheDocument());
  });
});

describe("Version Number Sort", () => {
  it("sorts correctly", () => {
    expect(
      ["2.1", "2.0.9", "3.0.0.1", "3.0", "2.1.1", "2.1.11", "2.1.13", "3.1", "2.1.12"].toSorted(versionCompare)
    ).toEqual(["2.0.9", "2.1", "2.1.1", "2.1.11", "2.1.12", "2.1.13", "3.0", "3.0.0.1", "3.1"]);
  });
});
