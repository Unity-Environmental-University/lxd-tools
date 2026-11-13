import {IUserData, ICourseData, EnrollmentData} from "@ueu/ueu-canvas";
import {instructorReducer, setCourseInstructorsStatus, updateInstructors} from "@/reporting/data/instructorsSlice";
import {addCourse, courseReducer} from "@/reporting/data/coursesSlice";
import {enrollmentsReducer, setUserEnrollmentsStatus, updateEnrollment} from "@/reporting/data/enrollmentsSlice";

jest.mock("@ueu/ueu-canvas", () => ({}));

const init = {type: "@@test/INIT"};
const user = (id: number, name = `User ${id}`) => ({id, name}) as IUserData;
const course = (id: number, enrollment_term_id: number | number[]) =>
    ({id, name: `Course ${id}`, enrollment_term_id}) as unknown as ICourseData;
const enrollment = (id: number, course_id: number, user_id: number) =>
    ({id, course_id, user_id}) as EnrollmentData;

describe("instructorsSlice", () => {
    it("stores instructors by id without a course mapping when no courseId is given", () => {
        const state = instructorReducer(undefined, updateInstructors({instructor: user(1)}));
        expect(state.instructorsById[1]).toEqual(user(1));
        expect(state.instructorsByCourseId).toEqual({});
    });

    it("maps instructors to the course when a courseId is given", () => {
        const state = instructorReducer(undefined, updateInstructors({instructor: [user(1), user(2)], courseId: 10}));
        expect(state.instructorsByCourseId[10]).toEqual([1, 2]);
    });

    it("handles a courseId of 0", () => {
        const state = instructorReducer(undefined, updateInstructors({instructor: user(1), courseId: 0}));
        expect(state.instructorsByCourseId[0]).toEqual([1]);
    });

    it("appends without duplicates, including duplicates within one payload", () => {
        let state = instructorReducer(undefined, updateInstructors({instructor: [user(1)], courseId: 10}));
        state = instructorReducer(state, updateInstructors({instructor: [user(1), user(2), user(2)], courseId: 10}));
        expect(state.instructorsByCourseId[10]).toEqual([1, 2]);
    });

    it("replaces the course's list when overwrite is set", () => {
        let state = instructorReducer(undefined, updateInstructors({instructor: [user(1), user(2)], courseId: 10}));
        state = instructorReducer(state, updateInstructors({instructor: [user(3)], courseId: 10, overwrite: true}));
        expect(state.instructorsByCourseId[10]).toEqual([3]);
    });

    it("stores an empty list for a course with no instructors", () => {
        const state = instructorReducer(undefined, updateInstructors({instructor: [], courseId: 10, overwrite: true}));
        expect(state.instructorsByCourseId[10]).toEqual([]);
    });

    it("tracks load status per course", () => {
        let state = instructorReducer(undefined, init);
        expect(state.loadStatusByCourseId[10]).toBeUndefined();
        state = instructorReducer(state, setCourseInstructorsStatus({courseId: 10, status: "loading"}));
        expect(state.loadStatusByCourseId).toEqual({10: "loading"});
    });
});

describe("coursesSlice addCourse", () => {
    it("adds a course id whose value equals an existing array index", () => {
        // `1 in [5, 7]` is true (index 1 exists), which used to drop course 1
        let state = courseReducer(undefined, addCourse(course(5, 100)));
        state = courseReducer(state, addCourse(course(7, 100)));
        state = courseReducer(state, addCourse(course(1, 100)));
        expect(state.courseIdsByTermId[100]).toEqual([5, 7, 1]);
    });

    it("does not duplicate a course that is added again", () => {
        let state = courseReducer(undefined, addCourse(course(5, 100)));
        state = courseReducer(state, addCourse(course(5, 100)));
        expect(state.courseIdsByTermId[100]).toEqual([5]);
    });

    it("indexes a course under each of its terms", () => {
        const state = courseReducer(undefined, addCourse(course(5, [100, 200])));
        expect(state.courseIdsByTermId).toEqual({100: [5], 200: [5]});
    });
});

describe("enrollmentsSlice updateEnrollment", () => {
    it("does not duplicate an enrollment that is added again", () => {
        let state = enrollmentsReducer(undefined, updateEnrollment({enrollment: enrollment(9, 50, 3)}));
        state = enrollmentsReducer(state, updateEnrollment({enrollment: enrollment(9, 50, 3)}));
        expect(state.enrollmentsByCourseId[50]).toEqual([9]);
        expect(state.enrollmentsByUserId[3]).toEqual([9]);
    });

    it("adds enrollment ids whose values equal existing array indices", () => {
        let state = enrollmentsReducer(undefined, updateEnrollment({enrollment: enrollment(20, 50, 3)}));
        state = enrollmentsReducer(state, updateEnrollment({enrollment: enrollment(0, 50, 3)}));
        expect(state.enrollmentsByCourseId[50]).toEqual([20, 0]);
        expect(state.enrollmentsByUserId[3]).toEqual([20, 0]);
    });

    it("tracks load status per user", () => {
        const state = enrollmentsReducer(undefined, setUserEnrollmentsStatus({userId: 3, status: "loading"}));
        expect(state.loadStatusByUserId).toEqual({3: "loading"});
    });
});
