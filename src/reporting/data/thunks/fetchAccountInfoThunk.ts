import {createAsyncThunk} from "@reduxjs/toolkit";
import {setAccountId, setRootAccountId, setStatus} from "@/reporting/data/accountsSlice";
import { Account, getAccountIdFromUrl } from "ueu_canvas";

type FetchAccountInfoParams = {} | undefined;
export const fetchAccountInfoThunk = createAsyncThunk(
    "accounts/fetchAccountIds",
    async (params: FetchAccountInfoParams, {dispatch}) => {

        dispatch(setStatus('loading'))
        const rootAccount = await Account.getRootAccount();
        const accountId = getAccountIdFromUrl() ?? undefined;
        dispatch(setRootAccountId(rootAccount?.id));
        dispatch(setAccountId(accountId));
        dispatch(setStatus('fulfilled'))
    });