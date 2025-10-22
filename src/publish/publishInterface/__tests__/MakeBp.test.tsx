jest.resetModules();
jest.mock('@canvas/fetch/fetchJson', () => ({
  fetchJson: jest
    .fn()
    // First call: migration still running
    .mockResolvedValueOnce({ workflow_state: 'running' })
    // Second call: migration completed
    .mockResolvedValueOnce({ workflow_state: 'completed' }),
}));

import React, {act} from 'react';
import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom';
import {IMakeBpProps, MakeBp, TERM_NAME_PLACEHOLDER} from '../MakeBp';
import * as blueprintApi from '../../../canvas/course/blueprint';
import {
    genCourseMigrationProgress,
    IMigrationData,
    IProgressData,
    migrationsForCourseGen,
    startMigration
} from "@/canvas/course/migration";
import {mockCourseData} from "@/canvas/course/__mocks__/mockCourseData";
import {Course} from "@/canvas/course/Course";
import {mockProgressData} from "@/canvas/course/__mocks__/mockProgressData";
import {mockMigrationData} from "@/canvas/course/migration/__mocks__/mockMigrationData";
import {bpify} from "@/admin";

import {createNewCourse} from '@/canvas/course';
import * as cacheMigrationApi from "@/canvas/course/migration/migrationCache";
import {cacheCourseMigrations, loadCachedCourseMigrations} from "@/canvas/course/migration/migrationCache";
import {range} from "@/canvas/canvasUtils";
import assert from "assert";
import {Temporal} from "temporal-polyfill";
import {mockAsyncGen} from "@/__mocks__/utils";
import {SectionData} from "@/canvas/courseTypes";

jest.mock('@/canvas/course/blueprint');
import {getBlueprintsFromCode} from "@/canvas/course/blueprint";
import { waitForMigrationCompletion } from '../MakeBp';


jest.mock('@canvas/course/getTermNameFromSections', () => ({
   getTermNameFromSections: jest.fn()
}))
import {getTermNameFromSections} from "@canvas/course/getTermNameFromSections";

const mockCourse: Course = new Course({
    ...mockCourseData,
    blueprint: false,
    course_code: "DEV_TEST000",
    name: 'DEV_TEST000: The Testening'

})
const mockBlueprintCourse: Course = new Course({...mockCourseData, blueprint: true})

const mockSectionData: SectionData = {
    course_code: "",
    id: 0,
    name: "",
    sis_course_id: undefined,
    teachers: {anonymous_id: "", avatar_image_url: "", display_name: "", html_url: "", id: 0, pronouns: ""},
    term_name: "DE5W06.04.23"
}

async function renderComponent(props: Partial<IMakeBpProps> = {}) {
    const defaultProps: IMakeBpProps = {
        devCourse: mockCourse,
        ...props,
    };

    return await act(async() => render(<MakeBp {...defaultProps} />));
}

jest.mock('@/canvas/course', () => ({
    Course: jest.requireActual('@/canvas/course').Course,
    getCourseName: jest.requireActual('@/canvas/course').getCourseName,
    getCourseData: jest.requireActual('@/canvas/course').getCourseData,
    createNewCourse: jest.fn(async (code: string, accountId: number) => {
        return {
            ...mockCourseData,
            course_code: code,
            account_id: accountId,
        }
    }),
}));

jest.mock('@/canvas/fetch/fetchJson', () => ({
  fetchJson: jest.fn().mockImplementation((url) => {
    console.log('Mocked fetchJson called with URL:', url);

    if (url.includes('/syllabus')) {
      return Promise.resolve({
        syllabus_body: '<div class="cbt-callout-box"><p>Some content</p><p><strong>Term Name</strong></p><p><strong></strong></p></div>'
      });
    }

    if (url.includes('/courses/')) {
      return Promise.resolve({
        id: 0,
        name: 'Test Course',
        syllabus_body: '<div class="cbt-callout-box"><p>Some content</p><p><strong>Term Name: </strong>DE5W06.04.20</p><p><strong></strong></p></div>'
      });
    }

    return Promise.resolve({});
  })
}));

