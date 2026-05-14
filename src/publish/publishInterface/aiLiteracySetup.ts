import { waitForMigrationCompletion } from "@/publish/publishInterface/MakeBp";
import { Course, fetchJson, formDataify, IAssignmentGroup, IModuleData } from "@ueu/ueu-canvas";
import { getAssignmentData } from "@ueu/ueu-canvas/content/assignments/legacy";
import { startMigration } from "@ueu/ueu-canvas/course/migration";

export interface aiLiteracySetupProps {
  currentBp: Course | null;
  setIsRunningAiLiteracySetup: (running: boolean) => void;
}

export async function aiLiteracySetup({ currentBp, setIsRunningAiLiteracySetup }: aiLiteracySetupProps) {
  const bp = currentBp;
  const aiLiteracyCourseId = 8019281;
  const aiLiteracyAssignmentId = 55291320;

  setIsRunningAiLiteracySetup(true);

  if (!bp) {
    alert("No BP found.");
    setIsRunningAiLiteracySetup(false);
    return;
  }

  const assignmentGroups = await bp.getAssignmentGroups();
  let destAssignmentGroup: IAssignmentGroup | null = null;
  const modules = await bp.getModules();
  let destModule: IModuleData | null = null;

  for (const group of assignmentGroups) {
    if (group.name.toLowerCase().includes("assignment") && !group.name.toLowerCase().includes("imported")) {
      destAssignmentGroup = group;
      break;
    }
  }

  if (!destAssignmentGroup) {
    destAssignmentGroup = assignmentGroups[0];
  }

  for (const module of modules) {
    if (module.name.toLowerCase().includes("module 1")) {
      destModule = module;
      break;
    }
  }

  if (!destModule) {
    alert("Module 1 not found.");
    setIsRunningAiLiteracySetup(false);
    return;
  }

  const dueDateString = (await getAssignmentData(bp.id, destModule.items[destModule.items.length - 1].content_id))
    .due_at;
  const dueDate = dueDateString ? new Date(dueDateString) : null;

  if (!dueDate) {
    alert("Couldn't find due date for Week 1 assignments.");
    setIsRunningAiLiteracySetup(false);
    return;
  }

  const assignmentContentMigration = await startMigration(aiLiteracyCourseId, bp.id, {
    fetchInit: {
      body: formDataify({
        migration_type: "course_copy_importer",
        settings: {
          source_course_id: aiLiteracyCourseId,
          move_to_assignment_group_id: destAssignmentGroup.id,
          insert_into_module_id: destModule.id,
          insert_into_module_type: "assignment",
          insert_into_module_position: 2,
        },
        date_shift_options: {
          shift_dates: true,
          new_end_date: dueDate,
        },
        select: {
          assignments: [aiLiteracyAssignmentId],
        },
      }),
    },
  });

  const finalMigration = await waitForMigrationCompletion(bp.id, assignmentContentMigration.id);

  if (finalMigration.workflow_state === "failed") {
    alert("There was a problem in the migration process. Check the BP to make sure the modules imported correctly.");
    setIsRunningAiLiteracySetup(false);
    return;
  }

  const updatedModules = await bp.updateModules();
  const updatedGroups = await bp.getAssignmentGroups();
  const aiLiteracyModuleItem = updatedModules[1].items[1];

  const updateModuleItem = await fetchJson(
    `/api/v1/courses/${bp.id}/modules/${updatedModules[1].id}/items/${aiLiteracyModuleItem.id}`,
    {
      fetchInit: {
        method: "PUT",
        body: formDataify({
          module_item: {
            indent: 1,
            completion_requirement: {
              type: "must_submit",
            },
            published: true,
          },
        }),
      },
    }
  );

  if (updateModuleItem.errors) {
    alert(
      "Failed to update the assignment in the module. You may need to update indent, competion requirement and published status manually."
    );
  }

  for (const group of updatedGroups) {
    if (group.name.toLocaleLowerCase().includes("imported")) {
      const deleteGroup = await fetchJson(`/api/v1/courses/${bp.id}/assignment_groups/${group.id}`, {
        fetchInit: {
          method: "DELETE",
          body: formDataify({}),
        },
      });
      if (deleteGroup.errors) {
        alert("Failed to delete imported assignment group in BP. You will need to remove it manually.");
      }
    }
  }

  setIsRunningAiLiteracySetup(false);
  alert("AI Literacy Assignment Setup done!");
}
