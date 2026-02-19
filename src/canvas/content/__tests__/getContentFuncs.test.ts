import { getFileLinks, getExternalLinks } from "@ueu/ueu-canvas/content/getContentFuncs";

describe("Canvas Link Tests", () => {
  const courseId = 12345;

  it("should correctly identify file links within the course", () => {
    const body = `
      <div>
        <a href="https://unity.instructure.com/files/12345">Course File 1</a>
        <a href="https://unity.instructure.com/courses/12345/files/67890">Course File 2</a>
        <a href="https://www.example.com/files/12345">External File</a>
      </div>
    `;

    const fileLinks = getFileLinks(body, courseId);
    expect(fileLinks.length).toBe(2);
    expect(fileLinks[0]).toBe("https://unity.instructure.com/files/12345");
    expect(fileLinks[1]).toBe("https://unity.instructure.com/courses/12345/files/67890");
  });

  it("should correctly identify external links", () => {
    const body = `
      <div>
        <a href="https://unity.instructure.com/files/12345">Course File</a>
        <a href="https://unity.instructure.com/courses/12345/files/67890">Course File</a>
        <a href="https://www.example.com/page">External Page</a>
        <a href="https://anotherexample.com/page">Another External Page</a>
      </div>
    `;

    const externalLinks = getExternalLinks(body, courseId);
    expect(externalLinks.length).toBe(2);
    expect(externalLinks[0]).toBe("https://www.example.com/page");
    expect(externalLinks[1]).toBe("https://anotherexample.com/page");
  });

  it("should handle an empty body", () => {
    const body = ``;

    const fileLinks = getFileLinks(body, courseId);
    const externalLinks = getExternalLinks(body, courseId);

    expect(fileLinks.length).toBe(0);
    expect(externalLinks.length).toBe(0);
  });

  it("should handle a body with no links", () => {
    const body = `<div>No links here</div>`;

    const fileLinks = getFileLinks(body, courseId);
    const externalLinks = getExternalLinks(body, courseId);

    expect(fileLinks.length).toBe(0);
    expect(externalLinks.length).toBe(0);
  });

  it("should handle mixed content correctly", () => {
    const body = `
      <div>
        <a href="https://unity.instructure.com/files/12345">Course File</a>
        <a href="https://www.example.com/page">External Page</a>
        <a href="https://unity.instructure.com/courses/12345/files/67890">Course File</a>
        <a href="https://anotherexample.com/page">Another External Page</a>
      </div>
    `;

    const fileLinks = getFileLinks(body, courseId);
    const externalLinks = getExternalLinks(body, courseId);

    expect(fileLinks.length).toBe(2);
    expect(fileLinks[0]).toBe("https://unity.instructure.com/files/12345");
    expect(fileLinks[1]).toBe("https://unity.instructure.com/courses/12345/files/67890");

    expect(externalLinks.length).toBe(2);
    expect(externalLinks[0]).toBe("https://www.example.com/page");
    expect(externalLinks[1]).toBe("https://anotherexample.com/page");
  });
});
