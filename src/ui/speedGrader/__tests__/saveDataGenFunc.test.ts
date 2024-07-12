import { saveDataGenFunc } from '../saveDataGenFunc';
import { FILE_HEADER } from '@/ui/speedGrader/consts';

global.URL.revokeObjectURL = jest.fn();
global.URL.createObjectURL = jest.fn();

describe('saveDataGenFunc', () => {
    let createElementSpy: jest.SpyInstance;
    let appendChildSpy: jest.SpyInstance;
    let setAttributeSpy: jest.Mock;
    let clickSpy: jest.Mock;
    let revokeObjectURLSpy: jest.SpyInstance;
    let createObjectURLSpy: jest.SpyInstance;

    beforeEach(() => {
        setAttributeSpy = jest.fn();
        clickSpy = jest.fn();
        createElementSpy = jest.spyOn(document, 'createElement').mockReturnValue({
            setAttribute: setAttributeSpy,
            click: clickSpy,
            href: '',
            download: ''
        } as unknown as HTMLAnchorElement);
        appendChildSpy = jest.spyOn(document.body, 'appendChild').mockImplementation();
        revokeObjectURLSpy = jest.spyOn(URL, 'revokeObjectURL').mockImplementation();
        createObjectURLSpy = jest.spyOn(URL, 'createObjectURL').mockReturnValue('blob:url');
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('should create an anchor element and set its attributes', () => {
        const saveData = saveDataGenFunc();
        saveData(['some data'], 'test.txt');

        expect(createElementSpy).toHaveBeenCalledWith('a');
        expect(appendChildSpy).toHaveBeenCalled();
        expect(setAttributeSpy).toHaveBeenCalledWith('display', 'none');
    });

    test('should prepend FILE_HEADER to the text array', () => {
        const saveData = saveDataGenFunc();
        const textArray = ['line1', 'line2'];
        const expectedArray = [FILE_HEADER, 'line1', 'line2'];

        saveData(textArray, 'test.txt');

        expect(createObjectURLSpy).toHaveBeenCalledWith(expect.any(Blob));
        const blob = createObjectURLSpy.mock.calls[0][0] as Blob;
        expect(blob).toBeInstanceOf(Blob);

        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            expect(result).toEqual(expectedArray.join(''));
        };
        reader.readAsText(blob);
    });

    test('should set the correct href and download attributes and click the anchor element', () => {
        const saveData = saveDataGenFunc();
        saveData(['some data'], 'test.txt');

        expect(createObjectURLSpy).toHaveBeenCalled();
        expect(clickSpy).toHaveBeenCalled();
        expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:url');
    });
});
