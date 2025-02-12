import {LoadStatus} from "@/reporting/data/loadStatus";
import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {IUserData} from "ueu_canvas"

export type InstructorsState = {
    instructorsById: Record<number, IUserData>;
    instructorsByCourseId: Record<number, number[]>; // Store only instructor IDs for consistency
    instructorLoadStatus: Record<number, LoadStatus>;
    status: LoadStatus;
    error?: string;
};

const initialState: InstructorsState = {
    instructorsById: {},
    instructorsByCourseId: {},
    instructorLoadStatus: {},
    status: "idle",
};

const instructorsSlice = createSlice({
    name: "instructors",
    initialState,
    reducers: {
        setStatus: (state, action: PayloadAction<LoadStatus>) => {
            state.status = action.payload;
        },
        updateInstructors: (
            state,
            action: PayloadAction<{
                instructor: IUserData | IUserData[];
                courseId?: number;
                overwrite?: boolean;
            }>
        ) => {
            const { instructor, courseId, overwrite = false } = action.payload;
            const instructors = Array.isArray(instructor) ? instructor : [instructor];

            // Store instructors in `instructorsById`
            instructors.forEach(inst => {
                state.instructorsById[inst.id] = inst;
            });

            // Handle course-specific logic
            if (courseId) {
                if (!state.instructorsByCourseId[courseId] || overwrite) {
                    // Overwrite or initialize new array
                    state.instructorsByCourseId[courseId] = instructors.map(inst => inst.id);
                } else {
                    // Append new instructors, avoiding duplicates
                    const existingIds = new Set(state.instructorsByCourseId[courseId]);
                    instructors.forEach(inst => existingIds.add(inst.id));
                    state.instructorsByCourseId[courseId] = Array.from(existingIds);
                }
            }
        },
    },
});

export const { setStatus, updateInstructors } = instructorsSlice.actions;
export const instructorReducer = instructorsSlice.reducer;

// Selector to retrieve all instructors as an array





