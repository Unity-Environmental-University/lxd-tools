/**
 * Test helper: replaces global fetch with a mock that answers Canvas API paths from a route table.
 * Every requested URL is recorded so tests can assert on the exact request that was built.
 */
export type CanvasRoute = (url: URL) => unknown | undefined;

export function mockCanvasFetch(route: CanvasRoute) {
    const requests: URL[] = [];
    const fetchMock = jest.fn(async (input: RequestInfo | URL) => {
        const url = new URL(String(input), "https://canvas.test");
        requests.push(url);
        // Let in-flight state settle between pages, as a real request would
        await Promise.resolve();
        const body = route(url);
        if (typeof body === "undefined") {
            return {ok: false, status: 404, statusText: "Not Found", json: async () => ({}), headers: {get: () => null}};
        }
        return {ok: true, status: 200, statusText: "OK", json: async () => body, headers: {get: () => null}};
    });
    global.fetch = fetchMock as unknown as typeof fetch;
    return {
        fetchMock,
        requests,
        /** Requests whose path matches, e.g. /\/courses\/\d+\/users$/ */
        requestsTo: (pathPattern: RegExp) => requests.filter(url => pathPattern.test(url.pathname)),
    };
}

/** Matches /api/v1/courses/:id/users and returns the course id. */
export const rosterCourseId = (url: URL) => {
    const match = url.pathname.match(/^\/api\/v1\/courses\/(\d+)\/users$/);
    return match ? Number(match[1]) : undefined;
};
