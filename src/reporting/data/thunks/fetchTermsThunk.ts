import {createAsyncThunk} from "@reduxjs/toolkit";
import {getTermsGenerator, TermQueryParams} from "@ueu/ueu-canvas";
import {ITermData} from "@ueu/ueu-canvas/term/Term";
import {addTerm, setStatus} from "@/reporting/data/termSlice";


export type GetTermsThunkParams = {
    rootAccountId: number;
    max?: number;
    queryParams?: TermQueryParams;
}

const defaultQueryParams: TermQueryParams = {
    workflow_state: 'active',
}
export const fetchTermsThunk = createAsyncThunk<void, GetTermsThunkParams>(
    'terms/getTermsThunk',

    async ({rootAccountId, max, queryParams}, {dispatch}) => {

        const params = {...defaultQueryParams, ...queryParams};
        const gen = getTermsGenerator(rootAccountId, params);
        dispatch(setStatus('loading'));
        let i = 0;
        for await(const term of gen) {
            dispatch(addTerm(term as ITermData));
            i++;
            if (max && i >= max) break;
        }
        dispatch(setStatus('fulfilled'));
    });