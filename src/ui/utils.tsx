import React, {useEffect} from "react";

export function useEffectAsync(func: () => Promise<any>, deps: React.DependencyList) {
    useEffect(() => {
        func().then();
    }, deps)
}