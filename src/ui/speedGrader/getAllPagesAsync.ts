import {CanvasData} from "@/canvas/canvasDataDefs";
import assert from "assert";
import {renderAsyncGen} from "@/canvas/fetch";
import {getPagedDataGenerator} from "@/canvas/fetch/getPagedDataGenerator";

export async function getAllPagesAsync(url: string) {
    return await renderAsyncGen(getPagedDataGenerator(url));
}