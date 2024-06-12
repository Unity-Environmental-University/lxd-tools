// MakeBp.test.tsx initial pass by ChatGPT 4o

import React from 'react';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom';
import {MakeBp, IMakeBpProps} from '../MakeBp';
import * as blueprintApi from '../../../canvas/course/blueprint';
import {getMigrationsForCourse, IMigrationData, IProgressData, startMigration} from "../../../canvas/course/migration";
import {mockCourseData} from "../../../canvas/course/__mocks__/mockCourseData";
import {Course} from "../../../canvas/course/Course";
import {mockProgressData} from "../../../canvas/course/__mocks__/mockProgressData";
import {mockMigrationData} from "../../../canvas/course/__mocks__/mockMigrationData";
import {bpify} from "../../../admin";

import {createNewCourse} from '../../../canvas/course';
import {getBlueprintsFromCode} from "../../../canvas/course/blueprint";
import {loadCachedCourseMigrations, cacheMigrations, cacheCourseMigrations} from "../../../canvas/course/migrationCache";

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
            yield []
        }),
        startMigration: jest.fn((id: number, accountId: number) => mockMigrationData),
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
        expect(screen.getByText(/No Current BP/i)).toBeInTheDocument();
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
        expect(screen.getByPlaceholderText(/This should autofill if bp exists and has sections/)).toHaveValue('');
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
        fireEvent.change(screen.getByPlaceholderText(/This should autofill if bp exists and has sections/),
            {target: {value: 'Spring 2024'}});

        await waitFor(() => expect(screen.getByText(/Archive/)).not.toBeDisabled())
        fireEvent.click(screen.getByText(/Archive/));

        // Wait for the retireBlueprint API call to be made
        (blueprintApi.getBlueprintsFromCode as jest.Mock).mockResolvedValue([]);
        await waitFor(() => expect(blueprintApi.retireBlueprint).toHaveBeenCalled());

        // Wait for the component to update and show "No Current BP"
        await waitFor(() => expect(screen.getByText(/No Current BP/)).toBeInTheDocument());

        await waitFor(() => screen.getByText(/No Current BP/))
        await waitFor(() => expect(blueprintApi.retireBlueprint).toHaveBeenCalled());
        expect(blueprintApi.getBlueprintsFromCode).toHaveBeenCalledTimes(2); // initial call and after archiving
    });


    it('Doesnt show new BP if theres already a bp', async () => {
        (blueprintApi.getBlueprintsFromCode as jest.Mock).mockResolvedValue([mockBlueprintCourse]);
        renderComponent();
        await waitFor(() => expect(getBlueprintsFromCode).toHaveBeenCalled());
        await waitFor(() => expect(screen.queryByLabelText(/New BP/)).not.toBeInTheDocument());

    })

    it('Doesnt run if DEV doesnt have a course code', async () => {
        (blueprintApi.getBlueprintsFromCode as jest.Mock).mockResolvedValue([]);
        const mockCourse = new Course({...mockCourseData, course_code: ''})
        renderComponent({
            devCourse: mockCourse
        })
        await waitFor(() => expect(screen.getByLabelText(/New BP/)).toBeDisabled())
    })

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
});


