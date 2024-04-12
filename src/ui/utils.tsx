import React, {useEffect} from "react";

export function useEffectAsync<T>(func : () => Promise<T>, deps: React.DependencyList) {
    useEffect(() => {
        func().then();
    }, deps)
}