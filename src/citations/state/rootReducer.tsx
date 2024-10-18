import {combineReducers, Reducer} from "redux";
import courseDataSlice from "@/canvas-redux/courseDataSlice";
import learningMaterialsSlice from "@/canvas-redux/learningMaterialsSlice";
import modulesSlice from "@/canvas-redux/modulesSlice";

export default combineReducers({
    courseData: courseDataSlice,
    learningMaterials: learningMaterialsSlice,
    modules: modulesSlice,
})

