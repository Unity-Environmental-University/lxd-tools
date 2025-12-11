import { academicIntegritySetup } from "@/publish/publishInterface/academicIntegritySetup";
import { fetchJson } from "@canvas/fetch/fetchJson";
import { getCourseById } from "@/canvas/course";
import { moduleGenerator } from "@canvas/course/modules";
import { startMigration } from "@/canvas/course/migration";
import { Course } from "@/canvas/course/Course";
import { IModuleData } from "@canvas/canvasDataDefs";
import mockModuleData from "@canvas/course/__mocks__/mockModuleData";

beforeAll(() => {
    jest.useFakeTimers();
});

// --- Mocking Dependencies ---
// Mocks for external dependencies, treating them as utilities
jest.mock("@canvas/fetch/fetchJson");
jest.mock("@canvas/canvasUtils", () => ({
    formDataify: jest.fn(data => data), // Mock formDataify to return the data directly for easy inspection
}));
jest.mock("@canvas/course/migration");

// Mocking the Canvas-specific classes/constructors
jest.mock("@/canvas/course", () => ({
    getCourseById: jest.fn(),
}));

// Mock the Course class and its methods
const mockCourse = {
    id: 101,
    getModules: jest.fn(),
    getAssignmentGroups: jest.fn(),
    getPages: jest.fn(),
};

// Mock the specific Course object (ID 7724480) for the Academic Integrity source
const mockAICourse = {
    id: 7724480,
    getModules: jest.fn(),
    getPages: jest.fn(),
};

// Mock the moduleGenerator to allow iteration over modules
jest.mock("@canvas/course/modules", () => ({
    moduleGenerator: jest.fn(),
}));


// --- Setup Data ---
const mockBpId = 123;
const mockAssignmentGroupId = 456;
const mockAIModuleId = 789;
const mockInstructorModuleId = 999;
const mockInstructorGuidePageUrl = 'ai-instructor-guide';
const mockInstructorGuidePageId = 500;

// Base structure for modules in the BP before migration
const bpInitialModules: IModuleData[] = [
    { ...mockModuleData, id: 1, name: 'Module 1', published: true, items: [] },
];

// Modules in the source Academic Integrity course (7724480)
const aiSourceModules: IModuleData[] = [
    { ...mockModuleData, id: mockAIModuleId, name: 'Academic Integrity', published: true, items: [] },
    {
        ...mockModuleData,
        id: 2,
        name: 'Instructor Guide Resources',
        published: true,
        items: [
            { id: 10, module_id: 333, position: 1, indent: 0, content_id: 10, title: 'AI Guide Page', html_url: 'ai-instructor-guide', new_tab: true, type: 'Page', page_url: mockInstructorGuidePageUrl }
        ]
    }
];

// Pages in the source Academic Integrity course (7724480)
const aiSourcePages = [
    { rawData: { url: mockInstructorGuidePageUrl, page_id: mockInstructorGuidePageId } }
];

// Assignment Groups in the BP
const bpAssignmentGroups = [
    { id: 111, name: 'Quizzes' },
    { id: mockAssignmentGroupId, name: 'Assignments' },
];

// Pages in the BP after migration
const bpPostMigrationPages = [
    { rawData: { url: 'some-other-page' } },
    {
        rawData: { url: mockInstructorGuidePageUrl, page_id: mockInstructorGuidePageId },
        getItem: (key: string) => key === "url" ? mockInstructorGuidePageUrl : undefined,
    }
];

// Define the final modules in the BP after a successful migration
const bpFinalModules: IModuleData[] = [
    ...bpInitialModules,
    { ...mockModuleData, id: mockAIModuleId, name: 'Academic Integrity', published: true, items: [] },
    { ...mockModuleData, id: mockInstructorModuleId, name: 'Leave unpublished: Instructor Resources', published: true, items: [] },
];

