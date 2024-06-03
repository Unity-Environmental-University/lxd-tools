import {runtime} from "webextension-polyfill";
import assert from "assert";

export type ResizeImageMessage = {
    src: string,
    image: HTMLImageElement,
    width: number,
    height?: number
}

export async function getResizedBlob(src: string, width: number, height: number | undefined = undefined) {
    let imageSrc = await contentDownloadImage(src);
    let canvas = document.createElement('canvas');
    let image = new Image();
    image.src = imageSrc;
    let ctx = canvas.getContext('2d');
    return new Promise<Blob|null>((resolve) => {
        image.onload = () => {
            height ??= image.height / image.width * width;
            assert(ctx);
            console.log(image.src);
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(image, 0, 0, width, height);
            canvas.toBlob(resolve);
        }
    })
}

export async function contentDownloadImage(src: string) {
    const base64 = await runtime.sendMessage({downloadImage: src});
    return base64 as string;

}

export function backgroundDownloadImage(src: string) {

    //if(!height) height = src.height / src.width * width;
    const imageUrl = src;

    return new Promise(async(resolve) => {
        const imageFileResponse = await fetch(imageUrl);
        let reader = new FileReader();
        reader.onload = event => {
            console.log(reader.result);
            resolve(reader.result)
        }
        const blob = await imageFileResponse.blob();
        reader.readAsDataURL(blob);
    })
}



