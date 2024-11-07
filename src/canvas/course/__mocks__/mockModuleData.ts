import {IModuleData, IModuleItemData, ModuleItemType} from "../../canvasDataDefs";




const mockModuleData: IModuleData = {
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


export const mockModuleItemData: IModuleItemData = {
    module_id: 0,
    position: 0,
    title: "string",
    indent: 0,
    type: 'Assignment',
    content_id: 0,
    url: 'http://localhost:8080',
    html_url: '',
    page_url: "https://this.page",
    new_tab: false,
    completion_requirement: {
        type:  "must_submit",
        min_score: 0
    },
}


export const mockUgModules:IModuleData[] = [];
export const mockGradModules:IModuleData[] = [];
for (let i = 1; i <= 8; i++) {
    const module = {
        ...mockModuleData,
        name: `Week ${i}`,
    }
    const moduleItem = {...mockModuleItemData,
                position: i - 1,
                title: `Week ${i} Overview`
            }

    const gradModule = {...module};
    gradModule.items = [{...moduleItem}];
    mockGradModules.push(gradModule)

    if(i <= 5) {
        const ugModule = {...module}
        ugModule.items = [{...moduleItem}]
        mockUgModules.push(ugModule);
    }
}


export default mockModuleData;
