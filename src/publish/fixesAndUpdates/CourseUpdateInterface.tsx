import React, { useEffect, useState } from "react";
import { useEffectAsync } from "../../ui/utils";
import { Alert, Button, Spinner } from "react-bootstrap";
import Modal from "../../ui/widgets/Modal/index";
import { UpdateStartDate } from "./UpdateStartDate";
import { CourseValidator } from "./CourseValidator";
import { Course } from "@ueu/ueu-canvas/course/Course";
import { CourseValidation } from "@publish/fixesAndUpdates/validations/types";
import { syncSyllabusWithResult } from "@publish/fixesAndUpdates/validations/syncSyllabus";
import { SyncUndoBanner } from "../../ui/syllabus/SyncUndoBanner";

const SUCCESS_MESSAGE_MS = 3000;

type SyncStatus =
	| { state: "idle" }
	| { state: "syncing" }
	| { state: "success"; message: string; autoDismiss: boolean }
	| { state: "error"; message: string; details: string };

export type CourseUpdateInterfaceProps = {
	course?: Course;
	parentCourse?: Course;
	onChangeMode?: (mode: InterfaceMode) => any;
	allValidations: CourseValidation<Course, any, any>[];
	refreshCourse: () => Promise<void>;
};

export class MismatchedUnloadError extends Error {
	public name = "Mismatched Unload Error";
}

export type InterfaceMode = "fix" | "unitTest";

