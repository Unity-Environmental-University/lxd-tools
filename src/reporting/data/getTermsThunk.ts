import {createAsyncThunk} from "@reduxjs/toolkit";
import {getTermsGenerator, TermQueryParams} from "ueu_canvas";
import {addTerm, setStatus} from "@/reporting/data/termSlice";


export type GetTermsThunkParams = {
    rootAccountId: number;
    queryParams?: TermQueryParams;
}

const defaultQueryParams: TermQueryParams = {
    workflow_state: 'active',
}
export const getTermsThunk = createAsyncThunk<void, GetTermsThunkParams>(
    'terms/getTermsThunk',
    async ({rootAccountId, queryParams}, {dispatch}) => {

        const params = {...defaultQueryParams, ...queryParams};
        const gen = getTermsGenerator(rootAccountId, params);
        dispatch(setStatus('loading'));
        for await(const term of gen) {
            dispatch(addTerm(term));
        }
        dispatch(setStatus('fulfilled'));
    });