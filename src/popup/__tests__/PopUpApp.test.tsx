import { act, fireEvent, render, screen } from "@testing-library/react";

const mockStorageLocalGet = jest.fn();
const mockStorageLocalSet = jest.fn();

jest.mock("webextension-polyfill", () => ({
  runtime: { getURL: jest.fn(), sendMessage: jest.fn() },
  tabs: { query: jest.fn().mockResolvedValue([]), create: jest.fn() },
  storage: { local: { get: mockStorageLocalGet, set: mockStorageLocalSet } },
}));

jest.mock("bootstrap", () => ({}));

jest.mock("../../canvasInstances", () => ({
  getInstances: jest.fn().mockResolvedValue({}),
  saveInstances: jest.fn(),
  getInstanceFromUrl: jest.fn().mockReturnValue(null),
}));

import PopUpApp from "../PopUpApp";

describe("PopUpApp advanced options", () => {
  it("does not offer an OpenAI API key setting or read one from storage", async () => {
    await act(async () => {
      render(<PopUpApp />);
    });

    await act(async () => {
      // The "Advanced Options" switch is the only checkbox in the popup.
      fireEvent.click(screen.getByRole("checkbox"));
    });

    expect(screen.getByText("Click Here for Instance-Wide Search")).toBeTruthy();
    expect(screen.queryByText(/OpenAI/i)).toBeNull();
    expect(document.getElementById("open-api-key")).toBeNull();
    expect(mockStorageLocalGet).not.toHaveBeenCalled();
    expect(mockStorageLocalSet).not.toHaveBeenCalled();
  });
});
