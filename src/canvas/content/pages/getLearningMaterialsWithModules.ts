import {IPageData} from "@canvas/content/pages/types";
import {IModuleHaver, moduleGenerator} from "@canvas/course/modules";
import {IModuleData} from "@canvas/canvasDataDefs";
import PageKind from "@canvas/content/pages/PageKind";
import {callAll} from "@canvas/canvasUtils";


async function getLearningMaterialsWithModules(courseId: number, modules: IModuleData[]) {
    const moduleLearningMaterials: { module: IModuleData, lms: IPageData[] }[] = [];

    for (let module of modules) {
        const lmItems = module.items.filter(a => a.title.match(/learning materials/i))
        const promises = lmItems.map((a) => PageKind.get(courseId, a.content_id));
        const lms = await Promise.all(promises);
        moduleLearningMaterials.push({module, lms})
    }
    return moduleLearningMaterials;

}


export default getLearningMaterialsWithModules