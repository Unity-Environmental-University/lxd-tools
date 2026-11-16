import {ImportButton} from "@/ui/syllabus/ImportButton";
import {SyncUndoBanner} from "@/ui/syllabus/SyncUndoBanner";
import {loadSnapshot} from "@publish/fixesAndUpdates/validations/syllabusUndo";
import ReactDOM from "react-dom/client";

// If Syllabus Sync was run on this course recently (from this browser), show the banner to review and undo it
function addSyncUndoBanner() {
    const courseId = Number(location.pathname.match(/\/courses\/(\d+)/)?.[1]);
    if (!courseId || !loadSnapshot(courseId)) return;
    const container = document.querySelector("#content") ?? document.body;
    const rootDiv = document.createElement("div");
    container.prepend(rootDiv);
    ReactDOM.createRoot(rootDiv).render(<SyncUndoBanner courseId={courseId} variant="page" />);
}

// will add the import button to the given location's grandparent if it exists
function addImportButton(location: Element) {
    const correctParent = location.parentElement?.parentElement;
    if (correctParent) {
        const rootDiv = document.createElement('div');
        correctParent.insertBefore(rootDiv, correctParent.firstElementChild);
        const importButtonRoot = ReactDOM.createRoot(rootDiv);
        importButtonRoot.render(
            <div>
                <ImportButton/>
                <ImportButton
                    name={"Custom Import"}
                    useSlug={true}
                />
            </div>
        );
    }
    else{
        console.error("could not find correct parent to add import button to syllabus")
    }
}

export function main() {
    try {
        addSyncUndoBanner();
    } catch (e) {
        console.error("could not add the Syllabus Sync undo banner", e);
    }
    // grab the location to add the button to
    // TODO this location is hardcoded has Week 1 Learning Materials
    // at least make it a constant because this is used in ImportHelpers as
    // well - at best it needs to be state because some CE pages won't 
    // use that wording in the syllabus - in that case the custom import button
    // should appear at top of page and accept a string indicating what text to
    // look for in syllabus.
    const location = Array.from(document.querySelectorAll(".content"))
        .find(h3 => h3.textContent?.includes("Week 1 Learning Materials")); // TODO I re-use this little snippet a lot - make a func?
    if (location){
        console.log("adding import button to syllabus")
        addImportButton(location);
    }
    else{
        console.error("could not find location to add import button to syllabus");
        alert("could not find location to add import button to syllabus - does this syllabus include header 'Week 1 Learning Materials' for that section? Make sure it does if you wish to use this feature")
    }
    
}