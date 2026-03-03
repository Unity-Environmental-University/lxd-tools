import { fetchTermsThunk, GetTermsThunkParams } from "@/reporting/data/thunks/fetchTermsThunk";

import { addTerm, setStatus } from "@/reporting/data/termSlice";
import {mockAsyncGen} from "@/__mocks__/utils";
import {mockTermData} from "@ueu/ueu-canvas/__mocks__/mockTermData"; // Adjust path as needed
import { getTermsGenerator } from "@ueu/ueu-canvas";
import {mockAll} from "@/utils/testUtls";


jest.mock("@ueu/ueu-canvas", () => ({
  getTermsGenerator: jest.fn(),
}));

describe("getTermsThunk", () => {
  let dispatch: jest.Mock;
  let getState: jest.Mock;

  beforeEach(() => {
    dispatch = jest.fn();
    getState = jest.fn();
  });

  it("dispatches setStatus('loading'), then addTerm for each term, then setStatus('fulfilled')", async () => {
    const mockTerms = mockAll(
      [{ id: 101, name: "Spring 2024" }, { id: 102, name: "Fall 2024" }],
      mockTermData
    );

    (getTermsGenerator as jest.Mock).mockReturnValue(mockAsyncGen(mockTerms));

    const params: GetTermsThunkParams = { rootAccountId: 999 };

    await fetchTermsThunk(params)(dispatch, getState, undefined);

    expect(dispatch).toHaveBeenCalledWith(setStatus("loading"));
    for (const term of mockTerms) {
      expect(dispatch).toHaveBeenCalledWith(addTerm(term));
    }
    expect(dispatch).toHaveBeenCalledWith(setStatus("fulfilled"));
  });
});
