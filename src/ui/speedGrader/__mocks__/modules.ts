import {CanvasData, IModuleData, IModuleItemData} from "@/canvas/canvasDataDefs";
import {AssignmentsCollection} from "@/ui/speedGrader/AssignmentsCollection";
import {IModuleInfo} from "@/ui/speedGrader/types";
import {mockModuleItemData} from "@/canvas/course/__mocks__/mockModuleData";

export const getModuleInfo = jest.fn((contentItem: CanvasData, modules: IModuleData[], assignmentsCollection: AssignmentsCollection): IModuleInfo => {
    return {
        weekNumber: 1,
        moduleName: "Module",
        type: "Assigment",
        numberInModule: 1
    }
})

export const getItemInModule = jest.fn((contentItem: CanvasData, module: IModuleData, assignmentsCollection: AssignmentsCollection) => {
        return <IModuleItemData> {
            ...mockModuleItemData,
            module_id: module.id,
            title: contentItem.name ?? contentItem.title ?? contentItem.id,
            type: "Assignment",
        };
})