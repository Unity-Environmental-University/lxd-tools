// modulesSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { moduleGenerator } from "@ueu/ueu-canvas";
import { IModuleData } from "@ueu/ueu-canvas";

export const fetchModules = createAsyncThunk("modules/fetchModules", async (courseId: number, thunkAPI) => {
  const generator = moduleGenerator(courseId);
  const modules = [] as IModuleData[];
  for await (const module of generator) {
    thunkAPI.dispatch(updateModules([module]));
    modules.push(module);
  }
  return modules;
});

type ModuleSliceInitState = {
  data: IModuleData[];
  loading: boolean;
  error: string | null;
};

const initialState = {
  data: [] as IModuleData[],
  loading: false,
  error: undefined as string | undefined,
};
const modulesSlice = createSlice({
  name: "modules",
  initialState,
  reducers: {
    updateModules: (state, action: PayloadAction<IModuleData[]>) => {
      // Filter out duplicates
      const existingIds = new Set(state.data.map((m) => m.id));
      const newModules = action.payload.filter((m) => !existingIds.has(m.id));
      state.data = [...state.data, ...newModules];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchModules.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchModules.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(fetchModules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { updateModules } = modulesSlice.actions;

export const getModules = (state: ModuleSliceInitState) => state.data;
export const getModulesStatus = (state: ModuleSliceInitState) => state.loading;
export const getModulesError = (state: ModuleSliceInitState) => state.error;
export const modulesReducer = modulesSlice.reducer;
export default modulesSlice.reducer;
