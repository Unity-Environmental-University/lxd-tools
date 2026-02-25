import React, { act } from "react";
import { render, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { HighlightBigImages } from "../HighlightBigImages";

import { BaseContentItem } from "@/canvas/content/BaseContentItem";

// Mock dependencies
jest.mock(
  "@/ui/widgets/Modal/index",
  () =>
    ({ isOpen, children }: { isOpen: boolean; children: React.ReactNode }) =>
      isOpen ? <div data-testid="modal">{children}</div> : null
);

describe("HighlightBigImages", () => {
  let el: HTMLElement;
  let bannerImage: HTMLImageElement;
  let currentContentItem: BaseContentItem;

  window.fetch = jest.fn();
  beforeEach(() => {
    el = document.createElement("div");
    document.body.appendChild(el);

    bannerImage = document.createElement("img");
    bannerImage.src = "https://example.com/image.jpg";
    Object.defineProperty(bannerImage, "naturalWidth", { value: 2500 });

    currentContentItem = {
      resizeBanner: jest.fn().mockResolvedValue(null),
    } as any as BaseContentItem;
  });

  afterEach(() => {
    document.body.removeChild(el);
  });

  it("renders notification box and resize button", () => {
    const { getByText } = render(
      <HighlightBigImages el={el} bannerImage={bannerImage} currentContentItem={currentContentItem} resizeTo={1200} />
    );

    expect(getByText("IMAGE REAL BIG")).toBeInTheDocument();
    expect(getByText("Try Resize")).toBeInTheDocument();
  });

  it("shows modal when resize button is clicked", async () => {
    const { getByText, queryByTestId } = render(
      <HighlightBigImages el={el} bannerImage={bannerImage} currentContentItem={currentContentItem} resizeTo={1200} />
    );

    fireEvent.click(getByText("Try Resize"));

    await waitFor(() => expect(queryByTestId("modal")).toBeInTheDocument());
    expect(getByText("Replacing banner")).toBeInTheDocument();
  });

  it("calls resizeBanner and updates the image source", async () => {
    const { getByText, queryByTestId } = render(
      <HighlightBigImages el={el} bannerImage={bannerImage} currentContentItem={currentContentItem} resizeTo={1200} />
    );

    await act(() => fireEvent.click(getByText("Try Resize")));

    await waitFor(() => expect(currentContentItem.resizeBanner).toHaveBeenCalledWith(1200));
    await waitFor(() => expect(bannerImage.src).toContain("?"));
    await waitFor(() => expect(queryByTestId("modal")).toBeInTheDocument());
    expect(getByText("Finished replacing banner")).toBeInTheDocument();
  });

  it("closes modal when close button is clicked", async () => {
    const { getByText, queryByTestId } = render(
      <HighlightBigImages el={el} bannerImage={bannerImage} currentContentItem={currentContentItem} resizeTo={1200} />
    );

    fireEvent.click(getByText("Try Resize"));

    await waitFor(() => expect(getByText("Finished replacing banner")).toBeInTheDocument());

    fireEvent.click(getByText("Close"));

    await waitFor(() => expect(queryByTestId("modal")).not.toBeInTheDocument());
  });
});
