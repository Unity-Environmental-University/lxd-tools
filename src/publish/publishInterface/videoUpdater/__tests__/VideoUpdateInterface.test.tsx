import React, {act} from 'react';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import {Provider} from 'react-redux';
import VideoUpdateInterface from '../VideoUpdateInterface';
import {fetchCourseData} from '@/canvas-redux/courseDataSlice';
import {resetKalturaState} from '@publish/publishInterface/videoUpdater/data/kalturaMigrationsSlice';
import {fetchCourseAssignments} from "@/canvas-redux/courseAssignmentsSlice";
import {fetchCoursePages} from "@/canvas-redux/coursePagesSlice";
import rootReducer from "@publish/publishInterface/videoUpdater/data/rootReducer";
import {configureStore} from "@reduxjs/toolkit";
import {RootState} from "@publish/publishInterface/videoUpdater/data/store";
//
import * as courseApi from '@/canvas/course/index'
import {mockCourseData} from "@canvas/course/__mocks__/mockCourseData";

const getCourseDataSpy = jest.spyOn(courseApi, 'getCourseData')
const getNewState = (params?: Partial<RootState>) => {
    return configureStore({
        reducer: rootReducer,
        preloadedState: {
            learningMaterials: {
                data: [],
                loading: false,
                error: undefined
            }, modules: {
                data: [],
                loading: false,
                error: undefined
            },
            courseAssignments: {data: [], loading: false, error: undefined},
            coursePages: {data: [], loading: false},
            kaltura: {migrations: {}, status: 'idle', error: undefined},
            courseData: {
                data: undefined,
                status: 'idle',
                error: undefined,
            },
            ...params,
        },
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware().concat(),
    });

}
let store = getNewState()
type StoreType = typeof store

async function renderComponent(store: StoreType) {
    await act(async () => {
        getCourseDataSpy.mockResolvedValue({...mockCourseData, name: "Test Course"})
        render(
            <Provider store={store}>
                <VideoUpdateInterface courseId={123}/>
            </Provider>
        );

    })
}

describe('VideoUpdateInterface', () => {

    beforeEach(() => {
        // Initialize the mock store
        store = getNewState()
        // Mock the necessary dispatch actions
        jest.spyOn(store, 'dispatch');
    });

    test('renders without crashing', async () => {
        await renderComponent(store)
        expect(screen.getByText('Test Course')).toBeInTheDocument();
        expect(screen.getByText('Migrate Kaltura Content')).toBeInTheDocument();
    });

    test('opens modal on button click', async () => {
        await renderComponent(store)

        await act(async () => fireEvent.click(screen.getByText('Migrate Kaltura Content')));
        expect(screen.getByText('Kaltura Migration')).toBeInTheDocument();
    });

    test('closes modal and resets state', async () => {
        await renderComponent(store);

        await act(async () => fireEvent.click(screen.getByText('Migrate Kaltura Content')));
        await act(async () => fireEvent.click(screen.getByText('Close')));

        await waitFor(() => {
            expect(store.dispatch).toHaveBeenCalledWith(resetKalturaState());
        });
    });

    test('fetches course data on mount', async () => {
        await renderComponent(store)

        expect(store.dispatch).toHaveBeenCalledWith(fetchCourseData({courseId: 123}));
        expect(store.dispatch).toHaveBeenCalledWith(fetchCourseAssignments({courseId: 123}));
        expect(store.dispatch).toHaveBeenCalledWith(fetchCoursePages({courseId: 123}));
    });

    test('displays error message if there is an error', async () => {
        store = getNewState({
            courseAssignments: {data: [], loading: false, error: 'Some error occurred'},
            coursePages: {data: [], loading: false},
            kaltura: {migrations: {}, status: 'idle', error: undefined},
        });

        await renderComponent(store)
        expect(screen.getByText('Some error occurred')).toBeInTheDocument();
    });
});
