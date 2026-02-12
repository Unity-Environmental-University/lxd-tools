import {ImportButton} from "@/ui/syllabus/ImportButton";
import ReactDOM from "react-dom/client";

// will add the import button to the given location's grandparent if it exists
function addImportButton(location: Element) {
    const correctParent = location.parentElement?.parentElement;
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
    // grab the location to add the button to
    const location = Array.from(document.querySelectorAll(".content"))
        .find(h3 => h3.textContent?.includes("Week 1 Learning Materials")); // TODO I re-use this little snippet a lot - make a func?
    if (location){
        console.log("adding import button to syllabus")
        addImportButton(location);
    }
    else{
        console.error("could not find location to add import button to syllabus");
    }
    
}