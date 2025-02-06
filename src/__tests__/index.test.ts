import {Temporal} from "temporal-polyfill";

import {aMinusBSortFn, bMinusASortFn, sleep} from "@/utils/toolbox";


describe('Testing basic sleep function', () => {


    it('doesnt break', async () => {
        await sleep(0);
    });


})

describe('aMinusBSortFn, bMinusASortFn', () => {
    it('applies correctly with a basic number function', () => {
        expect([5, 4, 3, 2, 1].toSorted(aMinusBSortFn((a) => a))).toEqual([1, 2, 3, 4, 5])
        expect([1, 2, 3, 4, 5].toSorted(bMinusASortFn((a) => a))).toEqual([5, 4, 3, 2, 1])
    })
    it('applies correctly with a look up function', () => {
        expect([{a: 1}, {a: 5}, {a: 3}, {a: 4}, {a: 2}]
            .toSorted(aMinusBSortFn((a) => a.a))
        ).toEqual([1, 2, 3, 4, 5].map(a => ({a})))
    })
    expect([{a: 1}, {a: 5}, {a: 3}, {a: 4}, {a: 2}]
        .toSorted(bMinusASortFn((a) => a.a))
    ).toEqual([5, 4, 3, 2, 1].map(a => ({a})))
})