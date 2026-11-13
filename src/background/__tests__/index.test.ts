import { OPEN_AI_API_KEY_KEY } from "../../consts";

const mockOnInstalledAddListener = jest.fn();
const mockStorageLocalRemove = jest.fn();

jest.mock("webextension-polyfill", () => ({
  runtime: {
    onMessage: { addListener: jest.fn() },
    onInstalled: { addListener: mockOnInstalledAddListener },
  },
  action: { onClicked: { addListener: jest.fn() } },
  scripting: { executeScript: jest.fn() },
  tabs: { query: jest.fn(), sendMessage: jest.fn() },
  storage: { local: { remove: mockStorageLocalRemove } },
}));

jest.mock("../../utils/image", () => ({
  backgroundDownloadImage: jest.fn(),
}));

async function loadBackgroundScript() {
  await jest.isolateModulesAsync(async () => {
    await import("../index");
  });
  expect(mockOnInstalledAddListener).toHaveBeenCalledTimes(1);
  return mockOnInstalledAddListener.mock.calls[0][0] as () => Promise<void>;
}

describe("background onInstalled cleanup", () => {
  beforeEach(() => {
    mockOnInstalledAddListener.mockReset();
    mockStorageLocalRemove.mockReset();
  });

  it("removes the stored OpenAI API key on install or update", async () => {
    mockStorageLocalRemove.mockResolvedValue(undefined);
    const onInstalled = await loadBackgroundScript();

    await onInstalled();

    expect(mockStorageLocalRemove).toHaveBeenCalledTimes(1);
    expect(mockStorageLocalRemove).toHaveBeenCalledWith(OPEN_AI_API_KEY_KEY);
  });

  it("does not throw if removing the key fails", async () => {
    mockStorageLocalRemove.mockRejectedValue(new Error("storage unavailable"));
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => undefined);
    const onInstalled = await loadBackgroundScript();

    await expect(onInstalled()).resolves.toBeUndefined();
    expect(warnSpy).toHaveBeenCalled();

    warnSpy.mockRestore();
  });
});
