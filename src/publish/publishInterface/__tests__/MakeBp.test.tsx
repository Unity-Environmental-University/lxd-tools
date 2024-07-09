// MakeBp.test.tsx initial pass by ChatGPT 4o

import React, {act} from 'react';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom';
import {MakeBp, IMakeBpProps} from '../MakeBp';
import * as blueprintApi from '../../../canvas/course/blueprint';
import {IMigrationData, IProgressData} from "@/canvas/course/migration";
import {mockCourseData} from "@/canvas/course/__mocks__/mockCourseData";
import {Course} from "@/canvas/course/Course";
import {mockProgressData} from "@/canvas/course/__mocks__/mockProgressData";
import {mockMigrationData} from "@/canvas/course/__mocks__/mockMigrationData";
import {bpify} from "@/admin";

import {createNewCourse} from '@/canvas/course';
import {getBlueprintsFromCode} from "@/canvas/course/blueprint";
import {
    cacheCourseMigrations,
} from "@/canvas/course/migrationCache";
import * as cacheMigrationApi from '@/canvas/course/migrationCache'
import {range} from "@/canvas/canvasUtils";
import {loadCachedCourseMigrations} from "@/canvas/course/migrationCache";
import assert from "assert";

jest.mock('@/canvas/course/blueprint');

const mockCourse: Course = new Course({...mockCourseData, blueprint: false, course_code: "DEV_TEST000", name: 'DEV_TEST000: The Testening'})
const mockBlueprintCourse: Course = new Course({...mockCourseData, blueprint: true})

async function renderComponent (props: Partial<IMakeBpProps> = {}) {
    const defaultProps: IMakeBpProps = {
        devCourse: mockCourse,
        ...props,
    };

    return await act( async () =>  render(<MakeBp {...defaultProps} />));
}


jest.mock('@/canvas/course', () => ({
    Course: jest.requireActual('@/canvas/course').Course,
    createNewCourse: jest.fn(async (code: string, accountId: number) => {
        return {
            ...mockCourseData,
            course_code: code,
            account_id: accountId,
        }
    }),
}));


jest.mock('../../../canvas/course/migration', () => {
    const originalModule = jest.requireActual('../../../canvas/course/migration');
    return {
        __esModule: true,
        ...originalModule,
        getMigrationsForCourse: jest.fn(function* (_: number) {
            return;
        }),
        startMigration: jest.fn((id: number, _: number) => ({
            ...mockMigrationData,
                id,
        })),
        getMigrationProgressGen: jest.fn(function* (_: IMigrationData) {
            for (let i = 0; i < 10; i++) {
                yield {...mockProgressData, workflow_state: 'running'} as IProgressData;
            }
            yield {...mockProgressData, workflow_state: 'completed'} as IProgressData;
        }),
    }
})




