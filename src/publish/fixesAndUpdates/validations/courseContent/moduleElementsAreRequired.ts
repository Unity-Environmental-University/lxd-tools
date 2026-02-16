import { CourseValidation, FixTestFunction } from "@publish/fixesAndUpdates/validations/types";
import { IModuleItemData } from "@ueu/ueu-canvas";
import { errorMessageResult, MessageResult, testResult } from "@publish/fixesAndUpdates/validations/utils";
import {
  AssignmentItemData,
  DiscussionItemData,
  isDiscussionItemData,
  moduleGenerator,
  PageItemData,
  saveModuleItem,
} from "@ueu/ueu-canvas";

type AffectedModuleItem = IModuleItemData & {
  completion_requirement: { type: "min-score"; min_score: number } | undefined;
};

export type CheckModuleCourse = { id: number };
export type CheckModuleResult = AffectedModuleItem[];

export function isAffectedModuleItem(mi: IModuleItemData, moduleName: string): mi is AffectedModuleItem {
  if (
    mi.title.toLocaleLowerCase().match(/how do i earn it\?/gi) ||
    moduleName.toLocaleLowerCase().match(/claim badge/gi) ||
    moduleName.toLocaleLowerCase().match(/academic integrity/gi)
  ) {
    return false;
  }

  const req = (mi as any).completion_requirement;
  if (typeof req === "undefined") return true;
  return (
    req.type === "min_score" &&
    !moduleName.toLocaleLowerCase().match(/how do i earn it\?/gi) &&
    (req.min_score ?? 0) !== 1
  );
}

const run = async (course: CheckModuleCourse) => {
  const affectedModuleItems: AffectedModuleItem[] = [];

  const modGen = moduleGenerator(course.id, { queryParams: { include: ["items"] } });
  for await (const mod of modGen) {
    if (!mod.published) continue;
    const { items } = mod;
    const badItems = items.filter((item) => isAffectedModuleItem(item, mod.name));
    affectedModuleItems.push(...badItems);
  }

  const failureMessage: MessageResult[] = [
    { bodyLines: ["These module items affected:"] },
    ...affectedModuleItems.map((a) => ({
      bodyLines: [a.title],
      links: [a.html_url],
    })),
  ];

  return testResult(affectedModuleItems.length === 0, {
    failureMessage,
    userData: affectedModuleItems,
  });
};

type UndefinedCompletionRequirementData = IModuleItemData & { completion_requirement: undefined };

const fixedPageData = (item: PageItemData & UndefinedCompletionRequirementData) => {
  let fixedItem: IModuleItemData;
  if (item.title.toLocaleLowerCase().match(/week.*overview/gi)) {
    fixedItem = { ...item, completion_requirement: { type: "must_view" } };
  } else if (item.title.toLocaleLowerCase().match(/learning materials/gi)) {
    fixedItem = { ...item, completion_requirement: { type: "must_submit" } };
  } else if (item.title.toLocaleLowerCase().match(/course project overview/gi)) {
    fixedItem = { ...item, completion_requirement: { type: "must_submit" } };
  } else {
    fixedItem = { ...item, completion_requirement: { type: "must_view" } };
  }
  return fixedItem;
};

const fixedDiscussionData = (item: DiscussionItemData & UndefinedCompletionRequirementData) => {
  return { ...item, completion_requirement: { type: "min_score", min_score: 1 } } satisfies IModuleItemData;
};

const fixedAssignmentData = (item: AssignmentItemData & UndefinedCompletionRequirementData) => {
  return { ...item, completion_requirement: { type: "must_submit" } } satisfies IModuleItemData;
};

const fixModuleItems = async (courseId: number, items: UndefinedCompletionRequirementData[]) => {
  const fixedItems: IModuleItemData[] = [];
  for (const item of items) {
    if (isDiscussionItemData(item)) {
      fixedItems.push(fixedDiscussionData(item));
    }

    /*if (isPageItemData(item)) {
            fixedItems.push(fixedPageData(item));
        } else if (isDiscussionItemData(item)) {
            fixedItems.push(fixedDiscussionData(item));
        } else if (isAssignmentItemData(item)) {
            fixedItems.push(fixedAssignmentData(item))
        }*/
  }
  for (const item of items) {
    await saveModuleItem(courseId, item.module_id, item.id, item);
  }

  return fixedItems;
};

const fix: FixTestFunction<CheckModuleCourse, CheckModuleResult, IModuleItemData[]> = async (course, result) => {
  result ??= await run(course);
  const affectedItems: AffectedModuleItem[] = result.userData!;
  if (result.success) throw new Error("Result should never be success in a fix");
  if (typeof affectedItems === "undefined") throw new Error("Affected items not defined");
  try {
    const fixedItems = (await fixModuleItems(course.id, affectedItems)).filter(
      (a) => typeof a.completion_requirement !== "undefined"
    );
    return testResult(true, {
      userData: fixedItems,
      links: fixedItems.map((a) => a.html_url),
    });
  } catch (e) {
    return errorMessageResult(
      e,
      affectedItems.map((a) => a.html_url)
    );
  }
};

export const moduleElementsAreRequiredValidation: CourseValidation<
  CheckModuleCourse,
  CheckModuleResult,
  IModuleItemData[]
> = {
  name: "Module Items Required",
  description:
    "Check if all items in weekly modules have been correctly marked as required. Discussions in this list may not be correctly set to Score at least 1.0. NOTE: This may be intential for things like practice quizzes.",
  run,
  //    fix,
};
