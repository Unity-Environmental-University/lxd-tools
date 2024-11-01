import {Temporal} from "temporal-polyfill";
import {IModuleData} from "../canvasDataDefs";
import {formDataify, ICanvasCallConfig, IQueryParams} from "../canvasUtils";


import {fetchJson} from "@/canvas/fetch/fetchJson";
import {Page} from "@/canvas/content/pages/Page";
import {getPagedDataGenerator} from "@/canvas/fetch/getPagedDataGenerator";
import {IPageData} from "@/canvas/content/pages/types";

export interface IModuleHaver {
    getModules(config: ICanvasCallConfig): IModuleData[],
}

export interface GenerateModulesOptions {
    include?: ('items' | 'content_details')[],
    search_term?: string,
    student_id?: string
}

export function moduleGenerator(courseId:number, config?: ICanvasCallConfig<GenerateModulesOptions>) {
    return getPagedDataGenerator<IModuleData>(`/api/v1/courses/${courseId}/modules`, config);
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
    const overview = module.items.find(item =>
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
    const match = module.name.match(regex);
    let weekNumber = !match ? null : Number(match[1]);
    if (!weekNumber) {
        for (const moduleItem of module.items) {
            if (!moduleItem.hasOwnProperty('title')) {
                continue;
            }
            const match = moduleItem.title.match(regex);
            if (match) {
                weekNumber = match[2];
            }
        }
    }
    return weekNumber;
}

export async function getModulesByWeekNumber(modules: IModuleData[]) {
    const modulesByWeekNumber: Record<string | number, IModuleData> = {};
    for (const module of modules) {
        const weekNumber = getModuleWeekNumber(module);
        if (weekNumber) {
            modulesByWeekNumber[weekNumber] = module;
        }
    }
    return modulesByWeekNumber;
}