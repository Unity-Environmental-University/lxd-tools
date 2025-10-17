import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import {RubricButton} from "@/ui/course/RubricButton";
import { Course } from '@canvas/course/Course';
import {
    getContentDataFromUrl,
    getRubric,
    IAssignmentData,
    IDiscussionData,
    IRubricData,
    IRubricAssociationData
} from '@/canvas';
import { getSingleCourse } from '@canvas/course';
import { getAssignmentData } from '@canvas/content/assignments/legacy';
import { assignmentDataGen } from '@canvas/content/assignments';
import { fetchJson } from '@canvas/fetch/fetchJson';
import '@testing-library/jest-dom';

// Mock all dependencies
jest.mock('@/canvas');
jest.mock('@canvas/course');
jest.mock('@canvas/content/assignments/legacy');
jest.mock('@canvas/content/assignments');
jest.mock('@canvas/fetch/fetchJson');
jest.mock('@canvas/canvasUtils', () => ({
    formDataify: jest.fn((data) => data),
    deepObjectMerge: jest.fn()
}));

describe('RubricButton', () => {
    let mockCourse: Course;
    let mockRelatedCourse: Course;
    let mockConfirm: jest.SpyInstance;
    let mockAlert: jest.SpyInstance;

    beforeEach(() => {
        // Mock window.confirm and window.alert
        mockConfirm = jest.spyOn(window, 'confirm').mockReturnValue(true);
        mockAlert = jest.spyOn(window, 'alert').mockImplementation((msg?: string) => {
          return Promise.resolve(console.log(`Alert: ${msg}`));
        });
        jest.spyOn(console, "error").mockImplementation(() => {});

        // Create mock courses
        mockCourse = {
            id: 123,
            name: 'Test Course',
            isDev: true,
            baseCode: 'TEST101',
            getAccountIds: jest.fn().mockReturnValue([1]),
            isBlueprint: jest.fn().mockReturnValue(false),
            getParentCourse: jest.fn(),
            getDiscussions: jest.fn()
        } as any;

        mockRelatedCourse = {
            id: 456,
            name: 'BP_TEST101',
            getDiscussions: jest.fn()
        } as any;

        // Set document.documentURI
        Object.defineProperty(document, 'documentURI', {
            writable: true,
            value: 'https://canvas.test/courses/123/assignments/789'
        });
    });

    afterEach(() => {
        mockConfirm.mockRestore();
        mockAlert.mockRestore();
        (getSingleCourse as jest.Mock).mockReset();
        jest.clearAllMocks();
        jest.resetModules();
    });

    describe('Rendering', () => {
        it('should render the button', () => {
            render(<RubricButton course={mockCourse} />);
            const button = screen.getByRole('button', { name: /rubric/i });
            expect(button).toBeInTheDocument();
        });

        it('should have the correct title attribute', () => {
            render(<RubricButton course={mockCourse} />);
            const button = screen.getByRole('button', { name: /rubric/i });
            expect(button).toHaveAttribute('title', 'Pull the rubric from a corresponding assignment into this one.');
        });
    });

    describe('User confirmation', () => {
        it('should show confirmation dialog when clicked', async () => {
            render(<RubricButton course={mockCourse} />);
            const button = screen.getByRole('button', { name: /rubric/i });

            fireEvent.click(button);

            expect(mockConfirm).toHaveBeenCalledWith(
                'This will try to update the rubric for the assignment based on the same assignment in DEV/BP. Confirm?'
            );
        });

        it('should not proceed if user cancels confirmation', async () => {
            mockConfirm.mockReturnValue(false);
            render(<RubricButton course={mockCourse} />);
            const button = screen.getByRole('button', { name: /rubric/i });

            fireEvent.click(button);

            expect(getSingleCourse).not.toHaveBeenCalled();
        });
    });

    describe('Loading state', () => {
        it('should show loading spinner during operation', async () => {
            (getSingleCourse as jest.Mock).mockImplementation(() => new Promise(() => {}));

            render(<RubricButton course={mockCourse} />);
            const button = screen.getByRole('button', { name: /rubric/i });

            fireEvent.click(button);

            await waitFor(() => {
                expect(button).toBeDisabled();
            });
        });
    });

    describe('Assignment rubric update', () => {
        let mockAssignment: IAssignmentData;
        let mockRelatedAssignment: IAssignmentData;
        let mockRubric: IRubricData;
        let mockRelatedRubric: IRubricData;

        beforeEach(() => {
            mockAssignment = {
                id: 789,
                name: 'Test Assignment',
                points_possible: 100,
                submission_types: ['online_text_entry'],
                rubric_settings: { id: 111 }
            } as any;

            mockRelatedAssignment = {
                id: 790,
                name: 'Test Assignment',
                points_possible: 100,
                submission_types: ['online_text_entry'],
                rubric_settings: { id: 222 }
            } as any;

            mockRubric = {
                id: 111,
                title: 'Test Rubric',
                free_form_criterion_comments: true,
                points_possible: 100,
                associations: [{
                    id: 333,
                    association_id: 789,
                    association_type: 'Assignment',
                    use_for_grading: true,
                    hide_score_total: false,
                    purpose: 'grading'
                }] as IRubricAssociationData[],
                data: [
                    {
                        id: 'crit1',
                        description: 'Criterion 1',
                        long_description: 'Long description 1',
                        points: 50,
                        ratings: [
                            { id: 'rating1', description: 'Excellent', long_description: '', points: 50 },
                            { id: 'rating2', description: 'Poor', long_description: '', points: 0 }
                        ]
                    }
                ]
            } as any;

            mockRelatedRubric = {
                id: 222,
                title: 'Updated Rubric',
                free_form_criterion_comments: false,
                points_possible: 100,
                data: [
                    {
                        id: 'crit2',
                        description: 'New Criterion',
                        long_description: 'New long description',
                        points: 100,
                        ratings: [
                            { id: 'rating3', description: 'Great', long_description: '', points: 100 },
                            { id: 'rating4', description: 'Bad', long_description: '', points: 0 }
                        ]
                    }
                ]
            } as any;

            (getSingleCourse as jest.Mock).mockResolvedValue(mockRelatedCourse);
            (getContentDataFromUrl as jest.Mock).mockResolvedValue(mockAssignment);

            const mockGen = (async function* () {
                yield mockRelatedAssignment;
            })();
            (assignmentDataGen as jest.Mock).mockReturnValue(mockGen);
        });

        it('should successfully update existing rubric', async () => {
            (getRubric as jest.Mock)
                .mockResolvedValueOnce(mockRubric)
                .mockResolvedValueOnce(mockRelatedRubric);
            (fetchJson as jest.Mock).mockResolvedValue({ id: 111 });

            render(<RubricButton course={mockCourse} />);
            const button = screen.getByRole('button', { name: /rubric/i });

            fireEvent.click(button);

            await waitFor(() => {
                expect(fetchJson).toHaveBeenCalledWith(
                    '/api/v1/courses/123/rubrics/111',
                    expect.objectContaining({
                        fetchInit: expect.objectContaining({
                            method: 'PUT'
                        })
                    })
                );
            });

            expect(mockAlert).toHaveBeenCalledWith('Rubric updated successfully!');
        });

        it('should create new rubric if assignment has no rubric', async () => {
            const assignmentWithoutRubric = { ...mockAssignment, rubric_settings: undefined };
            (getContentDataFromUrl as jest.Mock).mockResolvedValue(assignmentWithoutRubric);
            (getRubric as jest.Mock).mockResolvedValue(mockRelatedRubric);
            (fetchJson as jest.Mock).mockResolvedValue({ rubric: { id: 999 } });

            render(<RubricButton course={mockCourse} />);
            const button = screen.getByRole('button', { name: /rubric/i });

            fireEvent.click(button);

            await waitFor(() => {
                expect(fetchJson).toHaveBeenCalledWith(
                    '/api/v1/courses/123/rubrics',
                    expect.objectContaining({
                        fetchInit: expect.objectContaining({
                            method: 'POST'
                        })
                    })
                );
            });

            expect(mockAlert).toHaveBeenCalledWith('Rubric updated successfully!');
        });

        it('should warn when assignment points differ from rubric points', async () => {
            const differentPointsAssignment = { ...mockAssignment, points_possible: 150 };
            (getContentDataFromUrl as jest.Mock).mockResolvedValue(differentPointsAssignment);
            (getRubric as jest.Mock)
                .mockResolvedValueOnce(mockRubric)
                .mockResolvedValueOnce(mockRelatedRubric);
            (fetchJson as jest.Mock).mockResolvedValue({ id: 111 });

            render(<RubricButton course={mockCourse} />);
            const button = screen.getByRole('button', { name: /rubric/i });

            fireEvent.click(button);

            await waitFor(() => {
                expect(mockAlert).toHaveBeenCalledWith(
                    'Rubric updated successfully, but the assignment points are different from the rubric points. You may need to update the points manually.'
                );
            });
        });
    });

    describe('Discussion rubric update', () => {
        let mockDiscussion: IDiscussionData;

        beforeEach(() => {
            mockDiscussion = {
                id: 888,
                title: 'Test Discussion',
                discussion_type: 'threaded',
                assignment_id: 789
            } as any;
        });

        it('should handle discussion with assignment', async () => {
            const mockAssignment = {
                id: 789,
                name: 'Test Assignment',
                points_possible: 100,
                submission_types: ['discussion_topic']
            } as any;

            const mockRelatedAssignment = {
                id: 790,
                name: 'Test Assignment',
                points_possible: 100,
                rubric_settings: { id: 222 }
            } as any;

            const mockRelatedRubric = {
                id: 222,
                title: 'Discussion Rubric',
                points_possible: 100,
                data: []
            } as any;

            (getSingleCourse as jest.Mock).mockResolvedValue(mockRelatedCourse);
            (getContentDataFromUrl as jest.Mock).mockResolvedValue(mockDiscussion);
            (getAssignmentData as jest.Mock).mockResolvedValue(mockAssignment);
            (mockRelatedCourse.getDiscussions as jest.Mock).mockResolvedValue([
                { name: 'Test Discussion', data: { ...mockDiscussion, assignment_id: 790 } }
            ]);
            (getAssignmentData as jest.Mock)
                .mockResolvedValueOnce(mockAssignment)
                .mockResolvedValueOnce(mockRelatedAssignment);
            (getRubric as jest.Mock).mockResolvedValue(mockRelatedRubric);
            (fetchJson as jest.Mock).mockResolvedValue({ rubric: { id: 999 } });

            render(<RubricButton course={mockCourse} />);
            const button = screen.getByRole('button', { name: /rubric/i });

            fireEvent.click(button);

            await waitFor(() => {
                expect(fetchJson).toHaveBeenCalled();
            });
        });

        it('should throw error for ungraded discussion', async () => {
            const ungradedDiscussion = { ...mockDiscussion, assignment_id: undefined };
            (getContentDataFromUrl as jest.Mock).mockResolvedValue(ungradedDiscussion);
            (getSingleCourse as jest.Mock).mockResolvedValue(mockRelatedCourse);

            render(<RubricButton course={mockCourse} />);
            const button = screen.getByRole('button', { name: /rubric/i });

            fireEvent.click(button);

            await waitFor(() => {
                expect(mockAlert).toHaveBeenCalledWith(
                    expect.stringContaining('Discussion does not have an assignment id.')
                );
            });
        });
    });

    describe('Error handling', () => {
        it('should handle missing related course', async () => {
            (getSingleCourse as jest.Mock).mockResolvedValue(undefined);

            render(<RubricButton course={mockCourse} />);
            const button = screen.getByRole('button', { name: /rubric/i });

            fireEvent.click(button);

            await waitFor(() => {
                expect(mockAlert).toHaveBeenCalledWith(
                    expect.stringContaining('Related course not found')
                );
            });
        });

        it('should handle course that is neither dev nor blueprint', async () => {
            const invalidCourse = { ...mockCourse, isDev: false, isBlueprint: () => false };

            render(<RubricButton course={invalidCourse as any} />);
            const button = screen.getByRole('button', { name: /rubric/i });

            fireEvent.click(button);

            await waitFor(() => {
                expect(mockAlert).toHaveBeenCalledWith(
                    expect.stringContaining('Course is not a blueprint or dev course')
                );
            });
        });

        it('should handle missing related assignment', async () => {
            const mockAssignment = {
                id: 789,
                name: 'Test Assignment',
                submission_types: ['online_text_entry']
            } as any;

            (getSingleCourse as jest.Mock).mockResolvedValue(mockRelatedCourse);
            (getContentDataFromUrl as jest.Mock).mockResolvedValue(mockAssignment);

            const mockGen = (async function* () {})();
            (assignmentDataGen as jest.Mock).mockReturnValue(mockGen);

            render(<RubricButton course={mockCourse} />);
            const button = screen.getByRole('button', { name: /rubric/i });

            fireEvent.click(button);

            await waitFor(() => {
                expect(mockAlert).toHaveBeenCalledWith(
                    expect.stringContaining('Failed to update rubric: Content is not an assignment or discussion')
                );
            });
        });

        it('should handle related assignment without rubric', async () => {
            const mockAssignment = {
                id: 789,
                name: 'Test Assignment',
                submission_types: ['online_text_entry']
            } as any;

            const mockRelatedAssignment = {
                id: 790,
                name: 'Test Assignment',
                rubric_settings: undefined
            } as any;

            (getSingleCourse as jest.Mock).mockResolvedValue(mockRelatedCourse);
            (getContentDataFromUrl as jest.Mock).mockResolvedValue(mockAssignment);

            const mockGen = (async function* () {
                yield mockRelatedAssignment;
            })();
            (assignmentDataGen as jest.Mock).mockReturnValue(mockGen);

            render(<RubricButton course={mockCourse} />);
            const button = screen.getByRole('button', { name: /rubric/i });

            fireEvent.click(button);

            await waitFor(() => {
                expect(mockAlert).toHaveBeenCalledWith(
                    expect.stringContaining('Failed to update rubric: Content is not an assignment or discussion')
                );
            });
        });

        it('should handle unsupported content type', async () => {
            const mockPage = { id: 999, title: 'Test Page' };
            (getSingleCourse as jest.Mock).mockResolvedValue(mockRelatedCourse);
            (getContentDataFromUrl as jest.Mock).mockResolvedValue(mockPage);

            render(<RubricButton course={mockCourse} />);
            const button = screen.getByRole('button', { name: /rubric/i });

            fireEvent.click(button);

            await waitFor(() => {
                expect(mockAlert).toHaveBeenCalledWith(
                    expect.stringContaining('Content is not an assignment or discussion')
                );
            });
        });
    });

    describe('Blueprint course handling', () => {
        it('should get parent course for blueprint courses', async () => {
            const blueprintCourse = {
                ...mockCourse,
                isDev: false,
                isBlueprint: jest.fn().mockReturnValue(true),
                getParentCourse: jest.fn().mockResolvedValue(mockRelatedCourse)
            };

            const mockAssignment = {
                id: 789,
                name: 'Test Assignment',
                points_possible: 100,
                submission_types: ['online_text_entry'],
                rubric_settings: { id: 111 }
            } as any;

            const mockRelatedAssignment = {
                id: 790,
                name: 'Test Assignment',
                points_possible: 100,
                rubric_settings: { id: 222 }
            } as any;

            const mockRubric = {
                id: 111,
                title: 'Test Rubric',
                points_possible: 100,
                associations: [{
                    id: 333,
                    association_id: 789,
                    association_type: 'Assignment',
                    use_for_grading: true,
                    hide_score_total: false,
                    purpose: 'grading'
                }],
                data: []
            } as any;

            const mockRelatedRubric = {
                id: 222,
                title: 'Related Rubric',
                points_possible: 100,
                data: []
            } as any;

            (getContentDataFromUrl as jest.Mock).mockResolvedValue(mockAssignment);
            const mockGen = (async function* () {
                yield mockRelatedAssignment;
            })();
            (assignmentDataGen as jest.Mock).mockReturnValue(mockGen);
            (getRubric as jest.Mock)
                .mockResolvedValueOnce(mockRubric)
                .mockResolvedValueOnce(mockRelatedRubric);
            (fetchJson as jest.Mock).mockResolvedValue({ id: 111 });

            render(<RubricButton course={blueprintCourse as any} />);
            const button = screen.getByRole('button', { name: /rubric/i });

            fireEvent.click(button);

            await waitFor(() => {
                expect(blueprintCourse.getParentCourse).toHaveBeenCalled();
            });
        });
    });
});