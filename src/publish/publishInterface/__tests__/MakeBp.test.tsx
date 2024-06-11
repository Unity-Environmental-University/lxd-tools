// MakeBp.test.tsx initial pass by ChatGPT 4o

import React from 'react';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import {MakeBp, IMakeBpProps, getSavedMigrationsForCourse, saveMigrationsForCourse, saveMigrations} from '../MakeBp';
import * as blueprintApi from '../../../canvas/course/blueprint';
import * as makeBpApi from '../MakeBp';
import {getMigrationsForCourse, IMigrationData, IProgressData, startMigration} from "../../../canvas/course/migration";
import {mockCourseData} from "../../../canvas/course/__mocks__/mockCourseData";
import {Course} from "../../../canvas/course/Course";
import {mockProgressData} from "../../../canvas/course/__mocks__/mockProgressData";
import {mockMigrationData} from "../../../canvas/course/__mocks__/mockMigrationData";
import {bpify} from "../../../admin";

jest.mock('../../../canvas/course/blueprint');

const mockCourse: Course = new Course({...mockCourseData, blueprint: true})
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

import {createNewCourse} from '../../../canvas/course';
import {mockTermData} from "../../../canvas/__mocks__/mockTermData";
import {sleep} from "../../../index";
import {getBlueprintsFromCode} from "../../../canvas/course/blueprint";
import {wait} from "@testing-library/user-event/dist/utils";


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


describe('Saving and loading migration states', () => {
    beforeAll(() => {
        localStorage.clear();
        localStorage.g
    })
    afterAll(() => {
        localStorage.clear();
    })
    it('has base functions that save and load migration data', () => {
        let migrations = getSavedMigrationsForCourse(0);
        expect(migrations).toHaveLength(0);
        saveMigrationsForCourse(1, [mockMigrationData]);
        saveMigrationsForCourse(2, [mockMigrationData, mockMigrationData]);
        saveMigrationsForCourse(3, [mockMigrationData, mockMigrationData, mockMigrationData]);
        expect(getSavedMigrationsForCourse(0)).toHaveLength(0)
        expect(getSavedMigrationsForCourse(1)).toHaveLength(1)
        expect(getSavedMigrationsForCourse(2)).toHaveLength(2)
        expect(getSavedMigrationsForCourse(3)).toHaveLength(3)
        saveMigrationsForCourse(3, [mockMigrationData])
        expect(getSavedMigrationsForCourse(3)).toHaveLength(1);
        expect(getSavedMigrationsForCourse(3)[0]).toEqual(mockMigrationData)
    })


    it('saves active migration when one is created', async () => {
        expect(getSavedMigrationsForCourse(mockCourse.id)).toHaveLength(0);
        (blueprintApi.getBlueprintsFromCode as jest.Mock).mockResolvedValue([]);
        renderComponent();
        await waitFor(() => expect(getBlueprintsFromCode).toHaveBeenCalled());
        await waitFor(() => expect(screen.queryByText(/Create New BP For Dev/)).toBeInTheDocument());
        (createNewCourse as jest.Mock).mockResolvedValue(mockBlueprintCourse);

        const saveMigrationSpy = jest.spyOn(makeBpApi, 'saveMigrations');
        screen.getByText(/Create New BP For Dev/).click();
        await waitFor(() => expect(screen.queryByText(/Create New BP For Dev/)).toBeInTheDocument());
        await waitFor(() => expect(screen.getByText(/Archive/)).toBeInTheDocument());
        await waitFor(() => expect(screen.getByText(/Status:/)).toBeInTheDocument());
expect(screen.getByText(/Status:/)).toBeInTheDocument();
        await waitFor(() => expect(getSavedMigrationsForCourse(mockCourse.id)).toHaveLength(1));
    })
})


