import {runtime, Downloads} from "webextension-polyfill";
import DownloadOptionsType = Downloads.DownloadOptionsType;
import assert from "assert";

export async function downloadFile(options: DownloadOptionsType) {
    await runtime.sendMessage('downloadFile', options);
}

export function resizeImage(imgSrc: string, targetWidth: number, targetHeight: null | number = null): Promise<ImageData> {
    assert(document);
    const image = new Image();
    image.loading = 'eager';
    return new Promise((resolve, reject) => {
        let callback = () => {
            console.log("Loaded");
            console.log(image.src, image.height, image.width);
            const targetCanvas = document.createElement('canvas');
            const tCtx = targetCanvas.getContext('2d');
            if (!tCtx) {
                reject();
                return;
            }
            tCtx.imageSmoothingEnabled = true;
            tCtx.imageSmoothingQuality = "high";

            const aspectRatio = image.width / image.height;
            targetHeight = targetHeight ? targetHeight : targetWidth / aspectRatio;
            targetCanvas.width = targetWidth;
            targetCanvas.height = targetHeight;
            tCtx.drawImage(image, 0, 0, targetWidth, targetHeight);
            resolve(tCtx.getImageData(0, 0, targetWidth, targetHeight));
        }
        console.log("loading", imgSrc);
        image.src = imgSrc;
        if (image.complete) {
            callback();
        } else {
            image.addEventListener('load', callback);
            image.addEventListener('error', (e) => {
                console.log(e);
                console.log(image);
            })
        }

    });
}