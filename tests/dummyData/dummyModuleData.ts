import {IModuleData, IModuleItemData, ModuleItemType} from "../../src/canvas/canvasDataDefs";




const dummyModuleData: IModuleData = {
    id: 0,
    items: [],
    items_count: 0,
    items_url: "",
    name: "",
    position: 0,
    prerequisite_module_ids: [],
    published: false,
    require_sequential_progress: false,
    state: "",
    unlock_at: ""

}


export const dummyModuleItemData: IModuleItemData = {
    module_id: 0,
    position: 0,
    title: "string",
    indent: 0,
    type: 'Page',
    content_id: 0,
    html_url: '',
    new_tab: false,
    completion_requirement: {
        type:  "must_submit",
        min_score: 0
    },
}


export const dummyUgModules:IModuleData[] = [];
export const dummyGradModules:IModuleData[] = [];
for (let i = 1; i <= 8; i++) {
    const module = {
        ...dummyModuleData,
        name: `Week ${i}`,
    }
    const moduleItem = {...dummyModuleItemData,
                position: i - 1,
                title: `Week ${i} Overview`
            }

    const gradModule = {...module};
    gradModule.items = [{...moduleItem}];
    dummyGradModules.push(gradModule)

    if(i <= 5) {
        const ugModule = {...module}
        ugModule.items = [{...moduleItem}]
        dummyUgModules.push(ugModule);
    }

}


export default dummyModuleData;
