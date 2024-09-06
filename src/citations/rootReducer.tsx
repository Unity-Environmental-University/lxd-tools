import {combineReducers, Reducer} from "redux";
import courseDataSlice from "@citations/courseDataSlice";

type ActionType = {};

const initialState = {};

export default combineReducers({courseData: courseDataSlice})

