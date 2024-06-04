import {filterUniqueFunc} from "./canvas/canvasUtils";


interface ICollectionLutAddAction<TKey extends string | number, TItems> {
    key: TKey,
    items: TItems[]
}


interface ICollectionLutAction<TKey extends string | number, TItems> {
    /**
     * clears the lookup table
     */
    clear?: boolean,
    /**
     * adds elements to a collection at a given key in the lookup table
     */
    add?: ICollectionLutAddAction<TKey, TItems>,
    set?: ICollectionLutAddAction<TKey, TItems>
}


/**
 * Actions are resolved in the order clear, set, add
 * @param state
 * @param action
 */
export function collectionLutDispatcher<TKey extends string | number, TItems>(
    state: Record<TKey, TItems[]> | null | undefined,
    action: ICollectionLutAction<TKey, TItems>
) {
    let outputState = state || {} as Record<TKey, TItems[]>;
    //Handle clear first as there are more cases where one would want to
    // clear while setting a new state than there are cases where one
    // would want to add and then immediately remove the added items
    if(action.clear) outputState = {} as Record<TKey, TItems[]>
    if(action.set) {
        outputState = handleCollectionLutAdd(null, action.set)
    }
    if(action.add) {
        outputState = handleCollectionLutAdd(outputState, action.add);
    }
    return outputState;
}


function handleCollectionLutAdd<TKey extends string | number, TItems>(
    state: Record<TKey, TItems[]> | null,
    action: ICollectionLutAddAction<TKey, TItems>) {
    if(!state) state = {} as Record<TKey, TItems[]>
    const {key, items} = action;
    const stateItems = state[key] ?? [];
    return {
        ...state,
        [key]: [...stateItems, ...items].filter(filterUniqueFunc)
    };
}


type RecordKeyType = string | number | symbol

export interface ILutAction<KeyType extends RecordKeyType, DataType> {
    set?: ILutSetAction<KeyType, DataType>
}

interface ILutSetAction<KeyType extends RecordKeyType, DataType> {
    key: KeyType,
    item: DataType
}


export function lutDispatcher<KeyType extends RecordKeyType, DataType>(
    state: Record<KeyType, DataType>,
    action: ILutAction<KeyType, DataType>
) {
    state = handleLutSet(state, action);
    return state;
}

function handleLutSet<KeyType extends RecordKeyType, DataType>(
    state: Record<KeyType, DataType>,
    action: ILutAction<KeyType, DataType>
) {
    const set = action.set;
    if (!set) return state;
    const {key, item} = set;
    return {...state, [key]: item};
}


interface IListAction<DataType> {
    add?: DataType | DataType[]
}


export function listDispatcher<DataType>(
    state: Array<DataType>,
    action: IListAction<DataType>
) {
    const {add} = action;
    if(add) {
        if(Array.isArray(add)) state = [...state, ...add];
        else state = [...state, add];
    }
    return state;
}