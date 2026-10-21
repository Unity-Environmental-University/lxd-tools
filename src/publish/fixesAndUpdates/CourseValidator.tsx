import React from "react";
import "./CourseValidTest.scss";
import { ValidationRow } from "./ValidationRow";
import { Course } from "@ueu/ueu-canvas/course/Course";
import { Col } from "react-bootstrap";
import { CourseValidation } from "@publish/fixesAndUpdates/validations/types";
import { ValidationResult } from "./validations/utils";

export type CourseValidatorProps<T = Course> = {
	course: T;
	showOnlyFailures: boolean;
	refreshCourse: () => Promise<any>;
	tests: CourseValidation<T>[];
	runInProgress?: boolean;
	validationLoading?: boolean;
	validationRunStarted?: boolean;
	onValidationsComplete?: () => void;
};

export function CourseValidator({
	course,
	tests,
	refreshCourse,
	showOnlyFailures = false,
	runInProgress: runInProgressProp = false,
	validationLoading = false,
	validationRunStarted = false,
	onValidationsComplete,
}: CourseValidatorProps) {
	type ResultSet = {
		courseId: number;
		result: ValidationResult;
		test: CourseValidation;
	};
	const [results, setResults] = React.useState<ResultSet[]>([]);

	React.useEffect(() => {
		if (!validationRunStarted) return;
		if (!validationLoading && tests.length === 0) {
			onValidationsComplete?.();
		} else if (
			!validationLoading &&
			tests.length > 0 &&
			new Set(results.map(({ test }) => test.name)).size === tests.length
		) {
			onValidationsComplete?.();
		}
	}, [
		results,
		tests,
		validationLoading,
		validationRunStarted,
		onValidationsComplete,
	]);

	const validated = (
		courseId: number,
		result: ValidationResult,
		test: CourseValidation,
	) => {
		setResults((currentResults) => [
			...currentResults.filter(
				({ test: currentTest }) => currentTest.name !== test.name,
			),
			{ courseId, result, test },
		]);
	};

	// While any test has yet to report a result the list is still settling;
	// rows must not change height or disappear mid-run or Fix? buttons drift under the cursor.
	const waitingOnTests = tests.some(
		(test) => !results.some((r) => r.test === test),
	);
	const runInProgress = runInProgressProp || waitingOnTests;

	return (
		<Col>
			{showOnlyFailures || (
				<h2 data-testid="header">Course Settings and Content Tests</h2>
			)}

			{tests.map((test, _i) => (
				<ValidationRow
					key={`${course.id}${test.name}`}
					course={course}
					test={test}
					showOnlyFailures={showOnlyFailures}
					runInProgress={runInProgress}
					refreshCourse={refreshCourse}
					onValidationResult={(result, test) =>
						validated(course.id, result, test)
					}
				/>
			))}
		</Col>
	);
}
