import {Temporal} from "temporal-polyfill";
import {ICourseData, IModuleData} from "./canvasDataDefs";
import {Course} from "./index";
import {fetchApiJson, formDataify} from "./canvasUtils";


//TODO -- migrate some of the functionality built into course into functions here

export async function changeModuleLockDate(courseId:number, module:IModuleData, targetDate:Temporal.PlainDate) {
    const payload = {
        module: {
            unlock_at: targetDate.toString()
        }
    }
    const url = `courses/${courseId}/modules/${module.id}`;
    const result = fetchApiJson(url, {
        fetchInit: {
            method: 'PUT',
            body: formDataify(payload)
        }
    })
}