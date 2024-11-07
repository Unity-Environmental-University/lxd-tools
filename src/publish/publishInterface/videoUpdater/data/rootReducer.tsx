import {combineReducers} from "redux";
import {courseDataReducer} from "@/canvas-redux/courseDataSlice";

import {modulesReducer} from "@/canvas-redux/modulesSlice";
import {coursePagesReducer} from "@/canvas-redux/coursePagesSlice";
import {courseAssignmentsReducer} from "@/canvas-redux/courseAssignmentsSlice";
import {
    kalturaMigrationsReducer
} from "@publish/publishInterface/videoUpdater/data/kalturaMigrationsSlice";
import {learningMaterialsReducer} from "@/canvas-redux/learningMaterialsSlice";

export const rootReducer = combineReducers({
    courseData: courseDataReducer,
    learningMaterials: learningMaterialsReducer,
    modules: modulesReducer,
    coursePages: coursePagesReducer,
    courseAssignments: courseAssignmentsReducer,
    kaltura: kalturaMigrationsReducer, // Ensure correct name and path
});