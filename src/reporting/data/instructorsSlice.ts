import {ICourseData} from "@/canvas";
import {LoadStatus} from "@/reporting/data/loadStatus";
import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {IUserData} from "@canvas/canvasDataDefs";
export type InstructorsState = {
    instructors: IUserData[];
    instructorsById: Record<number, IUserData>;
    instructorsByCourseId: Record<number, IUserData[]>;
    instructorLoadStatus: Record<number, LoadStatus>;
    status: LoadStatus;
    error?: string | undefined;
};

const initialState: InstructorsState = {
    instructorLoadStatus: {},
    instructorsByCourseId: {},
    instructorsById: {},
    status: 'idle',
    instructors: [],


};const instructorsSlice = createSlice({
    name: 'instructors',
    initialState,
    reducers: {
        setStatus: (state, action: PayloadAction<LoadStatus>) => {
            state.status = action.payload;
        },
        updateInstructors: (state, action: PayloadAction<{
            instructor: IUserData | IUserData[],
            courseId?: number,
            overwrite?: boolean
        }>) => {
            const { instructor, courseId, overwrite = false } = action.payload;
            const instructors = Array.isArray(instructor) ? instructor : [instructor];

            // Always update the main instructors set and byId map
            instructors.forEach(inst => {
                if(state.instructors.indexOf(inst) === -1) {
                    state.instructors.push(inst);
                } else {
                    state.instructors.splice(instructors.indexOf(inst), 1, inst);
                }
                state.instructorsById[inst.id] = inst;
            });

            // Handle course-specific logic
            if (instructors && courseId) {
                if (!state.instructorsByCourseId[courseId]) {
                    state.instructorsByCourseId[courseId] = [...instructors];
                }
            }
        },
    },
});





export const { setStatus, updateInstructors } = instructorsSlice.actions;
export const instructorReducer = instructorsSlice.reducer;