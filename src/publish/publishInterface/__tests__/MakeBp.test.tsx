// MakeBp.test.tsx initial pass by ChatGPT 4o

import React from 'react';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom';
import {MakeBp, IMakeBpProps} from '../MakeBp';
import * as blueprintApi from '../../../canvas/course/blueprint';
import {IMigrationData, IProgressData} from "../../../canvas/course/migration";
import {mockCourseData} from "../../../canvas/course/__mocks__/mockCourseData";
import {Course} from "../../../canvas/course/Course";
import {mockProgressData} from "../../../canvas/course/__mocks__/mockProgressData";
import {mockMigrationData} from "../../../canvas/course/__mocks__/mockMigrationData";
import {bpify} from "../../../admin";

import {createNewCourse} from '../../../canvas/course';
import {getBlueprintsFromCode} from "../../../canvas/course/blueprint";
import {
    cacheCourseMigrations,
} from "../../../canvas/course/migrationCache";
import * as cacheMigrationApi from '../../../canvas/course/migrationCache'
import {range} from "../../../canvas/canvasUtils";
import {loadCachedCourseMigrations} from "../../../canvas/course/migrationCache";

jest.mock('../../../canvas/course/blueprint');

const mockCourse: Course = new Course({...mockCourseData, blueprint: false, course_code: "DEV_TEST000", name: 'DEV_TEST000'})
const mockBlueprintCourse: Course = new Course({...mockCourseData, blueprint: true})

const renderComponent = (props: Partial<IMakeBpProps> = {}) => {
    const defaultProps: IMakeBpProps = {
        devCourse: mockCourse,
        ...props,
    };

    return render(<MakeBp {...defaultProps} />);
};


jest.mock('../../../canvas/course', () => ({
    Course: jest.requireActual('../../../canvas/course').Course,
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

    it('renders without crashing', () => {
        renderComponent();
        expect(screen.getByText(/Create New BP/i)).toBeInTheDocument();
    });

    // it('displays alert if not a DEV course', () => {
    //     renderComponent({ devCourse: { ...mockCourse, isDev: false } });
    //     expect(screen.getByText(/This is not a DEV course/)).toBeInTheDocument();
    // });

    it('fetches and sets blueprint info on mount', async () => {
        (blueprintApi.getBlueprintsFromCode as jest.Mock).mockResolvedValue([mockBlueprintCourse]);
        (blueprintApi.getSections as jest.Mock).mockResolvedValue([]);
        (blueprintApi.getTermNameFromSections as jest.Mock).mockResolvedValue('Spring 2024');

        renderComponent();

        await waitFor(() => expect(blueprintApi.getBlueprintsFromCode).toHaveBeenCalled());
        await waitFor(() => expect(screen.queryByText(/Cannot find Existing Blueprint/)).not.toBeInTheDocument());
    });

    it('disables archive button if term name is empty', async () => {
        (blueprintApi.getBlueprintsFromCode as jest.Mock).mockResolvedValue([mockBlueprintCourse]);
        (blueprintApi.getSections as jest.Mock).mockResolvedValue([]);
        renderComponent();
        await waitFor(() => screen.getByText(/Archive/));
        expect(screen.getByPlaceholderText(/ABC123/)).toHaveValue('');
        expect(screen.getByText(/Archive/)).toBeDisabled();
    });

})
describe('Retirement and updates', () => {

    it('calls retireBlueprint and updates blueprint info on archive', async () => {
        (blueprintApi.getBlueprintsFromCode as jest.Mock).mockResolvedValue([mockBlueprintCourse]);
        (blueprintApi.getSections as jest.Mock).mockResolvedValue([]);
        (blueprintApi.getTermNameFromSections as jest.Mock).mockResolvedValue('Spring 2024');
        (blueprintApi.retireBlueprint as jest.Mock).mockResolvedValue(undefined);
        renderComponent();

        await waitFor(() => screen.getByText(/Archive/));
        fireEvent.change(screen.getByPlaceholderText(/ABC123/),
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
        renderComponent({
            devCourse: mockCourse
        })
        await waitFor(() => expect(screen.getByLabelText(/New BP/)).toBeInTheDocument());
        fireEvent.click(screen.getByLabelText(/New BP/));
        await waitFor(() => expect(createNewCourse).toHaveBeenCalled());
        expect(createNewCourse).toHaveBeenCalledWith(bpify(mockCourse.parsedCourseCode ?? ''), mockBlueprintCourse.accountId);
    })

    it('disabled new BP button if there is an existing BP', async () => {
        (blueprintApi.getBlueprintsFromCode as jest.Mock).mockResolvedValue([mockBlueprintCourse]);
        renderComponent();
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
        renderComponent();

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
        renderComponent({
            devCourse: mockCourse,
        });
        await waitFor(() => expect(getBlueprintsFromCode).toHaveBeenCalled());
        await waitFor(() => expect(screen.queryByLabelText(/New BP/)).toBeInTheDocument());
        await waitFor(() => expect(cachedCourseMigrationSpy).toHaveBeenCalled())
        await waitFor( () => expect(screen.queryAllByRole('progressbar')).toHaveLength(2));
        expect(screen.getAllByRole('progressbar')).toHaveLength(2);
    })
})