import {Course} from "@/canvas/course/Course";
import {getContentClassFromUrl} from "@/canvas/content/getContent";
import {
    addBpButton,
    addDevButton,
    addHighlightBigImageResizer,
    addHomeTileButton,
    addOpenAllLinksButton,
    addSectionsButton
} from "@/ui/course/addButtons";
import {getSingleCourse} from "@/canvas/course";

export async function main() {
    const currentCourse = await Course.getFromUrl(document.documentURI);
    let CurrentContentClass = getContentClassFromUrl(document.documentURI);
    let currentContentItem = await CurrentContentClass?.getFromUrl();
    if (!CurrentContentClass && /courses\/\d+/.test(document.URL)) {
        currentContentItem = await currentCourse?.getFrontPage();

    }

    if (!currentCourse) return;
    let header: HTMLElement | null = document.querySelector('.right-of-crumbs');
    if (!header) return;
    let bp: Course | undefined;

    if (currentCourse.isBlueprint()) {
        await addDevButton(header, currentCourse);
        await addSectionsButton(header, currentCourse);
    } else {
        bp = await getSingleCourse('BP_' + currentCourse.baseCode, currentCourse.getAccountIds());
        await addBpButton(header, currentCourse, bp);
        if (bp) {
            await addSectionsButton(header, bp, currentCourse);
        }
    }
    if (currentContentItem) {
        await addOpenAllLinksButton(header, currentContentItem);
        addHighlightBigImageResizer(currentContentItem);
    }
    const homeTileHost = document.querySelector('#Modules-anchor');

    if (homeTileHost) {
        console.log(homeTileHost);
        const buttonHolder = document.createElement('div');
        homeTileHost.append(buttonHolder);
        addHomeTileButton(buttonHolder, currentCourse);
    }

}

