import {filterUniqueFunc} from "../canvas/canvasUtils";


type RecordKeyType = string | number | symbol



type ListLutAddAction<TKey extends RecordKeyType, TItem>  =
    [key:TKey, values:TItem[]] | {[key in TKey] : TItem[]}

interface IListLutAction<TKey extends RecordKeyType, TItem> {
    /**
     * clears the lookup table
     */
    clear?: boolean,
    /**
     * adds elements to a collection at a given key in the lookup table
     */
    add?: ListLutAddAction<TKey, TItem>,
    /**
     * Replaces list(s) at target value
     */
    set?: ListLutAddAction<TKey, TItem>
}

type ListLutStateType<
    TKey extends RecordKeyType,
    TItem,
    TState extends Record<TKey, TItem[]> = Record<TKey, TItem[]>
> = {[key in (TKey | keyof TState)] : TItem[]}

export interface ILutAction<KeyType extends RecordKeyType, DataType> {
    set?: LutSetAction<KeyType, DataType>
    clear?: boolean,
}

type LutSetAction<KeyType extends RecordKeyType, ValueType> = [key:KeyType, value:ValueType] | { [key in KeyType] : ValueType}



/**
 * Actions are resolved in the order clear, set, add
 * @param state
 * @param action
 */
export function listLutDispatcher<TKey extends RecordKeyType,  TItem>(
    state: ListLutStateType<RecordKeyType, TItem>,
    action: IListLutAction<TKey, TItem>
) {
    let outputState = {...state} as ListLutStateType<RecordKeyType, TItem>;
    //Handle clear first as there are more cases where one would want to
    // clear while setting a new state than there are cases where one
    // would want to add and then immediately remove the added items
    if(action.clear) outputState = {} as ListLutStateType<TKey, TItem>;
    if(action.set) {
        outputState = handleCollectionLutAdd(null, action.set)
    }
    if(action.add) {
        outputState = handleCollectionLutAdd(outputState, action.add);
    }
    return outputState;
}


function handleCollectionLutAdd<TKey extends RecordKeyType, TItem>(
    state: ListLutStateType<TKey, TItem> | null,
    additions: ListLutAddAction<TKey, TItem>) {
    if(!state) state = {} as Record<TKey, TItem[]>
    let returnValue = {...state} satisfies typeof state;

    function updateState(state: typeof returnValue, key:TKey, values:TItem[]) {
        const previousValue = state[key] || [];
        return {...state, [key]: [...previousValue, ...values].filter(filterUniqueFunc)};
    }

    if(Array.isArray(additions)) {
        const [key, values] = additions;
        return updateState(state, key, values)
    }


    for(let key in additions)  {
        returnValue = updateState(returnValue, key, additions[key])
    }

    return returnValue;
}


export function lutDispatcher<KeyType extends RecordKeyType, ValueType>(
    state: Record<KeyType, ValueType>,
    action: ILutAction<RecordKeyType, ValueType>
) {
    let output: Record<RecordKeyType, ValueType> = {...state};
    if  (action.clear) output = {};
    output = handleLutSet(output, action.set);
    return output;
}

function handleLutSet<KeyType extends RecordKeyType, DataType>(
    state: Record<KeyType, DataType>,
    set:LutSetAction<RecordKeyType, DataType> | undefined
) {
    if (Array.isArray(set)) {
        const [key, value] = set;
        return {...state, [key]: value};
    }

    return {...state, ...set};
}

export interface IListAction<DataType> {
    add?: DataType | DataType[]
    set?: DataType[],
    clear?: boolean,
}

export function listDispatcher<DataType>(
    state: Array<DataType>,
    action: IListAction<DataType>
) {
    const {clear} = action;
    const {add} = action;
    const {set} = action;

    if(clear) {
     state = [];
    }
    if(set) {
        state = [...set];
    }
    if(add) {
        if(Array.isArray(add)) state = [...state, ...add];
        else state = [...state, add];
    }
    return state;
}