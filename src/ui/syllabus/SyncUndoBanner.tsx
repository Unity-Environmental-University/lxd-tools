import React, { useEffect, useState } from "react";
import { Alert, Button } from "react-bootstrap";
import {
	clearSnapshot,
	loadSnapshot,
	SyllabusSnapshot,
	undoSync,
} from "@publish/fixesAndUpdates/validations/syllabusUndo";

type SyncUndoBannerProps = {
	courseId: number;
	/**
	 * "panel": in the course update panel, right after a sync (includes a link to the syllabus).
	 * "page": at the top of the syllabus page, where the result is reviewed.
	 */
	variant: "panel" | "page";
	/** Change this to make the banner re-read the saved backup (e.g. after a new sync). */
	refreshKey?: number;
	/** Called after the sync was undone (the panel uses it to refresh its copy of the course). */
	onUndone?: () => void;
	/** Overrides the box's default spacing (a small top margin). */
	style?: React.CSSProperties;
};

const RESTORED_MESSAGE_MS = 3000;

export function syllabusUrl(courseId: number) {
	return `/courses/${courseId}/assignments/syllabus`;
}

function formatTime(ms: number) {
	return new Date(ms).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
}

/**
 * Shown while a backup from the last Syllabus Sync exists for this course (until it is undone, dismissed, replaced by
 * another sync, or 7 days old): review the syllabus, then undo the sync or dismiss this.
 */
export function SyncUndoBanner({ courseId, variant, refreshKey = 0, onUndone, style }: SyncUndoBannerProps) {
	const boxStyle = { marginTop: "12px", ...style };
	const [snapshot, setSnapshot] = useState<SyllabusSnapshot | null>(null);
	const [busy, setBusy] = useState(false);
	const [staleWarning, setStaleWarning] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [restored, setRestored] = useState<string | null>(null);

	useEffect(() => {
		setSnapshot(loadSnapshot(courseId));
		setStaleWarning(null);
		setError(null);
		setRestored(null);
	}, [courseId, refreshKey]);

	// Like the sync success message, the "restored" message clears itself after a few seconds
	useEffect(() => {
		if (!restored) return;
		const timer = setTimeout(() => setRestored(null), RESTORED_MESSAGE_MS);
		return () => clearTimeout(timer);
	}, [restored]);

	async function undo(force: boolean) {
		setBusy(true);
		setError(null);
		const result = await undoSync(courseId, { force });
		setBusy(false);
		if (result.status === "stale") {
			setStaleWarning(result.message);
		} else if (result.status === "restored") {
			setStaleWarning(null);
			setSnapshot(null);
			if (variant === "page") {
				location.reload(); // show the restored syllabus
			} else {
				setRestored(result.message);
				onUndone?.();
			}
		} else {
			setStaleWarning(null);
			setError(result.message);
		}
	}

	function dismiss() {
		clearSnapshot();
		setSnapshot(null);
		setStaleWarning(null);
		setError(null);
	}

	if (restored) {
		return (
			<Alert variant="success" style={boxStyle}>
				<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
					<span>{restored}</span>
					<Button size="sm" variant="outline-success" onClick={() => setRestored(null)}>
						Dismiss
					</Button>
				</div>
			</Alert>
		);
	}
	if (!snapshot) return null;

	return (
		<Alert variant={staleWarning || error ? "warning" : "info"} style={boxStyle}>
			<p style={{ marginBottom: "8px" }}>
				<strong>Syllabus Sync ran {formatTime(snapshot.savedAt)}.</strong>{" "}
				{variant === "panel"
					? "Review the syllabus, and undo the sync if something looks wrong."
					: "Look over the syllabus. If something looks wrong, undo the sync to restore the previous version."}
			</p>
			{staleWarning && <p style={{ marginBottom: "8px" }}>{staleWarning}</p>}
			{error && <p style={{ marginBottom: "8px" }}>{error}</p>}
			<div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
				{variant === "panel" && (
					<Button
						size="sm"
						variant="primary"
						onClick={() => window.open(syllabusUrl(courseId), "_blank", "noopener,noreferrer")}
					>
						View syllabus
					</Button>
				)}
				{staleWarning ? (
					<>
						<Button size="sm" variant="danger" disabled={busy} onClick={() => undo(true)}>
							{busy ? "Undoing..." : "Undo anyway"}
						</Button>
						<Button size="sm" variant="outline-secondary" disabled={busy} onClick={() => setStaleWarning(null)}>
							Cancel
						</Button>
					</>
				) : (
					<>
						<Button size="sm" variant="warning" disabled={busy} onClick={() => undo(false)}>
							{busy ? "Undoing..." : "Undo sync"}
						</Button>
						<Button size="sm" variant="outline-secondary" disabled={busy} onClick={dismiss}>
							{variant === "page" ? "Looks good" : "Dismiss"}
						</Button>
					</>
				)}
			</div>
		</Alert>
	);
}
