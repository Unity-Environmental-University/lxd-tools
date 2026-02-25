import { getCourseById } from "@ueu/ueu-canvas/course";
import { fetchJson } from "@ueu/ueu-canvas/fetch/fetchJson";
import { formDataify } from "@ueu/ueu-canvas/canvasUtils";
import { IModuleData } from "@ueu/ueu-canvas/canvasDataDefs";
import { moduleGenerator } from "@ueu/ueu-canvas/course/modules";
import { startMigration } from "@ueu/ueu-canvas/course/migration";
import { Course } from "@ueu/ueu-canvas/course/Course";
import { waitForMigrationCompletion } from "@/publish/publishInterface/MakeBp";
import { lockBlueprint } from "@ueu/ueu-canvas/course/blueprint";
import { getItemTypeAndId, IModuleItemData } from "@ueu/ueu-canvas";
import { getItemInModule } from "@/ui/speedGrader/modules";

export interface AcademicIntegritySetupProps {
  currentBp: Course | null;
  setIsRunningIntegritySetup: (running: boolean) => void;
}

export async function academicIntegritySetup({ currentBp, setIsRunningIntegritySetup }: AcademicIntegritySetupProps) {
  setIsRunningIntegritySetup(true);
  // Get BP
  const bp = currentBp;
  if (!bp) {
    alert("No BP found.");
    return;
  }

  const modules = await bp.getModules();
  if (!modules) {
    alert("No modules found in BP.");
    setIsRunningIntegritySetup(false);
    return;
  }

  // Check if the academic integrity module exists, find the instructor guide module
  for (const module of modules) {
    if (module.name === "Academic Integrity") {
      // If the academic integrity module already exists, alert the use and stop
      alert("Academic integrity module already exists in BP.");
      setIsRunningIntegritySetup(false);
      return;
    }
  }

  const assignmentGroups = await bp.getAssignmentGroups();
  let assignmentGroupId: number | null = null;

  console.log("Assignment Groups: ", JSON.stringify(assignmentGroups));

  for (const group of assignmentGroups) {
    if (group.name.toLocaleLowerCase().includes("assignment")) {
      assignmentGroupId = group.id;
      break;
    }
  }

  console.log("Integrity Assignment Group ID after for loop: ", assignmentGroupId);

  if (!assignmentGroupId) {
    assignmentGroupId = assignmentGroups[0]?.id || 0;
  }

  const academicIntegrityCourse = await getCourseById(7724480);
  const academicIntegrityModules = await academicIntegrityCourse.getModules();
  const academicIntegrityPages = await academicIntegrityCourse.getPages();
  const academicIntegrityModuleIds: number[] = [];
  let aiInstructorGuideModule: IModuleData | null = null;
  const aiInstructorGuideItemIds: number[] = [];
  const aiInstructorGuideItemUrls: Array<string | undefined> = [];

  if (!academicIntegrityCourse) {
    alert("Academic integrity course not found.");
    setIsRunningIntegritySetup(false);
    return;
  }

  for (const module of academicIntegrityModules) {
    let academicIntegrityModuleFound = false;
    let aiInstructorGuideModuleFound = false;

    if (module.name === "Academic Integrity") {
      academicIntegrityModuleIds.push(module.id);
      academicIntegrityModuleFound = true;
    } else if (module.name.toLocaleLowerCase().includes("instructor guide resources")) {
      aiInstructorGuideModule = module;
      aiInstructorGuideModuleFound = true;
    }

    if (academicIntegrityModuleFound && aiInstructorGuideModuleFound) {
      break; // Exit loop early if both modules are found
    }
  }

  if (aiInstructorGuideModule && aiInstructorGuideModule.items) {
    for (const item of aiInstructorGuideModule.items) {
      aiInstructorGuideItemUrls.push(item.page_url);
      const page = academicIntegrityPages.find((p) => p.rawData.url === item.page_url);
      if (page) aiInstructorGuideItemIds.push(page.rawData.page_id);
      console.log("Found AI Instructor Guide Page ID: ", page?.rawData.page_id);
    }
  }

  console.log("AI Instructor Guide Item IDs: ", aiInstructorGuideItemIds);

  if (!academicIntegrityModules) {
    alert("No modules found in academic integrity course.");
    setIsRunningIntegritySetup(false);
    return;
  }

  // Get module/pages from academic integrity course
  const academicIntegrityMigration = await startMigration(academicIntegrityCourse.id, bp.id, {
    fetchInit: {
      body: formDataify({
        migration_type: "course_copy_importer",
        settings: {
          source_course_id: academicIntegrityCourse.id,
          move_to_assignment_group_id: assignmentGroupId,
        },
        select: {
          modules: academicIntegrityModuleIds,
          pages: aiInstructorGuideItemIds,
        },
      }),
    },
  });

  const finalMigration = await waitForMigrationCompletion(bp.id, academicIntegrityMigration.id);

  if (finalMigration.workflow_state === "failed") {
    alert("There was a problem in the migration process. Check the BP to make sure the modules imported correctly.");
    setIsRunningIntegritySetup(false);
    return;
  }

  // Get the updated list of modules in the BP after the migration
  const updatedModules = await bp.updateModules();
  let bpAcademicIntegrityModule: IModuleData | undefined = undefined;
  let instructorResourcesModule: IModuleData | undefined = undefined;

  for (const module of updatedModules) {
    if (module.name === "Academic Integrity") {
      bpAcademicIntegrityModule = module;
    } else if (module.name.toLocaleLowerCase().includes("leave unpublished")) {
      instructorResourcesModule = module;
    }
  }

  if (!bpAcademicIntegrityModule) {
    alert("There was an error finding the Academic Integrity module in the BP after migration.");
    setIsRunningIntegritySetup(false);
    return;
  }

  if (!instructorResourcesModule) {
    alert("There was a problem finding the Instructor Resources module.");
    setIsRunningIntegritySetup(false);
    return;
  }

  // Unpublish module
  const unpublishModule = await fetchJson(`/api/v1/courses/${bp.id}/modules/${bpAcademicIntegrityModule.id}`, {
    fetchInit: {
      method: "PUT",
      body: formDataify({
        module: {
          published: false,
        },
      }),
    },
  });

  if (unpublishModule.errors) {
    alert(
      "There was a problem unpublishing the Academic Integrity module in the blueprint. You may need to check this manually."
    );
  }

  const updatedAssignmentGroups = await bp.getAssignmentGroups();

  for (const group of updatedAssignmentGroups) {
    console.log(`We are inside of the assignment group delete.`);
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

  const pages = await bp.getPages();
  console.log("All BP Pages: ", pages);
  console.log("AI Instructor Guide Item URLs: ", aiInstructorGuideItemUrls);
  const aiInstructorGuideItems = pages?.filter((page) => aiInstructorGuideItemUrls.includes(page.rawData.url));

  console.log("aiInstructorGuideItems after filter: ", aiInstructorGuideItems);

  console.log("AI Instructor Guide Items in BP: ", aiInstructorGuideItems);

  // Put items into the instructor resources module
  let issueOccurred = false;

  for (const item of aiInstructorGuideItems ?? []) {
    const itemUrl = item.getItem("url");
    const unpublish = await fetchJson(`/api/v1/courses/${bp.id}/pages/${itemUrl}`, {
      fetchInit: {
        method: "PUT",
        body: formDataify({
          wiki_page: {
            published: false,
          },
        }),
      },
    });
    const addToModule = await fetchJson(`/api/v1/courses/${bp.id}/modules/${instructorResourcesModule.id}/items`, {
      fetchInit: {
        method: "POST",
        body: formDataify({
          module_item: {
            type: "Page",
            page_url: item.getItem("url"),
          },
        }),
      },
    });

    if (unpublish.errors || addToModule.errors) {
      issueOccurred = true;
    }
  }

  bp.updateModules();

  if (issueOccurred) {
    alert(
      "There was an issue adding the Academic Integrity Instructor Guide pages to the Instructor Resources module. Please check the BP manually."
    );
  }

  //If we made it here, let the user know we've succeeded
  alert("Academic integrity setup complete!");
  setIsRunningIntegritySetup(false);
}
