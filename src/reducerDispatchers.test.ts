import {collectionLutDispatcher, lutDispatcher} from "./reducerDispatchers";
import {describe} from "@jest/globals";
import {deepObjectCopy} from "./canvas/canvasUtils";


describe('collection lookuptable dispatcher', () => {
    const initialState = {
            dogs: ['spot', 'harry'],
            cats: ['missy', 'todd']
        };


    test('add', () => {
        let state = collectionLutDispatcher(initialState, {
            add: ['dogs', ['steve']]
        });
        expect(state).toEqual({
            dogs: ['spot', 'harry', 'steve'],
            cats: ['missy', 'todd']
        })
    });
    test('clear', () => {
        let state = collectionLutDispatcher(initialState, {
            clear: true,
        })
        expect(state).toEqual({})
    });
    test('add new keys', () => {
        let state = collectionLutDispatcher(initialState, {
            add: ['people', ['judy']]
        });
        state = collectionLutDispatcher(state, {
            add: [ 'people', ['ryan']]
        });
        expect(state).toEqual({
            ...initialState,
            people: ['judy', 'ryan']
        })

    });

    test('add works with an object literal', () => {
        const state = collectionLutDispatcher(initialState, {
            add: {
                dogs: ['william'],
                cats: ['henrietta'],
                people: ['ruth']
            }
        });
        expect(state).toEqual({
            dogs: [...initialState.dogs, 'william'],
            cats: [...initialState.cats, 'henrietta'],
            people: ['ruth']
        })
    })

})


describe('Lookup Table Dispatcher', () => {
    const initialState:Record<string, string> = {
        odie: 'dog',
        garfield: 'cat'
    };
    let state: Record<string, string>;
     beforeEach(() => {
         state = {...initialState};
     })

    it('adds elements on set', () => {
        state = lutDispatcher(state, {
            set: ['jon','human']
        })
        for(let key in initialState) expect(state[key]).toEqual(initialState[key])
        expect(state.jon).toEqual('human');
    })

})


// type RecordKeyType = string | number | symbol
//
// export interface ILutAction<KeyType extends RecordKeyType, DataType> {
//     set?: ILutSetAction<KeyType, DataType>
// }
//
// interface ILutSetAction<KeyType extends RecordKeyType, DataType> {
//     key: KeyType,
//     item: DataType
// }
//
//
// export function lutDispatcher<KeyType extends RecordKeyType, DataType>(
//     state: Record<KeyType, DataType>,
//     action: ILutAction<KeyType, DataType>
// ) {
//     state = handleLutSet(state, action);
//     return state;
// }
//
// function handleLutSet<KeyType extends RecordKeyType, DataType>(
//     state: Record<KeyType, DataType>,
//     action: ILutAction<KeyType, DataType>
// ) {
//     const set = action.set;
//     if (!set) return state;
//     const {key, item} = set;
//     return {...state, [key]: item};
// }
//
//
// interface IListAction<DataType> {
//     add?: DataType | DataType[]
// }
//
//
// export function listDispatcher<DataType>(
//     state: Array<DataType>,
//     action: IListAction<DataType>
// ) {
//     const {add} = action;
//     if(add) {
//         if(Array.isArray(add)) state = [...state, ...add];
//         else state = [...state, add];
//     }
//     return state;
// }