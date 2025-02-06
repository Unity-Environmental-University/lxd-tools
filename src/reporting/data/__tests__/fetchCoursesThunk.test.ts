import { fetchCoursesThunk } from "@/reporting/data/fetchCoursesThunk";
import { setStatus, addCourse } from "@/reporting/data/coursesSlice";
import { FetchCoursesParams } from "@/reporting/data/fetchCoursesThunk";
import {getCourseDataGenerator, ICourseData, mockCourseData} from 'ueu_canvas';

import {mockAsyncGen} from "@/__mocks__/utils";
import {mockAll} from "@/utils/testUtls";

jest.mock("ueu_canvas", () => ({
  ...jest.requireActual("ueu_canvas"),
  getCourseDataGenerator: jest.fn(),
}));



describe("fetchCoursesThunk", () => {
  let dispatch: jest.Mock;
  let getState: jest.Mock;

  let mockCoursesData:ICourseData[];

  beforeEach(() => {
      mockCoursesData =
        mockAll<ICourseData>([
          { id: 1, name: "Course 1" },
          { id: 2, name: "Course 2" }
        ], mockCourseData);
      ;
    dispatch = jest.fn();
    getState = jest.fn();
  });


  it("dispatches setStatus('loading'), then addCourse for each course, then setStatus('fulfilled')", async () => {



    (getCourseDataGenerator as jest.Mock).mockReturnValue(mockAsyncGen(mockCoursesData));

    const params: FetchCoursesParams = {
      accountId: 456,
      config: {}
    };

    // Run the thunk
    await fetchCoursesThunk(params)(dispatch, getState, undefined);

    expect(dispatch).toHaveBeenCalledWith(setStatus("loading"));
    expect(dispatch).toHaveBeenCalledWith(addCourse(mockCoursesData[0]));
    expect(dispatch).toHaveBeenCalledWith(addCourse(mockCoursesData[1]));
    expect(dispatch).toHaveBeenCalledWith(setStatus("fulfilled"));
  });
});
