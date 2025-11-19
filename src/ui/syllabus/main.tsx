import {ImportButton} from "@/ui/syllabus/ImportButton";
import ReactDOM from "react-dom/client";

// will add the import button to the given location
function addImportButton(location: HTMLElement) {
    // TODO this is super scuffed and hardcoded - what if syllabus template changes?
    const correctParent = location.parentElement?.parentElement?.parentElement?.parentElement;
    if (correctParent) {
        const rootDiv = document.createElement('div');
        correctParent.insertBefore(rootDiv, correctParent.firstElementChild);
        const importButtonRoot = ReactDOM.createRoot(rootDiv);
        importButtonRoot.render(<ImportButton/>);
    }
    else{
        console.error("could not find correct parent to add import button to syllabus")
    }
}

export function main() {
    // grab the location to add the button
    // TODO might need to get more specific with how I grab the location than a selector can be - this is hardcoded to the syllabus template right now and not working elsewhere
    //const location: HTMLElement | null = document.body.querySelector("div.scaffold-media-box.cbt-content > div.cbt-callout-box > div.content > h3 > strong"); 
    const location: HTMLElement | null = document.getElementById('right-side');
    if (location){
        console.log("adding import button to syllabus")
        addImportButton(location);
    }
    else{
        console.error("could not find location to add import button to syllabus");
    }
    
}