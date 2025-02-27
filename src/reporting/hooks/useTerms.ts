import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTermsThunk } from "@/reporting/data/thunks/fetchTermsThunk";
import {AppDispatch, RootReportingState} from "@/reporting/data/reportingStore";
import {fetchAccountInfoThunk} from "@/reporting/data/thunks/fetchAccountInfoThunk";

export const useTerms = ({maxFetch}: {maxFetch?:number}) => {
    const dispatch = useDispatch<AppDispatch>();

    const { rootAccountId, status: accountStatus } = useSelector((state:RootReportingState) => state.accounts);
    const { terms, status } = useSelector((state: RootReportingState) => state.terms);

    useEffect(() => {
        if(accountStatus !== 'loading' && !rootAccountId) dispatch(fetchAccountInfoThunk());
    }, [rootAccountId]);
    useEffect(() => {
        if (status === "idle" && rootAccountId) {
            dispatch(fetchTermsThunk({ rootAccountId }));
        }
    }, [status, rootAccountId, dispatch]);

    return { terms, status };
};
