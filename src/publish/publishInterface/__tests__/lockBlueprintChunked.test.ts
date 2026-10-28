import { lockBlueprintChunked } from "../lockBlueprintChunked";
import { fetchJson } from "@ueu/ueu-canvas/fetch/fetchJson";

jest.mock("@ueu/ueu-canvas/fetch/fetchJson", () => ({
  ...jest.requireActual("@ueu/ueu-canvas/fetch/fetchJson"),
  fetchJson: jest.fn(),
}));

const mockFetchJson = fetchJson as jest.Mock;

function sent(): Record<string, string>[] {
  return mockFetchJson.mock.calls
    .filter(([url]) => String(url).includes("restrict_item"))
    .map(([, config]) => Object.fromEntries((config.fetchInit.body as FormData).entries()) as Record<string, string>);
}

describe("lockBlueprintChunked", () => {
  beforeEach(() => mockFetchJson.mockReset());

  it("sends Canvas content types and content ids, not module item types and ids", async () => {
    mockFetchJson.mockResolvedValue({});
    const modules = [
      {
        items: [
          { id: 900, type: "Assignment", content_id: 11 },
          { id: 901, type: "Discussion", content_id: 12 },
          { id: 902, type: "Quiz", content_id: 13 },
        ],
      },
    ];
    await lockBlueprintChunked(5, modules, undefined, 10, 0);
    expect(sent()).toEqual([
      expect.objectContaining({ content_type: "assignment", content_id: "11", restricted: "true" }),
      expect.objectContaining({ content_type: "discussion_topic", content_id: "12" }),
      expect.objectContaining({ content_type: "quiz", content_id: "13" }),
    ]);
  });

  it("looks up the page_id for wiki pages", async () => {
    mockFetchJson.mockImplementation(async (url: string) =>
      url === "/api/v1/courses/5/pages/intro" ? { page_id: 77 } : {}
    );
    await lockBlueprintChunked(
      5,
      [{ items: [{ id: 903, type: "Page", url: "/api/v1/courses/5/pages/intro" }] }],
      undefined,
      10,
      0
    );
    expect(sent()).toEqual([expect.objectContaining({ content_type: "wiki_page", content_id: "77" })]);
  });

  it("skips items Canvas can't restrict", async () => {
    mockFetchJson.mockResolvedValue({});
    await lockBlueprintChunked(
      5,
      [{ items: [{ id: 1, type: "Subheader" }, { id: 2, type: "ExternalUrl" }] }],
      undefined,
      10,
      0
    );
    expect(sent()).toEqual([]);
  });

  it("skips wiki pages listed in neverLock (profile/home page)", async () => {
    mockFetchJson.mockImplementation(async (url: string) =>
      url === "/api/v1/courses/5/pages/home" ? { page_id: 77 } : {}
    );
    await lockBlueprintChunked(
      5,
      [{ items: [{ id: 903, type: "Page", url: "/api/v1/courses/5/pages/home" }, { id: 1, type: "Assignment", content_id: 11 }] }],
      undefined,
      10,
      0,
      new Set([77])
    );
    expect(sent()).toEqual([expect.objectContaining({ content_type: "assignment", content_id: "11" })]);
  });
});
