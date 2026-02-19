import {IModuleData} from "@ueu/ueu-canvas/canvasDataDefs";
import PageKind from "@ueu/ueu-canvas/content/pages/PageKind";


export async function* learningMaterialsForModule(courseId: number, module: IModuleData) {

    const lmItems = module.items.filter(a => a.title.match(/learning materials/i))
    for await(const item of lmItems) {
        const page = await PageKind.get(courseId, item.content_id)
        yield { item, page  }
    }
}

export default learningMaterialsForModule;


