import { setStatus } from "@/reporting/data/coursesSlice";
import { updateInstructors } from "@/reporting/data/instructorsSlice";
import { GetUserGenConfig, getUserGenerator } from "ueu_canvas";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { deepObjectCopy } from "@ueu/ueu-canvas";

export const fetchInstructorsThunk = createAsyncThunk(
  "instructors/fetchInstructors",
  async (params: GetUserGenConfig, { dispatch }) => {
    const config = deepObjectCopy(params);
    config.queryParams = { ...(config.queryParams ?? {}), enrollment_type: "teacher" };

    // Generate data using provided generator function and parameters.
    const gen = getUserGenerator(params);
    dispatch(setStatus("loading"));

    for await (const instructor of gen) {
      console.log(JSON.stringify(instructor));
      dispatch(updateInstructors({ instructor }));
    }
    dispatch(setStatus("fulfilled"));
  }
);
