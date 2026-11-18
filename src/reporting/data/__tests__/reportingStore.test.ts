import {IUserData} from "@ueu/ueu-canvas";

jest.mock("@ueu/ueu-canvas", () => ({}));

const STORAGE_KEY = "persist:reportingStore";

type StoreModule = typeof import("@/reporting/data/reportingStore");
type SliceModule = typeof import("@/reporting/data/instructorsSlice");

/** Load a fresh copy of the store module, as a new page load would. */
async function loadStore() {
    let storeModule!: StoreModule;
    let sliceModule!: SliceModule;
    jest.isolateModules(() => {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        storeModule = require("@/reporting/data/reportingStore");
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        sliceModule = require("@/reporting/data/instructorsSlice");
    });
    await waitForRehydrate(storeModule);
    return {...storeModule, ...sliceModule};
}

function waitForRehydrate({persistor}: StoreModule) {
    return new Promise<void>(resolve => {
        if (persistor.getState().bootstrapped) return resolve();
        const unsubscribe = persistor.subscribe(() => {
            if (persistor.getState().bootstrapped) {
                unsubscribe();
                resolve();
            }
        });
    });
}

function readPersisted(): Record<string, unknown> {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
}

/** A blob as written by earlier versions, which persisted every slice. */
function legacyBlob(termsStatus = "fulfilled") {
    const s = JSON.stringify;
    return s({
        terms: s({terms: [{id: 100, name: "Fall"}], termsById: {100: {id: 100, name: "Fall"}}, status: termsStatus}),
        instructors: s({
            instructorsById: {1: {id: 1, name: "A Student"}},
            instructorsByCourseId: {10: [1]},
            instructorLoadStatus: {},
            status: "loading",
        }),
        courses: s({coursesById: {}, courseStatus: {10: "loading"}, courseIdsByTermId: {}, status: "loading"}),
        enrollments: s({enrollmentsById: {}, enrollmentsByCourseId: {}, enrollmentsByUserId: {}}),
        accounts: s({rootAccountId: 1, accountId: 2, status: "fulfilled"}),
        _persist: s({version: -1, rehydrated: true}),
    });
}

describe("reportingStore persistence", () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it("only whitelists non-user data", async () => {
        const {persistConfig} = await loadStore();
        expect(persistConfig.whitelist).toEqual(["terms", "accounts"]);
        expect(persistConfig.whitelist).not.toContain("instructors");
        expect(persistConfig.whitelist).not.toContain("enrollments");
        expect(persistConfig.whitelist).not.toContain("courses");
    });

    it("does not write rosters to storage", async () => {
        const {reportingStore, persistor, updateInstructors} = await loadStore();

        reportingStore.dispatch(updateInstructors({instructor: {id: 1, name: "Teacher"} as IUserData, courseId: 10}));
        await persistor.flush();

        const persisted = readPersisted();
        expect(Object.keys(persisted).sort()).toEqual(["_persist", "accounts", "terms"]);
        expect(localStorage.getItem(STORAGE_KEY)).not.toContain("Teacher");
    });

    it("ignores rosters and loading flags persisted by earlier versions, and purges them from storage", async () => {
        localStorage.setItem(STORAGE_KEY, legacyBlob());

        const {reportingStore, persistor} = await loadStore();
        const state = reportingStore.getState();

        expect(state.instructors.instructorsById).toEqual({});
        expect(state.instructors.instructorsByCourseId).toEqual({});
        expect(state.courses.status).toBe("idle");
        expect(state.courses.courseStatus).toEqual({});
        // Non-user data still survives
        expect(state.terms.termsById[100]).toEqual({id: 100, name: "Fall"});
        expect(state.accounts.rootAccountId).toBe(1);

        await persistor.flush();
        expect(localStorage.getItem(STORAGE_KEY)).not.toContain("A Student");
        expect(Object.keys(readPersisted()).sort()).toEqual(["_persist", "accounts", "terms"]);
    });

    it("starts over a persisted slice that was saved mid-load", async () => {
        localStorage.setItem(STORAGE_KEY, legacyBlob("loading"));

        const {reportingStore} = await loadStore();
        const {terms} = reportingStore.getState();

        expect(terms.status).toBe("idle");
        expect(terms.terms).toEqual([]);
    });
});
