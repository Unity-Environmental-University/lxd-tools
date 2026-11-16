import {
	fingerprint,
	loadSnapshot,
	readSnapshot,
	recordSyncedFingerprint,
	saveSnapshot,
	SNAPSHOT_KEY,
	SNAPSHOT_TTL_MS,
	SyllabusSnapshot,
	undoSync,
} from "../syllabusUndo";

jest.mock("@ueu/ueu-canvas", () => ({ getCourseById: jest.fn() }));

const ORIGINAL = "<p>Original syllabus</p>";
const SYNCED = "<p>Synced syllabus</p>";

function snapshot(overrides: Partial<SyllabusSnapshot> = {}): SyllabusSnapshot {
	return {
		courseId: 42,
		courseName: "DEV_TEST101",
		savedAt: Date.now(),
		originalHtml: ORIGINAL,
		syncedFingerprint: fingerprint(SYNCED),
		...overrides,
	};
}

// A fake Canvas holding one syllabus; `rewrite` lets a test make Canvas store something other than what was sent.
function fakeCanvas(initial: string, rewrite: (html: string) => string = (h) => h) {
	const state = { html: initial };
	const getCourse = jest.fn(async () => ({
		getSyllabus: async () => state.html,
		changeSyllabus: async (html: string) => {
			state.html = rewrite(html);
		},
	}));
	return { state, getCourse };
}

beforeEach(() => {
	localStorage.clear();
	jest.restoreAllMocks();
	jest.spyOn(console, "warn").mockImplementation(() => {});
});

describe("fingerprint", () => {
	it("ignores whitespace but not content", () => {
		expect(fingerprint("<p>A  B</p>\n")).toBe(fingerprint(" <p>A B</p>"));
		expect(fingerprint("<p>A B</p>")).not.toBe(fingerprint("<p>A C</p>"));
	});
});

describe("saved snapshot", () => {
	it("is returned only for its own course", () => {
		expect(saveSnapshot(snapshot())).toBe(true);
		expect(loadSnapshot(42)?.originalHtml).toBe(ORIGINAL);
		expect(loadSnapshot("42")?.courseName).toBe("DEV_TEST101");
		expect(loadSnapshot(43)).toBeNull();
	});

	it("is replaced by a newer one (one slot)", () => {
		saveSnapshot(snapshot());
		saveSnapshot(snapshot({ courseId: 7, courseName: "DEV_OTHER" }));
		expect(loadSnapshot(42)).toBeNull();
		expect(loadSnapshot(7)?.courseName).toBe("DEV_OTHER");
	});

	it("expires after 7 days and is deleted", () => {
		const savedAt = 1_000_000;
		saveSnapshot(snapshot({ savedAt }));
		expect(readSnapshot(savedAt + SNAPSHOT_TTL_MS - 1)).not.toBeNull();
		expect(readSnapshot(savedAt + SNAPSHOT_TTL_MS + 1)).toBeNull();
		expect(localStorage.getItem(SNAPSHOT_KEY)).toBeNull();
	});

	it("ignores unreadable or malformed data", () => {
		localStorage.setItem(SNAPSHOT_KEY, "not json");
		expect(readSnapshot()).toBeNull();
		localStorage.setItem(SNAPSHOT_KEY, JSON.stringify({ courseId: "x" }));
		expect(readSnapshot()).toBeNull();
		expect(localStorage.getItem(SNAPSHOT_KEY)).toBeNull();
	});

	it("reports failure when storage is unavailable or the course id is unusable", () => {
		expect(saveSnapshot(snapshot({ courseId: NaN }))).toBe(false);
		jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
			throw new Error("quota");
		});
		expect(saveSnapshot(snapshot())).toBe(false);
	});

	it("records the fingerprint of what Canvas stored", () => {
		saveSnapshot(snapshot({ syncedFingerprint: null }));
		recordSyncedFingerprint(42, SYNCED);
		expect(loadSnapshot(42)?.syncedFingerprint).toBe(fingerprint(SYNCED));
	});
});

describe("undoSync", () => {
	it("restores the original syllabus and clears the backup", async () => {
		saveSnapshot(snapshot());
		const canvas = fakeCanvas(SYNCED);
		const result = await undoSync(42, { getCourse: canvas.getCourse });
		expect(result.status).toBe("restored");
		expect(canvas.state.html).toBe(ORIGINAL);
		expect(loadSnapshot(42)).toBeNull();
	});

	it("does nothing when the syllabus was edited after the sync, unless forced", async () => {
		saveSnapshot(snapshot());
		const canvas = fakeCanvas("<p>Edited after the sync</p>");

		const result = await undoSync(42, { getCourse: canvas.getCourse });
		expect(result.status).toBe("stale");
		expect(canvas.state.html).toBe("<p>Edited after the sync</p>");
		expect(loadSnapshot(42)).not.toBeNull(); // still available

		const forced = await undoSync(42, { force: true, getCourse: canvas.getCourse });
		expect(forced.status).toBe("restored");
		expect(canvas.state.html).toBe(ORIGINAL);
	});

	it("skips the edit check when the synced version couldn't be recorded", async () => {
		saveSnapshot(snapshot({ syncedFingerprint: null }));
		const canvas = fakeCanvas("<p>Anything</p>");
		expect((await undoSync(42, { getCourse: canvas.getCourse })).status).toBe("restored");
	});

	it("reports when there is nothing to restore for the course", async () => {
		saveSnapshot(snapshot());
		const canvas = fakeCanvas(SYNCED);
		expect((await undoSync(99, { getCourse: canvas.getCourse })).status).toBe("none");
		expect(canvas.getCourse).not.toHaveBeenCalled();
	});

	it("keeps the backup and reports an error when Canvas can't be reached", async () => {
		saveSnapshot(snapshot());
		const result = await undoSync(42, {
			getCourse: async () => {
				throw new Error("network down");
			},
		});
		expect(result.status).toBe("error");
		expect(result.message).toContain("network down");
		expect(loadSnapshot(42)).not.toBeNull();
	});

	it("keeps the backup and reports an error when Canvas stores something different from the backup", async () => {
		saveSnapshot(snapshot());
		const canvas = fakeCanvas(SYNCED, (html) => html + "<p>extra</p>");
		const result = await undoSync(42, { getCourse: canvas.getCourse });
		expect(result.status).toBe("error");
		expect(loadSnapshot(42)).not.toBeNull();
	});
});
