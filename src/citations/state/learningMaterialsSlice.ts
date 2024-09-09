import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { fetchJson } from "@canvas/fetch/fetchJson";
import getLearningMaterialsWithModules from "@canvas/content/pages/getLearningMaterialsWithModules";
import {IModuleData} from "@canvas/canvasDataDefs";
import {IPageData} from "@canvas/content/pages/types";

export type ModuleLearningMaterials = {
    module: IModuleData,
    lms: IPageData[],
};

export type InitialLearningMaterialsState = {
    moduleLms: ModuleLearningMaterials[] | undefined;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

export const initialLearningMaterialsState: InitialLearningMaterialsState = {
    moduleLms: undefined,
    status: 'idle',
    error: null,
};


export type FetchLmsParams = {
    courseId: number,
    modules: IModuleData[],
}
// Async thunk to fetch learning materials based on week/module
export const fetchLearningMaterials = createAsyncThunk(
    'learningMaterials/fetchLearningMaterials',
    async ({ courseId, modules}:FetchLmsParams, { rejectWithValue }) => {
        try {
            return getLearningMaterialsWithModules(courseId, modules);
        } catch (error) {
            rejectWithValue(error?.toString() ?? error);
        }
    }
);

const learningMaterialsSlice = createSlice({
    name: 'learningMaterials',
    initialState: initialLearningMaterialsState,
    reducers: {
        setMaterials(state, action: PayloadAction<ModuleLearningMaterials[] | undefined>) {
            state.moduleLms = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchLearningMaterials.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchLearningMaterials.fulfilled, (state, action: PayloadAction<ModuleLearningMaterials[] | undefined>) => {
                state.status = 'succeeded';
                state.moduleLms = action.payload;
                state.error = null;
            })
            .addCase(fetchLearningMaterials.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            });
    }
});

export const getLmsWithModules = (state: ReturnType<typeof learningMaterialsSlice.reducer>) => state.moduleLms;
// Define selectors
export const getLearningMaterials = (state: ReturnType<typeof learningMaterialsSlice.reducer>) => state.moduleLms?.map(a => a.lms).flat();
export const getMaterialsStatus = (state: ReturnType<typeof learningMaterialsSlice.reducer>) => state.status;
export const getMaterialsError = (state: ReturnType<typeof learningMaterialsSlice.reducer>) => state.error;

export const { setMaterials } = learningMaterialsSlice.actions;
const learningMaterialsReducer = learningMaterialsSlice.reducer;
export default learningMaterialsReducer;
