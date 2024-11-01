import {Course} from "@/canvas/course/Course";
import {getContentClassFromUrl} from "@/canvas/content/determineContent";
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
    const CurrentContentClass = getContentClassFromUrl(document.documentURI);
    let currentContentItem = await CurrentContentClass?.getFromUrl();
    if (!CurrentContentClass && /courses\/\d+/.test(document.URL)) {
        currentContentItem = await currentCourse?.getFrontPage();

    }

    if (!currentCourse) return;
    const header: HTMLElement | null = document.querySelector('.right-of-crumbs');
    if (!header) return;
    let bp: Course | undefined;


    await addDevButton(header, currentCourse);
    bp = currentCourse.isBlueprint()? currentCourse : await getSingleCourse('BP_' + currentCourse.baseCode, currentCourse.getAccountIds());
    if (bp) {
        await addBpButton(header, currentCourse, bp);
        await addSectionsButton(header, bp, currentCourse);
    }


    if (currentContentItem) {
        await addOpenAllLinksButton(header, currentContentItem);
        addHighlightBigImageResizer(currentContentItem);
    }
    const homeTileHost = document.querySelector('#Modules-anchor');

    if (homeTileHost) {
        const buttonHolder = document.createElement('div');
        homeTileHost.append(buttonHolder);
        addHomeTileButton(buttonHolder, currentCourse);
    }

}

