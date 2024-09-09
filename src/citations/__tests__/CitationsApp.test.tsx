import React, {act} from "react";
import {render, screen, waitFor} from '@testing-library/react';
import CitationsApp from "@/citations/CitationsApp";
import {store} from "@citations/state/store";
import {Provider} from "react-redux";
import courseDataReducer, {InitialCourseSliceState} from "@citations/state/courseDataSlice";
import {configureStore} from "@reduxjs/toolkit";
import {mockCourseData} from "@canvas/course/__mocks__/mockCourseData";
import mock = jest.mock;
import '@testing-library/jest-dom'
import {ICourseData} from "@canvas/courseTypes";
import {fetchJson} from "@canvas/fetch/fetchJson";
import {wait} from "@testing-library/user-event/dist/utils";


jest.mock('@canvas/fetch/fetchJson')
const createMockStore = (initialState: InitialCourseSliceState) => {
    return configureStore({
        reducer: courseDataReducer,
        preloadedState: initialState,
    });
};

const courseData: ICourseData = {...mockCourseData, id: 1, name: 'Test Course'};
(fetchJson as jest.Mock).mockResolvedValue(courseData);

async function renderBody(store: ReturnType<typeof createMockStore>, courseId = courseData.id) {
    return await act(() => render(
        <Provider store={store}>
            <CitationsApp courseId={courseId}/>
        </Provider>
    ));
}


describe('CitationsApp', () => {
    it('runs without error', async () => {
        await expect(renderBody(createMockStore({
            courseData: mockCourseData,
            status: 'succeeded',
            error: null,
        }))).resolves.not.toThrow();
    })
    it('displays course data when loaded', async () => {
        const mockStore = createMockStore({
            courseData: {
                ...mockCourseData,
                name: 'Test Course',
            },
            status: 'succeeded',
            error: null,
        });

        await renderBody(mockStore);
        await waitFor(() => {
            expect(screen.getByText('Test Course')).toBeInTheDocument();
        });
    });
    it('displays loading status when course data is being fetched', async () => {
        const mockStore = createMockStore({
            courseData: undefined,
            status: 'loading',
            error: null,
        });

        await act(async () => {
            render(<Provider store={store}>
                <CitationsApp courseId={undefined}/>
            </Provider>)
        })
    });
});