// --- Mock Implementation Setup ---
beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(window, 'alert').mockImplementation(() => {});

    // Set up BP course mocks
    mockCourse.id = mockBpId;
    mockCourse.getModules.mockResolvedValue(bpInitialModules);
    mockCourse.getAssignmentGroups.mockResolvedValue(bpAssignmentGroups);
    mockCourse.getPages.mockResolvedValue(bpPostMigrationPages);

    // Set up AI Source course mocks
    mockAICourse.getModules.mockResolvedValue(aiSourceModules);
    mockAICourse.getPages.mockResolvedValue(aiSourcePages);

    // Mock getCourseById to return the correct course based on ID
    (getCourseById as jest.Mock).mockImplementation((id: number) => {
        if (id === mockBpId) return mockCourse;
        if (id === 7724480) return mockAICourse;
        return null;
    });

    // Mock startMigration
    (startMigration as jest.Mock).mockResolvedValue({
        id: 1000,
        workflow_state: 'pre_processing'
    });

    // Mock fetchJson to handle the migration status and various PUT/DELETE/POST calls
    (fetchJson as jest.Mock).mockImplementation(async (url: string) => {
        // Migration status checks from waitForMigrationCompletion
        if (url.includes(`/content_migrations/`)) {
            // Immediately return 'completed' on the second check (to simulate success)
            return { id: 1000, workflow_state: 'completed' };
        }

        // Unpublish module PUT
        if (url.includes(`/modules/${mockAIModuleId}`) && url.includes('PUT')) {
            return { id: mockAIModuleId, published: false };
        }

        // Delete imported assignment group DELETE
        if (url.includes(`/assignment_groups/`) && url.includes('DELETE')) {
            return {};
        }

        // Unpublish page PUT
        if (url.includes(`/pages/${mockInstructorGuidePageUrl}`) && url.includes('PUT')) {
            return {};
        }

        // Add item to module POST
        if (url.includes(`/modules/${mockInstructorModuleId}/items`) && url.includes('POST')) {
            return {};
        }

        return {}; // Default response
    });

    // Mock moduleGenerator to yield the final BP modules after migration
    (moduleGenerator as jest.Mock).mockImplementation(async function*() {
        for (const module of bpFinalModules) {
            yield module;
        }
    });

    // Mock the async delay in waitForMigrationCompletion
    jest.spyOn(globalThis, 'setTimeout').mockImplementation((cb: (...args: any[]) => void, ms?: number) => {
        if (ms === 5000) {
            // Skip the first delay to speed up the test and immediately check for 'completed'
            cb();
        }
        return {} as ReturnType<typeof setTimeout>;
    });
});

afterAll(() => {
    // Restore real timers (and alert mock) instead of calling mockRestore on setTimeout
    jest.useRealTimers();
    (window.alert as jest.Mock).mockRestore();
});

