const mockAddListener = jest.fn();

jest.mock("webextension-polyfill", () => ({
  runtime: {
    onMessage: {
      addListener: mockAddListener,
    },
  },
}));

const CONTENT_SCRIPT_FLAG = "__lxdCourseSearchListenerInstalled";
const message = { queryString: "CODE1234", subAccount: 1, canvasOrigin: "https://canvas.example.com" };

/**
 * Evaluates the content script as a fresh module, the way a repeated injection would,
 * while keeping the shared globalThis state the script uses as its install guard.
 */
async function injectContentScript() {
  await jest.isolateModulesAsync(async () => {
    await import("../index");
  });
}

describe("content script listener registration", () => {
  let openSpy: jest.SpyInstance;

  beforeEach(() => {
    delete (globalThis as Record<string, unknown>)[CONTENT_SCRIPT_FLAG];
    mockAddListener.mockClear();
    openSpy = jest.spyOn(window, "open").mockImplementation(() => null);
  });

  afterEach(() => {
    openSpy.mockRestore();
  });

  it("registers a single listener when the script is injected more than once", async () => {
    await injectContentScript();
    await injectContentScript();
    await injectContentScript();

    expect(mockAddListener).toHaveBeenCalledTimes(1);
  });

  it("opens exactly one tab per message after repeated injections", async () => {
    await injectContentScript();
    await injectContentScript();
    await injectContentScript();

    // Deliver the message to every registered listener, as the browser runtime would.
    const sendResponse = jest.fn();
    for (const [listener] of mockAddListener.mock.calls) {
      await listener(message, {}, sendResponse);
    }

    expect(openSpy).toHaveBeenCalledTimes(1);
    expect(sendResponse).toHaveBeenCalledTimes(1);
  });
});
