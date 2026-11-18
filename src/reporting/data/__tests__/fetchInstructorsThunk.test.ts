import {configureStore} from "@reduxjs/toolkit";
import {IUserData} from "@ueu/ueu-canvas";
import {instructorReducer} from "@/reporting/data/instructorsSlice";
import {courseReducer} from "@/reporting/data/coursesSlice";
import {fetchInstructorsThunk} from "@/reporting/data/thunks/fetchInstructorsThunk";
import {mockCanvasFetch, rosterCourseId} from "@/reporting/testUtils/mockCanvasFetch";

const user = (id: number) => ({id, name: `User ${id}`}) as IUserData;

const makeStore = () => configureStore({
    reducer: {instructors: instructorReducer, courses: courseReducer},
});

const rosterRoute = (users: IUserData[]) => (url: URL) =>
    typeof rosterCourseId(url) === "number" ? users : undefined;

describe("fetchInstructorsThunk", () => {
    it("requests only teachers from the course users endpoint", async () => {
        const canvas = mockCanvasFetch(rosterRoute([]));
        const store = makeStore();

        await store.dispatch(fetchInstructorsThunk({courseId: 10, queryParams: {sort: "last_login"}}));

        expect(canvas.requests).toHaveLength(1);
        const [request] = canvas.requests;
        expect(request.pathname).toBe("/api/v1/courses/10/users");
        expect(request.searchParams.getAll("enrollment_type[]")).toEqual(["teacher"]);
        expect(request.searchParams.get("sort")).toBe("last_login");
        // Nothing from the thunk's own arguments leaks into the query (ueu-canvas getUserGenerator bug)
        expect([...request.searchParams.keys()].sort()).toEqual(["enrollment_type[]", "sort"]);
    });

    it("stores the roster under its course and marks the course fulfilled", async () => {
        mockCanvasFetch(rosterRoute([user(1), user(2)]));
        const store = makeStore();

        await store.dispatch(fetchInstructorsThunk({courseId: 10}));

        const {instructors} = store.getState();
        expect(instructors.instructorsByCourseId[10]).toEqual([1, 2]);
        expect(instructors.instructorsById[1]).toEqual(user(1));
        expect(instructors.loadStatusByCourseId[10]).toBe("fulfilled");
    });

    it("does not touch the courses loading status", async () => {
        mockCanvasFetch(rosterRoute([user(1)]));
        const store = makeStore();

        await store.dispatch(fetchInstructorsThunk({courseId: 10}));

        expect(store.getState().courses.status).toBe("idle");
    });

    it("fetches a course only once, even when dispatched again while loading or after loading", async () => {
        const canvas = mockCanvasFetch(rosterRoute([user(1)]));
        const store = makeStore();

        const first = store.dispatch(fetchInstructorsThunk({courseId: 10}));
        const duplicate = store.dispatch(fetchInstructorsThunk({courseId: 10}));
        await Promise.all([first, duplicate]);
        await store.dispatch(fetchInstructorsThunk({courseId: 10}));

        expect(canvas.requests).toHaveLength(1);
    });

    it("marks the course failed and does not retry it automatically", async () => {
        const canvas = mockCanvasFetch(rosterRoute([]));
        canvas.fetchMock.mockRejectedValueOnce(new Error("rate limited"));
        const store = makeStore();

        const result = await store.dispatch(fetchInstructorsThunk({courseId: 10}));
        expect(result.meta.requestStatus).toBe("rejected");
        expect(store.getState().instructors.loadStatusByCourseId[10]).toBe("failed");

        await store.dispatch(fetchInstructorsThunk({courseId: 10}));
        expect(canvas.fetchMock).toHaveBeenCalledTimes(1);
    });
});
