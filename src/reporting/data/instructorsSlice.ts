import {LoadStatus} from "@/reporting/data/loadStatus";
import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {IUserData} from "@ueu/ueu-canvas"

export type InstructorsState = {
    instructorsById: Record<number, IUserData>;
    instructorsByCourseId: Record<number, number[]>; // Store only instructor IDs for consistency
    loadStatusByCourseId: Record<number, LoadStatus | undefined>;
    status: LoadStatus;
    error?: string;
};

const initialState: InstructorsState = {
    instructorsById: {},
    instructorsByCourseId: {},
    loadStatusByCourseId: {},
    status: "idle",
};

const instructorsSlice = createSlice({
    name: "instructors",
    initialState,
    reducers: {
        setStatus: (state, action: PayloadAction<LoadStatus>) => {
            state.status = action.payload;
        },
        setCourseInstructorsStatus: (state, action: PayloadAction<{ courseId: number, status: LoadStatus }>) => {
            const {courseId, status} = action.payload;
            state.loadStatusByCourseId[courseId] = status;
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
            if (typeof courseId === 'number') {
                const existingIds = overwrite ? [] : state.instructorsByCourseId[courseId] ?? [];
                // Merge, avoiding duplicates (also within a single payload)
                state.instructorsByCourseId[courseId] = Array.from(new Set([
                    ...existingIds,
                    ...instructors.map(inst => inst.id),
                ]));
            }
        },
    },
});

export const { setStatus, setCourseInstructorsStatus, updateInstructors } = instructorsSlice.actions;
export const instructorReducer = instructorsSlice.reducer;
