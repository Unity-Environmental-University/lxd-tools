import {RootReportingState} from "@/reporting/data/reportingStore";

export type LookupSetSelector = (state: RootReportingState) => Record<number,  Set<number> | number[] | undefined>;
export const generateGroupGetter = <T>(
    selector: LookupSetSelector,
    baseSelector: (state: RootReportingState) => Record<number, T>
) => {
    const cache = new Map<number, (state: RootReportingState) => T[] | undefined>();

    return (id: number) => {
        if (!cache.has(id)) {
            // Store either a simple function or a selector
            const getResult = (state: RootReportingState) => {
                const group = selector(state);
                const items = baseSelector(state);
                const elements = group[id];
                return elements ? Array.from(elements).map(a => items[a]) : undefined;
            };

            cache.set(id, getResult); // Just store a plain function
        }
        return cache.get(id)!;
    };
};