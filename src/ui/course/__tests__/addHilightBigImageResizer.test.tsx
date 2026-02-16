import React from "react";
import "@testing-library/jest-dom";
import ReactDOM from "react-dom/client";
import { HighlightBigImages } from "../HighlightBigImages";

import { addHighlightBigImageResizer } from "@/ui/course/addButtons";
import { BaseContentItem } from "@ueu/ueu-canvas";

// Mock dependencies
jest.mock("react-dom/client", () => ({
  createRoot: jest.fn().mockReturnValue({
    render: jest.fn(),
  }),
}));

describe("addHighlightBigImageResizer", () => {
  let currentContentItem: BaseContentItem;

  beforeEach(() => {
    document.body.innerHTML = "";
    currentContentItem = {
      getAllLinks: jest.fn(),
    } as any as BaseContentItem;
    jest.clearAllMocks();
  });

  it("adds the resizer if the banner image width is greater than 2000", () => {
    const bannerImageContainer = document.createElement("div");
    bannerImageContainer.classList.add("cbt-banner-image");
    const img = document.createElement("img");

    Object.defineProperty(img, "naturalWidth", { value: 2500 });

    bannerImageContainer.appendChild(img);
    document.body.appendChild(bannerImageContainer);

    addHighlightBigImageResizer(currentContentItem);

    const notificationDiv = bannerImageContainer.parentElement!.lastChild as HTMLElement;
    expect(notificationDiv).toBeInTheDocument();
    expect(ReactDOM.createRoot).toHaveBeenCalledWith(expect.any(HTMLElement));
    expect(ReactDOM.createRoot(notificationDiv!).render).toHaveBeenCalledWith(
      <HighlightBigImages
        el={notificationDiv}
        bannerImage={img}
        currentContentItem={currentContentItem}
        resizeTo={1200}
      />
    );
  });

  it("does not add the resizer if the banner image width is less than or equal to 2000", () => {
    const bannerImageContainer = document.createElement("div");
    bannerImageContainer.classList.add("cbt-banner-image");
    const img = document.createElement("img");

    Object.defineProperty(img, "naturalWidth", { value: 2000 });

    bannerImageContainer.appendChild(img);
    document.body.appendChild(bannerImageContainer);

    addHighlightBigImageResizer(currentContentItem);
    expect(ReactDOM.createRoot).not.toHaveBeenCalled();
  });

  it("does not add the resizer if there is no banner image", () => {
    const bannerImageContainer = document.createElement("div");
    bannerImageContainer.classList.add("cbt-banner-image");
    document.body.appendChild(bannerImageContainer);

    addHighlightBigImageResizer(currentContentItem);
    expect(ReactDOM.createRoot).not.toHaveBeenCalled();
  });

  it("does not add the resizer if there is no banner image container", () => {
    addHighlightBigImageResizer(currentContentItem);
    expect(ReactDOM.createRoot).not.toHaveBeenCalled();
  });
});
