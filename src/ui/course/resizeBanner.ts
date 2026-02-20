import { SAFE_MAX_BANNER_WIDTH } from "@/publish/consts";
import { getResizedBlob } from "@/utils/image";
import assert from "assert";
import { uploadFile, IFile } from "@ueu/ueu-canvas/files";
import { BaseContentItem, getBannerImage } from "@ueu/ueu-canvas/content/BaseContentItem";
import { fetchJson } from "@ueu/ueu-canvas/fetch/fetchJson";

export async function resizeBannerOnItem(item: BaseContentItem, maxWidth = SAFE_MAX_BANNER_WIDTH) {
  const bannerImg = getBannerImage(item);
  if (!bannerImg) throw new Error("No banner");
  const fileData = await getFileDataFromUrl(bannerImg.src, item.courseId);
  if (!fileData) throw new Error("File not found");
  if (bannerImg.naturalWidth < maxWidth) return;
  const resizedImageBlob = await getResizedBlob(bannerImg.src, maxWidth);
  const fileName = fileData.filename;
  const fileUploadUrl = `/api/v1/courses/${item.courseId}/files`;
  assert(resizedImageBlob);
  const file = new File([resizedImageBlob], fileName);
  return await uploadFile(file, fileData.folder_id, fileUploadUrl);
}

async function getFileDataFromUrl(url: string, courseId: number) {
  const match = /.*\/files\/(\d+)/.exec(url);
  if (!match) return null;
  const fileId = parseInt(match[1]);
  return await getFileData(fileId, courseId);
}

async function getFileData(fileId: number, courseId: number) {
  const url = `/api/v1/courses/${courseId}/files/${fileId}`;
  return (await fetchJson(url)) as IFile;
}
