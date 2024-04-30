import { callAll, range } from '../../src/canvas/canvasUtils'

const TEST_STRING = String.fromCharCode(...Array.from(range(32, 126)))

test('callAll returns the results of a list of paramless functions', ()=> {

    const list = Array.from(TEST_STRING).map((char) => ()=> char)
    expect(callAll(list).join('')).toMatch(TEST_STRING);
})

test('callAll returns the results of a list of function passed the same parameters', ()=> {
    const list = Array.from(range(0,100)).map((num) => {
        return (value: number) => {
            return num * value
        }
    })

    expect(callAll(list, 2)).toStrictEqual(Array.from(range(0,100)).map((num) => num * 2))
});