export function CourseUpdateInterface({
	course,
	refreshCourse,
	allValidations,
	onChangeMode,
}: CourseUpdateInterfaceProps) {
	const [validations, setValidations] = useState<
		CourseValidation<Course, any, any>[]
	>([]);
	const [show, setShow] = useState(false);
	const [buttonText, setButtonText] = useState("Content Fixes");
	const [affectedItems, setAffectedItems] = useState<React.ReactElement[]>([]);
	const [_, setUnaffectedItems] = useState<React.ReactElement[]>([]);
	const [failedItems, setFailedItems] = useState<React.ReactElement[]>([]);
	const [deannotatingCount, setLoadingCount] = useState(0);
	const [_error, setError] = useState<string | null>(null);
	const [mode, setMode] = useState<InterfaceMode>("fix");
	const [_startDateSetMode, setStartDateSetMode] = useState(false);
	const [batchingValidations, setBatchingValidations] = useState(false);
	const [validationRunStarted, setValidationRunStarted] = useState(false);
	const [validationRunId, setValidationRunId] = useState(0);
	const [showValidationsComplete, setShowValidationsComplete] = useState(false);
	const [showUpdateStartDate, setShowUpdateStartDate] = useState(false);
	const [isChangingStartDate, setIsChangingStartDate] = useState(false);
	const [syncStatus, setSyncStatus] = useState<SyncStatus>({ state: "idle" });
	const [syncBackupVersion, setSyncBackupVersion] = useState(0);

	const runSyncSyllabus = async (course: Course) => {
		if (syncStatus.state === "syncing") return;
		setSyncStatus({ state: "syncing" });
		// Keep "Syncing..." visible long enough to register, even when the sync is instant
		const minDisplay = new Promise((resolve) => setTimeout(resolve, 600));
		const result = await syncSyllabusWithResult(course);
		await minDisplay;
		setSyncBackupVersion((v) => v + 1); // re-read the backup of the previous syllabus
		if (result.success) {
			setSyncStatus({
				state: "success",
				// The blue undo banner carries the follow-up, so the green box fades away; unless it says undo is unavailable
				autoDismiss: result.undoAvailable !== false,
				message:
					result.message +
					(result.undoAvailable === false
						? " Undo isn't available for this sync, because this browser couldn't save a backup of the previous syllabus."
						: ""),
			});
		} else {
			setSyncStatus({
				state: "error",
				message: result.message,
				details: [
					"Syllabus sync failed",
					`Course: ${course.name} (id ${course.id})`,
					`Time: ${new Date().toISOString()}`,
					`Error: ${result.message}`,
				].join("\n"),
			});
		}
	};

	// The green success box clears itself after a few seconds (the undo banner stays)
	useEffect(() => {
		if (syncStatus.state !== "success" || !syncStatus.autoDismiss) return;
		const timer = setTimeout(() => setSyncStatus({ state: "idle" }), SUCCESS_MESSAGE_MS);
		return () => clearTimeout(timer);
	}, [syncStatus]);

	const runValidationsDisabled =
		!course || isRemovingAnnotations() || batchingValidations;

	// Prevent page unload when processing
	useEffect(() => {
		const handleBeforeUnload = (event: BeforeUnloadEvent) => {
			if (deannotatingCount > 0 || batchingValidations || isChangingStartDate) {
				event.preventDefault();
				event.returnValue = "";
			}
		};

		window.addEventListener("beforeunload", handleBeforeUnload);
		return () => {
			window.removeEventListener("beforeunload", handleBeforeUnload);
		};
	}, [deannotatingCount, batchingValidations, isChangingStartDate]);

	const batchValidationsOverTime = async (
		inValidations: CourseValidation<Course, any, any>[],
		batchSize: number = 10,
		delay = 2,
	) => {
		let localValidations: CourseValidation<Course, any, any>[] = [];
		inValidations = inValidations.filter(courseSpecificTestFilter);

		for (let i = 0; i < inValidations.length; i += batchSize) {
			const batch = inValidations.slice(i, i + batchSize);
			localValidations = [...localValidations, ...batch];
			setValidations(localValidations);

			await new Promise((resolve) => setTimeout(resolve, delay * 1000));
		}
	};

	const runValidations = () => async () => {
		if (batchingValidations) return;
		setShowValidationsComplete(false);
		setValidationRunStarted(true);
		setValidationRunId((currentRunId) => currentRunId + 1);
		setValidations([]);
		setBatchingValidations(true);
		await batchValidationsOverTime(allValidations, 10, 2);
		setBatchingValidations(false);
		if (allValidations.filter(courseSpecificTestFilter).length === 0) {
			setShowValidationsComplete(true);
			setValidationRunStarted(false);
		}
	};

	const handleValidationsComplete = () => {
		setShowValidationsComplete(true);
		setValidationRunStarted(false);
	};

	useEffect(() => {
		if (!showValidationsComplete) return;
		const timer = window.setTimeout(
			() => setShowValidationsComplete(false),
			3000,
		);
		return () => window.clearTimeout(timer);
	}, [showValidationsComplete]);

	useEffect(() => {
		// eslint-disable-next-line @typescript-eslint/no-unused-expressions
		onChangeMode && onChangeMode(mode);
	}, [mode]);

	const courseSpecificTestFilter = (
		validation: CourseValidation<Course, any, any>,
	) => {
		if (!validation.courseCodes) return true;
		for (const code of validation.courseCodes) {
			if (
				course?.parsedCourseCode
					?.toUpperCase()
					.includes(code.toLocaleUpperCase("en-US"))
			) {
				return true;
			}
		}
		return false;
	};

	useEffectAsync(async () => {
		if (!course) return;

		if (course.isDev) {
			setButtonText("DEV Content Changes/Fixes");
		} else if (course.isBlueprint()) {
			setButtonText("BP Content Fixes");
		} else {
			setButtonText("Can Only Fix from BP or DEV");
		}
	}, [course]);

	/* increment and decrement is loading just in case we end up setting it asynchronously somehow */
	function startLoading() {
		setLoadingCount(1);
		setFailedItems([]);
		setAffectedItems([]);
		setUnaffectedItems([]);
	}

	function isDisabled() {
		if (!course) return true;
		return !(course.isBlueprint() || course.isDev);
	}

	function endLoading() {
		setLoadingCount(0);
		console.log(deannotatingCount, "-");
		if (deannotatingCount < 0) throw new MismatchedUnloadError();
	}

	function isRemovingAnnotations() {
		return deannotatingCount > 0;
	}

	function urlRows(links: React.ReactElement[], className = "lxd-cu") {
		return links.map((link, i) => (
			<div key={i} className={["row", className].join(" ")}>
				{link}
			</div>
		));
	}

	function setStartDateOutcome(outcome: string) {
		if (outcome === "success") {
			setStartDateSetMode(true);
		} else {
			setError(outcome);
		}
	}

	const toggleStartDateUI = () => {
		setShowUpdateStartDate((current) => !current);
	};

	// Sync results and the undo banner, shown at the top of the window beside the "Show All Tests" button
	// (A plain function, not a component, so the banner keeps its state when this window re-renders)
	function renderSyncBanners(course: Course) {
		return (
			<>
				{syncStatus.state === "success" && (
					<Alert variant="success" style={{ margin: 0 }}>
						<div
							style={{
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
								gap: "12px",
							}}
						>
							<span>{syncStatus.message}</span>
							<Button
								size="sm"
								variant="outline-success"
								onClick={() => setSyncStatus({ state: "idle" })}
							>
								Dismiss
							</Button>
						</div>
					</Alert>
				)}
				{syncStatus.state === "error" && (
					<Alert variant="danger" style={{ margin: 0 }}>
						<Alert.Heading as="h3">Syllabus sync failed</Alert.Heading>
						<p style={{ marginBottom: "8px" }}>{syncStatus.message}</p>
						<p style={{ marginBottom: "8px" }}>
							The syllabus was not changed. Please report this message to the
							LXD tools team.
						</p>
						<div style={{ display: "flex", gap: "8px" }}>
							<Button
								size="sm"
								variant="outline-danger"
								onClick={() =>
									navigator.clipboard?.writeText(syncStatus.details)
								}
							>
								Copy details
							</Button>
							<Button
								size="sm"
								variant="outline-secondary"
								onClick={() => setSyncStatus({ state: "idle" })}
							>
								Dismiss
							</Button>
						</div>
					</Alert>
				)}

				{course && (
					<SyncUndoBanner
						courseId={course.id}
						variant="panel"
						style={{ margin: 0 }}
						refreshKey={syncBackupVersion}
						onUndone={() => void refreshCourse()}
					/>
				)}
			</>
		);
	}

	// This is the styling of the course update interface
	function FixesMode({ course }: { course: Course }) {
		return (
			<>
				<h2>Content Fixes for {course.name}</h2>

				<div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
					<Button
						onClick={() => toggleStartDateUI()}
						disabled={isChangingStartDate}
					>
						Update Start Date
					</Button>

					<Button
						onClick={() => runSyncSyllabus(course)}
						disabled={!course || syncStatus.state === "syncing"}
					>
						{syncStatus.state === "syncing" ? (
							<>
								<Spinner
									as="span"
									animation="border"
									size="sm"
									role="status"
									aria-hidden="true"
									style={{ marginRight: "8px" }}
								/>
								Syncing...
							</>
						) : (
							"Sync Syllabus"
						)}
					</Button>
				</div>

				<hr />

				{showUpdateStartDate && (
					<UpdateStartDate
						setAffectedItems={setAffectedItems}
						setUnaffectedItems={setUnaffectedItems}
						setFailedItems={setFailedItems}
						refreshCourse={refreshCourse}
						course={course}
						setStartDateOutcome={setStartDateOutcome}
						isDisabled={deannotatingCount > 0}
						startLoading={startLoading}
						endLoading={endLoading}
						onStartDateChangeStart={() => setIsChangingStartDate(true)}
						onStartDateChangeEnd={() => setIsChangingStartDate(false)}
					/>
				)}

				<hr />

				<Button onClick={runValidations()} disabled={runValidationsDisabled}>
					{batchingValidations ? "Loading Validations..." : "Run Validations"}
				</Button>
				{affectedItems.length > 0 && <h3>Fixes Succeeded</h3>}
				{urlRows(affectedItems, "lxd-cu-success")}
				{failedItems.length > 0 && <h3>Fix is Broken, Content Unchanged</h3>}
				{urlRows(failedItems, "lxd-cu-fail")}

				{showValidationsComplete && (
					<div
						className="position-fixed top-0 end-0 m-3 alert alert-success shadow"
						role="status"
						style={{ zIndex: 1000, pointerEvents: "none" }}
					>
						<strong>Validations complete</strong>
					</div>
				)}
			</>
		);
	}

	return (
		course && (
			<>
				<Button
					disabled={isDisabled()}
					role={"button"}
					className={"ui-button"}
					onClick={(_e) => setShow(true)}
				>
					{buttonText}
				</Button>
				<Modal
					isOpen={show}
					requestClose={() => setShow(false)}
					canClose={!deannotatingCount && !isChangingStartDate}
				>
					<div
						className={"d-flex justify-content-between align-items-start"}
						style={{ gap: "12px" }}
					>
						<div
							style={{
								flex: 1,
								minWidth: 0,
								display: "flex",
								flexDirection: "column",
								gap: "8px",
							}}
						>
							{mode === "fix" && renderSyncBanners(course)}
						</div>
						{mode === "fix" && (
							<Button onClick={() => setMode("unitTest")}>
								Show All Tests
							</Button>
						)}
						{mode === "unitTest" && (
							<Button onClick={() => setMode("fix")}>
								Hide Successful Tests
							</Button>
						)}
					</div>
					{mode === "fix" && <FixesMode course={course}></FixesMode>}
					{["fix", "unitTest"].includes(mode) && (
						<CourseValidator
							key={validationRunId}
							showOnlyFailures={mode !== "unitTest"}
							course={course}
							refreshCourse={refreshCourse}
							tests={validations}
							runInProgress={batchingValidations}
							validationLoading={batchingValidations}
							validationRunStarted={validationRunStarted}
							onValidationsComplete={handleValidationsComplete}
						/>
					)}
				</Modal>
			</>
		)
	);
}
