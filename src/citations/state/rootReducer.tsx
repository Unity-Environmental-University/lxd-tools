import {combineReducers, Reducer} from "redux";
import courseDataSlice from "@citations/state/courseDataSlice";
import learningMaterialsSlice from "@citations/state/learningMaterialsSlice";
import modulesSlice from "@citations/state/modulesSlice";

export default combineReducers({
    courseData: courseDataSlice,
    learningMaterials: learningMaterialsSlice,
    modules: modulesSlice,
})