describe('Retirement and updates', () => {

    it('calls retireBlueprint and updates blueprint info on archive', async () => {
        (blueprintApi.getBlueprintsFromCode as jest.Mock).mockResolvedValue([mockBlueprintCourse]);
        (blueprintApi.getSections as jest.Mock).mockResolvedValue([]);
        (blueprintApi.getTermNameFromSections as jest.Mock).mockResolvedValue('Spring 2024');
        (blueprintApi.retireBlueprint as jest.Mock).mockResolvedValue(undefined);
        renderComponent();

        await waitFor(() => screen.getByText(/Archive/));
        fireEvent.change(screen.getByPlaceholderText(/This should autofill if bp exists and has sections/),
            {target: {value: 'Spring 2024'}});

        await waitFor(() => expect(screen.getByText(/Archive/)).not.toBeDisabled())
        fireEvent.click(screen.getByText(/Archive/));

        // Wait for the retireBlueprint API call to be made
        (blueprintApi.getBlueprintsFromCode as jest.Mock).mockResolvedValue([]);
        await waitFor(() => expect(blueprintApi.retireBlueprint).toHaveBeenCalled());

        // Wait for the component to update and show "No Current BP"
        await waitFor(() => expect(screen.getByText(/No Current BP/)).toBeInTheDocument());

        await waitFor(() => screen.getByText(/No Current BP/))
        await waitFor(() => expect(blueprintApi.retireBlueprint).toHaveBeenCalled());
        expect(blueprintApi.getBlueprintsFromCode).toHaveBeenCalledTimes(2); // initial call and after archiving
    });


    it('Doesnt show new BP if theres already a bp', async () => {
        (blueprintApi.getBlueprintsFromCode as jest.Mock).mockResolvedValue([mockBlueprintCourse]);
        renderComponent();
        await waitFor(() => expect(getBlueprintsFromCode).toHaveBeenCalled());
        await waitFor(() => expect(screen.queryByText(/Create New BP For Dev/)).not.toBeInTheDocument());

    })


    it('Doesnt run if DEV doesnt have a course code', async () => {
        (blueprintApi.getBlueprintsFromCode as jest.Mock).mockResolvedValue([]);
        const mockCourse = new Course({...mockCourseData, course_code: ''})
        renderComponent({
            devCourse: mockCourse
        })
        await waitFor(() => expect(screen.getByText(/Create New BP For Dev/)).toBeDisabled())
    })

    it('Creates a new course', async () => {
        (blueprintApi.getBlueprintsFromCode as jest.Mock).mockResolvedValue([]);
        renderComponent({
            devCourse: mockCourse
        })
        await waitFor(() => expect(screen.getByText(/Create New BP For Dev/)).toBeInTheDocument());
        fireEvent.click(screen.getByText(/Create New BP For Dev/));
        await waitFor(() => expect(createNewCourse).toHaveBeenCalled());
        expect(createNewCourse).toHaveBeenCalledWith(bpify(mockCourse.parsedCourseCode ?? ''), mockBlueprintCourse.accountId);
    })
});

describe('Migrations', () => {
    it('saves active migration when one is created', async () => {
        expect(loadCachedCourseMigrations(mockCourse.id)).toHaveLength(0);
        (blueprintApi.getBlueprintsFromCode as jest.Mock).mockResolvedValue([]);
        renderComponent();
        await waitFor(() => expect(getBlueprintsFromCode).toHaveBeenCalled());
        await waitFor(() => expect(screen.queryByLabelText(/New BP/)).toBeInTheDocument());
        (createNewCourse as jest.Mock).mockResolvedValue(mockBlueprintCourse);

        screen.getByLabelText(/New BP/).click();
        await waitFor(() => expect(screen.queryByLabelText(/New BP/)).toBeInTheDocument());
        await waitFor(() => expect(screen.getByText(/Archive/)).toBeInTheDocument());
        await waitFor(() => expect(screen.getByText(/Status:/)).toBeInTheDocument());
        expect(screen.getByText(/Status:/)).toBeInTheDocument();
        await waitFor(() => expect(loadCachedCourseMigrations(mockCourse.id)).toHaveLength(1));
    })

    it('only shows active migrations', async () => {
        (blueprintApi.getBlueprintsFromCode as jest.Mock).mockResolvedValue([mockBlueprintCourse]);
        cacheCourseMigrations(mockCourse.id, [
            {...mockMigrationData, workflow_state: 'queued'},
            {...mockMigrationData, workflow_state: 'completed', startedFrom: true, cleanedUp: false},
            {...mockMigrationData, workflow_state: 'completed', startedFrom: true, cleanedUp: true},
        ])
        renderComponent({
            devCourse: mockCourse,
        });
        await waitFor(() => expect(getBlueprintsFromCode).toHaveBeenCalled());
        await waitFor(() => expect(screen.queryByLabelText(/New BP/)).toBeInTheDocument());

        await waitFor( () => expect(screen.getByText('Status:')).toBeInTheDocument());
        expect(screen.getAllByText('Status')).toHaveLength(2);
    })


})