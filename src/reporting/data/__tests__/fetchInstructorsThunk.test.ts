import { fetchInstructorsThunk } from "@/reporting/data/thunks/fetchInstructorsThunk";
import { updateInstructors } from "@/reporting/data/instructorsSlice";
import { setStatus } from "@/reporting/data/coursesSlice";
import { mockAsyncGen } from "@/__mocks__/utils";
import { getUserGenerator } from "@ueu/ueu-canvas";

jest.mock("@ueu/ueu-canvas", () => ({
  getUserGenerator: jest.fn(),
}));

describe("fetchInstructorsThunk", () => {
  let dispatch: jest.Mock;
  const getState = jest.fn();

  beforeEach(() => {
    dispatch = jest.fn();
    (getUserGenerator as jest.Mock).mockReset();
  });

  it("asks Canvas for teachers only, keeping any other query params", async () => {
    (getUserGenerator as jest.Mock).mockReturnValue(mockAsyncGen([]));

    await fetchInstructorsThunk({ courseId: 10, queryParams: { search_term: "smith" } })(dispatch, getState, undefined);

    expect(getUserGenerator).toHaveBeenCalledWith({
      courseId: 10,
      queryParams: { search_term: "smith", enrollment_type: "teacher" },
    });
  });

  it("dispatches each instructor, then fulfilled", async () => {
    const instructor = { id: 1, name: "A Teacher" };
    (getUserGenerator as jest.Mock).mockReturnValue(mockAsyncGen([instructor]));

    await fetchInstructorsThunk({ courseId: 10 })(dispatch, getState, undefined);

    expect(dispatch).toHaveBeenCalledWith(setStatus("loading"));
    expect(dispatch).toHaveBeenCalledWith(updateInstructors({ instructor: instructor as any }));
    expect(dispatch).toHaveBeenCalledWith(setStatus("fulfilled"));
  });

  it("sets failed status when the generator throws", async () => {
    (getUserGenerator as jest.Mock).mockReturnValue(
      (async function* () {
        throw new Error("403");
      })()
    );

    await fetchInstructorsThunk({ courseId: 10 })(dispatch, getState, undefined);

    expect(dispatch).toHaveBeenCalledWith(setStatus("failed"));
    expect(dispatch).not.toHaveBeenCalledWith(setStatus("fulfilled"));
  });
});
