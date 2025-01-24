import {CourseValidation, RunTestFunction} from "@publish/fixesAndUpdates/validations/types";
import {IModuleItemData} from "@canvas/canvasDataDefs";
import {MessageResult, testResult} from "@publish/fixesAndUpdates/validations/utils";
import {moduleGenerator} from "@canvas/course/modules";


export type CheckModuleCourse = { id: number };
export type CheckModuleResult = IModuleItemData[];


const run: RunTestFunction<CheckModuleCourse, CheckModuleResult> = async (course) => {
    let affectedModuleItems: IModuleItemData[] = [];

    let modGen = moduleGenerator(course.id, { queryParams: { include: ['items']}});
    for await (let mod of modGen) {
        if(!mod.published) continue;
        const { items } = mod;
        const badItems = items.filter(mi => typeof mi.completion_requirement === 'undefined');
        affectedModuleItems.push(...badItems);
    }

    const failureMessage:MessageResult[] = [
        {bodyLines: ["These module items affected:"]},
        ...affectedModuleItems.map(a => ({
           bodyLines: [a.title],
            links: [a.html_url],
        })),
    ]

    return testResult(affectedModuleItems.length === 0, {
        failureMessage,
        userData: affectedModuleItems,
    });
}



export const moduleElementsAreRequiredValidation: CourseValidation<CheckModuleCourse, CheckModuleResult> = {
    name: "Module Items Required",
    description: "All items in weekly modules are required",
    run,
}