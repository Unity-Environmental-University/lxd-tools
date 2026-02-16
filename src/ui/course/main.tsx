import { Course } from "@ueu/ueu-canvas";
import { getContentClassFromUrl } from "@ueu/ueu-canvas";
import {
  addBpButton,
  addDevButton,
  addHighlightBigImageResizer,
  addHomeTileButton,
  addOpenAllLinksButton,
  addRubricButton,
  addSectionsButton,
} from "@/ui/course/addButtons";
import { getSingleCourse } from "@ueu/ueu-canvas";

export async function main() {
  const currentCourse = await Course.getFromUrl(document.documentURI);
  const CurrentContentClass = getContentClassFromUrl(document.documentURI);
  let currentContentItem = await CurrentContentClass?.getFromUrl();
  if (!CurrentContentClass && /courses\/\d+/.test(document.URL))
    currentContentItem = await currentCourse?.getFrontPage();

  if (!currentCourse) return;
  const header: HTMLElement | null = document.querySelector(".right-of-crumbs");
  if (!header) return;

  await addDevButton(header, currentCourse);
  const bp = currentCourse.isBlueprint()
    ? currentCourse
    : await getSingleCourse("BP_" + currentCourse.baseCode, currentCourse.getAccountIds());
  await addBpButton(header, currentCourse, bp);
  if (bp) {
    await addSectionsButton(header, bp, currentCourse);
  }

  if (currentCourse.isBlueprint() || currentCourse.isDev) {
    await addRubricButton(header);
  }

  if (currentContentItem) {
    await addOpenAllLinksButton(header, currentContentItem);
    addHighlightBigImageResizer(currentContentItem);
  }
  const homeTileHost = document.querySelector("#Modules-anchor");

  if (homeTileHost) {
    const buttonHolder = document.createElement("div");
    homeTileHost.append(buttonHolder);
    addHomeTileButton(buttonHolder, currentCourse);
  }
}
