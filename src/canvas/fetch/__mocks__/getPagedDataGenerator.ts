export default {
    ...jest.requireActual('../getPagedDataGenerator'),
    getPagedDataGenerator: jest.fn(),
    getPagedData: jest.fn(),
}