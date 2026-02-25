import { IModuleData, IModuleItemData } from "@ueu/ueu-canvas/canvasDataDefs";
import { getBannerImage } from "@ueu/ueu-canvas/content/BaseContentItem";
import { uploadFile } from "@ueu/ueu-canvas/files";
import { Course } from "@ueu/ueu-canvas/course/Course";
import assert from "assert";
import { getResizedBlob } from "@/utils/image";
import { getCourseById, fetchJson, IPageData, Page } from "@ueu/ueu-canvas";

const HOMETILE_WIDTH = 500;

export async function getHometileSrcPage(module: IModuleData, courseId: number) {
  const course = await getCourseById(courseId);
  let hometileSrc: IModuleItemData | undefined;

  if (course.isCareerInstitute()) {
    // if career institute, grab first page
    hometileSrc = module.items.find((item) => item.type === "Page");
  } else {
    hometileSrc = module.items.find((item) => item.type === "Page" && item.title.toLowerCase().includes("overview"));
  }
  console.log("hometileSrc: ", hometileSrc);
  if (!hometileSrc?.url) return;

  const url = hometileSrc.url.replace(/.*\/api\/v1/, "/api/v1");
  const pageData = (await fetchJson(url)) as IPageData;
  return new Page(pageData, courseId);
}

export async function regenerateHomeTiles(course: Course) {
  const modules = await course.getModules();
  await Promise.all(
    modules.map(async (module) => {
      try {
        await generateHomeTile(module, course.id, course.fileUploadUrl);
      } catch (e) {
        console.log(e);
      }
    })
  );
  console.log("done");
}

export async function generateHomeTile(module: IModuleData, courseId: number, fileUploadUrl: string) {
  const hometileSrcPage = await getHometileSrcPage(module, courseId);
  if (!hometileSrcPage) throw new Error("Module does not have an overview");
  const bannerImg = getBannerImage(hometileSrcPage);
  if (!bannerImg) throw new Error("No banner image on page");
  const resizedImageBlob = await getResizedBlob(bannerImg.src, HOMETILE_WIDTH);
  const fileName = `hometile${module.position}.png`;
  assert(resizedImageBlob);
  const file = new File([resizedImageBlob], fileName);
  return await uploadFile(file, "Images/hometile", fileUploadUrl);
}
