import {listLutDispatcher, listDispatcher, lutDispatcher} from "../reducerDispatchers";
import {describe} from "@jest/globals";
import {deepObjectCopy} from "../../canvas/canvasUtils";


describe('collection lookuptable dispatcher', () => {
    const initialState = {
            dogs: ['spot', 'harry'],
            cats: ['missy', 'todd']
        };


    test('add', () => {
        const state = listLutDispatcher(initialState, {
            add: ['dogs', ['steve']]
        });
        expect(state).toEqual({
            dogs: ['spot', 'harry', 'steve'],
            cats: ['missy', 'todd']
        })
    });
    test('clear', () => {
        const state = listLutDispatcher(initialState, {
            clear: true,
        })
        expect(state).toEqual({})
    });
    test('add new keys', () => {
        let state = listLutDispatcher(initialState, {
            add: ['people', ['judy']]
        });
        state = listLutDispatcher(state, {
            add: [ 'people', ['ryan']]
        });
        expect(state).toEqual({
            ...initialState,
            people: ['judy', 'ryan']
        })

    });

    test ('set', () => {
        const state = listLutDispatcher({
                cats: ['charlene'],
                dogs: ['spike'],
                people: ['tom', 'dick', 'harry']
        }, {set: initialState})
        expect(state).toEqual(initialState);
    })

    test('add works with an object literal', () => {
        const state = listLutDispatcher(initialState, {
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

    it('adds elements on set', () => {
        const state = lutDispatcher(initialState, {
            set: ['jon','human']
        })
        for(const key in initialState) expect(state[key]).toEqual(initialState[key])
        expect(state.jon).toEqual('human');
    })
    it('accepts an object literal as input', () => {
        const state = lutDispatcher(initialState, {
            set: {
                jon: 'human',
                nermal: 'cat'
            }
        })

        expect(state).toEqual({...initialState, jon: 'human', nermal: 'cat'})
    })
    it('clears out properly', () => {
        const state = lutDispatcher(initialState, {
            clear: true,
        })
        expect(state).toEqual({});
    })

})

describe('List Dispatcher', () => {
    const initialSate = ['odie', 'garfield'];

    it('adds elements', () => {
        const state = listDispatcher(initialSate, {add: ['jon']});
        expect(state).toEqual([...initialSate, 'jon'])
    })

    it('sets properly', () => {
        const state = listDispatcher(initialSate, {set: ['jon']});
        expect(state).toEqual(['jon'])
    })

    it('clears properly', () => {
        const state = listDispatcher(initialSate, {clear: true});
        expect(state).toEqual([])
    })

})