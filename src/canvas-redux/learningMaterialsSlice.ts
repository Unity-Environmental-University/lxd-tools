// learningMaterialsSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchModules } from '@/canvas-redux/modulesSlice';
import learningMaterialsForModule from "@canvas/content/pages/learningMaterialsForModule";
import {IModuleData, IModuleItemData} from "@canvas/canvasDataDefs";
import {IPageData} from "@canvas/content/pages/types";

type PayloadParams = {
    courseId: number,
    modules: IModuleData[],
}

export type LearningMaterial = {
    module: IModuleData,
    item: IModuleItemData,
    page: IPageData,
}


const initialState = {
    data: [] as LearningMaterial[],
    status: 'idle' as 'idle' | 'pending' | 'fulfilled' | 'failed',
    error: undefined as string | undefined,
}

type State = typeof initialState;
export const fetchLearningMaterials = createAsyncThunk(
    'learningMaterials/fetchLearningMaterials',
    async ({ courseId, modules }: PayloadParams, thunkAPI) => {
        // Fetch modules if not provided
        if (!modules) {
            modules = await thunkAPI.dispatch(fetchModules(courseId)).unwrap();
        }

        // Filter out modules already processed
        const state = thunkAPI.getState() as { modules: {
            data: IModuleData[],
            }};
        const loadedModuleIds = new Set(state.modules.data.map(m => m.id));

        for (const module of modules) {
            if (!loadedModuleIds.has(module.id)) {
                const generator = learningMaterialsForModule(courseId, module);
                for await (const { item, page } of generator) {
                    thunkAPI.dispatch(updateLearningMaterials({ module, item, page }));
                }
            }
        }
    }
);

const learningMaterialsSlice = createSlice({
    name: 'learningMaterials',
    initialState,
    reducers: {
        updateLearningMaterials: (state, action) => {
            const { module, item, page } = action.payload;
            state.data.push({ module, item, page });
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchLearningMaterials.pending, (state) => {
                state.status ='pending';
            })
            .addCase(fetchLearningMaterials.fulfilled, (state) => {
                state.status = 'fulfilled';
            })
            .addCase(fetchLearningMaterials.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            });
    },
});


export const { updateLearningMaterials } = learningMaterialsSlice.actions;
export const getLmsData = (state:State) => state.data;
export const getLmsStatus = (state:State) => state.status;
export const getLmsError = (state:State) => state.error;
export const learningMaterialsReducer = learningMaterialsSlice.reducer;
export default learningMaterialsSlice.reducer;
