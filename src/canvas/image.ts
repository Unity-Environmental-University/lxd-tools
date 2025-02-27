import {runtime} from "webextension-polyfill";
import assert from "assert";

export async function getResizedBlob(src: string, width: number, height: number | undefined = undefined) {
    const imageSrc = await contentDownloadImage(src);
    const canvas = document.createElement('canvas');
    const image = new Image();
    image.src = imageSrc;
    const ctx = canvas.getContext('2d');
    return new Promise<Blob | null>((resolve) => {
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

export async function getCroppedSquareBlob(src: string, size: number): Promise<Blob | null> {
    const imageSrc = await contentDownloadImage(src);
    const image = new Image();
    image.src = imageSrc;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    return new Promise<Blob | null>((resolve) => {
        image.onload = () => {
            assert(ctx);
            const minDim = Math.min(image.width, image.height);
            const cropX = (image.width - minDim) / 2;
            const cropY = (image.height - minDim) / 2;

            canvas.width = size;
            canvas.height = size;
            ctx.drawImage(image, cropX, cropY, minDim, minDim, 0, 0, size, size);
            canvas.toBlob(resolve);
        };
    });
}

export async function contentDownloadImage(src: string) {
    const base64 = await runtime.sendMessage({downloadImage: src});
    return base64 as string;

}

export function backgroundDownloadImage(src: string) {

    //if(!height) height = src.height / src.width * width;
    const imageUrl = src;

    return new Promise(async (resolve) => {
        const imageFileResponse = await fetch(imageUrl);
        const reader = new FileReader();
        reader.onload = event => {
            console.log(reader.result);
            resolve(reader.result)
        }
        const blob = await imageFileResponse.blob();
        reader.readAsDataURL(blob);
    })
}



