export type ConditionEval<T> = (_: T) => boolean;

export function validateTestFuncGen<T>(...conditions: ConditionEval<T>[]) {
    return (ba: T) => {
        for (const condition of conditions) {
            if (condition(ba)) return false;
        }
        return true
    }
}