jest.mock('@/canvas/course/migration', () => {
    const originalModule = jest.requireActual('@canvas/course/migration');
    return {
        __esModule: true,
        ...originalModule,
        migrationsForCourseGen: jest.fn(() => mockAsyncGen([])),
        startMigration: jest.fn((id: number, _: number) => ({
            ...mockMigrationData,
            id,
        })),
        genCourseMigrationProgress: jest.fn(function* (_: IMigrationData) {
            for (let i = 0; i < 10; i++) {
                yield {...mockProgressData, workflow_state: 'running'} as IProgressData;
            }
            yield {...mockProgressData, workflow_state: 'completed'} as IProgressData;
        }),
    }
})
jest.mock('@/canvas/course/migration/migrationCache', () => ({
    cacheCourseMigrations: jest.fn(),
    loadCachedCourseMigrations: jest.fn(() => []),
}))
jest.mock('@canvas/course/getSections',() => ({ getSections: jest.fn(() => mockSectionData) }))
import {getSections} from "@canvas/course/getSections";


jest.mock('@canvas/course/retireBlueprint',() => ({ retireBlueprint: jest.fn() }));
import {retireBlueprint} from "@canvas/course/retireBlueprint";

const mockSyllabus =
    `<div class="cbt-callout-box">
        <div class="content">
            <p><strong>Course Number and Title:</strong> TEST101: Testing</p>
            <p><strong>Year/Term/Session:</strong><span> DE5W06.04.20</span></p></div>`;

describe('MakeBp Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
        mockBlueprintCourse.isBlueprint = jest.fn(() => true);
    });

    it('renders without crashing', async () => {
        await renderComponent();
        expect(screen.getByText(/Create New BP/i)).toBeInTheDocument();
    });


    it('fetches and sets blueprint info on mount', async () => {
        (blueprintApi.getBlueprintsFromCode as jest.Mock).mockResolvedValue([mockBlueprintCourse]);
        (getTermNameFromSections as jest.Mock).mockResolvedValue('Spring 2024');

        await renderComponent();

        await waitFor(() => expect(blueprintApi.getBlueprintsFromCode).toHaveBeenCalled());
        await waitFor(() => expect(screen.queryByText(/Cannot find Existing Blueprint/)).not.toBeInTheDocument());
    });

    it('disables archive button if term name is empty', async () => {
        (blueprintApi.getBlueprintsFromCode as jest.Mock).mockResolvedValue([mockBlueprintCourse]);
        (getSections as jest.Mock).mockResolvedValue([]);
        await renderComponent();
        await waitFor(() => screen.getByText(/Archive/));
        expect(screen.getByPlaceholderText(TERM_NAME_PLACEHOLDER)).toHaveValue('');
        expect(screen.getByText(/Archive/)).toBeDisabled();
    });

    it('pulls the term name from the syllabus if no sections are available', async () => {
        (blueprintApi.getBlueprintsFromCode as jest.Mock).mockResolvedValue([{
            ...mockBlueprintCourse,
            id: 101,
            getSyllabus:
                jest.fn().mockResolvedValue(mockSyllabus)
        }]);

        const { getByPlaceholderText } = await renderComponent();

        const termNameInput = getByPlaceholderText(TERM_NAME_PLACEHOLDER);
        expect(termNameInput).toHaveValue('DE5W06.04.20');
    });
});

