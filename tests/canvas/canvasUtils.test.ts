import {
    callAll,
    range,
    parentElement,
    formDataify,
    queryStringify,
    batchify,
    deFormDataify, recursiveMerge
} from '../../src/canvas/canvasUtils'
import {describe, expect} from "@jest/globals";
import assert from "assert";
import exp from "node:constants";
import {AssertionError} from "node:assert";

const TEST_STRING = String.fromCharCode(...Array.from(range(32, 126)))


describe('CallAll Tests', () => {
    test('callAll returns the results of a list of paramless functions', () => {

        const list = Array.from(TEST_STRING).map((char) => () => char)
        expect(callAll(list).join('')).toMatch(TEST_STRING);
    })

    test('callAll returns the results of a list of function passed the same parameters', () => {
        const list = Array.from(range(0, 100)).map((num) => {
            return (value: number) => {
                return num * value
            }
        })

        expect(callAll(list, 2)).toStrictEqual(Array.from(range(0, 100)).map((num) => num * 2))
    });

    test('CallAll runs a list of function, parameter pairs and returns the results as a list.', () => {
        const list = Array.from(range(0, 100)).map((value) => {
            return {
                func: (x: number) => x,
                params: value
            }
        })

        expect(callAll(list)).toStrictEqual(Array.from(range(0, 100)))
    })
})

test('ParentElement traverses up parents of a DOMElement and returns the first parent matching a tag. Otherwise returns null', () => {
    const elId = 'elementId'
    const parentId = 'parentId'
    const html = `<div id="${parentId}"><a><span id="${elId}">XXX</span></a></div>`;
    const body = document.createElement('div');
    body.innerHTML = html;
    const element = body.querySelector(`#${elId}`) as Element | null;
    const parent = parentElement(element, 'div');
    expect(parent?.id).toBe(parentId);
    expect(parentElement(element, 'blockquote')).toBe(null)
})

test('FormDatify properly serializes objects', () => {
    const testData = {
        a: [1],
        b: 'hello!',
        c: {
            c1: [1],
            c2: 2
        }
    }

    const formD = formDataify(testData);
    const entries = [...formD.entries()];
    console.log(entries);
    expect(entries[0]).toStrictEqual(['a[]', '1'])
    expect(entries[1]).toStrictEqual(['b', 'hello!'])
    expect(entries[2]).toStrictEqual(['c[c1][]', '1'])
    expect(entries[3]).toStrictEqual(['c[c2]', '2'])
})

test('deFormDatify properly deserializes objects', () => {
    const testData = {
        a: [1],
        b: 'hello!',
        c: {
            c1: [1],
            c2: 2
        }
    }

    const formD = formDataify(testData);
    const entries = [...formD.entries()];
    console.log(entries);
    const newData = deFormDataify(formD);
    console.log(newData);
    expect(testData).toBe(newData);
})


test('Querystringify', () => {
    const testData = {
        a: [1, 2, 3],
        b: 'hello!',
        c: {
            c1: [1],
            c2: 2
        }
    }

    const data = queryStringify(testData);
    const entries = Array.from(data);
    expect(entries[0]).toStrictEqual(['a[]', '1'])
    expect(entries[1]).toStrictEqual(['a[]', '2'])
    expect(entries[2]).toStrictEqual(['a[]', '3'])
    expect(entries[3]).toStrictEqual(['b', 'hello!'])
    expect(entries[4]).toStrictEqual(['c[c1][]', '1'])
    expect(entries[5]).toStrictEqual(['c[c2]', '2'])
})

test('Batchify', () => {
    expect(batchify([1, 2, 3, 4], 2)).toStrictEqual([[1, 2], [3, 4]])
    expect(batchify([1, 2, 3, 4, 5], 2)).toStrictEqual([[1, 2], [3, 4], [5]])
    expect(batchify([1, 2, 3, 4, 5], 5)).toStrictEqual([[1, 2, 3, 4, 5]])
    expect(batchify([1, 2, 3, 4, 5], 6)).toStrictEqual([[1, 2, 3, 4, 5]])
})

