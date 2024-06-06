import {collectionLutDispatcher} from "./reducerDispatchers";
import {describe} from "@jest/globals";


describe('collection lookuptable dispatcher', () => {
    let state: Record<string, string[]>;

    beforeEach(() => {
        state = {
            'dogs': ['spot', 'harry'],
            'cats': ['missy', 'todd']
        };
    })

    test('add and clear', () => {
        state = collectionLutDispatcher(state, {
            add: {
                key: 'dogs',
                items: ['steve']
            }
        });
        expect(state).toEqual({
            dogs: ['spot', 'harry', 'steve'],
            cats: ['missy', 'todd']
        })
        state = collectionLutDispatcher(state, {
            add: {
                key: 'cats',
                items: ['meredith', 'buddy', 'stevie']
            }
        });
        expect(state).toEqual({
            dogs: ['spot', 'harry', 'steve'],
            cats: ['missy', 'todd', 'meredith', 'buddy', 'stevie']
        })
        state = collectionLutDispatcher(state, {
            clear: true,
        })
        expect(state).toEqual({})
        state = collectionLutDispatcher(state, {
            add: {
                key: 'people',
                items: ['judy']
            }
        });
        state = collectionLutDispatcher(state, {
            add: {
                key: 'people',
                items: ['ryan']
            }
        });
        expect(state).toEqual({
            people: ['judy', 'ryan']
        })
        state = collectionLutDispatcher(state, {
            set: {
              key: 'people',
              items: ['todd']
            },
            add: {
                key: 'people',
                items: ['ryan']
            }
        });
        expect(state).toEqual({
            people: ['todd', 'ryan']
        })

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