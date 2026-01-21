import { startMigration } from "@/canvas/course/migration";
import { waitForMigrationCompletion } from "@/publish/publishInterface/MakeBp";
import { Course } from "@/canvas/course/Course";
import { fetchJson, formDataify, getCourseById, IModuleData, moduleGenerator } from "ueu_canvas";


export interface SkillsGapModuleProps {
  currentBp: Course | null;
  setIsRunningSkillsGapSetup: (running: boolean) => void;
}

export async function skillsGapModuleSetup({
  currentBp,
  setIsRunningSkillsGapSetup
}: SkillsGapModuleProps) {
  setIsRunningSkillsGapSetup(true);

  // Get BP
  const bp = currentBp;
  if(!bp) {
    alert("No BP found.");
    setIsRunningSkillsGapSetup(false);
    return;
  }

  const modules = await bp.getModules();
  if(!modules) {
    alert("No modules found in BP.");
    setIsRunningSkillsGapSetup(false);
    return;  
  }

  // Check if the skills gap module exists, find the instructor guide module
  // TODO; Replace with the correct module name once we have it
  for(const module of modules) {
    if(module.name === 'Insert Module Name Here') {
      alert("Skills Gap module already exists in BP.");
      setIsRunningSkillsGapSetup(false);
      return;
    }
  }

  const assignmentGroups = await bp.getAssignmentGroups();
  let assignmentGroupId: number | null = null;

  console.log("Assignment Groups: ", JSON.stringify(assignmentGroups));
  
  for(const group of assignmentGroups) {
    if(group.name.toLowerCase().includes("assignment")) {
      assignmentGroupId = group.id;
      break;
    }
  }

  console.log("Integrity Assignment Group ID after for loop: ", assignmentGroupId);

    if (!assignmentGroupId) {
        assignmentGroupId = assignmentGroups[0]?.id || 0;
    }

    // TODO; get ID for skills gap template course
    const skillsGapCourse = await getCourseById(0);
    const skillsGapModules = await skillsGapCourse.getModules();
    const skillsGapPages = await skillsGapCourse.getPages();
    const skilsGapModuleIds: number[] = [];
    let skillsGapInstrGuideModule: IModuleData | null = null;
    const skillsGapInstGuideItemIds: number[] = [];
    const skillsGapInstGuideItemUrls: Array<string | undefined> = [];

    if(!skillsGapCourse){
      alert("Skills Gap template course not found.");
      setIsRunningSkillsGapSetup(false);
      return;
    }

    for(const module of skillsGapModules) {
      let skillsGapModuleFound = false;
      let sgInstGuideModuleFound = false;
      
      // TODO; Grab correct module names(skills gap and instructor guide)
      if(module.name === "Insert Module Name Here") {
        skilsGapModuleIds.push(module.id);
        skillsGapModuleFound = true;
      } else if(module.name.toLowerCase().includes('insert module name here')) {
        skillsGapInstrGuideModule = module;
        sgInstGuideModuleFound = true;
      }

      if(skillsGapModuleFound && sgInstGuideModuleFound) {
        break;
      }
    }

    if(skillsGapInstrGuideModule && skillsGapInstrGuideModule.items) {
      for(const item of skillsGapInstrGuideModule.items) {
        skillsGapInstGuideItemUrls.push(item.page_url);
        const page = skillsGapPages.find(p => p.rawData.url === item.page_url);
        if(page) skillsGapInstGuideItemIds.push(page.rawData.page_id);
        console.log("Found Skills Gap Instructor Guide Page ID: ", page?.rawData.page_id);
      }
    }

    console.log("Skills Gap Instructor Guide Item IDs: ", skillsGapInstGuideItemIds);

    if(!skillsGapModules) {
      alert("No modules found in skills gap template course.");
      setIsRunningSkillsGapSetup(false);
      return;
    }

    // Pull modules/pages from skills gap template course
    const skillsGapMigration = await startMigration(skillsGapCourse.id, bp.id,
      {
        fetchInit: {
          body: formDataify({
            migration_type: 'course_copy_importer',
            settings: {
              source_course_id: skillsGapCourse.id,
              move_to_assignment_group_id: assignmentGroupId,
            },
            select: {
              modules: skilsGapModuleIds,
              pages: skillsGapInstGuideItemIds,
            }
          })
        }
      });

    const finalMigration = await waitForMigrationCompletion(bp.id, skillsGapMigration.id);

    if(finalMigration.workflow_state === "failed") {
      alert("There was a problem in the migration process. Check the BP to make sure the modules imported correctly.");
        setIsRunningSkillsGapSetup(false);
        return;
    }

    //Get the updated list of modules in the BP after migration
    const updatedModulesGen = moduleGenerator(bp.id);
    let bpSkillsGapModule: IModuleData | undefined = undefined;
    let instructorResourcesModule: IModuleData | undefined = undefined;

    // TODO; Get correct module name
    for await (const module of updatedModulesGen) {
      if(module.name === "Insert Name Here") {
        bpSkillsGapModule = module;
      } else if(module.name.toLowerCase().includes('leave unpublished')) {
        instructorResourcesModule = module;
      }
    }

    if(!bpSkillsGapModule) {
      alert("There was an error finding the Skills Gap module in the BP after migration.");
      setIsRunningSkillsGapSetup(false);
      return; 
    }

    if(!instructorResourcesModule) {
      alert("There was a problem finding the Instructor Resources module.");
      setIsRunningSkillsGapSetup(false);
      return;
    }

    // Unpublish module
    const unpublishModule = await fetchJson(
      `/api/v1/courses/${bp.id}/modules/${bpSkillsGapModule.id}`,
      {
        fetchInit: {
          method: 'PUT',
          body: formDataify({
            module: {
                published: false,
            }
          })
        }
      }
    );

    if(unpublishModule.errors) {
      alert("There was a problem unpublishing the Skills Gap module in the blueprint. You may need to check this manually.")
    }

    const updatedAssignmentGroups = await bp.getAssignmentGroups();

    for(const group of updatedAssignmentGroups) {
      if(group.name.toLowerCase().includes('imported')) {
        const deleteGroup = await fetchJson(
          `/api/v1/courses/${bp.id}/assignment_groups/${group.id}`,
          {
            fetchInit: {
              method: 'DELETE',
              body: formDataify({}),
            }
          }
        );
        if(deleteGroup.errors) {
          alert("Failed to delete imported assignment group in BP. You will need to remove it manually.");
        }
      }
    }

    const pages = await bp.getPages();
    const skillsGapInstGuideItems = pages?.filter(page => skillsGapInstGuideItemUrls.includes(page.rawData.url));

    console.log("skillsGapInstGuideItems after filter: ", skillsGapInstGuideItems);

    let issueOccurred = false;

    for(const item of skillsGapInstGuideItems ?? []) {
      const itemUrl = item.getItem('url');
      const unpublish = await fetchJson(
        `/api/v1/courses/${bp.id}/pages/${itemUrl}`,
            {
                fetchInit: {
                    method: 'PUT',
                    body: formDataify({
                        wiki_page: {
                            published: false,
                        }
                    }),
                }
            }
      )
      const addToModule = await fetchJson(
        `/api/v1/courses/${bp.id}/modules/${instructorResourcesModule.id}/items`,
        {
            fetchInit: {
                method: 'POST',
                body: formDataify({
                    module_item: {
                        type: 'Page',
                        page_url: item.getItem("url"),
                    }
                }),
            }
        }
    );

    if (unpublish.errors || addToModule.errors) {
        issueOccurred = true;
    }
  }
  
  if (issueOccurred) {
        alert("There was an issue adding the Skills Gap Instructor Guide pages to the Instructor Resources module. Please check the BP manually.");
    }

    //If we made it here, let the user know we've succeeded
    alert("Skills gap setup complete!");
    setIsRunningSkillsGapSetup(false);
}