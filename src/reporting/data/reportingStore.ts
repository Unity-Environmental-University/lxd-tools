import {configureStore} from "@reduxjs/toolkit";
import {termReducer} from "@/reporting/data/termSlice";
import {combineReducers} from "redux";
import {instructorReducer} from "@/reporting/data/instructorsSlice";
import {courseReducer} from "@/reporting/data/coursesSlice";


const reducer = combineReducers({
    term: termReducer,
    faculty: instructorReducer,
    course: courseReducer,
})
export const reportingStore = configureStore({
    reducer,
})

export type RootReportingState = ReturnType<typeof reducer>;
export type AppDispatch = typeof reportingStore.dispatch;
export type RootState = ReturnType<typeof reportingStore.getState>;