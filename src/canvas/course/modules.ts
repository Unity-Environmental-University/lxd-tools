import {Temporal} from "temporal-polyfill";
import {ICourseData, IModuleData} from "../canvasDataDefs";
import {ICanvasCallConfig, fetchApiJson, formDataify} from "../canvasUtils";
import {Course} from "./index";

interface IModuleHaver {
    getModules(config:ICanvasCallConfig): IModuleData[],
}


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

