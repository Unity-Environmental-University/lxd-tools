import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {ITermData} from "@canvas/term/Term";
import {LoadStatus} from "@/reporting/data/loadStatus";
import {getTermsThunk} from "@/reporting/data/getTermsThunk";


type ADD_TERM = 'ADD_TERM';

export interface TermState {
    terms: ITermData[];
    status: LoadStatus;
    error?: string | undefined;
}

const initialState: TermState = {
    terms: [],
    status: 'idle',
};



export const termSlice = createSlice({
    name: 'terms',
    initialState,
    reducers: {
        setStatus(state, action: PayloadAction<LoadStatus>) {
            state.status = action.payload;
        },
        addTerm: (state, action:PayloadAction<ITermData>) => {
            state.terms ??= [];
            state.terms = [...state.terms, action.payload.value];
        },
        reset: (state: TermState) => {
            state.terms = [];
            state.status = 'idle';
            state.error = undefined;
        }
    },
})

export const { reset, addTerm, setStatus } = termSlice.actions;
export const termReducer = termSlice.reducer;