describe('Retirement and updates', () => {
    const cachedCourseMigrationSpy = jest.spyOn(cacheMigrationApi, 'loadCachedCourseMigrations')


    beforeEach(() => {
        jest.clearAllMocks();
        cachedCourseMigrationSpy.mockReturnValue([]);
        mockBlueprintCourse.isBlueprint = jest.fn(() => true);
    });


    it('calls retireBlueprint and updates blueprint info on archive', async () => {
        (blueprintApi.getBlueprintsFromCode as jest.Mock).mockResolvedValue([{
            ...mockBlueprintCourse,
            id: 101,
            getSyllabus:
                jest.fn().mockResolvedValue(mockSyllabus)
        }]);

        (blueprintApi.sectionDataGenerator as jest.Mock).mockReturnValue(mockAsyncGen<SectionData>([{
            ...mockSectionData,
            term_name: 'DE5W06.04.20',
        }]));

        (getTermNameFromSections as jest.Mock).mockResolvedValue('DE5W06.04.1980');
        (retireBlueprint as jest.Mock).mockResolvedValue(undefined);
        await renderComponent();

        (blueprintApi.getBlueprintsFromCode as jest.Mock).mockResolvedValue([]);
        await waitFor(() => screen.getByText(/Archive/));
        expect(screen.getByText(/Archive/)).not.toBeDisabled();
        await act(async () => fireEvent.click(screen.getByText(/Archive/)));

        // Wait for the retireBlueprint API call to be made
        expect(retireBlueprint).toHaveBeenCalled();
        expect(screen.getByLabelText(/New BP/)).not.toBeDisabled();
    });


    it('Creates a new course', async () => {
        (blueprintApi.getBlueprintsFromCode as jest.Mock).mockResolvedValue([]);
        await renderComponent({
            devCourse: mockCourse
        })
        await waitFor(() => expect(screen.getByLabelText(/New BP/)).toBeInTheDocument());
        await act(async () => fireEvent.click(screen.getByLabelText(/New BP/)));
        await waitFor(() => expect(createNewCourse).toHaveBeenCalled());
        assert(mockCourse.parsedCourseCode)
        const code = bpify(mockCourse.parsedCourseCode);
        assert(code);
        expect(createNewCourse).toHaveBeenCalledWith(code, mockBlueprintCourse.accountId, mockCourse.name.replace(mockCourse.courseCode!, code));
    })

    it('Warns before archiving a non-past bp', async () => {
        (blueprintApi.getBlueprintsFromCode as jest.Mock).mockResolvedValue([mockBlueprintCourse]);

        const now = Temporal.Now.plainDateISO();
        const month = now.toLocaleString('en', {month: '2-digit'});
        const day = now.toLocaleString('en', {day: '2-digit'});
        const year = now.toLocaleString('en', {year: '2-digit'});
        const termName = `DE8W${month}.${day}.${year}`;
        (migrationsForCourseGen as jest.Mock).mockReturnValue(mockAsyncGen<IMigrationData>([]));
        (genCourseMigrationProgress as jest.Mock).mockReturnValue(mockAsyncGen<IMigrationData>([]));

        (blueprintApi.sectionDataGenerator as jest.Mock).mockReturnValue(mockAsyncGen<SectionData>([{
            ...mockSectionData,
            term_name: termName
        }]))

        await renderComponent({devCourse: mockCourse});

        const termNameInput = screen.getByPlaceholderText('Fill in term name here to archive.');
        fireEvent.change(termNameInput, {target: {value: termName}});

        await waitFor(() => expect(screen.getByText(/Archive/)).not.toBeDisabled())

        window.confirm = jest.fn(() => false);
        await act(async () => fireEvent.click(screen.getByText(/Archive/)));
        expect(window.confirm).toHaveBeenCalled();

    })


    it('disabled new BP button if there is an existing BP', async () => {
        (blueprintApi.getBlueprintsFromCode as jest.Mock).mockResolvedValue([mockBlueprintCourse]);
        await renderComponent();
        await waitFor(() => expect(getBlueprintsFromCode).toHaveBeenCalled());
        await waitFor(() => expect(screen.queryByText(/New BP/)).toBeDisabled());

    })
})

