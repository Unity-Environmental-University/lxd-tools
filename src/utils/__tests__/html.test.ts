import { parseHtmlInert } from "../html";

describe("parseHtmlInert", () => {
  it("parses into a detached div owned by a document with no browsing context", () => {
    const el = parseHtmlInert("<p>Hello</p>");
    expect(el.tagName).toBe("DIV");
    expect(el.ownerDocument).not.toBe(document);
    expect(el.ownerDocument.defaultView).toBeNull();
    expect(el.isConnected).toBe(false);
  });

  it("does not run inline event handlers in the parsed HTML", () => {
    const handler = jest.fn();
    (window as unknown as Record<string, unknown>).__parseHtmlInertHandler = handler;
    try {
      const el = parseHtmlInert(
        '<img src="x" onerror="window.__parseHtmlInertHandler()">' +
          '<img src="x" onload="window.__parseHtmlInertHandler()">'
      );
      // Dispatching the events directly proves no handler was compiled for them.
      el.querySelectorAll("img").forEach((img) => {
        img.dispatchEvent(new Event("error"));
        img.dispatchEvent(new Event("load"));
      });
      expect(handler).not.toHaveBeenCalled();
    } finally {
      delete (window as unknown as Record<string, unknown>).__parseHtmlInertHandler;
    }
  });

  it("round-trips markup the same way div.innerHTML does", () => {
    const html =
      '<link rel="stylesheet" href="/style.css"><style>p{color:red}</style>' +
      '<div class="a"><p data-profile-name="">Name</p></div><p>tail</p>';
    const live = document.createElement("div");
    live.innerHTML = html;
    expect(parseHtmlInert(html).innerHTML).toBe(live.innerHTML);
  });

  it("resolves relative URLs against the current document", () => {
    const el = parseHtmlInert('<img src="/courses/1/files/2/preview">');
    const img = el.querySelector("img");
    expect(img).toBeInstanceOf(HTMLImageElement);
    expect(img?.src).toBe(new URL("/courses/1/files/2/preview", document.baseURI).href);
  });

  it("supports querying and editing the parsed content", () => {
    const el = parseHtmlInert('<div data-profile-bio="">old</div>');
    const bio = el.querySelector("[data-profile-bio]");
    expect(bio).not.toBeNull();
    bio!.innerHTML = "<b>new</b>";
    expect(el.innerHTML).toBe('<div data-profile-bio=""><b>new</b></div>');
  });
});
