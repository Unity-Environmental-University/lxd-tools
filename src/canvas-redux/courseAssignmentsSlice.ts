// learningMaterialsSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchModules } from '@/canvas-redux/modulesSlice';
import learningMaterialsForModule from "@canvas/content/pages/learningMaterialsForModule";
import {IModuleData, IModuleItemData} from "@canvas/canvasDataDefs";
import {IPageData} from "@canvas/content/pages/types";
import {RootState} from "@citations/state/store";
import getReferencesTemplate from "@canvas/course/references/getReferencesTemplate";
import {IAssignmentData} from "@canvas/content/assignments/types";

type PayloadParams = {
    courseId: number,
    modules: IModuleData[],
}


const initialState = {
    data: [] as IAssignmentData[],
    loading: false,
    error: undefined as string | undefined,
}

type State = typeof initialState;
export const fetchCourseAssignments = createAsyncThunk(
    'assignments/fetchCourseAssignments',
    async ({ courseId, modules }: PayloadParams, thunkAPI) => {
        // Fetch modules if not provided
        if (!modules) {
            modules = await thunkAPI.dispatch(fetchModules(courseId)).unwrap();
        }

        // Filter out modules already processed
        const state = thunkAPI.getState() as RootState;
        const loadedModuleIds = new Set(state.modules.data.map(m => m.id));

        for (const module of modules) {
            if (!loadedModuleIds.has(module.id)) {
                const generator = learningMaterialsForModule(courseId, module);
                const materials = [] as {
                    module: IModuleData,
                    item: IModuleItemData,
                    page: IPageData
                }[];
                for await (const { item, page } of generator) {
                    thunkAPI.dispatch(updateLearningMaterials({ module, item, materials }));
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
                state.loading = true;
            })
            .addCase(fetchLearningMaterials.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(fetchLearningMaterials.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            });
    },
});


export const { updateLearningMaterials } = learningMaterialsSlice.actions;
export const getLmsData = (state:State) => state.data;
export const getLmsStatus = (state:State) => state.loading;
export const getLmsError = (state:State) => state.error;
export default learningMaterialsSlice.reducer;