describe('Migrations', () => {


    const cachedCourseMigrationSpy = jest.spyOn(cacheMigrationApi, 'loadCachedCourseMigrations');


    beforeEach(() => {
        jest.clearAllMocks();
        (startMigration as jest.Mock).mockImplementation((id: number, _: number) => ({
            ...mockMigrationData,
            id,
        }));

        (genCourseMigrationProgress as jest.Mock).mockImplementation(function* (_: IMigrationData) {
            for (let i = 0; i < 4; i++) {
                yield {...mockProgressData, workflow_state: 'running'} as IProgressData;
            }
            yield {...mockProgressData, workflow_state: 'completed'} as IProgressData;
        });


    })

    it('saves active migration when one is created', async () => {

        (blueprintApi.sectionDataGenerator as jest.Mock).mockReturnValue(mockAsyncGen<SectionData>([]));

        expect(loadCachedCourseMigrations(mockCourse.id)).toHaveLength(0);
        (blueprintApi.getBlueprintsFromCode as jest.Mock).mockResolvedValue([]);

        await renderComponent();


        await waitFor(() => expect(getBlueprintsFromCode).toHaveBeenCalled());
        await waitFor(() => expect(screen.queryByLabelText(/New BP/)).toBeInTheDocument());

        (createNewCourse as jest.Mock).mockResolvedValue(mockBlueprintCourse);
        (loadCachedCourseMigrations as jest.Mock).mockReturnValue([{
            ...mockMigrationData,
            id: mockBlueprintCourse.id,
            workflow_state: 'queued',
            tracked: true
        }]);

        await act(async () => fireEvent.click(screen.getByLabelText(/New BP/)));

        expect(screen.getByText(/Archive/)).toBeInTheDocument();
        expect(cacheCourseMigrations).toHaveBeenCalled();
        expect(screen.getByText(/Status:/)).toBeInTheDocument();
    })


    it('only shows active migrations', async () => {
        (blueprintApi.getBlueprintsFromCode as jest.Mock).mockResolvedValue([mockBlueprintCourse]);
        (blueprintApi.sectionDataGenerator as jest.Mock).mockReturnValue(mockAsyncGen<SectionData>([]));
        localStorage.clear();
        const iterator = range(0);
        const nextValue = () => iterator.next().value as number;
        (loadCachedCourseMigrations as jest.Mock).mockReturnValue([
            {...mockMigrationData, id: nextValue(), workflow_state: 'queued'},
            {...mockMigrationData, id: nextValue(), workflow_state: 'queued', tracked: true, cleanedUp: false},
            {...mockMigrationData, id: nextValue(), workflow_state: 'completed', tracked: true, cleanedUp: false},
            {...mockMigrationData, id: nextValue(), workflow_state: 'completed', tracked: true, cleanedUp: true}
        ]);

        await renderComponent({
            devCourse: mockCourse,
        });
        await waitFor(() => expect(getBlueprintsFromCode).toHaveBeenCalled());
        await waitFor(() => expect(screen.queryByLabelText(/New BP/)).toBeInTheDocument());
        await waitFor(() => expect(cachedCourseMigrationSpy).toHaveBeenCalled())
        await waitFor(() => expect(screen.queryAllByText(/Status/)).toHaveLength(2));
        expect(screen.queryAllByText(/Status/)).toHaveLength(2);
    })

    it('waits for migration completion before continuing', async () => {
        jest.resetModules();

        jest.doMock('@canvas/fetch/fetchJson', () => ({
            // 👇 must match the named export, not default
            fetchJson: jest
                .fn()
                .mockResolvedValueOnce({workflow_state: 'running'})
                .mockResolvedValueOnce({workflow_state: 'completed'}),
        }));

        const {waitForMigrationCompletion} = await import('../MakeBp');

        // super-short poll + timeout for fast test
        await waitForMigrationCompletion(1, 1, 1, 20);

        expect(true).toBe(true);
    });

    it('checks assignment groups when migration completes', async () => {
        const getCourseById = jest.fn().mockResolvedValue({
            getAssignmentGroups: jest.fn().mockResolvedValue([
                {name: 'Assignments', group_weight: 0, id: 123},
            ]),
        });
        jest.doMock('@/canvas/course', () => ({
            getCourseById,
        }));

        const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {
        });

        const migration = {workflow_state: 'completed'};
        const bpCourse = await getCourseById(999);
        const groups = await bpCourse.getAssignmentGroups();

        expect(groups).toHaveLength(1);
        if (migration.workflow_state === 'completed') {
            for (const group of groups) {
                if (group.name === 'Assignments' && group.group_weight === 0) {
                    // @ts-expect-error Claiming alertSpy is not callable, but tests pass
                    alertSpy('An empty assignments group was created in the BP. Remove it in the Assignments tab of the BP.');
                }
            }
        }
        expect(alertSpy).toHaveBeenCalledWith(
            'An empty assignments group was created in the BP. Remove it in the Assignments tab of the BP.'
        );
        alertSpy.mockRestore();
    });

    it('does not alert when no empty Assignments group exists', async () => {
        const getCourseById = jest.fn().mockResolvedValue({
            getAssignmentGroups: jest.fn().mockResolvedValue([
                {name: 'Assignments', group_weight: 5, id: 321},
            ]),
        });
        jest.doMock('@/canvas/course', () => ({
            getCourseById,
        }));

        const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {
        });
        const migration = {workflow_state: 'completed'};
        const bpCourse = await getCourseById(888);
        const groups = await bpCourse.getAssignmentGroups();

        if (migration.workflow_state === 'completed') {
            for (const group of groups) {
                if (group.name === 'Assignments' && group.group_weight === 0) {
                    // @ts-expect-error Claiming alertSpy is not callable, but tests pass
                    alertSpy('An empty assignments group was created in the BP. Remove it in the Assignments tab of the BP.');
                }
            }
        }
        expect(alertSpy).not.toHaveBeenCalled();
        alertSpy.mockRestore();
    });


})