import {setStatus} from "@/reporting/data/coursesSlice";
import {updateInstructors} from "@/reporting/data/instructorsSlice";
import {GetUserGenConfig, getUserGenerator} from "@ueu/ueu-canvas";
import {createAsyncThunk} from "@reduxjs/toolkit";
import {deepObjectCopy} from "@ueu/ueu-canvas/canvasUtils";


export const fetchInstructorsThunk = createAsyncThunk(
    "instructors/fetchInstructors",
    async (params: GetUserGenConfig, {dispatch}) => {


        const config = deepObjectCopy(params);
        config.queryParams = {...config.queryParams ?? {}, enrollment_type: "teacher"}

        // Generate data using provided generator function and parameters.
        const gen = getUserGenerator(config)
        dispatch(setStatus('loading'));

        try {
            for await (const instructor of gen) {
                console.log(JSON.stringify(instructor));
                dispatch(updateInstructors({instructor}));
            }
        } catch (error) {
            // Canvas errors now throw from the generator; surface them instead of staying on 'loading'
            dispatch(setStatus('failed'));
            throw error;
        }
        dispatch(setStatus('fulfilled'));
    }
);





