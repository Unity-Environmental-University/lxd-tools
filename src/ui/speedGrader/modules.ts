import {CanvasData, IModuleData, ModuleItemType} from "@/canvas/canvasDataDefs";
import {AssignmentsCollection} from "@/ui/speedGrader/AssignmentsCollection";
import {IModuleInfo} from "@/ui/speedGrader/types";

export function getModuleInfo(contentItem: CanvasData, modules: IModuleData[], assignmentsCollection: AssignmentsCollection): IModuleInfo {
    const regex = /(week|module) (\d+)/i;
    for (let module of modules) {
        let moduleNameMatch = module.name.match(regex);
        let [fullMatch, weekOrModule, weekNumber] = moduleNameMatch ?? [];
        if (!weekNumber) {
            for (let moduleItem of module.items) {
                if (!moduleItem.hasOwnProperty('title')) {
                    continue;
                }
                let [fullMatch, weekOrModule, itemWeekNumber] =  moduleItem.title.match(regex) ?? [];
                if (itemWeekNumber) {
                    weekNumber = itemWeekNumber;
                }
            }
        }

        let moduleItem = getItemInModule(contentItem, module, assignmentsCollection);
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

export function getItemInModule(contentItem: CanvasData, module: IModuleData, assignmentsCollection: AssignmentsCollection) {

    let contentId;
    let type: ModuleItemType = assignmentsCollection.getAssignmentContentType(contentItem);
    if (type === 'Discussion') {
        contentId = contentItem.discussion_topic.id;
    } else if (type === 'Quiz') {
        contentId = contentItem.quiz_id;
    } else {
        contentId = contentItem.id;
    }

    let count = 1;
    for (let moduleItem of module.items) {

        let moduleItemAssignment = assignmentsCollection.getContentById(moduleItem.content_id);
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

        if (type === 'Discussion' && !moduleItemAssignment?.hasOwnProperty('rubric')) {
            continue;
        }

        count++;
    }
    return null;
}