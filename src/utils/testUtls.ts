// utils/testUtils.ts
import {AnyAction, ThunkDispatch} from '@reduxjs/toolkit';
import {ThunkAction} from 'redux-thunk';


interface TestAsyncThunkParams<ThunkParams extends ThunkDispatch<any, unknown, AnyAction>> {
    thunk: ThunkAction<Promise<void>, any, unknown, AnyAction>;
    params: ThunkParams;
    expectedActions: AnyAction[];
}

export function mockAll<T>(partials: Partial<T>[], filler: T) {
    return partials.map(p => ({...filler, ...p})) as T[]
}