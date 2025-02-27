import {ICourseData} from "@/canvas";
import {LoadStatus} from "@/reporting/data/loadStatus";
import {createSlice, PayloadAction} from "@reduxjs/toolkit";

export type AccountsSlice = {
    rootAccountId: number | undefined | null;
    accountId: number | undefined | null;
    status: LoadStatus;
    error?: string;
};

const initialState: AccountsSlice = {
    status: "idle",
    rootAccountId: undefined,
    accountId: undefined,
    error: undefined,
};

const coursesSlice = createSlice({
    name: "courses",
    initialState,
    reducers: {
        setStatus: (state, action: PayloadAction<LoadStatus>) => {
            state.status = action.payload;
        },
        setRootAccountId: (state, action: PayloadAction<number|undefined>) => {
            state.rootAccountId = action.payload;
        },
        setAccountId: (state, action: PayloadAction<number|undefined>) => {
            state.accountId = action.payload;
        }

    },
});

export const { setStatus, setRootAccountId, setAccountId } = coursesSlice.actions;
export const accountsReducer = coursesSlice.reducer;

