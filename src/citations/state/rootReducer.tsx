import {combineReducers, Reducer} from "redux";
import courseDataSlice from "@citations/state/courseDataSlice";

type ActionType = {};

const initialState = {};

export default combineReducers({courseData: courseDataSlice})

