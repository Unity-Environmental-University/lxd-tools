import {combineReducers} from "redux";
import {learningMaterialsReducer} from "@/canvas-redux/learningMaterialsSlice";
import {modulesReducer} from "@/canvas-redux/modulesSlice";
import {courseDataReducer} from "@/canvas-redux/courseDataSlice";

export default combineReducers({
    courseData: courseDataReducer,
    learningMaterials: learningMaterialsReducer,
    modules: modulesReducer,
})

