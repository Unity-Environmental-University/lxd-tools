import {CanvasData, IModuleData, ModuleItemType} from "@/canvas/canvasDataDefs";
import {AssignmentsCollection} from "@/ui/speedGrader/AssignmentsCollection";
import {IModuleInfo} from "@/ui/speedGrader/types";

export function getModuleInfo(contentItem: CanvasData, modules: IModuleData[], assignmentsCollection: AssignmentsCollection): IModuleInfo {
    const regex = /(week|module) (\d+)/i;
    for (const module of modules) {
        const moduleNameMatch = module.name.match(regex);
        let [fullMatch, weekOrModule, weekNumber] = moduleNameMatch ?? [];
        if (!weekNumber) {
            for (const moduleItem of module.items) {
                if (!moduleItem.hasOwnProperty('title')) {
                    continue;
                }
                const [fullMatch, weekOrModule, itemWeekNumber] =  moduleItem.title.match(regex) ?? [];
                if (itemWeekNumber) {
                    weekNumber = itemWeekNumber;
                }
            }
        }

        const moduleItem = getItemInModule(contentItem, module, assignmentsCollection);
        if (!moduleItem) {
            continue;
        }
        return {
            weekNumber: weekNumber == null ? '-' : parseInt(weekNumber),
            moduleName: module.name,
            type: moduleItem.type,
            numberInModule: moduleItem.numberInModule
        }
    }
    return {
        weekNumber: '-',
        moduleName: '-',
        type: assignmentsCollection.getAssignmentContentType(contentItem),
        numberInModule: -1
    }
}


export function getContentItemId(contentItem:CanvasData, type:ModuleItemType) {
    if (type === 'Discussion') return contentItem.discussion_topic.id;
    if (type === 'Quiz')  return contentItem.quiz_id;
    return contentItem.id;

}

export function getItemInModule(contentItem: CanvasData, module: IModuleData, assignmentsCollection: AssignmentsCollection) {

    const type: ModuleItemType = assignmentsCollection.getAssignmentContentType(contentItem);
    const contentId = getContentItemId(contentItem, type)

    let count = 1;
    for (const moduleItem of module.items) {

        const moduleItemAssignment = assignmentsCollection.getContentById(moduleItem.content_id);
        if (assignmentsCollection.getModuleItemType(moduleItem) !== type) {
            continue;
        }

        if (moduleItem.content_id === contentId) {
            if (type === 'Discussion' && !contentItem.rubric) {
                moduleItem.numberInModule = '-';
            } else {
                moduleItem.numberInModule = count;
            }
            moduleItem.type = type;
            return moduleItem;
        }

        if (type === 'Discussion' && !moduleItemAssignment.rubric) {
            continue;
        }

        count++;
    }
}