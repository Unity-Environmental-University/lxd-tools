import {Temporal} from "temporal-polyfill";
import {IModuleData} from "../canvasDataDefs";
import {formDataify, ICanvasCallConfig} from "../canvasUtils";


import {fetchJson} from "@/canvas/fetch/fetchJson";
import {Page} from "@/canvas/content/Page";
import {IPageData} from "@/canvas/content/types";

export interface IModuleHaver {
    getModules(config: ICanvasCallConfig): IModuleData[],
}

export async function changeModuleLockDate(courseId: number, module: IModuleData, targetDate: Temporal.PlainDate) {
    const payload = {
        module: {
            unlock_at: targetDate.toString()
        }
    }
    const url = `/api/v1/courses/${courseId}/modules/${module.id}`;
    const result = fetchJson(url, {
        fetchInit: {
            method: 'PUT',
            body: formDataify(payload)
        }
    })
}


export async function getModuleOverview(module: IModuleData, courseId: number) {
    let overview = module.items.find(item =>
        item.type === "Page" &&
        item.title.toLowerCase().includes('overview')
    );
    if (!overview?.url) return; //skip this if it's not an overview

    const url = overview.url.replace(/.*\/api\/v1/, '/api/v1')
    const pageData = await fetchJson(url) as IPageData;
    return new Page(pageData, courseId);
}

export function getModuleWeekNumber(module: Record<string, any>) {
    const regex = /(week|module) (\d+)/i;
    let match = module.name.match(regex);
    let weekNumber = !match ? null : Number(match[1]);
    if (!weekNumber) {
        for (let moduleItem of module.items) {
            if (!moduleItem.hasOwnProperty('title')) {
                continue;
            }
            let match = moduleItem.title.match(regex);
            if (match) {
                weekNumber = match[2];
            }
        }
    }
    return weekNumber;
}

export async function getModulesByWeekNumber(modules: IModuleData[]) {
    let modulesByWeekNumber: Record<string | number, IModuleData> = {};
    for (let module of modules) {
        let weekNumber = getModuleWeekNumber(module);
        if (weekNumber) {
            modulesByWeekNumber[weekNumber] = module;
        }
    }
    return modulesByWeekNumber;
}