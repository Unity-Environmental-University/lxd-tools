import { combineReducers } from "redux";
import courseDataSlice from "@/canvas-redux/courseDataSlice";
import learningMaterialsSlice from "@/canvas-redux/learningMaterialsSlice";
import modulesSlice from "@/canvas-redux/modulesSlice";
import coursePagesSlice from "@/canvas-redux/coursePagesSlice";
import courseAssignmentsSlice from "@/canvas-redux/courseAssignmentsSlice";
import kalturaMigrationSlice from "@publish/publishInterface/videoUpdater/data/kalturaMigrationsSlice";

const rootReducer = combineReducers({
    courseData: courseDataSlice,
    learningMaterials: learningMaterialsSlice,
    coursePages: coursePagesSlice,
    courseAssignments: courseAssignmentsSlice,
    modules: modulesSlice,
    kaltura: kalturaMigrationSlice, // Ensure correct name and path
});

export default rootReducer;