import {filterUniqueFunc} from "./canvas/canvasUtils";


type CollectionLut<T> = Record<number | string, T[]>;

interface ICollectionLutAddAction<T> {
    key: number,
    items: T[]
}


interface ICollectionLutAction<T> {
    /**
     * clears the lookup table
     */
    clear?: boolean,
    /**
     * adds elements to a collection at a given key in the lookup table
     */
    add?: ICollectionLutAddAction<T>,
}

export function collectionLutDispatcher<T>(
    state: CollectionLut<T>,
    action: ICollectionLutAction<T>
) {
    const {add} = action;
    state = handleCollectionLutAdd(state, action);
    return state;
}


function handleCollectionLutAdd<T>(state: CollectionLut<T>, action: ICollectionLutAction<T>) {
    if(action.clear) return {}
    if (action.add) {
        const {key, items} = action.add;
        const stateItems = state[key] ?? [];
        return {
            ...state,
            [key]: [...stateItems, ...items].filter(filterUniqueFunc)
        };
    }
    return state;
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