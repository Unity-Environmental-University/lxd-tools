import {CanvasData} from "@/canvas/canvasDataDefs";

export interface IPageData extends CanvasData {
    page_id: number,
    url: string,
    title: string,
    body?: string,
}