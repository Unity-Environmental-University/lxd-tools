import React, {useEffect} from "react";

export function useEffectAsync<T>(func : () => Promise<T>, deps: React.DependencyList) {
    useEffect(() => {
        // library fetches now throw on Canvas errors; log them instead of leaving an unhandled rejection
        func().catch((error) => console.error(error));
    }, deps)
}

