import { getCourseById } from "@ueu/ueu-canvas";

// One saved copy of the syllabus as it was before the most recent Syllabus Sync, kept in this browser so the sync can be
// undone. Syncing another course replaces it. It is read from the course page (where Sync runs) and from the syllabus page
// (where the Undo banner shows); both are the same Canvas origin, so they share this storage.

export const SNAPSHOT_KEY = "LXD_SYLLABUS_SYNC_UNDO";
export const SNAPSHOT_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export type SyllabusSnapshot = {
	courseId: number;
	courseName: string;
	savedAt: number;
	/** The syllabus exactly as Canvas returned it before the sync. */
	originalHtml: string;
	/** Fingerprint of the syllabus as Canvas stored it after the sync; null if that couldn't be read back. */
	syncedFingerprint: string | null;
};

/**
 * Short fingerprint of a syllabus, ignoring whitespace differences. Used to tell whether the syllabus in Canvas is still
 * the one Sync wrote (Canvas re-serializes HTML on save, so the string that was sent can't be compared directly).
 */
export function fingerprint(html: string): string {
	const text = html.replace(/\s+/g, " ").trim();
	let hash = 0x811c9dc5;
	for (let i = 0; i < text.length; i++) {
		hash ^= text.charCodeAt(i);
		hash = Math.imul(hash, 0x01000193) >>> 0;
	}
	return `${text.length}:${hash.toString(16)}`;
}

function isSnapshot(value: any): value is SyllabusSnapshot {
	return (
		value &&
		typeof value.courseId === "number" &&
		typeof value.courseName === "string" &&
		typeof value.savedAt === "number" &&
		typeof value.originalHtml === "string" &&
		(value.syncedFingerprint === null || typeof value.syncedFingerprint === "string")
	);
}

/** Returns false if the snapshot couldn't be stored (storage full or blocked, or the course id isn't usable). */
export function saveSnapshot(snapshot: SyllabusSnapshot): boolean {
	if (!Number.isFinite(snapshot.courseId)) return false;
	try {
		localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(snapshot));
		return true;
	} catch (e) {
		console.warn("Could not save a syllabus backup for undo:", e);
		return false;
	}
}

export function clearSnapshot(): void {
	try {
		localStorage.removeItem(SNAPSHOT_KEY);
	} catch (e) {
		console.warn("Could not clear the saved syllabus backup:", e);
	}
}

/** The saved snapshot, or null if there is none, it is older than 7 days (it is deleted), or it is unreadable. */
export function readSnapshot(now = Date.now()): SyllabusSnapshot | null {
	try {
		const raw = localStorage.getItem(SNAPSHOT_KEY);
		if (!raw) return null;
		const parsed = JSON.parse(raw);
		if (!isSnapshot(parsed)) {
			clearSnapshot();
			return null;
		}
		if (now - parsed.savedAt > SNAPSHOT_TTL_MS) {
			clearSnapshot();
			return null;
		}
		return parsed;
	} catch (e) {
		console.warn("Could not read the saved syllabus backup:", e);
		return null;
	}
}

/** The snapshot, only if it is for the given course. */
export function loadSnapshot(courseId: number | string, now = Date.now()): SyllabusSnapshot | null {
	const snapshot = readSnapshot(now);
	return snapshot && snapshot.courseId === Number(courseId) ? snapshot : null;
}

/** Records what Canvas stored after the sync, so a later undo can tell whether anyone has edited the syllabus since. */
export function recordSyncedFingerprint(courseId: number, syncedHtml: string): void {
	const snapshot = loadSnapshot(courseId);
	if (snapshot) saveSnapshot({ ...snapshot, syncedFingerprint: fingerprint(syncedHtml) });
}

export type UndoResult =
	| { status: "restored"; message: string }
	/** The syllabus has been edited since the sync; nothing was changed. Call again with `force` to restore anyway. */
	| { status: "stale"; message: string }
	| { status: "none"; message: string }
	| { status: "error"; message: string };

type CourseLike = {
	getSyllabus: () => Promise<string>;
	changeSyllabus: (html: string) => Promise<unknown>;
};

/**
 * Puts the syllabus back as it was before the last sync. Unless `force` is set, it first checks that the syllabus in
 * Canvas is still what the sync wrote and refuses ("stale") if someone has edited it since. Reads and writes use a
 * fresh copy of the course, never a cached one.
 */
export async function undoSync(
	courseId: number | string,
	{
		force = false,
		getCourse = (id: number) => getCourseById(id) as Promise<CourseLike>,
	}: { force?: boolean; getCourse?: (id: number) => Promise<CourseLike> } = {},
): Promise<UndoResult> {
	const snapshot = loadSnapshot(courseId);
	if (!snapshot) return { status: "none", message: "There is no saved syllabus to restore for this course." };

	try {
		const live = await (await getCourse(snapshot.courseId)).getSyllabus();
		if (!force && snapshot.syncedFingerprint && fingerprint(live) !== snapshot.syncedFingerprint) {
			return {
				status: "stale",
				message: "The syllabus has been edited since the sync. Undoing will discard those edits.",
			};
		}

		await (await getCourse(snapshot.courseId)).changeSyllabus(snapshot.originalHtml);

		const restored = await (await getCourse(snapshot.courseId)).getSyllabus();
		if (fingerprint(restored) !== fingerprint(snapshot.originalHtml)) {
			return {
				status: "error",
				message:
					"The syllabus was saved, but Canvas now holds something different from the backup. Check the syllabus before doing anything else.",
			};
		}
		clearSnapshot();
		return { status: "restored", message: "The syllabus was restored to how it was before the sync." };
	} catch (e) {
		return { status: "error", message: `Couldn't undo the sync: ${e instanceof Error ? e.message : String(e)}` };
	}
}