describe('MakeBp Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders without crashing', async () => {
        await renderComponent();
        expect(screen.getByText(/Create New BP/i)).toBeInTheDocument();
    });


    it('fetches and sets blueprint info on mount', async () => {
        (blueprintApi.getBlueprintsFromCode as jest.Mock).mockResolvedValue([mockBlueprintCourse]);
        (blueprintApi.getSections as jest.Mock).mockResolvedValue([]);
        (blueprintApi.getTermNameFromSections as jest.Mock).mockResolvedValue('Spring 2024');

        await renderComponent();

        await waitFor(() => expect(blueprintApi.getBlueprintsFromCode).toHaveBeenCalled());
        await waitFor(() => expect(screen.queryByText(/Cannot find Existing Blueprint/)).not.toBeInTheDocument());
    });

    it('disables archive button if term name is empty', async () => {
        (blueprintApi.getBlueprintsFromCode as jest.Mock).mockResolvedValue([mockBlueprintCourse]);
        (blueprintApi.getSections as jest.Mock).mockResolvedValue([]);
        await renderComponent();
        await waitFor(() => screen.getByText(/Archive/));
        expect(screen.getByPlaceholderText(/DE8W/)).toHaveValue('');
        expect(screen.getByText(/Archive/)).toBeDisabled();
    });

})
describe('Retirement and updates', () => {

    it('calls retireBlueprint and updates blueprint info on archive', async () => {
        (blueprintApi.getBlueprintsFromCode as jest.Mock).mockResolvedValue([mockBlueprintCourse]);
        (blueprintApi.getSections as jest.Mock).mockResolvedValue([]);
        (blueprintApi.getTermNameFromSections as jest.Mock).mockResolvedValue('Spring 2024');
        (blueprintApi.retireBlueprint as jest.Mock).mockResolvedValue(undefined);
        await renderComponent();

        await waitFor(() => screen.getByText(/Archive/));
        fireEvent.change(screen.getByPlaceholderText(/DE8W/),
            {target: {value: 'Spring 2024'}});

        await waitFor(() => expect(screen.getByText(/Archive/)).not.toBeDisabled())
        fireEvent.click(screen.getByText(/Archive/));

        // Wait for the retireBlueprint API call to be made
        (blueprintApi.getBlueprintsFromCode as jest.Mock).mockResolvedValue([]);
        await waitFor(() => expect(blueprintApi.retireBlueprint).toHaveBeenCalled());

        // Wait for the component to update
        await waitFor(() => expect(screen.getByLabelText(/New BP/)).not.toBeDisabled());
        await waitFor(() => expect(blueprintApi.retireBlueprint).toHaveBeenCalled());
        expect((blueprintApi.getBlueprintsFromCode as jest.Mock).mock.calls.length).toBeGreaterThanOrEqual(2);
    });


    it('Creates a new course', async () => {
        (blueprintApi.getBlueprintsFromCode as jest.Mock).mockResolvedValue([]);
        await renderComponent({
            devCourse: mockCourse
        })
        await waitFor(() => expect(screen.getByLabelText(/New BP/)).toBeInTheDocument());
        fireEvent.click(screen.getByLabelText(/New BP/));
        await waitFor(() => expect(createNewCourse).toHaveBeenCalled());
        assert(mockCourse.parsedCourseCode)
        const code = bpify(mockCourse.parsedCourseCode);
        assert(code);
        expect(createNewCourse).toHaveBeenCalledWith(code, mockBlueprintCourse.accountId, mockCourse.name.replace(mockCourse.courseCode!, code));
    })

    it('disabled new BP button if there is an existing BP', async () => {
        (blueprintApi.getBlueprintsFromCode as jest.Mock).mockResolvedValue([mockBlueprintCourse]);
        await renderComponent();
        await waitFor(() => expect(getBlueprintsFromCode).toHaveBeenCalled());
        await waitFor(() => expect(screen.queryByText(/New BP/)).toBeDisabled());

    })


});


describe('Migrations', () => {

    const cachedCourseMigrationSpy = jest.spyOn(cacheMigrationApi, 'loadCachedCourseMigrations')
    beforeEach(() => {
        localStorage.clear();
    })
    it('saves active migration when one is created', async () => {
        expect(loadCachedCourseMigrations(mockCourse.id)).toHaveLength(0);
        (blueprintApi.getBlueprintsFromCode as jest.Mock).mockResolvedValue([]);
        cachedCourseMigrationSpy.mockClear();
        await renderComponent();

        await waitFor(() => expect(getBlueprintsFromCode).toHaveBeenCalled());
        await waitFor(() => expect(screen.queryByLabelText(/New BP/)).toBeInTheDocument());
        (createNewCourse as jest.Mock).mockResolvedValue(mockBlueprintCourse);

        screen.getByLabelText(/New BP/).click();
        await waitFor(() => expect(screen.queryByLabelText(/New BP/)).toBeInTheDocument());
        await waitFor(() => expect(screen.getByText(/Archive/)).toBeInTheDocument());
        await waitFor(() => expect(cachedCourseMigrationSpy).toHaveBeenCalled());
        await waitFor(() => expect(screen.getByText(/Status:/)).toBeInTheDocument());

        expect(screen.getByText(/Status:/)).toBeInTheDocument();
        await waitFor(() => expect(loadCachedCourseMigrations(mockCourse.id)).toHaveLength(1));
    })

    it('only shows active migrations', async () => {
        (blueprintApi.getBlueprintsFromCode as jest.Mock).mockResolvedValue([mockBlueprintCourse]);
        const iterator = range(0);
        const nextValue = () => iterator.next().value as number;
        cacheCourseMigrations(mockCourse.id, [
            {...mockMigrationData, id: nextValue(), workflow_state: 'queued'},
            {...mockMigrationData, id: nextValue(), workflow_state: 'queued', tracked: true, cleanedUp: false},
            {...mockMigrationData, id: nextValue(), workflow_state: 'completed', tracked: true, cleanedUp: false},
            {...mockMigrationData, id: nextValue(), workflow_state: 'completed', tracked: true, cleanedUp: true},
        ])
        await renderComponent({
            devCourse: mockCourse,
        });
        await waitFor(() => expect(getBlueprintsFromCode).toHaveBeenCalled());
        await waitFor(() => expect(screen.queryByLabelText(/New BP/)).toBeInTheDocument());
        await waitFor(() => expect(cachedCourseMigrationSpy).toHaveBeenCalled())
        await waitFor( () => expect(screen.queryAllByText(/Status/)).toHaveLength(2));
        expect(screen.queryAllByText(/Status/)).toHaveLength(2);
    })
})