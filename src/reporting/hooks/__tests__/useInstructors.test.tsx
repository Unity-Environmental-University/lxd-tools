import React from "react";
import {Provider} from "react-redux";
import {act, renderHook, waitFor} from "@testing-library/react";
import {configureStore} from "@reduxjs/toolkit";
import {ICourseData, IUserData} from "@ueu/ueu-canvas";
import {ITermData} from "@ueu/ueu-canvas/term/Term";
import {instructorReducer} from "@/reporting/data/instructorsSlice";
import {addCourse, courseReducer} from "@/reporting/data/coursesSlice";
import {fetchCourseThunk} from "@/reporting/data/thunks/fetchCourseThunk";
import {useInstructors} from "@/reporting/hooks/useInstructors";
import {useInstructorsByTerm} from "@/reporting/hooks/useInstructorsByTerm";
import {mockCanvasFetch, rosterCourseId} from "@/reporting/testUtils/mockCanvasFetch";

const user = (id: number, last_login?: string) => ({id, name: `User ${id}`, last_login}) as unknown as IUserData;
const course = (id: number, enrollment_term_id: number) =>
    ({id, name: `Course ${id}`, enrollment_term_id}) as unknown as ICourseData;

const rosters: Record<number, IUserData[]> = {
    10: [user(1, "2026-01-01T00:00:00Z"), user(2, "2026-03-01T00:00:00Z")],
    11: [user(1, "2026-01-01T00:00:00Z")],
    12: [user(3, "2026-02-01T00:00:00Z")],
};

const ROSTER_PATH = /^\/api\/v1\/courses\/\d+\/users$/;

const mockCanvas = () => mockCanvasFetch(url => {
    const courseId = rosterCourseId(url);
    if (typeof courseId === "number") return rosters[courseId] ?? [];
    // Single-course lookup, e.g. a course from another subaccount found through an enrollment
    const single = url.pathname.match(/^\/api\/v1\/courses\/(\d+)$/);
    if (single) return course(Number(single[1]), 100);
    return undefined;
});

const makeStore = () => configureStore({
    reducer: {instructors: instructorReducer, courses: courseReducer},
});

const wrapperFor = (store: ReturnType<typeof makeStore>) =>
    ({children}: { children: React.ReactNode }) => <Provider store={store}>{children}</Provider>;

const rosterCourseIds = (canvas: ReturnType<typeof mockCanvas>) =>
    canvas.requestsTo(ROSTER_PATH).map(url => rosterCourseId(url));

describe("useInstructors", () => {
    it("fetches each course once across re-renders with equivalent course id arrays", async () => {
        const canvas = mockCanvas();
        const store = makeStore();
        const {rerender, result} = renderHook(
            ({ids}: { ids: number[] }) => useInstructors(ids),
            {wrapper: wrapperFor(store), initialProps: {ids: [10, 11]}}
        );

        // New array instances with the same contents, mid-fetch
        rerender({ids: [10, 11]});
        rerender({ids: [10, 11]});

        await waitFor(() => expect(result.current.instructorsByCourseId[11]).toBeDefined());
        await waitFor(() => expect(result.current.instructorsByCourseId[10]).toBeDefined());

        // And again after the store has been updated with the rosters
        rerender({ids: [10, 11]});
        rerender({ids: [10, 11]});

        expect(rosterCourseIds(canvas).sort()).toEqual([10, 11]);
        for (const request of canvas.requestsTo(ROSTER_PATH)) {
            expect(request.searchParams.getAll("enrollment_type[]")).toEqual(["teacher"]);
        }
    });

    it("fetches only the new course when the list grows", async () => {
        const canvas = mockCanvas();
        const store = makeStore();
        const {rerender, result} = renderHook(
            ({ids}: { ids: number[] }) => useInstructors(ids),
            {wrapper: wrapperFor(store), initialProps: {ids: [10]}}
        );
        await waitFor(() => expect(result.current.instructorsByCourseId[10]).toBeDefined());

        rerender({ids: [10, 11]});
        await waitFor(() => expect(result.current.instructorsByCourseId[11]).toBeDefined());

        expect(rosterCourseIds(canvas)).toEqual([10, 11]);
    });
});

describe("useInstructorsByTerm", () => {
    it("returns each instructor once, most recent login first, without refetching on re-render", async () => {
        const canvas = mockCanvas();
        const store = makeStore();
        act(() => {
            store.dispatch(addCourse(course(10, 100)));
            store.dispatch(addCourse(course(11, 100)));
        });
        const term = {id: 100} as ITermData;

        const {result, rerender} = renderHook(
            ({terms}: { terms: ITermData[] }) => useInstructorsByTerm({selectedTerms: terms}),
            {wrapper: wrapperFor(store), initialProps: {terms: [term]}}
        );

        await waitFor(() => expect(result.current).toHaveLength(2));
        rerender({terms: [{...term}]});
        rerender({terms: [{...term}]});

        expect(result.current.map(u => u.id)).toEqual([2, 1]);
        expect(rosterCourseIds(canvas).sort()).toEqual([10, 11]);
    });

    it("does not fetch rosters for courses stored by fetchCourseThunk, even in a selected term", async () => {
        const canvas = mockCanvas();
        const store = makeStore();
        act(() => {
            store.dispatch(addCourse(course(10, 100)));
        });
        const term = {id: 100} as ITermData;

        const {result} = renderHook(
            () => useInstructorsByTerm({selectedTerms: [term]}),
            {wrapper: wrapperFor(store)}
        );
        await waitFor(() => expect(result.current).toHaveLength(2));

        // As FacEnrollmentRow does for an instructor's enrollment in another course (term 100 too)
        await act(async () => {
            await store.dispatch(fetchCourseThunk({courseId: 12}));
        });
        expect(store.getState().courses.coursesById[12]).toBeDefined();

        // Give any effect a chance to run, then confirm course 12's roster was never requested
        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 0));
        });
        expect(rosterCourseIds(canvas)).toEqual([10]);
        expect(result.current.map(u => u.id)).toEqual([2, 1]);
    });
});
