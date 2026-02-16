import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ValidationRow, ValidationRowProps } from "@/publish/fixesAndUpdates/ValidationRow";
import { mockCourseData } from "@ueu/ueu-canvas";
import { Course } from "@ueu/ueu-canvas";
import { ValidationResult } from "@publish/fixesAndUpdates/validations/utils";
import { act } from "react";
import { CourseValidation } from "@publish/fixesAndUpdates/validations/types";

const mockCourse = new Course(mockCourseData); // Use appropriate instantiation for Course
const mockValidation: CourseValidation = {
  name: "Test Validation",
  description: "This is a test validation",
  run: jest.fn().mockResolvedValue({ success: true, messages: [], links: [] }),
  fix: jest.fn().mockResolvedValue({}),
};
const mockRefreshCourse = jest.fn().mockResolvedValue({});
const mockOnValidationResult = jest.fn();
const mockOnFixResult = jest.fn();

const defaultProps: ValidationRowProps = {
  course: mockCourse,
  test: mockValidation,
  slim: false,
  initialResult: undefined,
  refreshCourse: mockRefreshCourse,
  onValidationResult: mockOnValidationResult,
  onFixResult: mockOnFixResult,
  showOnlyFailures: false,
};

describe("ValidationRow component", () => {
  it("should render the validation row with test details", async () => {
    await act(async () => render(<ValidationRow {...defaultProps} />));
    expect(screen.getByText("Test Validation")).toBeInTheDocument();
    expect(screen.getByText("This is a test validation")).toBeInTheDocument();
  });

  it("should display success status when validation succeeds", async () => {
    const result: ValidationResult = { success: true, messages: [], links: [] };
    const props = { ...defaultProps, initialResult: result };
    await act(async () => render(<ValidationRow {...props} />));
    await waitFor(() => expect(screen.getByText("Succeeded!")).toBeInTheDocument());
  });

  it("should display failure status when validation fails", async () => {
    const result: ValidationResult = {
      success: false,
      messages: [{ bodyLines: ["Error occurred"], links: [] }],
      links: [],
    };
    const props = { ...defaultProps, initialResult: result };
    await act(async () => render(<ValidationRow {...props} />));
    await waitFor(() => {
      expect(screen.getByText("Failed")).toBeInTheDocument();
      expect(screen.getByText("Error occurred")).toBeInTheDocument();
    });
  });

  it("should call fix function when fix button is clicked", async () => {
    const result: ValidationResult = { success: false, messages: [], links: [] };
    const props = { ...defaultProps, initialResult: result };
    await act(async () => render(<ValidationRow {...props} />));
    const fixButton = screen.getByText("Fix?");
    await act(async () => fireEvent.click(fixButton));
    await waitFor(() => expect(mockValidation.fix).toHaveBeenCalled());
  });

  it("should call onValidationResult with the validation result", async () => {
    const result: ValidationResult = { success: true, messages: [], links: [] };
    const props = { ...defaultProps, initialResult: result };
    await act(async () => render(<ValidationRow {...props} />));
    await waitFor(() => expect(mockOnValidationResult).toHaveBeenCalledWith(result, mockValidation));
  });

  it("should call onFixResult with the fix result", async () => {
    const result: ValidationResult = { success: false, messages: [], links: [] };
    const props = { ...defaultProps, initialResult: result };
    await act(async () => render(<ValidationRow {...props} />));
    const fixButton = screen.getByText("Fix?");
    await act(async () => fireEvent.click(fixButton));
    await waitFor(() => expect(mockOnFixResult).toHaveBeenCalledWith(expect.any(Object), mockValidation));
  });
});
