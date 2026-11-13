import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { SyncUndoBanner } from "../SyncUndoBanner";
import { fingerprint, loadSnapshot, saveSnapshot, undoSync } from "@publish/fixesAndUpdates/validations/syllabusUndo";

jest.mock("@ueu/ueu-canvas", () => ({ getCourseById: jest.fn() }));
jest.mock("@publish/fixesAndUpdates/validations/syllabusUndo", () => ({
	...jest.requireActual("@publish/fixesAndUpdates/validations/syllabusUndo"),
	undoSync: jest.fn(),
}));

const mockUndo = undoSync as jest.Mock;

function saveBackup(courseId = 42) {
	saveSnapshot({
		courseId,
		courseName: "DEV_TEST101",
		savedAt: Date.now(),
		originalHtml: "<p>before</p>",
		syncedFingerprint: fingerprint("<p>after</p>"),
	});
}

beforeEach(() => {
	localStorage.clear();
	mockUndo.mockReset();
});

describe("SyncUndoBanner", () => {
	it("shows nothing when there is no backup, or the backup is for another course", () => {
		const { container, rerender } = render(<SyncUndoBanner courseId={42} variant="page" />);
		expect(container).toBeEmptyDOMElement();
		saveBackup(7);
		rerender(<SyncUndoBanner courseId={42} variant="page" refreshKey={1} />);
		expect(container).toBeEmptyDOMElement();
	});

	it("on the syllabus page offers Undo sync and Looks good; Looks good clears the backup", () => {
		saveBackup();
		render(<SyncUndoBanner courseId={42} variant="page" />);
		expect(screen.getByText(/Syllabus Sync ran/)).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Undo sync" })).toBeInTheDocument();
		expect(screen.queryByText("View syllabus")).toBeNull();

		fireEvent.click(screen.getByRole("button", { name: "Looks good" }));

		expect(screen.queryByText(/Syllabus Sync ran/)).toBeNull();
		expect(loadSnapshot(42)).toBeNull();
	});

	it("in the course panel links to the syllabus in a new tab and can be dismissed", () => {
		saveBackup();
		render(<SyncUndoBanner courseId={42} variant="panel" />);
		const open = jest.spyOn(window, "open").mockImplementation(() => null);
		fireEvent.click(screen.getByRole("button", { name: "View syllabus" }));
		expect(open).toHaveBeenCalledWith("/courses/42/assignments/syllabus", "_blank", "noopener,noreferrer");
		fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));
		expect(loadSnapshot(42)).toBeNull();
	});

	it("picks up a new backup when refreshKey changes", () => {
		const { rerender } = render(<SyncUndoBanner courseId={42} variant="panel" refreshKey={0} />);
		expect(screen.queryByText(/Syllabus Sync ran/)).toBeNull();
		saveBackup();
		rerender(<SyncUndoBanner courseId={42} variant="panel" refreshKey={1} />);
		expect(screen.getByText(/Syllabus Sync ran/)).toBeInTheDocument();
	});

	it("warns when the syllabus was edited since, and only undoes it after Undo anyway", async () => {
		saveBackup();
		mockUndo.mockResolvedValueOnce({ status: "stale", message: "The syllabus has been edited since the sync." });
		render(<SyncUndoBanner courseId={42} variant="panel" />);

		fireEvent.click(screen.getByRole("button", { name: "Undo sync" }));
		expect(await screen.findByText(/has been edited since the sync/)).toBeInTheDocument();
		expect(mockUndo).toHaveBeenLastCalledWith(42, { force: false });

		mockUndo.mockResolvedValueOnce({ status: "restored", message: "Restored." });
		fireEvent.click(screen.getByRole("button", { name: "Undo anyway" }));
		await waitFor(() => expect(mockUndo).toHaveBeenLastCalledWith(42, { force: true }));
	});

	it("Cancel on the edited-since warning leaves everything as it was", async () => {
		saveBackup();
		mockUndo.mockResolvedValueOnce({ status: "stale", message: "The syllabus has been edited since the sync." });
		render(<SyncUndoBanner courseId={42} variant="panel" />);
		fireEvent.click(screen.getByRole("button", { name: "Undo sync" }));
		fireEvent.click(await screen.findByRole("button", { name: "Cancel" }));
		expect(screen.getByRole("button", { name: "Undo sync" })).toBeInTheDocument();
		expect(mockUndo).toHaveBeenCalledTimes(1);
	});

	it("in the course panel, tells the user the syllabus was restored and refreshes the course", async () => {
		saveBackup();
		mockUndo.mockResolvedValueOnce({ status: "restored", message: "The syllabus was restored." });
		const onUndone = jest.fn();
		render(<SyncUndoBanner courseId={42} variant="panel" onUndone={onUndone} />);

		fireEvent.click(screen.getByRole("button", { name: "Undo sync" }));

		expect(await screen.findByText(/The syllabus was restored/)).toBeInTheDocument();
		expect(onUndone).toHaveBeenCalledTimes(1);
		expect(screen.queryByRole("button", { name: "Undo sync" })).toBeNull();
		expect(screen.getByRole("button", { name: "Dismiss" })).toBeInTheDocument();
	});

	it("the restored message clears itself after a few seconds", async () => {
		jest.useFakeTimers();
		try {
			saveBackup();
			mockUndo.mockResolvedValueOnce({ status: "restored", message: "The syllabus was restored." });
			render(<SyncUndoBanner courseId={42} variant="panel" />);
			fireEvent.click(screen.getByRole("button", { name: "Undo sync" }));
			expect(await screen.findByText(/The syllabus was restored/)).toBeInTheDocument();
			act(() => {
				jest.advanceTimersByTime(3100);
			});
			expect(screen.queryByText(/The syllabus was restored/)).toBeNull();
		} finally {
			jest.useRealTimers();
		}
	});

	it("shows an error and keeps the backup when undo fails", async () => {
		saveBackup();
		mockUndo.mockResolvedValueOnce({ status: "error", message: "Couldn't undo the sync: network down" });
		render(<SyncUndoBanner courseId={42} variant="panel" />);
		fireEvent.click(screen.getByRole("button", { name: "Undo sync" }));
		expect(await screen.findByText(/network down/)).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Undo sync" })).toBeInTheDocument();
		expect(loadSnapshot(42)).not.toBeNull();
	});
});
