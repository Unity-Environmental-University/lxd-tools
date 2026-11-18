import {createSelector} from "@reduxjs/toolkit";
import {RootReportingState} from "@/reporting/data/reportingStore";

export type LookupSetSelector = (state: RootReportingState) => Record<number,  Set<number> | number[] | undefined>;
export const generateGroupGetter = <T>(
    selector: LookupSetSelector,
    baseSelector: (state: RootReportingState) => Record<number, T>
) => {
    const cache = new Map<number, (state: RootReportingState) => T[] | undefined>();

    return (id: number) => {
        if (!cache.has(id)) {
            // Memoized so components using this with useSelector only re-render when the group changes
            cache.set(id, createSelector(
                [selector, baseSelector],
                (group, items) => {
                    const elements = group[id];
                    return elements ? Array.from(elements).map(a => items[a]) : undefined;
                }
            ));
        }
        return cache.get(id)!;
    };
};
