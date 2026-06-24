const mockRuntime = {
    sendMessage: jest.fn()
}

export const storage = {
    local: {
        get: jest.fn(async () => ({})),
        set: jest.fn(async () => undefined),
    },
};

export const tabs = {
    query: jest.fn(async () => []),
};

export const runtime = mockRuntime;

export default mockRuntime;