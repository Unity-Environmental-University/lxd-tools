import {CourseFixValidation, CourseValidation, FixTestFunction} from "@publish/fixesAndUpdates/validations/types";
import {IModuleItemData} from "@canvas/canvasDataDefs";
import {errorMessageResult, MessageResult, testResult} from "@publish/fixesAndUpdates/validations/utils";
import {
    AssignmentItemData,
    DiscussionItemData, isAssignmentItemData, isDiscussionItemData,
    isPageItemData,
    moduleGenerator,
    PageItemData,
    saveModuleItem
} from "@canvas/course/modules";

type AffectedModuleItem = IModuleItemData & { completion_requirement: undefined };

export type CheckModuleCourse = { id: number };
export type CheckModuleResult = AffectedModuleItem[];

function isAffectedModuleItem(mi: IModuleItemData): mi is AffectedModuleItem {
    return typeof mi.completion_requirement === 'undefined';
}

const run = async (course: CheckModuleCourse) => {
    let affectedModuleItems: AffectedModuleItem[] = [];


    let modGen = moduleGenerator(course.id, {queryParams: {include: ['items']}});
    for await (let mod of modGen) {
        if (!mod.published) continue;
        const {items} = mod;
        const badItems = items.filter(isAffectedModuleItem);
        affectedModuleItems.push(...badItems);
    }

    const failureMessage: MessageResult[] = [
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


type UndefinedCompletionRequirementData = IModuleItemData & { completion_requirement: undefined };


const fixedPageData = (item: PageItemData & UndefinedCompletionRequirementData) => {
    let fixedItem: IModuleItemData;
    if (item.title.toLocaleLowerCase().match(/week.*overview/ig)) {
        fixedItem = {...item, completion_requirement: {type: "must_view"}};
    } else if (item.title.toLocaleLowerCase().match(/learning materials/ig)) {
        fixedItem = {...item, completion_requirement: {type: "must_submit"}};
    } else if (item.title.toLocaleLowerCase().match(/course project overview/ig)) {
        fixedItem = {...item, completion_requirement: {type: "must_submit"}};
    } else {
        fixedItem = {...item, completion_requirement: {type: "must_view"}};
    }
    return fixedItem;
}

const fixedDiscussionData = (item: DiscussionItemData & UndefinedCompletionRequirementData) => {
    return {...item, completion_requirement: {type: "min_score", min_score: 1}} satisfies IModuleItemData;
}


const fixedAssignmentData = (item: AssignmentItemData & UndefinedCompletionRequirementData) => {
    return {...item, completion_requirement: {type: "must_submit"}} satisfies IModuleItemData;
}


const fixModuleItems = async (courseId: number, items: UndefinedCompletionRequirementData[]) => {
    const fixedItems: IModuleItemData[] = [];
    for (const item of items) {
        if (isPageItemData(item)) {
            fixedItems.push(fixedPageData(item));
        } else if (isDiscussionItemData(item)) {
            fixedItems.push(fixedDiscussionData(item));
        } else if (isAssignmentItemData(item)) {
            fixedItems.push(fixedAssignmentData(item))
        }

    }
    for (const item of items) {
        await saveModuleItem(courseId, item.module_id, item.id, item);
    }

    return fixedItems;

}


const fix: FixTestFunction<CheckModuleCourse, CheckModuleResult, IModuleItemData[]> = async (course, result) => {
    result ??= await run(course);
    const affectedItems: AffectedModuleItem[] = result.userData!;
    if (result.success) throw new Error("Result should never be success in a fix");
    if (typeof affectedItems === 'undefined') throw new Error("Affected items not defined");
    try {
        const fixedItems = (await fixModuleItems(course.id, affectedItems)).filter(a => typeof a.completion_requirement !== "undefined");
        return testResult(true, {
            userData: fixedItems,
            links: fixedItems.map(a => a.html_url),
        })
    } catch (e) {
        return errorMessageResult(e, affectedItems.map(a => a.html_url))
    }


}


export const moduleElementsAreRequiredValidation: CourseValidation<CheckModuleCourse, CheckModuleResult, IModuleItemData[]> = {
    name: "Module Items Required",
    description: "Check if all items in weekly modules have been marked as required. NOTE: This may be intential for things like practice quizzes.",
    run,
//    fix,
}