describe("Recursive object merge", () => {
    test('Non-indexing merges', () => {
        expect(recursiveMerge(1, null)).toBe(1)
        expect(recursiveMerge(undefined, 2)).toBe(2)
        expect(() => recursiveMerge<string | number>(1, 'apple')).toThrow('Type clash on merge number 1, string apple')
        expect(() => recursiveMerge<string | number>(1, '2')).toThrow('Type clash on merge number 1, string 2')
        expect(() => recursiveMerge(1, 2)).toThrow('Values unmergeable')
    })

    test('Arrays', () => {
        expect(recursiveMerge([1, 2], [3, 4])).toHaveLength(4);
        expect(recursiveMerge([1, 2], null)).toHaveLength(2);
        expect(recursiveMerge(null, [3, 4])).toHaveLength(2);
        [1, 2, 3, 4].forEach(i => {
            expect(recursiveMerge([1, 2], [3, 4])).toContain(i);
        });

        let simpleMerged = recursiveMerge([1, 2], ['a', 'b']);
        [1, 2, 'a', 'b'].forEach(a => {
            assert(simpleMerged);
            expect(simpleMerged).toContain(a);
        })

    });

    test('Files and Complex arrays', () => {
        let object = {key: "X", value: 7, list: [1, 2, 3, 4, 5]};
        let file = new File([JSON.stringify(object)], 'file.txt')
        expect(recursiveMerge(file, file)?.name).toBe(file.name);
        let counterFile = new File([JSON.stringify(object)], 'file2.txt');
        expect(() => recursiveMerge(file, counterFile)?.name).toThrow(AssertionError)
        counterFile = new File(['aaaaaa'], 'file.txt');
        expect(() => recursiveMerge(file, counterFile)?.name).toThrow(AssertionError)

        let complexMerged = recursiveMerge([null, 'a', file], [undefined, [1, 2, 3, 4], 5, object, object, file]);
        expect(complexMerged).toHaveLength(9);
        for (let value of [5, 'a', null, undefined]) {
            expect(complexMerged).toContain(value);
        }

        const objectsInMerge = complexMerged?.filter(item => item && typeof item === 'object') ?? [];
        expect(objectsInMerge).toHaveLength(5);
        const [extractedObject, extractedObjectTwo] = objectsInMerge.filter(item => item && !(item instanceof File || Array.isArray(item)));
        expect(extractedObject).toStrictEqual(object);
        expect(extractedObject === extractedObjectTwo).toBe(false);
        expect(extractedObject === object).toBe(false);
        let [fileOne, fileTwo] = objectsInMerge.filter(item => item instanceof File);
        expect(fileOne).toBe(fileTwo);
    })

    test('Objects', () => {
        expect(() => recursiveMerge({a: 1}, {a: "Dog"})).toThrow('Type clash on merge')
        expect(recursiveMerge({a: 1}, {b: 2})).toStrictEqual({a: 1, b: 2});
        expect(recursiveMerge({
            list: [1, 2, 3]
        }, {
            list: [4, 5, 6]
        })).toStrictEqual({list: [1, 2, 3, 4, 5, 6]})

        expect(recursiveMerge({
            item: {
                name: "NAME",
                age: 35
            }
        }, {
            item: {
                height: 165,
                children: ['bobby', 'andrew']
            }
        })).toStrictEqual({
            item: {
                name: "NAME",
                age: 35,
                height: 165,
                children: ['bobby', 'andrew']
            }
        })
    })

    test('Self-containment error', () => {

        let smith: { [key: string]: any } = {};
        let smithsHouse: { [key: string]: any } = {};

        smith = {
            name: 'Smith',
        }

        smithsHouse = {
            address: '224 West 9th',
            owner: smith,
            inhabitants: [smith]
        }

        smith['house'] = smithsHouse;
        expect(() => {
            recursiveMerge(smith, {
                dog: "Steven"
            })

        }).toThrow('Infinite Loop')
    })

    test('Complex Merge', () => {

        let a: Record<string, any> = {
            list: [1, 2],
            human: {
                name: "Stan",
                age: 45,
                children: ['rod', 'lucy'],
                dog: {
                    name: "Walter"
                },


            },
            cat: {
                name: "Stephanie"
            }
        }

        let b: Record<string, any> = {
            list: [2, 3, 4, undefined],
            human: {
                name: "Stan",
                children: ['stacy'],
                dog: {
                    age: 7,
                },
                fish: {
                    name: "Capn Guppy",
                    previousNames: ['Admiral Blub', "Mr. Bubbles"]
                }
            },

        }

        let expectedMerge = {
            list: [1, 2, 2, 3, 4, undefined],
            human: {
                name: "Stan",
                age: 45,
                children: ['rod', 'lucy', 'stacy'],
                dog: {
                    name: "Walter",
                    age: 7
                },
                fish: {
                    name: 'Capn Guppy',
                    previousNames: ['Admiral Blub', "Mr. Bubbles"]
                }
            },
            cat: {
                name: "Stephanie"
            },


        }

        expect(recursiveMerge(a, b)).toEqual(expectedMerge);

    })


})
