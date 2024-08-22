import {
    callAll,
    range,
    parentElement,
    formDataify,
    queryStringify,
    batchify,
    deFormDataify, deepObjectMerge, generatorMap, batchGen, renderAsyncGen
} from '../canvasUtils'
import {describe, expect} from "@jest/globals";
import assert from "assert";
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
    const newData = deFormDataify(formD);
    expect(newData).toEqual({
        a: ['1'],
        b: 'hello!',
        c: {
            c1: ['1'],
            c2: '2'
        }
    });
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
        expect(deepObjectMerge(1, null)).toBe(1)
        expect(deepObjectMerge(undefined, 2)).toBe(2)
        expect(deepObjectMerge(undefined, null)).toBe(null)
        expect(deepObjectMerge(null, undefined)).toBe(null)

        expect(() => deepObjectMerge<string | number>(1, 'apple', false)).toThrow('Type clash on merge number 1, string apple')
        expect(() => deepObjectMerge<string | number>(1, '2', false)).toThrow('Type clash on merge number 1, string 2')
        expect(() => deepObjectMerge(1, 2, false)).toThrow('Values unmergeable')

        expect(deepObjectMerge<string | number>('apple', 1, true)).toBe('apple');
        expect(deepObjectMerge<string | number>(1, '2', true)).toBe(1);
        expect(deepObjectMerge(1, 2, true)).toBe(1)
        expect(deepObjectMerge({
            name: "todd"
        }, {
            name: 'steve'
        }, true)?.name).toBe('todd');
    })

    test('Arrays', () => {
        expect(deepObjectMerge([1, 2], [3, 4])).toHaveLength(4);
        expect(deepObjectMerge([1, 2], null)).toHaveLength(2);
        expect(deepObjectMerge(null, [3, 4])).toHaveLength(2);
        [1, 2, 3, 4].forEach(i => {
            expect(deepObjectMerge([1, 2], [3, 4])).toContain(i);
        });

        let simpleMerged = deepObjectMerge([1, 2], ['a', 'b']);
        [1, 2, 'a', 'b'].forEach(a => {
            assert(simpleMerged);
            expect(simpleMerged).toContain(a);
        })
        const dougsAndHenries = deepObjectMerge([{name: 'henry'}, {name: 'doug'}], [{name: 'henry'}, {name: 'doug'}]);
        expect(dougsAndHenries).toHaveLength(4)
        expect(dougsAndHenries?.map(entry => entry.name)).toEqual(['henry', 'doug', 'henry', 'doug'])
    });

    test('Files and Complex arrays', () => {
        let object = {key: "X", value: 7, list: [1, 2, 3, 4, 5]};
        let file = new File([JSON.stringify(object)], 'file.txt')
        expect(deepObjectMerge(file, file)?.name).toBe(file.name);
        let counterFile = new File([JSON.stringify(object)], 'file2.txt');
        expect(() => deepObjectMerge(file, counterFile)?.name).toThrow(AssertionError)
        counterFile = new File(['aaaaaa'], 'file.txt');
        expect(() => deepObjectMerge(file, counterFile)?.name).toThrow(AssertionError)
        expect(deepObjectMerge(file, counterFile, true)?.name).toBe(file.name)
        let complexMerged = deepObjectMerge([null, 'a', file], [undefined, [1, 2, 3, 4], 5, object, object, file]);
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

    test('FormData', () => {
        const formMerge = deepObjectMerge({data: new FormData()}, {body: new FormData()});
        expect(formMerge?.body).toBeInstanceOf(FormData);
        expect(formMerge?.data).toBeInstanceOf(FormData);
    })

    test('Objects', () => {
        expect(() => deepObjectMerge({a: 1}, {a: "Dog"})).toThrow('Type clash on merge')
        expect(deepObjectMerge({a: 1}, {b: 2})).toStrictEqual({a: 1, b: 2});
        expect(deepObjectMerge({
            list: [1, 2, 3]
        }, {
            list: [4, 5, 6]
        })).toStrictEqual({list: [1, 2, 3, 4, 5, 6]})
        expect(deepObjectMerge({
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
            deepObjectMerge(smith, {
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

        expect(deepObjectMerge(a, b)).toEqual(expectedMerge);

    })


})



describe('batchGen', () => {
    async function* testGenerator() {
        yield 1;
        yield 2;
        yield 3;
        yield 4;
        yield 5;
    }

    it('should yield batches of specified size', async () => {
        const generator = batchGen(testGenerator(), 2);
        const result = [];

        for await (let batch of generator) {
            result.push(batch);
        }

        expect(result).toEqual([[1, 2], [3, 4], [5]]);
    });

    it('should yield all items in a single batch if batchSize is greater than total items', async () => {
        const generator = batchGen(testGenerator(), 10);
        const result = [];

        for await (let batch of generator) {
            result.push(batch);
        }

        expect(result).toEqual([[1, 2, 3, 4, 5]]);
    });

    it('should handle empty generator', async () => {
        async function* emptyGenerator() {}
        const generator = batchGen(emptyGenerator(), 2);
        const result = [];

        for await (let batch of generator) {
            result.push(batch);
        }

        expect(result).toEqual([]);
    });
});

describe('renderAsyncGen', () => {
    async function* testGenerator() {
        yield 'a';
        yield 'b';
        yield 'c';
    }

    it('should collect all items from the generator', async () => {
        const generator = testGenerator();
        const result = await renderAsyncGen(generator);

        expect(result).toEqual(['a', 'b', 'c']);
    });

    it('should handle an empty generator', async () => {
        async function* emptyGenerator() {}
        const generator = emptyGenerator();
        const result = await renderAsyncGen(generator);

        expect(result).toEqual([]);
    });
});

describe('generatorMap', () => {
    async function* testGenerator() {
        yield 1;
        yield 2;
        yield 3;
    }

    it('should apply the mapping function to each value', async () => {
        const mapFunc = (value:any) => value * 2;
        const generator = generatorMap(testGenerator(), mapFunc);
        const result = [];

        for await (let item of generator) {
            result.push(item);
        }

        expect(result).toEqual([2, 4, 6]);
    });

    it('should pass the index and generator to the mapping function', async () => {
        const mapFunc = (value:any, index:number) => `${value}-${index}`;
        const generator = generatorMap(testGenerator(), mapFunc);
        const result = [];

        for await (let item of generator) {
            result.push(item);
        }

        expect(result).toEqual(['1-0', '2-1', '3-2']);
    });

    it('should handle an empty generator', async () => {
        async function* emptyGenerator() {}
        const generator = generatorMap(emptyGenerator(), (value) => value);
        const result = [] as Array<any>;

        for await (let item of generator) {
            result.push(item);
        }

        expect(result).toEqual([]);
    });
});

describe('batchGen additional tests', () => {
    async function* testGenerator() {
        yield 1;
        yield 2;
    }

    it('should yield single-item batches when batchSize is 1', async () => {
        const generator = batchGen(testGenerator(), 1);
        const result = [];

        for await (let batch of generator) {
            result.push(batch);
        }

        expect(result).toEqual([[1], [2]]);
    });

    it('should handle batchSize of 0 by throwing an error', async () => {
        expect(async() => batchGen(testGenerator(), 0).next()).rejects.toThrow();
    });

    it('should propagate errors from the input generator', async () => {
        async function* errorGenerator() {
            yield 1;
            throw new Error('Test error');
        }
        const generator = batchGen(errorGenerator(), 2);
        const result = [];

        await expect(async () => {
            for await (let batch of generator) {
                result.push(batch);
            }
        }).rejects.toThrow('Test error');
    });
});

describe('renderAsyncGen additional tests', () => {
    async function* testGenerator() {
        yield null;
        yield undefined;
        yield 3;
    }

    it('should handle null and undefined values', async () => {
        const result = await renderAsyncGen(testGenerator());

        expect(result).toEqual([null, undefined, 3]);
    });

    it('should propagate errors from the input generator', async () => {
        async function* errorGenerator() {
            yield 1;
            throw new Error('Test error');
        }

        await expect(renderAsyncGen(errorGenerator())).rejects.toThrow('Test error');
    });
});

describe('generatorMap additional tests', () => {
    async function* testGenerator() {
        yield 1;
        yield 2;
    }

    it('should handle nextMapFunc returning undefined or null', async () => {
        const mapFunc = (value:any) => value === 1 ? undefined : null;
        const generator = generatorMap(testGenerator(), mapFunc);
        const result = [];

        for await (let item of generator) {
            result.push(item);
        }

        expect(result).toEqual([undefined, null]);
    });

    it('should propagate errors from nextMapFunc', async () => {
        const mapFunc = () => {
            throw new Error('Map error');
        };
        const generator = generatorMap(testGenerator(), mapFunc);

        await expect(async () => {
            for await (let item of generator) {}
        }).rejects.toThrow('Map error');
    });

    it('should handle asynchronous nextMapFunc', async () => {
        const mapFunc = async (value:any) => value * 2;
        const generator = generatorMap(testGenerator(), mapFunc);
        const result = [];

        for await (let item of generator) {
            result.push(item);
        }

        expect(result).toEqual([2, 4]);
    });
});