// --- Test Suite ---
describe('academicIntegritySetup', () => {
    const mockSetIsRunning = jest.fn();
    const props = {
        currentBp: mockCourse as unknown as Course,
        setIsRunningIntegritySetup: mockSetIsRunning,
    };

    it('should complete the full setup workflow successfully', async () => {
        await academicIntegritySetup(props);

        // 1. Check control flow
        expect(mockSetIsRunning).toHaveBeenCalledWith(true);
        expect(window.alert).toHaveBeenCalledWith("Academic integrity setup complete!");
        expect(mockSetIsRunning).toHaveBeenCalledWith(false);

        // 2. Check for migration start with the correct payload
        expect(startMigration).toHaveBeenCalledWith(
            mockAICourse.id,
            mockBpId,
            expect.objectContaining({
                fetchInit: {
                    body: {
                        migration_type: 'course_copy_importer',
                        settings: {
                            source_course_id: mockAICourse.id,
                            move_to_assignment_group_id: mockAssignmentGroupId, // Uses the found 'Assignments' group ID
                        },
                        select: {
                            modules: [mockAIModuleId], // Only the 'Academic Integrity' module ID
                            pages: [mockInstructorGuidePageId], // Only the Instructor Guide page ID
                        }
                    }
                }
            })
        );

        // 3. Check for module unpublish
        expect(fetchJson).toHaveBeenCalledWith(
            `/api/v1/courses/${mockBpId}/modules/${mockAIModuleId}`,
            expect.objectContaining({
                fetchInit: {
                    method: 'PUT',
                    body: { module: { published: false } }
                }
            })
        );

        // 4. Check for page an unpublish and move to Instructor Resources
        // (The logic expects only one instructor guide item)
        expect(fetchJson).toHaveBeenCalledWith(
            `/api/v1/courses/${mockBpId}/pages/${mockInstructorGuidePageUrl}`,
            expect.objectContaining({
                fetchInit: {
                    method: 'PUT',
                    body: { wiki_page: { published: false } }
                }
            })
        );
        expect(fetchJson).toHaveBeenCalledWith(
            `/api/v1/courses/${mockBpId}/modules/${mockInstructorModuleId}/items`,
            expect.objectContaining({
                fetchInit: {
                    method: 'POST',
                    body: { module_item: { type: 'Page', page_url: mockInstructorGuidePageUrl } }
                }
            })
        );
    });

    it('should stop and alert if Academic Integrity module already exists in BP', async () => {
        mockCourse.getModules.mockResolvedValueOnce([
            ...bpInitialModules,
            { id: 2, name: 'Academic Integrity', published: true, items: [] }
        ]);

        await academicIntegritySetup(props);

        expect(window.alert).toHaveBeenCalledWith("Academic integrity module already exists in BP.");
        expect(startMigration).not.toHaveBeenCalled();
        expect(mockSetIsRunning).toHaveBeenCalledWith(false);
    });

    it('should handle migration failure and alert the user', async () => {
        // Mock migration check to return 'failed'
        (fetchJson as jest.Mock).mockImplementationOnce(async (url: string) => {
            if (url.includes(`/content_migrations/`)) {
                return { id: 1000, workflow_state: 'failed' };
            }
            return {};
        });

        await academicIntegritySetup(props);

        expect(window.alert).toHaveBeenCalledWith("There was a problem in the migration process. Check the BP to make sure the modules imported correctly.");
        expect(fetchJson).not.toHaveBeenCalledWith( // Migration failed, so it shouldn't proceed to unpublish the module
            `/api/v1/courses/${mockBpId}/modules/${mockAIModuleId}`,
            expect.anything()
        );
        expect(mockSetIsRunning).toHaveBeenCalledWith(false);
    });

    it('should delete a newly imported assignment group named "Imported Assignments"', async () => {
        const importedGroupId = 999;
        // Mock getAssignmentGroups to return an imported group after migration
        mockCourse.getAssignmentGroups
            .mockResolvedValueOnce(bpAssignmentGroups) // Initial check
            .mockResolvedValueOnce([ // Second check after migration
                ...bpAssignmentGroups,
                { id: importedGroupId, name: 'Imported Assignments' }
            ]);

        await academicIntegritySetup(props);

        expect(fetchJson).toHaveBeenCalledWith(
            `/api/v1/courses/${mockBpId}/assignment_groups/${importedGroupId}`,
            expect.objectContaining({
                fetchInit: { method: 'DELETE', body: {} }
            })
        );
    });

    it('should fall back to the first assignment group if no "assignment" group is found', async () => {
        const fallbackGroupId = 111;
        mockCourse.getAssignmentGroups.mockResolvedValueOnce([
            { id: fallbackGroupId, name: 'Quizzes' },
            { id: 222, name: 'Discussions' },
        ]);

        await academicIntegritySetup(props);

        // Check if startMigration was called with the fallbackGroupId
        expect(startMigration).toHaveBeenCalledWith(
            mockAICourse.id,
            mockBpId,
            expect.objectContaining({
                fetchInit: {
                    body: expect.objectContaining({
                        settings: {
                            source_course_id: mockAICourse.id,
                            move_to_assignment_group_id: fallbackGroupId,
                        },
                    })
                }
            })
        );
    });
});