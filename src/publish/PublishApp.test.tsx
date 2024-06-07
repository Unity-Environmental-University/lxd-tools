// PublishApp.test.tsx
global.TextEncoder = require('util').TextEncoder;

import React, {act} from 'react';
import {render, screen, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom';
import PublishApp from './PublishApp';
import {Course} from '../canvas/course';
import {IUserData} from '../canvas/canvasDataDefs';
import * as canvasUtils from '../canvas/canvasUtils';
import * as CourseModule from '../canvas/course';
import {PublishInterface} from './publishInterface/PublishInterface';
import {ContentUpdateInterface} from './fixesAndUpdates/ContentUpdateInterface';
import {AdminApp} from '../admin/AdminApp';

jest.mock('../canvas/course');
jest.mock('../canvas/canvasUtils');
jest.mock('./publishInterface/PublishInterface');
jest.mock('./fixesAndUpdates/ContentUpdateInterface');
jest.mock('../admin/AdminApp');


const mockCourse: Course = {
    getParentCourse: jest.fn().mockResolvedValue({}),
} as any;

const mockUser: IUserData = {
    id: 1,
    name: 'Test User',
} as any;

const mockFetchJson = canvasUtils.fetchJson as jest.Mock;
const mockCourseGetFromUrl = CourseModule.Course.getFromUrl as jest.Mock;

beforeEach(() => {
    jest.clearAllMocks();
    mockCourseGetFromUrl.mockResolvedValue(mockCourse);
    mockFetchJson.mockResolvedValue(mockUser);
});


test('TextEncoder is globally defined in Jest', () => {
    expect(global.TextEncoder).toBeDefined();
});

describe('PublishApp Component', () => {
    it('renders subcomponents with correct props', async () => {


        (PublishInterface as jest.Mock).mockImplementation(({course, user}) => (
            <div>PublishInterface: {course && user && 'Loaded'}</div>
        ));
        (ContentUpdateInterface as jest.Mock).mockImplementation(({course, parentCourse, refreshCourse}) => (
            <div>ContentUpdateInterface: {course && parentCourse && 'Loaded'}</div>
        ));
        (AdminApp as jest.Mock).mockImplementation(({course}) => (
            <div>AdminApp: {course && 'Loaded'}</div>
        ));

        render(<PublishApp/>);
        await waitFor(() => expect(mockCourseGetFromUrl).toHaveBeenCalled());
        await waitFor(() => expect(mockFetchJson).toHaveBeenCalledWith('/api/v1/users/self'));


        await waitFor(() => expect(screen.getByText(/PublishInterface: Loaded/)).toBeInTheDocument());
        await waitFor(() => expect(screen.getByText(/ContentUpdateInterface: Loaded/)).toBeInTheDocument());
        await waitFor(() => expect(screen.getByText(/AdminApp: Loaded/)).toBeInTheDocument());
    });
});
