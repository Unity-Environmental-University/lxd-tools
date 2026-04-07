import {Button} from "react-bootstrap";
import {useState} from "react";
import {handleImportClick} from "@/ui/syllabus/handleImportClick";

export function ImportButton() {
    const [loading, setLoading] = useState(false);

    return (
        <Button 
            title={"Import the Week 1 Learning mats into the syllabus"}
            disabled={loading}
            onClick={async e => {
                setLoading(true);
                console.log("Import Syllabus clicked", e);
                await handleImportClick();
                console.log("About to reload");
                location.reload();  
            }}
        >
            {loading ? "..." : "Import Wk1 Mats"}
        </Button>
    );
}
// TODO there might be some edge cases for lmats pages that don't use a dropdown?
// TODO users might prefer a carousel over listing the videos out?
// TODO replace stock line with titles of the dropdowns from the lmats page