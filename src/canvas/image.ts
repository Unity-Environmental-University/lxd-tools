import {runtime, Downloads} from "webextension-polyfill";
import DownloadOptionsType = Downloads.DownloadOptionsType;
import assert from "assert";

import { Jimp as JimpType, JimpConstructors } from '@jimp/core';
import 'jimp';
import {fetchOneKnownApiJson} from "./utils";

declare const Jimp: JimpType & JimpConstructors;

export type ResizeImageMessage = {
    src: string,
    width: number,
    height?: number
}

export async function contentResizeImage(message: ResizeImageMessage) {
    console.log("resizing", message);
    const image = document.createElement('img');
    const base64 = await runtime.sendMessage({resizeImage: message});
    image.src = base64;
    image.width = message.width;
    image.height = message.width;
}

export function backgroundResizeImage(src: string, width:number, height: number | undefined) {

    //if(!height) height = src.height / src.width * width;
    const imageUrl = src;
    const dataUrl = imageUrl.replace('.com/', '.com/api/v1/').replace('/preview', '');

    return new Promise(async(resolve) => {
        const imageDataRes = await fetch(dataUrl);
        const imageData = await imageDataRes.json();
        const imageFileResponse = await fetch(imageUrl);
        let reader = new FileReader();
        reader.onload = event => {
            console.log(event.target?.result);
            resolve(reader.result)
        }
        const blob = await imageFileResponse.blob();
        console.log(blob);
        reader.readAsDataURL(blob);
    })
}

