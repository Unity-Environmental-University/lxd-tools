import {Course} from "../../../../canvas/course/Course";
import {mockCourseData} from "../../../../canvas/course/__mocks__/mockCourseData";
import * as rubricApi from "../../../../canvas/rubrics"

import {getRubric, rubricsForCourseGen} from "../../../../canvas/rubrics";
import {config} from "dotenv";
import {ICanvasCallConfig} from "../../../../canvas/canvasUtils";
import {assignmentDataGen} from "../../../../canvas/content";


describe('rubrics are set to grade assignments', () => {
    let config:ICanvasCallConfig = {};
    it('passes when all rubrics are linked to grade their assignments', async () => {

        let course = new Course({...mockCourseData});
        let rubricsGen = rubricsForCourseGen(course.id, { include: ['associations']} , config);
        let assignments = assignmentDataGen(course.id);

        for await (let rubric of rubricsGen) {
            let associations = rubric.associations ?? [];
            for(let association of associations) {

            }
        }

    })
})