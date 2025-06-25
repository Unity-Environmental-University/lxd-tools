import {runtime} from "webextension-polyfill";
import assert from "assert";

/**
 * Function to resize an image and convert image to .jpg and return it as a Blob.
 * @param src The source URL of the image to be resized.
 * @param width The desired width of the resized image.
 * @param height The desired height of the resized image. If not provided, it will be calculated based 
 * on the aspect ratio of the original image.
 * @returns A Promise that resolves to a Blob containing the resized image in JPEG format.
 * If the image cannot be resized, it resolves to null.
 */
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

/**
 * Function to change the file extension of a given filename.
 * @param filename The original filename with its extension.
 * @param newExtension The new extension to be applied to the filename.
 * @returns The filename with the new extension.
 */
export function changeExtension(filename: string, newExtension: string): string {
    const base = filename.replace(/\.[^/.]+$/, ""); // Remove existing extension
    return `${base}.${newExtension}`;
}

/**
 * Function to crop an image to a square and resize it to a specified size.
 * @param src The source URL of the image to be cropped.
 * @param size The desired size of the cropped square image (both width and height).
 * @returns A Promise that resolves to a Blob containing the cropped square image.
 * If the image cannot be cropped, it resolves to null.
 */
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

/**
 * This function sends a message to the background script to download an image from the given source URL
 * @param src  The source URL of the image to be downloaded.
 * @returns a string message containing the base64 encoded image data.
 */
export async function contentDownloadImage(src: string) {
    const base64 = await runtime.sendMessage({downloadImage: src});
    return base64 as string;

}

/**
 * This function downloads an image from the given source URL in the background and returns it as a base64 
 * encoded string.
 * @param src The source URL of the image to be downloaded.
 * @returns A Promise that resolves to a base64 encoded string of the image data.
 */
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



