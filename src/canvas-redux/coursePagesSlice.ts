import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {fetchModules} from '@/canvas-redux/modulesSlice';
import learningMaterialsForModule from "@canvas/content/pages/learningMaterialsForModule";
import {IModuleData, IModuleItemData} from "@canvas/canvasDataDefs";
import {IPageData} from "@canvas/content/pages/types";
import {RootState} from "@citations/state/store";
import getReferencesTemplate from "@canvas/course/references/getReferencesTemplate";
import {IAssignmentData} from "@canvas/content/assignments/types";
import AssignmentKind from "@canvas/content/assignments/AssignmentKind";
import PageKind from "@canvas/content/pages/PageKind";

type PayloadParams = {
    courseId: number,
}


const initialState = {
    data: [] as IPageData[],
    loading: false,
    error: undefined as string | undefined,
}

type State = typeof initialState;

export const fetchCourseAssignments = createAsyncThunk(
    'courseAssignments/fetchCoursePages',
    async ({courseId}: PayloadParams, thunkAPI) => {

        const pageDataGen = PageKind.dataGenerator(courseId)
        const state = thunkAPI.getState() as RootState;


        for await (const assignmentData of pageDataGen) {
            thunkAPI.dispatch(updateCoursePages({assignmentData}));
        }
    }
)

const coursePagesSlice = createSlice({
    name: 'coursePages',
    initialState,
    reducers: {
        updateCoursePages: (state, action) => {
            const assignmentData = action.payload;
            state.data.push(assignmentData);
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCourseAssignments.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchCourseAssignments.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(fetchCourseAssignments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            });
    },
});


export const {updateCoursePages} = coursePagesSlice.actions;
export const getCoursePagesData = (state: State) => state.data;
export const getPagesStatus = (state: State) => state.loading;
export const getPagesError = (state: State) => state.error;
export default coursePagesSlice.reducer;
